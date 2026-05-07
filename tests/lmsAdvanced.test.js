const path = require('path');
const fs = require('fs');
const request = require('supertest');
const app = require('../server');
const { initDatabase, seedDatabase, closeDatabase, resolveDatabaseFiles, getDatabase } = require('../database/db');
const authService = require('../services/authService');
const quizService = require('../services/quizService');
const restrictionService = require('../services/restrictionService');
const gradeSchemeService = require('../services/gradeSchemeService');
const validationIssueService = require('../services/validationIssueService');
const { VALIDATION_ISSUE_MESSAGES } = require('../constants/validationIssues');

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

    const stamp = String(Date.now()).slice(-8);
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

  test('course_access_blocked restriction prevents course access', async () => {
    const db = getDatabase();
    const course = db.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');
    const stamp = String(Date.now()).slice(-8);
    const blockedStudent = authService.createUser({
      name: `Course Blocked ${stamp}`,
      username: `course-blocked-${stamp}`,
      email: `course-blocked-${stamp}@example.com`,
      role: 'student',
      password: 'CourseBlocked123!',
      studentNumber: `CBL-${stamp}`
    });
    db.prepare('INSERT INTO enrollments (courseId, userId, role, status) VALUES (?, ?, \'student\', \'active\')')
      .run(course.id, blockedStudent.id);

    restrictionService.create({
      userId: blockedStudent.id,
      restrictionType: 'course_access_blocked',
      scopeType: 'course',
      scopeId: course.id,
      reason: 'Course access hold'
    }, null);

    const session = authService.login(blockedStudent.studentNumber, 'CourseBlocked123!');
    await request(app)
      .get(`/api/courses/${course.id}`)
      .set('Cookie', cookie(session))
      .expect(403);
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

  test('teachers can only manage validation issues for their courses or own issues', async () => {
    const db = getDatabase();
    const course = db.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');
    const teacherSession = authService.login('teacher@example.com', 'Teacher123!');
    const stamp = String(Date.now()).slice(-8);
    const otherTeacher = authService.createUser({
      name: `Other Issue Teacher ${stamp}`,
      username: `other-issue-teacher-${stamp}`,
      email: `other-issue-teacher-${stamp}@example.com`,
      role: 'teacher',
      password: 'OtherTeacher123!',
      staffNumber: `OIT-${stamp}`
    });
    const otherSession = authService.login(otherTeacher.email, 'OtherTeacher123!');

    const issue = (await request(app)
      .post('/api/issues')
      .set('Cookie', cookie(teacherSession))
      .send({
        entityType: 'quiz',
        entityId: 1,
        severity: 'warning',
        message: 'Course-scoped issue',
        relatedCourseId: course.id
      })
      .expect(201)).body;

    await request(app)
      .get(`/api/issues?relatedCourseId=${course.id}`)
      .set('Cookie', cookie(teacherSession))
      .expect(200)
      .expect(response => {
        expect(response.body.items.some(item => item.id === issue.id)).toBe(true);
      });

    await request(app)
      .put(`/api/issues/${issue.id}/status`)
      .set('Cookie', cookie(otherSession))
      .send({ status: 'resolved' })
      .expect(403);
  });

  test('stale quiz question validation issues are resolved before health reporting', () => {
    const db = getDatabase();
    const quiz = db.prepare(`
      SELECT q.id
      FROM quizzes q
      JOIN quiz_questions qq ON qq.quizId = q.id
      JOIN questions question ON question.id = qq.questionId
      WHERE q.status = 'published'
        AND COALESCE(NULLIF(question.status, ''), 'valid') != 'invalid'
      LIMIT 1
    `).get();

    const issue = validationIssueService.create({
      entityType: 'quiz',
      entityId: quiz.id,
      severity: 'critical',
      field: 'questions',
      message: VALIDATION_ISSUE_MESSAGES.quizNoValidQuestions,
      status: 'open'
    });

    const result = validationIssueService.list({
      status: 'open',
      entityType: 'quiz',
      entityId: quiz.id
    });
    const updated = validationIssueService.getById(issue.id);

    expect(result.items.some(item => item.id === issue.id)).toBe(false);
    expect(updated.status).toBe('resolved');
    expect(db.prepare("SELECT COUNT(*) as count FROM validation_issues WHERE id = ? AND status = 'open'").get(issue.id).count).toBe(0);
  });

  test('course deletion removes attached-database course data and student resource visibility is time-gated', async () => {
    const stamp = String(Date.now()).slice(-8);
    const admin = authService.createUser({
      name: `Cascade Admin ${stamp}`,
      username: `cascade-admin-${stamp}`,
      email: `cascade-admin-${stamp}@example.com`,
      role: 'admin',
      password: 'CascadeAdmin123!'
    });
    const adminSession = authService.login(admin.username, 'CascadeAdmin123!');
    const studentSession = authService.login('STU-0003', 'Student123!');

    const course = (await request(app)
      .post('/api/courses')
      .set('Cookie', cookie(adminSession))
      .send({
        code: `CAS-${stamp}`,
        title: `Cascade Course ${stamp}`,
        description: 'Course deletion cascade test.',
        credits: 3,
        visibility: 'published'
      })
      .expect(201)).body;

    await request(app)
      .post(`/api/courses/${course.id}/enrollments`)
      .set('Cookie', cookie(adminSession))
      .send({ userId: studentSession.user.id, role: 'student' })
      .expect(201);

    const week = (await request(app)
      .post(`/api/weeks/courses/${course.id}/weeks`)
      .set('Cookie', cookie(adminSession))
      .send({ weekNumber: 1, title: 'Cascade Week', description: 'Visible week', visible: true })
      .expect(201)).body;

    const visibleResource = (await request(app)
      .post(`/api/weeks/weeks/${week.id}/resources`)
      .set('Cookie', cookie(adminSession))
      .send({ title: 'Visible resource', type: 'link', content: 'https://example.com/visible' })
      .expect(201)).body;

    const futureResource = (await request(app)
      .post(`/api/weeks/weeks/${week.id}/resources`)
      .set('Cookie', cookie(adminSession))
      .send({
        title: 'Future resource',
        type: 'link',
        content: 'https://example.com/future',
        visibleFrom: '2099-01-01T00:00:00.000Z'
      })
      .expect(201)).body;

    await request(app)
      .get(`/api/weeks/weeks/${week.id}/resources`)
      .set('Cookie', cookie(studentSession))
      .expect(200)
      .expect(response => {
        expect(response.body.items.some(item => item.id === visibleResource.id)).toBe(true);
        expect(response.body.items.some(item => item.id === futureResource.id)).toBe(false);
      });

    await request(app)
      .post(`/api/discussion/courses/${course.id}/threads`)
      .set('Cookie', cookie(studentSession))
      .send({ title: 'Cascade discussion', body: 'This should disappear with the course.' })
      .expect(201);

    const category = (await request(app)
      .post('/api/categories')
      .set('Cookie', cookie(adminSession))
      .send({ courseId: course.id, name: `Cascade Category ${stamp}`, description: 'Cascade category' })
      .expect(201)).body;

    await request(app)
      .post('/api/questions')
      .set('Cookie', cookie(adminSession))
      .send({
        categoryId: category.id,
        text: 'Cascade question?',
        type: 'MC',
        options: ['Yes', 'No'],
        correctAnswer: '0',
        difficulty: 'EASY',
        points: 1
      })
      .expect(201);

    gradeSchemeService.ensureDefault(course.id, adminSession.user.id);
    quizService.createExamTemplate({
      name: `Cascade Template ${stamp}`,
      description: 'Course-scoped template',
      courseId: course.id,
      defaults: { durationMinutes: 15 }
    }, adminSession.user);
    restrictionService.create({
      userId: studentSession.user.id,
      restrictionType: 'course_access_blocked',
      scopeType: 'course',
      scopeId: course.id,
      reason: 'Cascade restriction'
    }, adminSession.user.id);
    validationIssueService.create({
      entityType: 'course',
      entityId: course.id,
      severity: 'warning',
      message: 'Cascade issue',
      relatedCourseId: course.id
    });

    await request(app)
      .delete(`/api/courses/${course.id}`)
      .set('Cookie', cookie(adminSession))
      .expect(200);

    const db = getDatabase();
    expect(db.prepare('SELECT COUNT(*) as count FROM categories WHERE courseId = ?').get(course.id).count).toBe(0);
    expect(db.prepare('SELECT COUNT(*) as count FROM questions WHERE categoryId = ?').get(category.id).count).toBe(0);
    expect(db.prepare('SELECT COUNT(*) as count FROM course_weeks WHERE courseId = ?').get(course.id).count).toBe(0);
    expect(db.prepare('SELECT COUNT(*) as count FROM week_resources WHERE weekId = ?').get(week.id).count).toBe(0);
    expect(db.prepare('SELECT COUNT(*) as count FROM course_threads WHERE courseId = ?').get(course.id).count).toBe(0);
    expect(db.prepare('SELECT COUNT(*) as count FROM grade_schemes WHERE courseId = ?').get(course.id).count).toBe(0);
    expect(db.prepare('SELECT COUNT(*) as count FROM exam_templates WHERE courseId = ?').get(course.id).count).toBe(0);
    expect(db.prepare('SELECT COUNT(*) as count FROM user_restrictions WHERE scopeType = ? AND scopeId = ?').get('course', course.id).count).toBe(0);
    expect(db.prepare('SELECT COUNT(*) as count FROM validation_issues WHERE relatedCourseId = ?').get(course.id).count).toBe(0);
  });

  test('course and week file resources accept real uploaded documents', async () => {
    const db = getDatabase();
    const course = db.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');
    const week = db.prepare('SELECT id FROM course_weeks WHERE courseId = ? ORDER BY id ASC LIMIT 1').get(course.id) ||
      (await request(app)
        .post(`/api/weeks/courses/${course.id}/weeks`)
        .set('Cookie', cookie(authService.login('teacher@example.com', 'Teacher123!')))
        .send({ weekNumber: 8, title: 'Upload Week', visible: true })
        .expect(201)).body;
    const teacherSession = authService.login('teacher@example.com', 'Teacher123!');

    const courseResource = (await request(app)
      .post(`/api/courses/${course.id}/resources`)
      .set('Cookie', cookie(teacherSession))
      .field('title', 'Uploaded PDF')
      .field('type', 'file')
      .field('description', 'Lecture notes')
      .attach('file', Buffer.from('%PDF-1.4\nresource test\n'), {
        filename: 'lecture-notes.pdf',
        contentType: 'application/pdf'
      })
      .expect(201)).body;

    expect(courseResource.type).toBe('file');
    expect(courseResource.url).toMatch(/^\/uploads\/resources\/.+\.pdf$/);
    expect(courseResource.fileName).toBe('lecture-notes.pdf');
    expect(courseResource.fileSizeBytes).toBeGreaterThan(0);

    const weekResource = (await request(app)
      .post(`/api/weeks/weeks/${week.id}/resources`)
      .set('Cookie', cookie(teacherSession))
      .field('title', 'Grade Sheet')
      .field('type', 'file')
      .attach('file', Buffer.from('student,grade\nA,95\n'), {
        filename: 'grades.csv',
        contentType: 'text/csv'
      })
      .expect(201)).body;

    expect(weekResource.type).toBe('file');
    expect(weekResource.content).toMatch(/^\/uploads\/resources\/.+\.csv$/);
    expect(weekResource.fileName).toBe('grades.csv');

    const htmlResource = (await request(app)
      .post(`/api/courses/${course.id}/resources`)
      .set('Cookie', cookie(teacherSession))
      .field('title', 'HTML Handout')
      .field('type', 'file')
      .attach('file', Buffer.from('<!doctype html><title>Lesson</title><p>Notes</p>'), {
        filename: 'lesson.html',
        contentType: 'text/html'
      })
      .expect(201)).body;

    expect(htmlResource.url).toMatch(/^\/uploads\/resources\/.+\.html$/);
    expect(htmlResource.fileName).toBe('lesson.html');

    const markdownResource = (await request(app)
      .post(`/api/weeks/weeks/${week.id}/resources`)
      .set('Cookie', cookie(teacherSession))
      .field('title', 'Markdown Notes')
      .field('type', 'file')
      .attach('file', Buffer.from('# Notes\n\n- Item\n'), {
        filename: 'notes.md',
        contentType: 'text/markdown'
      })
      .expect(201)).body;

    expect(markdownResource.content).toMatch(/^\/uploads\/resources\/.+\.md$/);
    expect(markdownResource.fileName).toBe('notes.md');

    await request(app)
      .post(`/api/weeks/weeks/${week.id}/resources`)
      .set('Cookie', cookie(teacherSession))
      .send({ title: 'Legacy Page', type: 'page', content: 'unused' })
      .expect(400);

    await request(app)
      .delete(`/api/courses/resources/${courseResource.id}`)
      .set('Cookie', cookie(teacherSession))
      .expect(200);
    await request(app)
      .delete(`/api/weeks/week-resources/${weekResource.id}`)
      .set('Cookie', cookie(teacherSession))
      .expect(200);
    await request(app)
      .delete(`/api/courses/resources/${htmlResource.id}`)
      .set('Cookie', cookie(teacherSession))
      .expect(200);
    await request(app)
      .delete(`/api/weeks/week-resources/${markdownResource.id}`)
      .set('Cookie', cookie(teacherSession))
      .expect(200);
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
      status: 'draft',
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
    quizService.update(quiz.id, { status: 'published' }, teacherSession.user);

    const attempt = quizService.startAttempt(quiz.id, studentSession.user);
    db.prepare('UPDATE quiz_attempts SET expiresAt = ? WHERE id = ?').run(new Date(Date.now() - 1000).toISOString(), attempt.id);

    const submitted = quizService.submitAttempt(attempt.id, studentSession.user, {
      answers: [{ questionId: attempt.questions[0].id, answer: '__wrong__' }]
    });

    expect(submitted.lifecycleStatus).toBe('expired');
    expect(submitted.score).toBeGreaterThanOrEqual(0);
  });

  test('manual result policy hides scores and answer correctness until released', async () => {
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
      title: `Manual Release Quiz ${Date.now()}`,
      description: 'Hidden result policy test',
      status: 'draft',
      startAt: new Date(Date.now() - 1000 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      durationMinutes: 10,
      maxAttempts: 1,
      showCorrectAnswers: true,
      showResultPolicy: 'after_manual_release'
    }, teacherSession.user);
    quizService.setQuestions(quiz.id, [question.id], teacherSession.user.id);
    quizService.update(quiz.id, { status: 'published' }, teacherSession.user);

    const attempt = quizService.startAttempt(quiz.id, studentSession.user);
    const submitted = quizService.submitAttempt(attempt.id, studentSession.user, {
      answers: [{ questionId: attempt.questions[0].id, answer: '__wrong__' }]
    });

    expect(submitted.hiddenByPolicy).toBe(true);
    expect(submitted.score).toBeNull();
    expect(submitted.answers[0].isCorrect).toBeUndefined();
    expect(submitted.answers[0].pointsAwarded).toBeUndefined();
    expect(submitted.answers[0].correctAnswer).toBeUndefined();

    await request(app)
      .get(`/api/quizzes/${quiz.id}/attempts`)
      .set('Cookie', cookie(studentSession))
      .expect(200)
      .expect(response => {
        expect(response.body[0].score).toBeNull();
        expect(response.body[0].hiddenByPolicy).toBe(true);
      });

    await request(app)
      .post(`/api/quizzes/${quiz.id}/release-results`)
      .set('Cookie', cookie(teacherSession))
      .expect(200);

    const released = await request(app)
      .get(`/api/quizzes/attempts/${attempt.id}`)
      .set('Cookie', cookie(studentSession))
      .expect(200);
    expect(released.body.score).not.toBeNull();
    expect(released.body.answers[0].isCorrect).toBeDefined();
  });

  test('published quiz creation is rejected until questions are assigned', () => {
    const teacherSession = authService.login('teacher@example.com', 'Teacher123!');
    const db = getDatabase();
    const course = db.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');

    expect(() => quizService.create({
      courseId: course.id,
      title: `Invalid Published Quiz ${Date.now()}`,
      description: 'Should not publish without questions',
      status: 'published',
      startAt: new Date(Date.now() - 1000 * 60).toISOString(),
      endAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      durationMinutes: 10,
      maxAttempts: 1
    }, teacherSession.user)).toThrow(/draft/i);
  });

  test('question upload rejects non-raster image types', async () => {
    const teacherSession = authService.login('teacher@example.com', 'Teacher123!');
    await request(app)
      .post('/api/questions/upload')
      .set('Cookie', cookie(teacherSession))
      .attach('file', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), {
        filename: 'question.svg',
        contentType: 'image/svg+xml'
      })
      .expect(400);
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
