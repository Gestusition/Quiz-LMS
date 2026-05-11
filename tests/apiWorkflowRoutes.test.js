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

const TEST_DB = path.join(__dirname, 'test_api_workflow_routes.db');

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

let ctx;

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();
  settingsService.setMaintenanceMode(false);

  const stamp = String(Date.now()).slice(-8);
  const admin = authService.createUser({
    name: `Route Flow Admin ${stamp}`,
    username: `route-flow-admin-${stamp}`,
    email: `route-flow-admin-${stamp}@example.com`,
    role: 'admin',
    password: 'RouteFlow123!'
  });
  const teacher = authService.createUser({
    name: `Route Flow Teacher ${stamp}`,
    username: `route-flow-teacher-${stamp}`,
    email: `route-flow-teacher-${stamp}@example.com`,
    role: 'teacher',
    password: 'RouteFlow123!',
    staffNumber: `RFT-${stamp}`
  });
  const student = authService.createUser({
    name: `Route Flow Student ${stamp}`,
    username: `route-flow-student-${stamp}`,
    email: `route-flow-student-${stamp}@example.com`,
    role: 'student',
    password: 'RouteFlow123!',
    studentNumber: `RFS-${stamp}`
  });
  const outsider = authService.createUser({
    name: `Route Flow Outsider ${stamp}`,
    username: `route-flow-outsider-${stamp}`,
    email: `route-flow-outsider-${stamp}@example.com`,
    role: 'student',
    password: 'RouteFlow123!',
    studentNumber: `RFO-${stamp}`
  });

  const course = courseService.create({
    code: `RFL-${stamp}`,
    title: `Route Flow Course ${stamp}`,
    visibility: 'published'
  }, teacher);
  courseService.enroll(course.id, student.id, 'student');

  ctx = {
    admin,
    teacher,
    student,
    outsider,
    course,
    adminSession: authService.login(admin.username, 'RouteFlow123!'),
    teacherSession: authService.login(teacher.email, 'RouteFlow123!'),
    studentSession: authService.login(student.studentNumber, 'RouteFlow123!'),
    outsiderSession: authService.login(outsider.studentNumber, 'RouteFlow123!')
  };
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('import routes', () => {
  test('admin can create, list, add row errors, and resolve import workflow records', async () => {
    const batch = (await request(app)
      .post('/api/imports/batches')
      .set('Cookie', cookie(ctx.adminSession))
      .send({
        type: 'students',
        fileName: 'students.csv',
        status: 'partially_failed',
        totalRows: 2,
        successCount: 1,
        failedCount: 1
      })
      .expect(201)).body;

    await request(app)
      .get('/api/imports/batches?type=students&status=partially_failed&date=2026-05-11&limit=5')
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200)
      .expect(response => {
        expect(response.body.pagination.limit).toBe(5);
      });

    const rowError = (await request(app)
      .post(`/api/imports/batches/${batch.id}/errors`)
      .set('Cookie', cookie(ctx.adminSession))
      .send({
        rowNumber: 2,
        rawData: { studentNumber: 'RFS-1' },
        errorField: 'studentNumber',
        errorMessage: 'Duplicate student number'
      })
      .expect(201)).body;

    await request(app)
      .get(`/api/imports/batches/${batch.id}/errors?status=unresolved`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200)
      .expect(response => {
        expect(response.body.items.map(item => item.id)).toContain(rowError.id);
      });

    await request(app)
      .put(`/api/imports/errors/${rowError.id}/resolve`)
      .set('Cookie', cookie(ctx.adminSession))
      .send({ status: 'ignored', fixedData: { note: 'Accepted manually' } })
      .expect(200)
      .expect(response => {
        expect(response.body.status).toBe('ignored');
      });
  });

  test('import routes validate admin access and bad inputs', async () => {
    await request(app)
      .get('/api/imports/batches')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(403);

    await request(app)
      .get('/api/imports/batches?date=bad-date')
      .set('Cookie', cookie(ctx.adminSession))
      .expect(400);

    await request(app)
      .post('/api/imports/batches')
      .set('Cookie', cookie(ctx.adminSession))
      .send({ type: 'bad', fileName: 'bad.csv' })
      .expect(400);

    await request(app)
      .get('/api/imports/batches/not-number/errors')
      .set('Cookie', cookie(ctx.adminSession))
      .expect(400);
  });
});

