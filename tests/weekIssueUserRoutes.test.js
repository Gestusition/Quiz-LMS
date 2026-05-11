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

const TEST_DB = path.join(__dirname, 'test_week_issue_user_routes.db');
let counter = 0;

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

function stamp(prefix) {
  counter += 1;
  return `${prefix}${String(Date.now()).slice(-5)}${counter}`;
}

function cookie(session) {
  return `auth_token=${session.token}`;
}

function createUser(role) {
  const id = stamp(role[0]);
  const payload = {
    name: `Week Issue ${role} ${id}`,
    username: `wi-${role}-${id}`,
    email: `wi-${role}-${id}@example.com`,
    role,
    password: 'WeekIssue123!'
  };
  if (role === 'teacher') payload.staffNumber = `WIT-${id}`;
  if (role === 'student') payload.studentNumber = `WIS-${id}`;
  return authService.createUser(payload);
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
  const course = courseService.create({
    code: `WI-${stamp('c')}`.toUpperCase(),
    title: 'Week Issue Course',
    visibility: 'published'
  }, teacher);
  courseService.enroll(course.id, student.id, 'student');

  ctx = {
    admin,
    teacher,
    otherTeacher,
    student,
    course,
    adminSession: authService.login(admin.username, 'WeekIssue123!'),
    teacherSession: authService.login(teacher.email, 'WeekIssue123!'),
    otherTeacherSession: authService.login(otherTeacher.email, 'WeekIssue123!'),
    studentSession: authService.login(student.studentNumber, 'WeekIssue123!')
  };
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('course week resource routes', () => {
  test('covers week CRUD, resource CRUD, protected-download misses, and validation failures', async () => {
    await request(app)
      .get('/api/weeks/courses/not-number/weeks')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .post(`/api/weeks/courses/${ctx.course.id}/weeks`)
      .set('Cookie', cookie(ctx.studentSession))
      .send({ weekNumber: 1, title: 'Forbidden Week' })
      .expect(403);

    const week = (await request(app)
      .post(`/api/weeks/courses/${ctx.course.id}/weeks`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        weekNumber: 3,
        title: 'Route Week',
        description: 'Weekly route coverage',
        visible: true
      })
      .expect(201)).body;

    await request(app)
      .get(`/api/weeks/courses/${ctx.course.id}/weeks?page=1&limit=5`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200);

    await request(app)
      .put('/api/weeks/weeks/not-number')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ title: 'Bad' })
      .expect(400);

    await request(app)
      .put(`/api/weeks/weeks/${week.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ title: 'Route Week Updated' })
      .expect(200);

    const link = (await request(app)
      .post(`/api/weeks/weeks/${week.id}/resources`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ title: 'Week Link', type: 'link', content: 'https://example.com/week' })
      .expect(201)).body;

    const fileResource = (await request(app)
      .post(`/api/weeks/weeks/${week.id}/resources`)
      .set('Cookie', cookie(ctx.teacherSession))
      .field('title', 'Week File')
      .attach('file', Buffer.from('Week file resource\n'), {
        filename: 'week-resource.txt',
        contentType: 'text/plain'
      })
      .expect(201)).body;

    await request(app)
      .get(`/api/weeks/weeks/${week.id}/resources?page=1&limit=5`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200);

    await request(app)
      .get('/api/weeks/week-resources/not-number/download')
      .set('Cookie', cookie(ctx.studentSession))
      .expect(400);

    await request(app)
      .get(`/api/weeks/week-resources/${link.id}/download`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(404);

    await request(app)
      .get(`/api/weeks/week-resources/${fileResource.id}/download`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200);

    await request(app)
      .delete('/api/weeks/week-resources/not-number')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .delete(`/api/weeks/week-resources/${fileResource.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .delete(`/api/weeks/week-resources/${link.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .delete('/api/weeks/weeks/not-number')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .delete(`/api/weeks/weeks/${week.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);
  });
});

describe('validation issue routes', () => {
  test('covers admin and teacher issue list, create, update, access checks, and bad query parsing', async () => {
    await request(app)
      .get('/api/issues')
      .set('Cookie', cookie(ctx.studentSession))
      .expect(403);

    await request(app)
      .get('/api/issues?entityId=bad')
      .set('Cookie', cookie(ctx.adminSession))
      .expect(400);

    await request(app)
      .post('/api/issues')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        entityType: 'course',
        entityId: ctx.course.id,
        relatedCourseId: 999999,
        message: 'Teacher cannot report this course'
      })
      .expect(403);

    const teacherIssue = (await request(app)
      .post('/api/issues')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        entityType: 'course',
        entityId: ctx.course.id,
        relatedCourseId: ctx.course.id,
        severity: 'warning',
        message: 'Teacher-visible course issue'
      })
      .expect(201)).body;

    const adminOnlyIssue = (await request(app)
      .post('/api/issues')
      .set('Cookie', cookie(ctx.adminSession))
      .send({
        entityType: 'user',
        entityId: ctx.student.id,
        relatedUserId: ctx.student.id,
        severity: 'info',
        message: 'Admin-owned issue'
      })
      .expect(201)).body;

    await request(app)
      .get(`/api/issues?relatedCourseId=${ctx.course.id}&status=open`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200)
      .expect(response => {
        expect(response.body.items.map(item => item.id)).toContain(teacherIssue.id);
      });

    await request(app)
      .get('/api/issues?relatedCourseId=999999')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(403);

    await request(app)
      .put(`/api/issues/${adminOnlyIssue.id}/status`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ status: 'resolved' })
      .expect(403);

    await request(app)
      .put('/api/issues/not-number/status')
      .set('Cookie', cookie(ctx.adminSession))
      .send({ status: 'resolved' })
      .expect(400);

    await request(app)
      .put(`/api/issues/${teacherIssue.id}/status`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ status: 'resolved' })
      .expect(200);
  });
});

describe('admin user routes', () => {
  test('covers user detail, route validation failures, password set, self-delete block, and delete missing', async () => {
    await request(app)
      .get('/api/users/999999')
      .set('Cookie', cookie(ctx.adminSession))
      .expect(404);

    await request(app)
      .get(`/api/users/${ctx.student.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200);

    await request(app)
      .put('/api/users/not-number')
      .set('Cookie', cookie(ctx.adminSession))
      .send({ name: 'Bad' })
      .expect(400);

    await request(app)
      .put(`/api/users/${ctx.student.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .send({ cohort: '2030' })
      .expect(200);

    await request(app)
      .put(`/api/users/${ctx.student.id}/password`)
      .set('Cookie', cookie(ctx.adminSession))
      .send({ password: 'WeekIssueNew123!' })
      .expect(200);

    await request(app)
      .post('/api/users/999999/password-reset-code')
      .set('Cookie', cookie(ctx.adminSession))
      .expect(404);

    await request(app)
      .delete(`/api/users/${ctx.admin.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(400);

    await request(app)
      .delete('/api/users/999999')
      .set('Cookie', cookie(ctx.adminSession))
      .expect(404);
  });
});
