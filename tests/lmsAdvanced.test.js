const path = require('path');
const fs = require('fs');
const request = require('supertest');
const app = require('../server');
const { initDatabase, seedDatabase, closeDatabase, resolveDatabaseFiles, getDatabase } = require('../database/db');
const authService = require('../services/authService');
const quizService = require('../services/quizService');
const restrictionService = require('../services/restrictionService');
const gradeSchemeService = require('../services/gradeSchemeService');

const TEST_DB = path.join(__dirname, 'test_lms_advanced.db');

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

function cookie(session) {
  return `auth_token=${session.token}`;
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

describe('Advanced LMS controls', () => {
  test('enrolled student can post in course discussion; non-enrolled cannot', async () => {
    const db = getDatabase();
    const course = db.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');
    const studentSession = authService.login('STU-0003', 'Student123!');

    await request(app)
      .post(`/api/discussion/courses/${course.id}/threads`)
      .set('Cookie', cookie(studentSession))
      .send({ title: 'Exam question', body: 'When is the midterm schedule published?' })
      .expect(201);

    const stamp = Date.now();
    const outsider = authService.createUser({
      name: `Outsider ${stamp}`,
      username: `outsider-${stamp}`,
      email: `outsider-${stamp}@example.com`,
      role: 'student',
      password: 'Outsider123!',
      studentNumber: `OUT-${stamp}`
    });
    const outsiderSession = authService.login(outsider.studentNumber, 'Outsider123!');

    await request(app)
      .post(`/api/discussion/courses/${course.id}/threads`)
      .set('Cookie', cookie(outsiderSession))
      .send({ title: 'Access test', body: 'I should not post here.' })
      .expect(403);
  });

  test('chat muted restriction blocks discussion posting', async () => {
    const db = getDatabase();
    const course = db.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');
    const student = authService.login('STU-0003', 'Student123!').user;
    const admin = authService.createUser({
      name: `Restriction Admin ${Date.now()}`,
      username: `restriction-admin-${Date.now()}`,
      email: `restriction-admin-${Date.now()}@example.com`,
      role: 'admin',
      password: 'Restriction123!'
    });

    restrictionService.create({
      userId: student.id,
      restrictionType: 'chat_muted',
      scopeType: 'course',
      scopeId: course.id,
      reason: 'Temporary moderation hold'
    }, admin.id);

    const studentSession = authService.login('STU-0003', 'Student123!');
    await request(app)
      .post(`/api/discussion/courses/${course.id}/threads`)
      .set('Cookie', cookie(studentSession))
      .send({ title: 'Muted post', body: 'This must be blocked.' })
      .expect(403)
      .expect(response => {
        expect(response.body.error).toMatch(/Access restricted/i);
      });
  });

  test('quiz_blocked restriction prevents starting attempt', async () => {
    const studentSession = authService.login('STU-0003', 'Student123!');
    const quiz = quizService.getAll(studentSession.user).find(item => item.status === 'published');
    expect(quiz).toBeDefined();

    restrictionService.create({
      userId: studentSession.user.id,
      restrictionType: 'quiz_blocked',
      scopeType: 'quiz',
      scopeId: quiz.id,
      reason: 'Academic integrity review'
    }, null);

    await request(app)
      .post(`/api/quizzes/${quiz.id}/attempts`)
      .set('Cookie', cookie(studentSession))
      .expect(403)
      .expect(response => {
        expect(response.body.error).toMatch(/Access restricted/i);
      });
  });

  test('assignment_blocked restriction prevents submission', async () => {
    const db = getDatabase();
    const offering = db.prepare(`
      SELECT co.id
      FROM course_offerings co
      JOIN courses c ON c.id = co.courseId
      WHERE c.code = 'WEB101'
      ORDER BY co.id ASC
      LIMIT 1
    `).get();
    const teacherSession = authService.login('teacher@example.com', 'Teacher123!');
    const studentSession = authService.login('STU-0003', 'Student123!');

    const assignment = (await request(app)
      .post('/api/academic/assignments')
      .set('Cookie', cookie(teacherSession))
      .send({
        courseOfferingId: offering.id,
        title: `Restriction Assignment ${Date.now()}`,
        description: 'Submission restriction check',
        dueDate: '2027-01-15T10:00:00.000Z',
        status: 'published'
      })
      .expect(201)).body;

    restrictionService.create({
      userId: studentSession.user.id,
      restrictionType: 'assignment_blocked',
      scopeType: 'assignment',
      scopeId: assignment.id,
      reason: 'Submission access restricted'
    }, teacherSession.user.id);

    await request(app)
      .post(`/api/academic/assignments/${assignment.id}/submissions`)
      .set('Cookie', cookie(studentSession))
      .send({ submissionText: 'Attempted submission' })
      .expect(403)
      .expect(response => {
        expect(response.body.message || response.body.error).toMatch(/restricted/i);
      });
  });

  test('timed attempt marks expired and negative marking score never goes below zero', () => {
    const teacherSession = authService.login('teacher@example.com', 'Teacher123!');
    const studentSession = authService.login('STU-0003', 'Student123!');
    const db = getDatabase();
    const course = db.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');
    const question = db.prepare(`
      SELECT q.id
      FROM questions q
      JOIN categories c ON c.id = q.categoryId
      WHERE c.courseId = ?
      ORDER BY q.id ASC
      LIMIT 1
    `).get(course.id);

    const quiz = quizService.create({
      courseId: course.id,
      title: `Timed Negative Quiz ${Date.now()}`,
      description: 'Timer + penalty test',
      status: 'published',
      startAt: new Date(Date.now() - 1000 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      durationMinutes: 5,
      maxAttempts: 1,
      gradingMode: 'negative_marking',
      penaltyEnabled: true,
      penaltyPerWrong: 10,
      showResultPolicy: 'immediately'
    }, teacherSession.user);

    quizService.setQuestions(quiz.id, [question.id], teacherSession.user.id);

    const attempt = quizService.startAttempt(quiz.id, studentSession.user);
    db.prepare('UPDATE quiz_attempts SET expiresAt = ? WHERE id = ?').run(new Date(Date.now() - 1000).toISOString(), attempt.id);

    const submitted = quizService.submitAttempt(attempt.id, studentSession.user, {
      answers: [{ questionId: attempt.questions[0].id, answer: '__wrong__' }]
    });

    expect(submitted.lifecycleStatus).toBe('expired');
    expect(submitted.score).toBeGreaterThanOrEqual(0);
  });

  test('invalid grade scheme keeps numeric score but sets letter grade pending review', () => {
    const teacherSession = authService.login('teacher@example.com', 'Teacher123!');
    const db = getDatabase();
    const course = db.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');

    const scheme = gradeSchemeService.ensureDefault(course.id, teacherSession.user.id);
    gradeSchemeService.markSchemeInvalid(scheme.id);

    const stamp = Date.now();
    const student = authService.createUser({
      name: `Pending Grade Student ${stamp}`,
      username: `pending-grade-${stamp}`,
      email: `pending-grade-${stamp}@example.com`,
      role: 'student',
      password: 'Pending123!',
      studentNumber: `PND-${stamp}`
    });

    db.prepare('INSERT OR IGNORE INTO enrollments (courseId, userId, role, status) VALUES (?, ?, \'student\', \'active\')')
      .run(course.id, student.id);
    const offering = db.prepare('SELECT id FROM course_offerings WHERE courseId = ? ORDER BY id ASC LIMIT 1').get(course.id);
    if (offering) {
      db.prepare('INSERT OR IGNORE INTO course_offering_enrollments (courseOfferingId, studentId, status) VALUES (?, ?, \'active\')')
        .run(offering.id, student.id);
    }

    const studentSession = authService.login(student.studentNumber, 'Pending123!');
    const quiz = quizService.getAll(studentSession.user).find(item => item.status === 'published');
    const attempt = quizService.startAttempt(quiz.id, studentSession.user);
    const answers = attempt.questions.map(question => ({ questionId: question.id, answer: question.correctAnswer || '0' }));
    const result = quizService.submitAttempt(attempt.id, studentSession.user, { answers });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.gradeStatus).toBe('pending_review');
    expect(result.letterGrade).toBeNull();
  });
});
