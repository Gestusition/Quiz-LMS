const path = require('path');
const fs = require('fs');
const { initDatabase, seedDatabase, closeDatabase } = require('../database/db');
const authService = require('../services/authService');
const quizService = require('../services/quizService');

const TEST_DB = path.join(__dirname, 'test_auth_quiz.db');

function removeDbFiles() {
  [TEST_DB, `${TEST_DB}-shm`, `${TEST_DB}-wal`].forEach(file => {
    if (fs.existsSync(file)) fs.unlinkSync(file);
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
  test('logs in seeded role accounts with salted and spiced password hashes', () => {
    const admin = authService.login('admin@example.com', 'Admin123!');
    const teacher = authService.login('teacher@example.com', 'Teacher123!');
    const student = authService.login('student@example.com', 'Student123!');

    expect(admin.user.role).toBe('admin');
    expect(teacher.user.role).toBe('teacher');
    expect(student.user.role).toBe('student');
    expect(student.token).toBeTruthy();
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
