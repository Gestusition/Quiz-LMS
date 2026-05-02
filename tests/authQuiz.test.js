const path = require('path');
const fs = require('fs');
const { initDatabase, seedDatabase, closeDatabase, getDatabaseFiles, resolveDatabaseFiles } = require('../database/db');
const authService = require('../services/authService');
const quizService = require('../services/quizService');
const request = require('supertest');
const app = require('../server');

const TEST_DB = path.join(__dirname, 'test_auth_quiz.db');

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
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
    expect(Object.keys(files)).toEqual(expect.arrayContaining(['identity', 'learning', 'assessment', 'content']));
    expect(fs.existsSync(files.identity)).toBe(true);
    expect(fs.existsSync(files.learning)).toBe(true);
    expect(fs.existsSync(files.assessment)).toBe(true);
    expect(fs.existsSync(files.content)).toBe(true);
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