describe('discussion routes', () => {
  test('course members can use discussion routes and managers can lock threads', async () => {
    const thread = (await request(app)
      .post(`/api/discussion/courses/${ctx.course.id}/threads`)
      .set('Cookie', cookie(ctx.studentSession))
      .send({ title: 'Route thread', body: 'Can we ask questions here?' })
      .expect(201)).body;

    await request(app)
      .get(`/api/discussion/threads/${thread.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200)
      .expect(response => {
        expect(response.body.id).toBe(thread.id);
      });

    await request(app)
      .get(`/api/discussion/courses/${ctx.course.id}/threads?status=open&limit=10`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200)
      .expect(response => {
        expect(response.body.items.map(item => item.id)).toContain(thread.id);
      });

    const reply = (await request(app)
      .post(`/api/discussion/threads/${thread.id}/replies`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ body: 'Yes, this is the right place.' })
      .expect(201)).body;

    await request(app)
      .get(`/api/discussion/threads/${thread.id}/replies?page=1&limit=5`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200)
      .expect(response => {
        expect(response.body.items.map(item => item.id)).toContain(reply.id);
      });

    await request(app)
      .put(`/api/discussion/threads/${thread.id}/status`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ status: 'locked' })
      .expect(200)
      .expect(response => {
        expect(response.body.status).toBe('locked');
      });

    await request(app)
      .post(`/api/discussion/threads/${thread.id}/replies`)
      .set('Cookie', cookie(ctx.studentSession))
      .send({ body: 'Can I still post?' })
      .expect(403);
  });

  test('discussion routes reject bad IDs and non-members', async () => {
    await request(app)
      .get('/api/discussion/courses/not-number/threads')
      .set('Cookie', cookie(ctx.studentSession))
      .expect(400);

    await request(app)
      .post(`/api/discussion/courses/${ctx.course.id}/threads`)
      .set('Cookie', cookie(ctx.outsiderSession))
      .send({ title: 'No access', body: 'This should fail.' })
      .expect(403);

    await request(app)
      .put('/api/discussion/threads/999999/status')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ status: 'locked' })
      .expect(404);
  });
});

describe('restriction, settings, audit, and analytics routes', () => {
  test('admin can create, filter, and deactivate restrictions', async () => {
    const restriction = (await request(app)
      .post('/api/restrictions')
      .set('Cookie', cookie(ctx.adminSession))
      .send({
        userId: ctx.student.id,
        restrictionType: 'manual_review_required',
        scopeType: 'course',
        scopeId: ctx.course.id,
        reason: 'Route flow review'
      })
      .expect(201)).body;

    await request(app)
      .get(`/api/restrictions?userId=${ctx.student.id}&scopeType=course&scopeId=${ctx.course.id}&activeOnly=true`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200)
      .expect(response => {
        expect(response.body.items.map(item => item.id)).toContain(restriction.id);
      });

    await request(app)
      .put(`/api/restrictions/${restriction.id}/deactivate`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200)
      .expect(response => {
        expect(Boolean(response.body.isActive)).toBe(false);
      });
  });

  test('settings, audit, and analytics routes cover success and validation failures', async () => {
    await request(app)
      .get('/api/analytics/admin')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(403);

    await request(app)
      .get('/api/analytics/admin')
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200)
      .expect(response => {
        expect(response.body.totals).toBeDefined();
      });

    await request(app)
      .put('/api/settings/maintenance')
      .set('Cookie', cookie(ctx.adminSession))
      .send({ enabled: 'maybe' })
      .expect(400);

    await request(app)
      .get('/api/audit?date=bad-date')
      .set('Cookie', cookie(ctx.adminSession))
      .expect(400);

    await request(app)
      .get('/api/audit?limit=5')
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200)
      .expect(response => {
        expect(Array.isArray(response.body)).toBe(true);
      });
  });

  test('restriction route validates admin access and bad input', async () => {
    await request(app)
      .get('/api/restrictions')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(403);

    await request(app)
      .get('/api/restrictions?userId=bad')
      .set('Cookie', cookie(ctx.adminSession))
      .expect(400);

    await request(app)
      .post('/api/restrictions')
      .set('Cookie', cookie(ctx.adminSession))
      .send({
        userId: ctx.student.id,
        restrictionType: 'chat_muted',
        scopeType: 'course'
      })
      .expect(400);

    await request(app)
      .put('/api/restrictions/not-number/deactivate')
      .set('Cookie', cookie(ctx.adminSession))
      .expect(400);
  });
});
