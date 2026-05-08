const path = require('path');
const fs = require('fs');
const request = require('supertest');
const app = require('../server');
const { initDatabase, seedDatabase, closeDatabase, resolveDatabaseFiles, getDatabase } = require('../database/db');
const authService = require('../services/authService');
const gradeSchemeService = require('../services/gradeSchemeService');
const quizService = require('../services/quizService');
const categoryService = require('../services/categoryService');
const questionService = require('../services/questionService');

const TEST_DB = path.join(__dirname, 'test_lms_regression.db');

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

function thresholds(overrides = {}) {
  const base = { AA: 90, BA: 85, BB: 80, CB: 75, CC: 70, DC: 60, DD: 50, FD: 40, FF: 0, ...overrides };
  return ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF']
    .map(letterGrade => ({ letterGrade, minScore: base[letterGrade] }));
}

let ctx;
const createdUploadUrls = [];

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();

  const stamp = Date.now();
  const db = getDatabase();
  const term = db.prepare('SELECT id FROM academic_terms WHERE isActive = 1 ORDER BY id DESC LIMIT 1').get();

  const admin = authService.createUser({
    name: 'Regression Admin',
    username: `reg-admin-${stamp}`,
    email: `reg-admin-${stamp}@example.com`,
    role: 'admin',
    password: 'Regression123!'
  });
  const teacherA = authService.createUser({
    name: 'Regression Teacher A',
    username: `reg-teacher-a-${stamp}`,
    email: `reg-teacher-a-${stamp}@example.com`,
    role: 'teacher',
    password: 'Regression123!',
    staffNumber: `RTA-${stamp}`
  });
  const teacherB = authService.createUser({
    name: 'Regression Teacher B',
    username: `reg-teacher-b-${stamp}`,
    email: `reg-teacher-b-${stamp}@example.com`,
    role: 'teacher',
    password: 'Regression123!',
    staffNumber: `RTB-${stamp}`
  });
  const studentA = authService.createUser({
    name: 'Regression Student A',
    username: `reg-student-a-${stamp}`,
    email: `reg-student-a-${stamp}@example.com`,
    role: 'student',
    password: 'Regression123!',
    studentNumber: `RSA-${stamp}`
  });
  const studentB = authService.createUser({
    name: 'Regression Student B',
    username: `reg-student-b-${stamp}`,
    email: `reg-student-b-${stamp}@example.com`,
    role: 'student',
    password: 'Regression123!',
    studentNumber: `RSB-${stamp}`
  });

  const courseAId = Number(db.prepare("INSERT INTO courses (code, title, visibility, createdBy) VALUES (?, ?, 'published', ?)")
    .run(`REG-A-${stamp}`, 'Regression Course A', admin.id).lastInsertRowid);
  const courseBId = Number(db.prepare("INSERT INTO courses (code, title, visibility, createdBy) VALUES (?, ?, 'published', ?)")
    .run(`REG-B-${stamp}`, 'Regression Course B', admin.id).lastInsertRowid);

  db.prepare("INSERT INTO enrollments (courseId, userId, role, status) VALUES (?, ?, 'teacher', 'active')").run(courseAId, teacherA.id);
  db.prepare("INSERT INTO enrollments (courseId, userId, role, status) VALUES (?, ?, 'teacher', 'active')").run(courseBId, teacherB.id);
  db.prepare("INSERT INTO enrollments (courseId, userId, role, status) VALUES (?, ?, 'student', 'active')").run(courseAId, studentA.id);

  const offeringAId = Number(db.prepare(`
    INSERT INTO course_offerings (courseId, termId, instructorId, capacity, status)
    VALUES (?, ?, ?, 30, 'active')
  `).run(courseAId, term.id, teacherA.id).lastInsertRowid);
  const offeringBId = Number(db.prepare(`
    INSERT INTO course_offerings (courseId, termId, instructorId, capacity, status)
    VALUES (?, ?, ?, 30, 'active')
  `).run(courseBId, term.id, teacherB.id).lastInsertRowid);
  db.prepare("INSERT INTO course_offering_enrollments (courseOfferingId, studentId, status) VALUES (?, ?, 'active')")
    .run(offeringAId, studentA.id);

  const adminSession = authService.login(admin.username, 'Regression123!');
  const teacherASession = authService.login(teacherA.email, 'Regression123!');
  const teacherBSession = authService.login(teacherB.email, 'Regression123!');
  const studentASession = authService.login(studentA.studentNumber, 'Regression123!');
  const studentBSession = authService.login(studentB.studentNumber, 'Regression123!');

  const schemeA = gradeSchemeService.ensureDefault(courseAId, teacherA.id);
  const schemeB = gradeSchemeService.ensureDefault(courseBId, teacherB.id);

  const catA = categoryService.create({ courseId: courseAId, name: `Regression Questions A ${stamp}` });
  const q10 = questionService.create({
    categoryId: catA.id,
    text: 'Ten point question?',
    type: 'MC',
    options: ['Correct', 'Wrong'],
    correctAnswer: '0',
    points: 10
  });
  const q100 = questionService.create({
    categoryId: catA.id,
    text: 'Hundred point question?',
    type: 'MC',
    options: ['Correct', 'Wrong'],
    correctAnswer: '0',
    points: 100
  });
  const qMissing = questionService.create({
    categoryId: catA.id,
    text: 'Missing attempt question?',
    type: 'MC',
    options: ['Correct', 'Wrong'],
    correctAnswer: '0',
    points: 5
  });

  const quiz10 = quizService.create({ courseId: courseAId, title: 'Small Quiz', status: 'draft', durationMinutes: 10 }, teacherASession.user);
  const quiz100 = quizService.create({ courseId: courseAId, title: 'Large Exam', status: 'draft', durationMinutes: 10 }, teacherASession.user);
  const quizMissing = quizService.create({ courseId: courseAId, title: 'No Attempt Quiz', status: 'draft', durationMinutes: 10 }, teacherASession.user);
  quizService.setQuestions(quiz10.id, [q10.id], teacherA.id);
  quizService.setQuestions(quiz100.id, [q100.id], teacherA.id);
  quizService.setQuestions(quizMissing.id, [qMissing.id], teacherA.id);
  quizService.update(quiz10.id, { status: 'published' }, teacherASession.user);
  quizService.update(quiz100.id, { status: 'published' }, teacherASession.user);
  quizService.update(quizMissing.id, { status: 'published' }, teacherASession.user);

  db.prepare(`
    INSERT INTO quiz_attempts (quizId, userId, attemptNumber, status, score, maxScore, percentage, lifecycleStatus)
    VALUES (?, ?, 1, 'submitted', 10, 10, 100, 'graded')
  `).run(quiz10.id, studentA.id);
  db.prepare(`
    INSERT INTO quiz_attempts (quizId, userId, attemptNumber, status, score, maxScore, percentage, lifecycleStatus)
    VALUES (?, ?, 1, 'submitted', 50, 100, 50, 'graded')
  `).run(quiz100.id, studentA.id);

  ctx = {
    admin, teacherA, teacherB, studentA, studentB,
    adminSession, teacherASession, teacherBSession, studentASession, studentBSession,
    courseAId, courseBId, offeringAId, offeringBId, schemeA, schemeB,
    quiz10, quiz100, quizMissing
  };
});

