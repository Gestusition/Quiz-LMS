const path = require('path');
const fs = require('fs');
const request = require('supertest');
const app = require('../server');
const {
  initDatabase,
  seedDatabase,
  closeDatabase,
  resolveDatabaseFiles
} = require('../database/db');
const authService = require('../services/authService');
const settingsService = require('../services/settingsService');
const courseService = require('../services/courseService');
const gradeSchemeService = require('../services/gradeSchemeService');

const TEST_DB = path.join(__dirname, 'test_route_crud_edges.db');
let counter = 0;

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

function stamp(label = 'r') {
  counter += 1;
  return `${label}${String(Date.now()).slice(-5)}${counter}`;
}

function cookie(session) {
  return `auth_token=${session.token}`;
}

function createUser(role) {
  const id = stamp(role[0]);
  const payload = {
    name: `Route ${role} ${id}`,
    username: `rt-${role}-${id}`,
    email: `rt-${role}-${id}@example.com`,
    role,
    password: 'RouteCrud123!'
  };
  if (role === 'teacher') payload.staffNumber = `T-${id}`;
  if (role === 'student') payload.studentNumber = `S-${id}`;
  return authService.createUser(payload);
}

function quizPayload(courseId, title) {
  return {
    courseId,
    title,
    description: 'Route CRUD quiz',
    status: 'draft',
    startAt: new Date(Date.now() - 60_000).toISOString(),
    endAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    durationMinutes: 10,
    maxAttempts: 2
  };
}

