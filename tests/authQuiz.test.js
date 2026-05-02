const path = require('path');
const fs = require('fs');
const { initDatabase, seedDatabase, closeDatabase, getDatabase, getDatabaseFiles, resolveDatabaseFiles } = require('../database/db');
const authService = require('../services/authService');
const quizService = require('../services/quizService');
const { hashPassword, verifyPassword } = require('../utils/security');
const request = require('supertest');
const app = require('../server');

const TEST_DB = path.join(__dirname, 'test_auth_quiz.db');
let uniqueUserSuffix = 0;

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

function nextSuffix() {
  uniqueUserSuffix += 1;
  return `${Date.now()}-${uniqueUserSuffix}`;
}

function createAdminSession() {
  const suffix = nextSuffix();
  const admin = authService.createUser({
    name: `Test Admin ${suffix}`,
    username: `test-admin-${uniqueUserSuffix}`,
    email: `test-admin-${suffix}@example.com`,
    role: 'admin',
    password: 'TestAdmin123!'
  });
  return authService.login(admin.username, 'TestAdmin123!');
}

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('Auth and quiz attempt flow', () => {
  test('uses separate SQLite files for each bounded context', () => {
    const files = getDatabaseFiles();
    expect(Object.keys(files)).toEqual(expect.arrayContaining([
      'users',
      'admin',
      'teacher',
      'student',
      'learning',
      'assessment',
      'content'
    ]));
    expect(fs.existsSync(files.users)).toBe(true);
    expect(fs.existsSync(files.admin)).toBe(true);
    expect(fs.existsSync(files.teacher)).toBe(true);
    expect(fs.existsSync(files.student)).toBe(true);
    expect(fs.existsSync(files.learning)).toBe(true);
    expect(fs.existsSync(files.assessment)).toBe(true);
    expect(fs.existsSync(files.content)).toBe(true);
  });

  test('seeds role-specific profile databases for admin, teacher, and student', () => {
    const db = getDatabase();
    expect(db.prepare('SELECT COUNT(*) as count FROM admin_profiles').get().count).toBeGreaterThanOrEqual(1);
    expect(db.prepare('SELECT COUNT(*) as count FROM teacher_profiles').get().count).toBeGreaterThanOrEqual(1);
    expect(db.prepare('SELECT COUNT(*) as count FROM student_profiles').get().count).toBeGreaterThanOrEqual(1);
  });

  test('does not store plaintext passwords in the users database', () => {
    const db = getDatabase();
    const users = db.prepare(`
      SELECT passwordHash, passwordSalt, passwordAlgorithm
      FROM users
    `).all();

    expect(users.length).toBeGreaterThan(0);
    users.forEach(user => {
      expect(user.passwordAlgorithm).toBe('scrypt+salt+spice');
      expect(user.passwordHash).toMatch(/^[0-9a-f]{128}$/i);
      expect(user.passwordSalt).toMatch(/^[0-9a-f]{32}$/i);
      expect(['Admin123!', 'Teacher123!', 'Student123!', 'BetterAdmin123!']).not.toContain(user.passwordHash);
      expect(['Admin123!', 'Teacher123!', 'Student123!', 'BetterAdmin123!']).not.toContain(user.passwordSalt);
    });
  });

  test('requires the same application spice to verify a password hash', () => {
    const originalSpice = process.env.PASSWORD_SPICE;
    process.env.PASSWORD_SPICE = 'test-spice-one';
    const hashed = hashPassword('SpicedPassword123!');

    expect(verifyPassword('SpicedPassword123!', hashed.passwordSalt, hashed.passwordHash)).toBe(true);

    process.env.PASSWORD_SPICE = 'test-spice-two';
    expect(verifyPassword('SpicedPassword123!', hashed.passwordSalt, hashed.passwordHash)).toBe(false);

    if (originalSpice === undefined) delete process.env.PASSWORD_SPICE;
    else process.env.PASSWORD_SPICE = originalSpice;
  });

  test('logs in seeded role accounts with salted and spiced password hashes', () => {
    const admin = authService.login('admin', 'Admin123!');
    const teacher = authService.login('teacher@example.com', 'Teacher123!');
    const student = authService.login('student@example.com', 'Student123!');

    expect(admin.user.role).toBe('admin');
    expect(admin.user.username).toBe('admin');
    expect(admin.user.mustChangeCredentials).toBe(true);
    expect(teacher.user.role).toBe('teacher');
    expect(student.user.role).toBe('student');
    expect(student.token).toBeTruthy();
  });

  test('blocks default admin from using the app until username and password are changed', async () => {
    const session = authService.login('admin', 'Admin123!');

    await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${session.token}`)
      .expect(403)
      .expect(response => {
        expect(response.body.code).toBe('CREDENTIAL_CHANGE_REQUIRED');
      });

    const user = authService.changeOwnCredentials(session.user.id, session.token, {
      username: 'primary-admin',
      currentPassword: 'Admin123!',
      newPassword: 'BetterAdmin123!'
    });

    expect(user.username).toBe('primary-admin');
    expect(Boolean(user.mustChangeCredentials)).toBe(false);
    expect(authService.login('primary-admin', 'BetterAdmin123!').user.role).toBe('admin');
  });

  test('rejects invalid passwords', () => {
    expect(() => authService.login('student@example.com', 'wrong-password')).toThrow('Invalid email or password');
  });

  test('lets admins issue one-time reset codes without storing plaintext codes', () => {
    const db = getDatabase();
    const requestResult = authService.requestPasswordReset('teacher');
    expect(requestResult.message).toMatch(/admin reset request/);

    const pendingRequests = authService.getPasswordResetRequests();
    expect(pendingRequests.some(request => request.username === 'teacher' && request.status === 'requested')).toBe(true);

    const teacher = db.prepare('SELECT id FROM users WHERE username = ?').get('teacher');
    const issued = authService.issuePasswordResetCode(teacher.id);
    expect(issued.code).toMatch(/^[0-9A-F]{8}$/);

    const stored = db.prepare(`
      SELECT codeHash
      FROM password_reset_codes
      WHERE userId = ? AND status = 'issued'
      ORDER BY id DESC
      LIMIT 1
    `).get(teacher.id);
    expect(stored.codeHash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored.codeHash).not.toBe(issued.code);

    expect(() => authService.completePasswordReset({
      username: 'teacher',
      code: '00000000',
      newPassword: 'TeacherReset123!'
    })).toThrow('Invalid or expired reset code');

    const completed = authService.completePasswordReset({
      username: 'teacher',
      code: issued.code,
      newPassword: 'TeacherReset123!'
    });
    expect(completed.message).toMatch(/Password updated/);
    expect(authService.login('teacher', 'TeacherReset123!').user.role).toBe('teacher');
    expect(() => authService.login('teacher', 'Teacher123!')).toThrow('Invalid email or password');
    expect(() => authService.completePasswordReset({
      username: 'teacher',
      code: issued.code,
      newPassword: 'TeacherAgain123!'
    })).toThrow('Invalid or expired reset code');
  });

  test('admin user edit can set a new password that works for login', async () => {
    const db = getDatabase();
    const admin = authService.createUser({
      name: 'Password Admin',
      username: 'password-admin',
      email: 'password-admin@example.com',
      role: 'admin',
      password: 'PasswordAdmin123!'
    });
    const student = authService.createUser({
      name: 'Managed Student',
      username: 'managed-student',
      email: 'managed-student@example.com',
      role: 'student',
      studentNumber: 'MNG-0001',
      password: 'ManagedOld123!'
    });
    const adminSession = authService.login(admin.username, 'PasswordAdmin123!');

    await request(app)
      .put(`/api/users/${student.id}/password`)
      .set('Authorization', `Bearer ${adminSession.token}`)
      .send({ password: 'ManagedNew123!' })
      .expect(200);

    expect(authService.login('managed-student', 'ManagedNew123!').user.id).toBe(student.id);
    expect(() => authService.login('managed-student', 'ManagedOld123!')).toThrow('Invalid email or password');

    const stored = db.prepare('SELECT passwordHash, passwordSalt FROM users WHERE id = ?').get(student.id);
    expect(stored.passwordHash).not.toBe('ManagedNew123!');
    expect(stored.passwordSalt).not.toBe('ManagedNew123!');
    expect(stored.passwordHash).toMatch(/^[0-9a-f]{128}$/i);
  });

  test('admin can create a student with studentNumber and cohort', async () => {
    const adminSession = createAdminSession();
    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminSession.token}`)
      .send({
        name: 'Academic Student',
        username: 'academic-student',
        email: 'academic-student@example.com',
        role: 'student',
        password: 'Academic123!',
        studentNumber: 'ACD-1001',
        cohort: '2026'
      })
      .expect(201);

    expect(response.body.studentNumber).toBe('ACD-1001');
    expect(response.body.cohort).toBe('2026');
  });

  test('duplicate studentNumber is rejected', async () => {
    const adminSession = createAdminSession();
    authService.createUser({
      name: 'Duplicate Seed Student',
      username: 'duplicate-seed-student',
      email: 'duplicate-seed-student@example.com',
      role: 'student',
      password: 'Duplicate123!',
      studentNumber: 'DUP-1001'
    });

    await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminSession.token}`)
      .send({
        name: 'Duplicate Student',
        username: 'duplicate-student-number',
        email: 'duplicate-student-number@example.com',
        role: 'student',
        password: 'Duplicate123!',
        studentNumber: 'DUP-1001'
      })
      .expect(400)
      .expect(response => {
        expect(response.body.error).toMatch(/student number already exists/i);
      });
  });

  test('student can log in using studentNumber', () => {
    const student = authService.createUser({
      name: 'Number Login Student',
      username: 'number-login-student',
      email: 'number-login-student@example.com',
      role: 'student',
      password: 'NumberLogin123!',
      studentNumber: 'LOGIN-1001',
      cohort: '2027'
    });

    const session = authService.login('LOGIN-1001', 'NumberLogin123!');
    expect(session.user.id).toBe(student.id);
    expect(session.user.studentNumber).toBe('LOGIN-1001');
  });

  test('password reset request can identify studentNumber', () => {
    authService.createUser({
      name: 'Reset Number Student',
      username: 'reset-number-student',
      email: 'reset-number-student@example.com',
      role: 'student',
      password: 'ResetNumber123!',
      studentNumber: 'RESET-1001'
    });

    const result = authService.requestPasswordReset('RESET-1001');
    expect(result.message).toMatch(/admin reset request/);

    const pending = authService.getPasswordResetRequests();
    expect(pending.some(request => request.username === 'reset-number-student')).toBe(true);
  });

  test('admin user search can find a student by studentNumber', async () => {
    const adminSession = createAdminSession();
    authService.createUser({
      name: 'Search Number Student',
      username: 'search-number-student',
      email: 'search-number-student@example.com',
      role: 'student',
      password: 'SearchNumber123!',
      studentNumber: 'SEARCH-1001',
      cohort: '2028'
    });

    await request(app)
      .get('/api/users?search=SEARCH-1001')
      .set('Authorization', `Bearer ${adminSession.token}`)
      .expect(200)
      .expect(response => {
        expect(response.body.some(user => user.username === 'search-number-student')).toBe(true);
        expect(response.body[0]).toHaveProperty('studentNumber');
      });
  });

  test('course participants include studentNumber', async () => {
    const db = getDatabase();
    const adminSession = createAdminSession();
    const course = db.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');

    await request(app)
      .get(`/api/courses/${course.id}/participants`)
      .set('Authorization', `Bearer ${adminSession.token}`)
      .expect(200)
      .expect(response => {
        const student = response.body.find(participant => participant.courseRole === 'student');
        expect(student.studentNumber).toMatch(/^STU-/);
      });
  });

  test('gradebook includes studentNumber', async () => {
    const db = getDatabase();
    const adminSession = createAdminSession();
    const course = db.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');

    await request(app)
      .get(`/api/courses/${course.id}/gradebook`)
      .set('Authorization', `Bearer ${adminSession.token}`)
      .expect(200)
      .expect(response => {
        expect(response.body.students.length).toBeGreaterThan(0);
        expect(response.body.students[0].studentNumber).toMatch(/^STU-/);
      });
  });

  test('student can submit a published quiz attempt for server-side grading', () => {
    const session = authService.login('student@example.com', 'Student123!');
    const quizzes = quizService.getAll(session.user);
    expect(quizzes.length).toBeGreaterThan(0);

    const attempt = quizService.startAttempt(quizzes[0].id, session.user);
    expect(attempt.questions.length).toBeGreaterThan(0);
    expect(attempt.questions[0].correctAnswer).toBeUndefined();

    const answers = attempt.questions.map(question => ({
      questionId: question.id,
      answer: question.type === 'MC' ? '0' : question.type === 'TF' ? 'false' : 'demo'
    }));
    const result = quizService.submitAttempt(attempt.id, session.user, { answers });

    expect(result.status).toBe('submitted');
    expect(result.maxScore).toBeGreaterThan(0);
    expect(result.percentage).toBeGreaterThanOrEqual(0);
  });
});