afterAll(() => {
  createdUploadUrls.forEach(url => {
    const fileName = path.basename(url || '');
    const folder = String(url || '').includes('/submissions/') ? 'submissions' : 'resources';
    const filePath = path.join(__dirname, '..', 'public', 'uploads', folder, fileName);
    if (fileName && filePath.startsWith(path.join(__dirname, '..', 'public', 'uploads')) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
  closeDatabase();
  removeDbFiles();
});

describe('grade schemes and templates are course scoped', () => {
  test('grade scheme access is admin/all and teacher/course-manager only', async () => {
    await request(app)
      .get(`/api/quizzes/grade-schemes?courseId=${ctx.courseBId}`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200);

    await request(app)
      .get(`/api/quizzes/grade-schemes?courseId=${ctx.courseAId}`)
      .set('Cookie', cookie(ctx.teacherASession))
      .expect(200)
      .expect(response => {
        expect(response.body.every(item => item.courseId === ctx.courseAId)).toBe(true);
      });

    await request(app)
      .get(`/api/quizzes/grade-schemes?courseId=${ctx.courseBId}`)
      .set('Cookie', cookie(ctx.teacherASession))
      .expect(403);

    await request(app)
      .get('/api/quizzes/grade-schemes?courseId=abc')
      .set('Cookie', cookie(ctx.teacherASession))
      .expect(400);

    await request(app)
      .get(`/api/quizzes/grade-schemes?courseId=${ctx.courseAId}`)
      .set('Cookie', cookie(ctx.studentASession))
      .expect(403);

    await request(app)
      .put(`/api/quizzes/grade-schemes/${ctx.schemeB.id}/thresholds`)
      .set('Cookie', cookie(ctx.teacherASession))
      .send({ thresholds: thresholds() })
      .expect(403);
  });

  test('threshold validation rejects invalid values and accepts Turkish grade scale edits', async () => {
    await request(app)
      .put(`/api/quizzes/grade-schemes/${ctx.schemeA.id}/thresholds`)
      .set('Cookie', cookie(ctx.teacherASession))
      .send({ thresholds: thresholds({ BA: 90 }) })
      .expect(400);

    await request(app)
      .put(`/api/quizzes/grade-schemes/${ctx.schemeA.id}/thresholds`)
      .set('Cookie', cookie(ctx.teacherASession))
      .send({ thresholds: thresholds({ FD: 'bad' }) })
      .expect(400);

    await request(app)
      .put(`/api/quizzes/grade-schemes/${ctx.schemeA.id}/thresholds`)
      .set('Cookie', cookie(ctx.teacherASession))
      .send({ thresholds: thresholds({ DC: 65, DD: 55, FD: 45 }) })
      .expect(200)
      .expect(response => {
        expect(response.body.thresholds.map(item => item.letterGrade)).toEqual(['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF']);
      });
  });

  test('teacher template access excludes other managed-course templates', async () => {
    const templateA = (await request(app)
      .post('/api/quizzes/templates')
      .set('Cookie', cookie(ctx.teacherASession))
      .send({ name: 'Course A Template', courseId: ctx.courseAId, defaults: { durationMinutes: 20 } })
      .expect(201)).body;

    const templateB = (await request(app)
      .post('/api/quizzes/templates')
      .set('Cookie', cookie(ctx.teacherBSession))
      .send({ name: 'Course B Template', courseId: ctx.courseBId, defaults: { durationMinutes: 40 } })
      .expect(201)).body;

    await request(app)
      .get(`/api/quizzes/templates?courseId=${ctx.courseAId}`)
      .set('Cookie', cookie(ctx.teacherASession))
      .expect(200)
      .expect(response => {
        expect(response.body.some(item => item.id === templateA.id)).toBe(true);
        expect(response.body.some(item => item.id === templateB.id)).toBe(false);
      });

    await request(app)
      .get(`/api/quizzes/templates/${templateB.id}`)
      .set('Cookie', cookie(ctx.teacherASession))
      .expect(403);

    await request(app)
      .post('/api/quizzes/templates')
      .set('Cookie', cookie(ctx.teacherASession))
      .send({ name: 'Forbidden Template', courseId: ctx.courseBId, defaults: {} })
      .expect(403);

    await request(app)
      .put(`/api/quizzes/templates/${templateB.id}`)
      .set('Cookie', cookie(ctx.teacherASession))
      .send({ name: 'Nope' })
      .expect(403);

    await request(app)
      .put(`/api/quizzes/templates/${templateB.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .send({ name: 'Admin Updated Template' })
      .expect(200);

    await request(app)
      .get('/api/quizzes/templates')
      .set('Cookie', cookie(ctx.studentASession))
      .expect(403);
  });
});

describe('gradebook calculation', () => {
  test('uses submitted-point weighted average and custom thresholds', async () => {
    await request(app)
      .get(`/api/courses/${ctx.courseAId}/gradebook`)
      .set('Cookie', cookie(ctx.teacherASession))
      .expect(200)
      .expect(response => {
        const row = response.body.students.find(student => student.id === ctx.studentA.id);
        expect(row.weightedAverage).toBe(54.55);
        expect(row.average).toBe(54.55);
        expect(row.finalLetterGrade).toBe('FD');
        expect(row.completedQuizCount).toBe(2);
        expect(row.totalQuizCount).toBe(3);
        expect(row.quizzes.some(item => item.quizId === ctx.quizMissing.id && item.percentage === null)).toBe(true);
      });

    await request(app)
      .get(`/api/courses/${ctx.courseAId}/gradebook`)
      .set('Cookie', cookie(ctx.teacherBSession))
      .expect(403);
  });
});

describe('protected downloads and attendance self marking', () => {
  test('course resources and assignment submissions require authorized downloads', async () => {
    const resource = (await request(app)
      .post(`/api/courses/${ctx.courseAId}/resources`)
      .set('Cookie', cookie(ctx.teacherASession))
      .field('title', 'Protected Notes')
      .field('type', 'file')
      .attach('file', Buffer.from('safe text notes\n'), {
        filename: 'notes.txt',
        contentType: 'text/plain'
      })
      .expect(201)).body;

    expect(resource.downloadUrl).toBe(`/api/courses/resources/${resource.id}/download`);
    createdUploadUrls.push(resource.url);

    await request(app).get(resource.url).expect(404);
    await request(app).get(resource.downloadUrl).expect(401);
    await request(app).get(resource.downloadUrl).set('Cookie', cookie(ctx.studentBSession)).expect(403);
    await request(app).get(resource.downloadUrl).set('Cookie', cookie(ctx.studentASession)).expect(200)
      .expect(response => expect(response.headers['content-disposition']).toMatch(/attachment/));

    const assignment = (await request(app)
      .post('/api/academic/assignments')
      .set('Cookie', cookie(ctx.teacherASession))
      .send({
        courseOfferingId: ctx.offeringAId,
        title: 'Protected Submission Assignment',
        description: 'Upload a file.',
        dueDate: '2027-01-01',
        status: 'published'
      })
      .expect(201)).body;

    const submission = (await request(app)
      .post(`/api/academic/assignments/${assignment.id}/submissions`)
      .set('Cookie', cookie(ctx.studentASession))
      .field('submissionText', 'Attached.')
      .attach('file', Buffer.from('# answer\n'), {
        filename: 'answer.md',
        contentType: 'text/markdown'
      })
      .expect(201)).body;

    expect(submission.downloadUrl).toBe(`/api/academic/submissions/${submission.id}/download`);
    createdUploadUrls.push(submission.submissionUrl);
    await request(app).get(submission.submissionUrl).expect(404);
    await request(app).get(submission.downloadUrl).expect(401);
    await request(app).get(submission.downloadUrl).set('Cookie', cookie(ctx.studentBSession)).expect(403);
    await request(app).get(submission.downloadUrl).set('Cookie', cookie(ctx.teacherBSession)).expect(403);
    await request(app).get(submission.downloadUrl).set('Cookie', cookie(ctx.teacherASession)).expect(200);
    await request(app).get(submission.downloadUrl).set('Cookie', cookie(ctx.adminSession)).expect(200);
  });

  test('student self-attendance is open-session scoped and removable with note', async () => {
    const session = (await request(app)
      .post('/api/academic/attendance/sessions')
      .set('Cookie', cookie(ctx.teacherASession))
      .send({
        courseOfferingId: ctx.offeringAId,
        sessionDate: '2027-02-01T10:00:00.000Z',
        topic: 'Regression attendance'
      })
      .expect(201)).body;

    const record = (await request(app)
      .post(`/api/academic/attendance/sessions/${session.id}/self`)
      .set('Cookie', cookie(ctx.studentASession))
      .expect(201)).body;
    expect(record.status).toBe('present');

    await request(app)
      .post(`/api/academic/attendance/sessions/${session.id}/self`)
      .set('Cookie', cookie(ctx.studentASession))
      .expect(409);

    await request(app)
      .post(`/api/academic/attendance/sessions/${session.id}/self`)
      .set('Cookie', cookie(ctx.studentBSession))
      .expect(403);

    await request(app)
      .put(`/api/academic/attendance/records/${record.id}/remove`)
      .set('Cookie', cookie(ctx.teacherASession))
      .send({})
      .expect(400);

    await request(app)
      .put(`/api/academic/attendance/records/${record.id}/remove`)
      .set('Cookie', cookie(ctx.teacherBSession))
      .send({ removalNote: 'Wrong course.' })
      .expect(403);

    await request(app)
      .put(`/api/academic/attendance/records/${record.id}/remove`)
      .set('Cookie', cookie(ctx.teacherASession))
      .send({ removalNote: 'Student was not physically present.' })
      .expect(200)
      .expect(response => {
        expect(response.body.status).toBe('removed');
        expect(response.body.removalNote).toMatch(/physically present/);
      });

    await request(app)
      .get(`/api/academic/attendance/offerings/${ctx.offeringAId}/summary`)
      .set('Cookie', cookie(ctx.teacherASession))
      .expect(200)
      .expect(response => {
        expect(response.body.summary.find(item => item.status === 'present')).toBeUndefined();
      });

    const closedSession = (await request(app)
      .post('/api/academic/attendance/sessions')
      .set('Cookie', cookie(ctx.teacherASession))
      .send({
        courseOfferingId: ctx.offeringAId,
        sessionDate: '2027-02-02T10:00:00.000Z',
        topic: 'Closed attendance'
      })
      .expect(201)).body;

    await request(app)
      .put(`/api/academic/attendance/sessions/${closedSession.id}/close`)
      .set('Cookie', cookie(ctx.teacherASession))
      .expect(200);

    await request(app)
      .post(`/api/academic/attendance/sessions/${closedSession.id}/self`)
      .set('Cookie', cookie(ctx.studentASession))
      .expect(400);
  });
});
