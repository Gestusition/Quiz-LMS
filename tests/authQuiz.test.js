const path = require('path');
const fs = require('fs');
const {
  DATABASE_CONTEXTS,
  initDatabase,
  seedDatabase,
  closeDatabase,
  getDatabase,
  getDatabaseFiles,
  resolveDatabaseFiles
} = require('../database/db');
const authService = require('../services/authService');
const settingsService = require('../services/settingsService');
const auditService = require('../services/auditService');
const quizService = require('../services/quizService');
const restrictionService = require('../services/restrictionService');
const { hashPassword, hashSessionToken, verifyPassword } = require('../utils/security');
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

function cookie(session) {
  return `auth_token=${session.token}`;
}

function getDeclaredContextTables() {
  const dbSource = fs.readFileSync(path.join(__dirname, '..', 'database', 'db.js'), 'utf8');
  const tablePattern = /CREATE TABLE IF NOT EXISTS\s+([a-z_]+)\.([a-z_]+)/g;
  const tablesByContext = new Map(Object.keys(DATABASE_CONTEXTS).map(context => [context, []]));
  let match;

  while ((match = tablePattern.exec(dbSource)) !== null) {
    const [, context, table] = match;
    if (tablesByContext.has(context)) {
      tablesByContext.get(context).push(table);
    }
  }

  return Object.fromEntries(
    [...tablesByContext.entries()].map(([context, tables]) => [context, [...new Set(tables)].sort()])
  );
}

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();
  settingsService.setMaintenanceMode(false);
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('Auth and quiz attempt flow', () => {
  test('uses separate SQLite files for each bounded context', () => {
    const files = getDatabaseFiles();
    const contexts = Object.keys(DATABASE_CONTEXTS);

    expect(Object.keys(files)).toEqual(expect.arrayContaining(contexts));
    contexts.forEach(context => {
      expect(fs.existsSync(files[context])).toBe(true);
    });
  });

  test('fresh setup creates the required tables in each database context', () => {
    const expectedTables = getDeclaredContextTables();
    const database = getDatabase();
    Object.entries(expectedTables).forEach(([schema, tables]) => {
      const actualTables = database.prepare(`
        SELECT name
        FROM ${schema}.sqlite_master
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
      `).all().map(row => row.name).sort();

      expect(actualTables).toEqual(tables);
    });
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

  test('requires PASSWORD_SPICE in production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalSpice = process.env.PASSWORD_SPICE;

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.PASSWORD_SPICE;

      expect(() => hashPassword('ProductionPassword123!')).toThrow('PASSWORD_SPICE is required in production.');

      process.env.PASSWORD_SPICE = 'production-test-spice';
      expect(() => hashPassword('ProductionPassword123!')).not.toThrow();
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;

      if (originalSpice === undefined) delete process.env.PASSWORD_SPICE;
      else process.env.PASSWORD_SPICE = originalSpice;
    }
  });

  test('logs in seeded role accounts with salted and spiced password hashes', () => {
    const admin = authService.login('admin', 'Admin123!');
    const teacher = authService.login('teacher@example.com', 'Teacher123!');
    const student = authService.login('STU-0003', 'Student123!');

    expect(admin.user.role).toBe('admin');
    expect(admin.user.username).toBe('admin');
    expect(admin.user.mustChangeCredentials).toBe(true);
    expect(teacher.user.role).toBe('teacher');
    expect(student.user.role).toBe('student');
    expect(student.token).toBeTruthy();
  });

  test('login endpoint sets an HttpOnly session cookie without exposing the token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'teacher@example.com', password: 'Teacher123!' })
      .expect(200);

    expect(response.body.token).toBeUndefined();
    expect(response.body.user.role).toBe('teacher');

    const setCookie = response.headers['set-cookie'] || [];
    const sessionCookie = setCookie.find(item => item.startsWith('auth_token='));
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie).toEqual(expect.stringContaining('HttpOnly'));
    if (process.env.NODE_ENV === 'production') {
      expect(sessionCookie).toEqual(expect.stringContaining('Secure'));
    } else {
      expect(sessionCookie).not.toEqual(expect.stringContaining('Secure'));
    }
    expect(sessionCookie).toEqual(expect.stringContaining('SameSite=Strict'));

    const cookieHeader = sessionCookie.split(';')[0];
    await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookieHeader)
      .expect(200)
      .expect(meResponse => {
        expect(meResponse.body.role).toBe('teacher');
      });

    const logout = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookieHeader)
      .expect(200);
    expect((logout.headers['set-cookie'] || []).some(item => item.startsWith('auth_token=;'))).toBe(true);
  });

  test('query string and header session tokens are rejected by HTTP auth middleware', async () => {
    const session = authService.login('STU-0003', 'Student123!');

    await request(app)
      .get('/api/auth/me')
      .query({ token: session.token })
      .expect(401);

    await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${session.token}`)
      .expect(401);

    await request(app)
      .get('/api/auth/me')
      .set('x-session-token', session.token)
      .expect(401);
  });

  test('opaque session hashes are not accepted as authentication tokens', async () => {
    const db = getDatabase();
    const session = authService.login('STU-0003', 'Student123!');
    const opaqueToken = `opaque-${Date.now()}`;

    db.prepare(`
      INSERT INTO sessions (userId, tokenHash, tokenType, expiresAt)
      VALUES (?, ?, 'jwt', ?)
    `).run(
      session.user.id,
      hashSessionToken(opaqueToken),
      new Date(Date.now() + 60_000).toISOString()
    );

    await request(app)
      .get('/api/auth/me')
      .set('Cookie', `auth_token=${opaqueToken}`)
      .expect(401);
  });

  test('login brute-force lockout blocks a known account after repeated failures', async () => {
    const suffix = nextSuffix();
    const admin = authService.createUser({
      name: `Lockout Admin ${suffix}`,
      username: `lockout-admin-${suffix}`,
      email: `lockout-admin-${suffix}@example.com`,
      role: 'admin',
      password: 'LockoutAdmin123!'
    });

    for (let i = 0; i < 5; i += 1) {
      await request(app)
        .post('/api/auth/login')
        .send({ identifier: admin.username, password: 'WrongLockout123!' })
        .expect(401);
    }

    await request(app)
      .post('/api/auth/login')
      .send({ identifier: admin.username, password: 'LockoutAdmin123!' })
      .expect(429)
      .expect(response => {
        expect(response.body.error).toMatch(/temporarily locked/i);
        expect(response.body.retryAfterSeconds).toBeGreaterThan(0);
      });
  });

  test('failed login for a known email or username is written to audit logs', async () => {
    const suffix = nextSuffix();
    const teacher = authService.createUser({
      name: `Audit Teacher ${suffix}`,
      username: `audit-teacher-${suffix}`,
      email: `audit-teacher-${suffix}@example.com`,
      role: 'teacher',
      password: 'AuditTeacher123!',
      staffNumber: `AUD-${uniqueUserSuffix}`
    });
    const admin = authService.createUser({
      name: `Audit Admin ${suffix}`,
      username: `audit-admin-${suffix}`,
      email: `audit-admin-${suffix}@example.com`,
      role: 'admin',
      password: 'AuditAdmin123!'
    });

    await request(app)
      .post('/api/auth/login')
      .send({ identifier: teacher.email, password: 'WrongAudit123!' })
      .expect(401);

    await request(app)
      .post('/api/auth/login')
      .send({ identifier: admin.username, password: 'WrongAudit123!' })
      .expect(401);

    const logs = auditService.recent(25);
    const log = logs.find(entry =>
      entry.action === 'LOGIN_FAILED' && entry.entityId === teacher.id
    );
    const usernameLog = logs.find(entry =>
      entry.action === 'LOGIN_FAILED' && entry.entityId === admin.id
    );

    expect(log).toBeDefined();
    expect(log.actorUserId).toBe(teacher.id);
    expect(log.details.identifierType).toBe('email');
    expect(log.details.identifier).toBe(teacher.email.toLowerCase());
    expect(log.details.reason).toBe('invalid_credentials');
    expect(log.details.password).toBeUndefined();
    expect(usernameLog).toBeDefined();
    expect(usernameLog.details.identifierType).toBe('username');
  });

  test('blocks default admin from using the app until username and password are changed', async () => {
    const session = authService.login('admin', 'Admin123!');

    await request(app)
      .get('/api/courses')
      .set('Cookie', cookie(session))
      .expect(403)
      .expect(response => {
        expect(response.body.code).toBe('CREDENTIAL_CHANGE_REQUIRED');
      });

    const response = await request(app)
      .post('/api/auth/change-credentials')
      .set('Cookie', cookie(session))
      .send({
        username: 'primary-admin',
        currentPassword: 'Admin123!',
        newPassword: 'BetterAdmin123!'
      })
      .expect(200);

    const user = response.body;
    expect(user.username).toBe('primary-admin');
    expect(Boolean(user.mustChangeCredentials)).toBe(false);
    expect(authService.login('primary-admin', 'BetterAdmin123!').user.role).toBe('admin');
  });

  test('change-credentials route returns validation errors for bad current password', async () => {
    const suffix = nextSuffix();
    const teacher = authService.createUser({
      name: `Credential Route Teacher ${suffix}`,
      username: `credential-route-teacher-${uniqueUserSuffix}`,
      email: `credential-route-teacher-${suffix}@example.com`,
      role: 'teacher',
      password: 'CredentialRoute123!',
      staffNumber: `CRT-${uniqueUserSuffix}`
    });
    const session = authService.login(teacher.email, 'CredentialRoute123!');

    await request(app)
      .post('/api/auth/change-credentials')
      .set('Cookie', cookie(session))
      .send({
        username: `credential-route-updated-${uniqueUserSuffix}`,
        currentPassword: 'WrongCredential123!',
        newPassword: 'CredentialRoute456!'
      })
      .expect(400);
  });

  test('rejects invalid passwords', () => {
    expect(() => authService.login('STU-0003', 'wrong-password')).toThrow('Invalid credentials');
  });

  test('lets admins issue one-time reset codes without storing plaintext codes', () => {
    const db = getDatabase();
    const requestResult = authService.requestPasswordReset('teacher@example.com');
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
      identifier: 'teacher@example.com',
      code: '00000000',
      newPassword: 'TeacherReset123!'
    })).toThrow('Invalid or expired reset code');

    const completed = authService.completePasswordReset({
      identifier: 'teacher@example.com',
      code: issued.code,
      newPassword: 'TeacherReset123!'
    });
    expect(completed.message).toMatch(/Password updated/);
    expect(authService.login('teacher@example.com', 'TeacherReset123!').user.role).toBe('teacher');
    expect(() => authService.login('teacher@example.com', 'Teacher123!')).toThrow('Invalid credentials');
    expect(() => authService.completePasswordReset({
      identifier: 'teacher@example.com',
      code: issued.code,
      newPassword: 'TeacherAgain123!'
    })).toThrow('Invalid or expired reset code');
  });

  test('public password reset API accepts requests and completes issued codes', async () => {
    const suffix = nextSuffix();
    const teacher = authService.createUser({
      name: `Public Reset Teacher ${suffix}`,
      username: `public-reset-teacher-${uniqueUserSuffix}`,
      email: `public-reset-teacher-${suffix}@example.com`,
      role: 'teacher',
      password: 'PublicReset123!',
      staffNumber: `PRT-${uniqueUserSuffix}`
    });

    await request(app)
      .post('/api/auth/password-reset/request')
      .send({ identifier: teacher.email })
      .expect(200)
      .expect(response => {
        expect(response.body.message).toMatch(/admin reset request/i);
      });

    await request(app)
      .post('/api/auth/password-reset/request')
      .send({})
      .expect(400);

    const issued = authService.issuePasswordResetCode(teacher.id);

    await request(app)
      .post('/api/auth/password-reset/complete')
      .send({ identifier: teacher.email, code: '00000000', newPassword: 'PublicReset456!' })
      .expect(400);

    await request(app)
      .post('/api/auth/password-reset/complete')
      .send({ identifier: teacher.email, code: issued.code, newPassword: 'PublicReset456!' })
      .expect(200)
      .expect(response => {
        expect(response.body.message).toMatch(/Password updated/i);
      });

    expect(authService.login(teacher.email, 'PublicReset456!').user.id).toBe(teacher.id);
  });

  test('admin can list password reset requests through the API', async () => {
    const adminSession = createAdminSession();
    authService.requestPasswordReset('STU-0003');

    await request(app)
      .get('/api/users/password-reset-requests')
      .set('Cookie', cookie(adminSession))
      .expect(200)
      .expect(response => {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.some(item => item.username === 'student')).toBe(true);
      });
  });

  test('admin can issue password reset code through the API', async () => {
    const db = getDatabase();
    const adminSession = createAdminSession();
    const student = db.prepare('SELECT id FROM users WHERE username = ?').get('student');

    await request(app)
      .post(`/api/users/${student.id}/password-reset-code`)
      .set('Cookie', cookie(adminSession))
      .expect(201)
      .expect(response => {
        expect(response.body.userId).toBe(student.id);
        expect(response.body.code).toMatch(/^[0-9A-F]{8}$/);
      });
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
      .set('Cookie', cookie(adminSession))
      .send({ password: 'ManagedNew123!' })
      .expect(200);

    expect(authService.login('MNG-0001', 'ManagedNew123!').user.id).toBe(student.id);
    expect(() => authService.login('MNG-0001', 'ManagedOld123!')).toThrow('Invalid credentials');

    const stored = db.prepare('SELECT passwordHash, passwordSalt FROM users WHERE id = ?').get(student.id);
    expect(stored.passwordHash).not.toBe('ManagedNew123!');
    expect(stored.passwordSalt).not.toBe('ManagedNew123!');
    expect(stored.passwordHash).toMatch(/^[0-9a-f]{128}$/i);
  });

  test('admin can create a student with studentNumber and cohort', async () => {
    const adminSession = createAdminSession();
    const response = await request(app)
      .post('/api/users')
      .set('Cookie', cookie(adminSession))
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
      .set('Cookie', cookie(adminSession))
      .send({
        name: 'Duplicate Student',
        username: 'duplicate-student-number',
        email: 'duplicate-student-number@example.com',
        role: 'student',
        password: 'Duplicate123!',
        studentNumber: 'DUP-1001'
      })
      .expect(409)
      .expect(response => {
        expect(response.body.message).toMatch(/student number already exists/i);
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

  test('student email login is rejected even with correct password', () => {
    const student = authService.createUser({
      name: 'Strict Login Student',
      username: 'strict-login-student',
      email: 'strict-login-student@example.com',
      role: 'student',
      password: 'StrictLogin123!',
      studentNumber: 'STRICT-1001'
    });

    expect(() => authService.login(student.email, 'StrictLogin123!')).toThrow('Invalid credentials');
    expect(authService.login(student.studentNumber, 'StrictLogin123!').user.id).toBe(student.id);
  });

  test('teacher must log in with email (employee number/username are rejected)', () => {
    const teacher = authService.createUser({
      name: 'Strict Login Teacher',
      username: 'strict-login-teacher',
      email: 'strict-login-teacher@example.com',
      role: 'teacher',
      password: 'StrictTeacher123!',
      staffNumber: 'EMP-STRICT-1001'
    });

    expect(() => authService.login(teacher.staffNumber, 'StrictTeacher123!')).toThrow('Invalid credentials');
    expect(() => authService.login(teacher.username, 'StrictTeacher123!')).toThrow('Invalid credentials');
    expect(authService.login(teacher.email, 'StrictTeacher123!').user.id).toBe(teacher.id);
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
      .set('Cookie', cookie(adminSession))
      .expect(200)
      .expect(response => {
        expect(response.body.items.some(user => user.username === 'search-number-student')).toBe(true);
        expect(response.body.items[0]).toHaveProperty('studentNumber');
        expect(response.body.pagination).toBeDefined();
      });
  });

  test('duplicate email returns 409 conflict', async () => {
    const adminSession = createAdminSession();
    await request(app)
      .post('/api/users')
      .set('Cookie', cookie(adminSession))
      .send({
        name: 'Duplicate Email One',
        username: 'dup-email-1',
        email: 'duplicate-email@example.com',
        role: 'student',
        password: 'DuplicateEmail123!',
        studentNumber: 'DUP-EMAIL-1001'
      })
      .expect(201);

    await request(app)
      .post('/api/users')
      .set('Cookie', cookie(adminSession))
      .send({
        name: 'Duplicate Email Two',
        username: 'dup-email-2',
        email: 'duplicate-email@example.com',
        role: 'student',
        password: 'DuplicateEmail123!',
        studentNumber: 'DUP-EMAIL-1002'
      })
      .expect(409)
      .expect(response => {
        expect(response.body.field).toBe('email');
      });
  });

  test('admin users endpoint supports pagination, role filter, and status filter', async () => {
    const adminSession = createAdminSession();
    const response = await request(app)
      .get('/api/users?role=student&status=active&page=1&limit=5')
      .set('Cookie', cookie(adminSession))
      .expect(200);

    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.length).toBeLessThanOrEqual(5);
    response.body.items.forEach(user => {
      expect(user.role).toBe('student');
      expect(user.status).toBe('active');
    });
    expect(response.body.pagination.page).toBe(1);

    await request(app)
      .get('/api/users?departmentId=1&classYearId=1&sectionId=1&page=1&limit=5')
      .set('Cookie', cookie(adminSession))
      .expect(200)
      .expect(filteredResponse => {
        expect(Array.isArray(filteredResponse.body.items)).toBe(true);
      });
  });

  test('login identifier is rejected when ambiguous across academic identifiers', () => {
    const stamp = Date.now();
    authService.createUser({
      name: 'Ambiguous Student',
      username: `amb-student-${stamp}`,
      email: `amb-student-${stamp}@example.com`,
      role: 'student',
      password: 'Ambiguous123!',
      studentNumber: `AMB-${stamp}`
    });
    authService.createUser({
      name: 'Ambiguous Teacher',
      username: `amb-teacher-${stamp}`,
      email: `amb-teacher-${stamp}@example.com`,
      role: 'teacher',
      password: 'Ambiguous123!',
      staffNumber: `AMB-${stamp}`
    });

    expect(() => authService.login(`AMB-${stamp}`, 'Ambiguous123!')).toThrow('ambiguous');
  });

  test('restricted/suspended user cannot login', () => {
    const stamp = Date.now();
    const blocked = authService.createUser({
      name: 'Blocked Student',
      username: `blocked-student-${stamp}`,
      email: `blocked-student-${stamp}@example.com`,
      role: 'student',
      password: 'Blocked123!',
      studentNumber: `BLK-${stamp}`
    });

    restrictionService.create({
      userId: blocked.id,
      restrictionType: 'account_suspended',
      scopeType: 'global',
      reason: 'Testing restriction'
    }, null);

    expect(() => authService.login(blocked.studentNumber, 'Blocked123!')).toThrow('restricted');
  });

  test('course participants include studentNumber', async () => {
    const db = getDatabase();
    const adminSession = createAdminSession();
    const course = db.prepare('SELECT id FROM courses WHERE code = ?').get('DEMO101');

    await request(app)
      .get(`/api/courses/${course.id}/participants`)
      .set('Cookie', cookie(adminSession))
      .expect(200)
      .expect(response => {
        const student = response.body.find(participant => participant.courseRole === 'student');
        expect(student.studentNumber).toMatch(/^STU-/);
      });
  });

  test('gradebook includes studentNumber', async () => {
    const db = getDatabase();
    const adminSession = createAdminSession();
    const course = db.prepare('SELECT id FROM courses WHERE code = ?').get('DEMO101');

    await request(app)
      .get(`/api/courses/${course.id}/gradebook`)
      .set('Cookie', cookie(adminSession))
      .expect(200)
      .expect(response => {
        expect(response.body.students.length).toBeGreaterThan(0);
        expect(response.body.students[0].studentNumber).toMatch(/^STU-/);
      });
  });

  test('student can submit a published quiz attempt for server-side grading', () => {
    const session = authService.login('STU-0003', 'Student123!');
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

  test('blank full demo exam submission scores zero', () => {
    const session = authService.login('STU-0003', 'Student123!');
    const quiz = getDatabase().prepare(`
      SELECT id
      FROM quizzes
      WHERE LOWER(title) LIKE 'numerical methods%full demo exam'
    `).get();
    expect(quiz).toBeDefined();

    const attempt = quizService.startAttempt(quiz.id, session.user);
    expect(attempt.questions).toHaveLength(45);

    const result = quizService.submitAttempt(attempt.id, session.user, { answers: {} });

    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
    expect((result.answers || []).filter(answer => Number(answer.isCorrect) === 1)).toHaveLength(0);
  });
});