let ctx;

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();
  settingsService.setMaintenanceMode(false);

  const admin = createUser('admin');
  const teacher = createUser('teacher');
  const otherTeacher = createUser('teacher');
  const student = createUser('student');
  const outsider = createUser('student');
  ctx = {
    admin,
    teacher,
    otherTeacher,
    student,
    outsider,
    adminSession: authService.login(admin.username, 'RouteCrud123!'),
    teacherSession: authService.login(teacher.email, 'RouteCrud123!'),
    otherTeacherSession: authService.login(otherTeacher.email, 'RouteCrud123!'),
    studentSession: authService.login(student.studentNumber, 'RouteCrud123!'),
    outsiderSession: authService.login(outsider.studentNumber, 'RouteCrud123!')
  };
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('course route CRUD and content edges', () => {
  test('covers course, enrollment, announcement, resource, and gradebook endpoints', async () => {
    const code = `RC-${stamp('c')}`.toUpperCase();

    await request(app)
      .get('/api/courses?search=none')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .post('/api/courses')
      .set('Cookie', cookie(ctx.studentSession))
      .send({ code, title: 'Forbidden Course' })
      .expect(403);

    await request(app)
      .post('/api/courses')
      .set('Cookie', cookie(ctx.adminSession))
      .send({ code: '!', title: 'Bad' })
      .expect(400);

    const course = (await request(app)
      .post('/api/courses')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        code,
        title: `Route CRUD Course ${code}`,
        description: 'Created through course route tests.',
        visibility: 'published'
      })
      .expect(201)).body;

    await request(app)
      .get(`/api/courses/${course.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .get('/api/courses/not-number/participants')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .get(`/api/courses/${course.id}/participants`)
      .set('Cookie', cookie(ctx.outsiderSession))
      .expect(403);

    await request(app)
      .post(`/api/courses/${course.id}/enrollments`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ userId: 'bad', role: 'student' })
      .expect(400);

    const studentEnrollment = (await request(app)
      .post(`/api/courses/${course.id}/enrollments`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ userId: ctx.student.id, role: 'student' })
      .expect(201)).body;

    const teacherEnrollment = (await request(app)
      .post(`/api/courses/${course.id}/enrollments`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ userId: ctx.otherTeacher.id, role: 'teacher' })
      .expect(201)).body;

    await request(app)
      .get(`/api/courses/${course.id}/participants`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200)
      .expect(response => {
        expect(response.body.map(item => item.id)).toContain(ctx.student.id);
      });

    await request(app)
      .put('/api/courses/enrollments/not-number')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ status: 'suspended' })
      .expect(400);

    await request(app)
      .put('/api/courses/enrollments/999999')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ status: 'suspended' })
      .expect(404);

    await request(app)
      .put(`/api/courses/enrollments/${studentEnrollment.enrollmentId}`)
      .set('Cookie', cookie(ctx.outsiderSession))
      .send({ status: 'suspended' })
      .expect(403);

    await request(app)
      .put(`/api/courses/enrollments/${studentEnrollment.enrollmentId}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ status: 'suspended' })
      .expect(200);

    await request(app)
      .post(`/api/courses/${course.id}/enrollments`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ userId: ctx.student.id, role: 'student' })
      .expect(201);

    await request(app)
      .delete('/api/courses/enrollments/not-number')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .delete(`/api/courses/enrollments/${teacherEnrollment.enrollmentId}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    const announcement = (await request(app)
      .post(`/api/courses/${course.id}/announcements`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ title: 'Route announcement', body: 'Visible to course members.' })
      .expect(201)).body;

    await request(app)
      .get(`/api/courses/${course.id}/announcements`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200);

    await request(app)
      .delete('/api/courses/announcements/not-number')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .delete('/api/courses/announcements/999999')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(404);

    await request(app)
      .delete(`/api/courses/announcements/${announcement.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    const resource = (await request(app)
      .post(`/api/courses/${course.id}/resources`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        title: 'Route resource',
        type: 'link',
        url: 'https://example.com/route-resource'
      })
      .expect(201)).body;

    const fileResource = (await request(app)
      .post(`/api/courses/${course.id}/resources`)
      .set('Cookie', cookie(ctx.teacherSession))
      .field('title', 'Route file resource')
      .attach('file', Buffer.from('Route file resource\n'), {
        filename: 'route-resource.txt',
        contentType: 'text/plain'
      })
      .expect(201)).body;

    await request(app)
      .get(`/api/courses/${course.id}/resources`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200);

    await request(app)
      .get('/api/courses/resources/not-number/download')
      .set('Cookie', cookie(ctx.studentSession))
      .expect(400);

    await request(app)
      .get(`/api/courses/resources/${resource.id}/download`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(404);

    await request(app)
      .get(`/api/courses/resources/${fileResource.id}/download`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200);

    await request(app)
      .delete('/api/courses/resources/not-number')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .delete(`/api/courses/resources/${fileResource.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .delete(`/api/courses/resources/${resource.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .get(`/api/courses/${course.id}/gradebook`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .put(`/api/courses/${course.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ title: 'Route CRUD Course Updated' })
      .expect(200);

    await request(app)
      .delete(`/api/courses/${course.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);
  });
});

describe('category and question route edges', () => {
  test('covers access helpers, CRUD, sharing errors, random questions, and upload no-file response', async () => {
    const managedCourse = courseService.create({
      code: `CQ-${stamp('q')}`.toUpperCase(),
      title: 'Category Question Route Course',
      visibility: 'published'
    }, ctx.teacher);
    const otherCourse = courseService.create({
      code: `CQO-${stamp('oq')}`.toUpperCase(),
      title: 'Other Category Question Route Course',
      visibility: 'published'
    }, ctx.otherTeacher);
    courseService.enroll(managedCourse.id, ctx.student.id, 'student');

    await request(app)
      .get('/api/categories?courseId=bad')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .post('/api/categories')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ name: 'Teacher Missing Course' })
      .expect(403);

    await request(app)
      .post('/api/categories')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ name: 'Teacher Other Course', courseId: otherCourse.id })
      .expect(403);

    const category = (await request(app)
      .post('/api/categories')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        name: `Route Category ${stamp('cat')}`,
        description: 'Route category coverage',
        courseId: managedCourse.id
      })
      .expect(201)).body;

    await request(app)
      .post('/api/categories')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        name: category.name,
        courseId: managedCourse.id
      })
      .expect(400);

    const privateCategory = (await request(app)
      .post('/api/categories')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        name: `Private Route Category ${stamp('pcat')}`,
        description: 'Private route category coverage',
        courseId: managedCourse.id
      })
      .expect(201)).body;

    await request(app)
      .get(`/api/categories/${category.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .get(`/api/categories/${category.id}`)
      .set('Cookie', cookie(ctx.outsiderSession))
      .expect(403);

    await request(app)
      .get('/api/categories/999999')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(404);

    await request(app)
      .get(`/api/categories/${category.id}`)
      .set('Cookie', cookie(ctx.otherTeacherSession))
      .expect(403);

    await request(app)
      .put(`/api/categories/${category.id}`)
      .set('Cookie', cookie(ctx.otherTeacherSession))
      .send({ name: 'No Write Access' })
      .expect(403);

    await request(app)
      .put('/api/categories/999999')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ name: 'Missing Category' })
      .expect(404);

    await request(app)
      .delete('/api/categories/999999')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(404);

    await request(app)
      .put(`/api/categories/${category.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ courseId: otherCourse.id })
      .expect(403);

    await request(app)
      .post(`/api/categories/${category.id}/share`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ teacherEmail: 'missing@example.com', accessLevel: 'read' })
      .expect(400);

    await request(app)
      .get(`/api/categories/${category.id}/access`)
      .set('Cookie', cookie(ctx.otherTeacherSession))
      .expect(403);

    await request(app)
      .post(`/api/categories/${category.id}/share`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ teacherEmail: ctx.otherTeacher.email, accessLevel: 'write' })
      .expect(201);

    await request(app)
      .get(`/api/categories/${category.id}/access`)
      .set('Cookie', cookie(ctx.otherTeacherSession))
      .expect(200);

    await request(app)
      .put(`/api/categories/${category.id}`)
      .set('Cookie', cookie(ctx.otherTeacherSession))
      .send({ description: 'Shared write update' })
      .expect(200);

    await request(app)
      .delete(`/api/categories/${category.id}/access/${ctx.otherTeacher.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .delete(`/api/categories/${category.id}/access/not-number`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    const question = (await request(app)
      .post('/api/questions')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        categoryId: category.id,
        text: 'Route CRUD question?',
        type: 'MC',
        options: ['Yes', 'No'],
        correctAnswer: '0',
        difficulty: 'EASY',
        points: 2
      })
      .expect(201)).body;

    const privateQuestion = (await request(app)
      .post('/api/questions')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        categoryId: privateCategory.id,
        text: 'Private route CRUD question?',
        type: 'TF',
        correctAnswer: 'true',
        points: 1
      })
      .expect(201)).body;

    await request(app)
      .get('/api/questions?categoryId=bad')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .get('/api/questions/random?limit=bad')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .get(`/api/questions/random?courseId=${managedCourse.id}&limit=1`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200)
      .expect(response => {
        expect(response.body.length).toBeLessThanOrEqual(1);
      });

    await request(app)
      .get(`/api/questions/${question.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .get(`/api/questions/${privateQuestion.id}`)
      .set('Cookie', cookie(ctx.otherTeacherSession))
      .expect(403);

    await request(app)
      .get('/api/questions/999999')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(404);

    await request(app)
      .post('/api/questions')
      .set('Cookie', cookie(ctx.studentSession))
      .send({ categoryId: category.id, text: 'Student cannot create', type: 'TF', correctAnswer: 'true' })
      .expect(403);

    await request(app)
      .post('/api/questions')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ categoryId: 999999, text: 'Missing category', type: 'TF', correctAnswer: 'true' })
      .expect(400);

    await request(app)
      .put(`/api/questions/${question.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ categoryId: 999999 })
      .expect(400);

    await request(app)
      .put(`/api/questions/${question.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ categoryId: otherCourse.id })
      .expect(403);

    await request(app)
      .put('/api/questions/999999')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ text: 'Missing question' })
      .expect(404);

    await request(app)
      .post(`/api/questions/${question.id}/duplicate`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(201);

    await request(app)
      .post(`/api/questions/${question.id}/share`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ teacherEmail: 'missing@example.com', accessLevel: 'read' })
      .expect(400);

    await request(app)
      .post(`/api/questions/${question.id}/share`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ teacherEmail: ctx.otherTeacher.email, accessLevel: 'read' })
      .expect(201);

    await request(app)
      .get(`/api/questions/${question.id}/access`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .delete(`/api/questions/${question.id}/access/${ctx.otherTeacher.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .post('/api/questions/upload')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    const uploadResponse = await request(app)
      .post('/api/questions/upload')
      .set('Cookie', cookie(ctx.teacherSession))
      .attach('file', Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x00
      ]), {
        filename: 'route-question.png',
        contentType: 'image/png'
      })
      .expect(200);
    const uploadedPath = path.join(__dirname, '..', 'public', uploadResponse.body.url);
    if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);

    await request(app)
      .delete(`/api/questions/${question.id}`)
      .set('Cookie', cookie(ctx.otherTeacherSession))
      .expect(403);

    await request(app)
      .delete('/api/questions/999999')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(404);

    await request(app)
      .delete(`/api/questions/${question.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .delete(`/api/questions/${privateQuestion.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .delete(`/api/categories/${privateCategory.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .delete(`/api/categories/${category.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);
  });
});

describe('quiz route edges', () => {
  test('covers quiz CRUD, templates, grade schemes, questions, attempts, and error branches', async () => {
    const course = courseService.create({
      code: `QZ-${stamp('z')}`.toUpperCase(),
      title: 'Quiz Route Course',
      visibility: 'published'
    }, ctx.teacher);
    courseService.enroll(course.id, ctx.student.id, 'student');

    const category = (await request(app)
      .post('/api/categories')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ name: `Quiz Category ${stamp('qc')}`, courseId: course.id })
      .expect(201)).body;
    const question = (await request(app)
      .post('/api/questions')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        categoryId: category.id,
        text: 'Quiz route question?',
        type: 'TF',
        correctAnswer: 'true',
        points: 1
      })
      .expect(201)).body;

    await request(app)
      .get('/api/quizzes?courseId=bad')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .post('/api/quizzes')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ title: 'Missing Course' })
      .expect(400);

    await request(app)
      .post('/api/quizzes')
      .set('Cookie', cookie(ctx.outsiderSession))
      .send(quizPayload(course.id, 'Forbidden Quiz'))
      .expect(403);

    const quiz = (await request(app)
      .post('/api/quizzes')
      .set('Cookie', cookie(ctx.teacherSession))
      .send(quizPayload(course.id, `Route Quiz ${stamp('quiz')}`))
      .expect(201)).body;

    await request(app)
      .get('/api/quizzes/attempts/not-number')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .get('/api/quizzes/templates')
      .set('Cookie', cookie(ctx.studentSession))
      .expect(403);

    await request(app)
      .post('/api/quizzes/templates')
      .set('Cookie', cookie(ctx.studentSession))
      .send({ name: 'Student Template' })
      .expect(403);

    const template = (await request(app)
      .post('/api/quizzes/templates')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        name: `Route Template ${stamp('tpl')}`,
        description: 'Template via route',
        courseId: course.id,
        defaults: { durationMinutes: 20 }
      })
      .expect(201)).body;

    await request(app)
      .get(`/api/quizzes/templates/${template.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .put(`/api/quizzes/templates/${template.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ description: 'Updated route template' })
      .expect(200);

    await request(app)
      .get('/api/quizzes/grade-schemes')
      .set('Cookie', cookie(ctx.studentSession))
      .expect(403);

    const scheme = gradeSchemeService.ensureDefault(course.id, ctx.teacher.id);
    await request(app)
      .get(`/api/quizzes/grade-schemes/${scheme.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .get(`/api/quizzes/grade-schemes/${scheme.id}`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(403);

    await request(app)
      .put(`/api/quizzes/grade-schemes/${scheme.id}/thresholds`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ thresholds: gradeSchemeService.DEFAULT_THRESHOLDS })
      .expect(200);

    await request(app)
      .put(`/api/quizzes/grade-schemes/${scheme.id}/thresholds`)
      .set('Cookie', cookie(ctx.studentSession))
      .send({ thresholds: gradeSchemeService.DEFAULT_THRESHOLDS })
      .expect(403);

    await request(app)
      .get('/api/quizzes/not-number')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .get('/api/quizzes/999999')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(404);

    await request(app)
      .get(`/api/quizzes/${quiz.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .put(`/api/quizzes/${quiz.id}/questions`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ questionIds: 'bad' })
      .expect(400);

    await request(app)
      .put(`/api/quizzes/${quiz.id}/questions`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ questionIds: [question.id] })
      .expect(200);

    await request(app)
      .post(`/api/quizzes/${quiz.id}/save-as-template`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ name: `Saved Template ${stamp('sv')}` })
      .expect(201);

    await request(app)
      .put(`/api/quizzes/${quiz.id}`)
      .set('Cookie', cookie(ctx.otherTeacherSession))
      .send({ title: 'No quiz write access' })
      .expect(403);

    await request(app)
      .post(`/api/quizzes/${quiz.id}/share`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ teacherEmail: 'missing@example.com', accessLevel: 'read' })
      .expect(400);

    await request(app)
      .post(`/api/quizzes/${quiz.id}/share`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ teacherEmail: ctx.otherTeacher.email, accessLevel: 'write' })
      .expect(201);

    await request(app)
      .get(`/api/quizzes/${quiz.id}/access`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .delete(`/api/quizzes/${quiz.id}/access/${ctx.otherTeacher.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .put(`/api/quizzes/${quiz.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ status: 'published' })
      .expect(200);

    await request(app)
      .get(`/api/quizzes/${quiz.id}`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200);

    await request(app)
      .get(`/api/quizzes/${quiz.id}`)
      .set('Cookie', cookie(ctx.outsiderSession))
      .expect(403);

    await request(app)
      .get('/api/quizzes/attempts/999999')
      .set('Cookie', cookie(ctx.studentSession))
      .expect(404);

    const attempt = (await request(app)
      .post(`/api/quizzes/${quiz.id}/attempts`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(201)).body;

    await request(app)
      .post('/api/quizzes/attempts/not-number/submit')
      .set('Cookie', cookie(ctx.studentSession))
      .send({ answers: [] })
      .expect(400);

    await request(app)
      .post(`/api/quizzes/attempts/${attempt.id}/submit`)
      .set('Cookie', cookie(ctx.studentSession))
      .send({ answers: [{ questionId: question.id, answer: 'true' }] })
      .expect(200);

    await request(app)
      .get(`/api/quizzes/attempts/${attempt.id}`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200);

    await request(app)
      .get(`/api/quizzes/${quiz.id}/attempts`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200);

    await request(app)
      .get(`/api/quizzes/${quiz.id}/attempts`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .post(`/api/quizzes/${quiz.id}/release-results`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .delete(`/api/quizzes/templates/${template.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .delete(`/api/quizzes/${quiz.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);
  });
});
