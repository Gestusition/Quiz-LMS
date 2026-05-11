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

const TEST_DB = path.join(__dirname, 'test_academic_routes_expanded.db');
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
    name: `Academic Route ${role} ${id}`,
    username: `ar-${role}-${id}`,
    email: `ar-${role}-${id}@example.com`,
    role,
    password: 'AcademicRoute123!'
  };
  if (role === 'teacher') payload.staffNumber = `ART-${id}`;
  if (role === 'student') payload.studentNumber = `ARS-${id}`;
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
  const student = createUser('student');
  const course = courseService.create({
    code: `AR-${stamp('c')}`.toUpperCase(),
    title: 'Academic Route Course',
    visibility: 'published'
  }, teacher);
  courseService.enroll(course.id, student.id, 'student');

  ctx = {
    admin,
    teacher,
    student,
    course,
    adminSession: authService.login(admin.username, 'AcademicRoute123!'),
    teacherSession: authService.login(teacher.email, 'AcademicRoute123!'),
    studentSession: authService.login(student.studentNumber, 'AcademicRoute123!')
  };
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('academic hierarchy and offering API routes', () => {
  test('covers hierarchy CRUD, terms, offerings, and offering enrollments', async () => {
    await request(app)
      .get('/api/academic/faculties')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .post('/api/academic/faculties')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ name: 'Forbidden Faculty', code: 'FORBID' })
      .expect(403);

    await request(app)
      .post('/api/academic/faculties')
      .set('Cookie', cookie(ctx.adminSession))
      .send({ name: '', code: '' })
      .expect(400);

    const faculty = (await request(app)
      .post('/api/academic/faculties')
      .set('Cookie', cookie(ctx.adminSession))
      .send({ name: 'Route Faculty', code: stamp('fac').toUpperCase() })
      .expect(201)).body;

    await request(app)
      .put('/api/academic/faculties/not-number')
      .set('Cookie', cookie(ctx.adminSession))
      .send({ name: 'Bad' })
      .expect(400);

    await request(app)
      .put(`/api/academic/faculties/${faculty.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .send({ name: 'Route Faculty Updated' })
      .expect(200);

    await request(app)
      .get('/api/academic/departments')
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200);

    await request(app)
      .post('/api/academic/departments')
      .set('Cookie', cookie(ctx.adminSession))
      .send({ facultyId: 999999, name: 'Missing', code: 'MISS' })
      .expect(404);

    const department = (await request(app)
      .post('/api/academic/departments')
      .set('Cookie', cookie(ctx.adminSession))
      .send({ facultyId: faculty.id, name: 'Route Department', code: stamp('dep').toUpperCase() })
      .expect(201)).body;

    await request(app)
      .put(`/api/academic/departments/${department.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .send({ name: 'Route Department Updated' })
      .expect(200);

    await request(app)
      .get(`/api/academic/class-years?departmentId=${department.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200);

    const classYear = (await request(app)
      .post('/api/academic/class-years')
      .set('Cookie', cookie(ctx.adminSession))
      .send({ departmentId: department.id, yearNumber: 2, name: 'Second Year' })
      .expect(201)).body;

    await request(app)
      .put(`/api/academic/class-years/${classYear.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .send({ name: 'Second Year Updated' })
      .expect(200);

    await request(app)
      .get(`/api/academic/sections?classYearId=${classYear.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200);

    const section = (await request(app)
      .post('/api/academic/sections')
      .set('Cookie', cookie(ctx.adminSession))
      .send({ classYearId: classYear.id, name: 'B' })
      .expect(201)).body;

    await request(app)
      .put(`/api/academic/sections/${section.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .send({ name: 'B1' })
      .expect(200);

    await request(app)
      .get('/api/academic/terms')
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200);

    const term = (await request(app)
      .post('/api/academic/terms')
      .set('Cookie', cookie(ctx.adminSession))
      .send({
        name: `Route Term ${stamp('term')}`,
        academicYear: '2030-2031',
        semesterType: 'fall',
        startDate: '2030-09-01',
        endDate: '2031-01-15'
      })
      .expect(201)).body;

    await request(app)
      .post(`/api/academic/terms/${term.id}/active`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200);

    await request(app)
      .put(`/api/academic/terms/${term.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .send({ name: `${term.name} Updated` })
      .expect(200);

    await request(app)
      .get('/api/academic/offerings')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    const offering = (await request(app)
      .post('/api/academic/offerings')
      .set('Cookie', cookie(ctx.adminSession))
      .send({
        courseId: ctx.course.id,
        termId: term.id,
        instructorId: ctx.teacher.id,
        departmentId: department.id,
        classYearId: classYear.id,
        sectionId: section.id,
        capacity: 5,
        status: 'active'
      })
      .expect(201)).body;

    await request(app)
      .get(`/api/academic/offerings/${offering.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    const enrollment = (await request(app)
      .post('/api/academic/enrollments')
      .set('Cookie', cookie(ctx.adminSession))
      .send({ courseOfferingId: offering.id, studentId: ctx.student.id, status: 'active' })
      .expect(201)).body;

    await request(app)
      .get(`/api/academic/offerings/${offering.id}/enrollments`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .put(`/api/academic/enrollments/${enrollment.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .send({ status: 'dropped' })
      .expect(200);

    await request(app)
      .delete(`/api/academic/enrollments/${enrollment.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200);

    await request(app)
      .put(`/api/academic/offerings/${offering.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .send({ capacity: 10 })
      .expect(200);

    await request(app)
      .delete(`/api/academic/offerings/${offering.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200);

    await request(app)
      .delete(`/api/academic/sections/${section.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200);
    await request(app)
      .delete(`/api/academic/class-years/${classYear.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200);
    await request(app)
      .delete(`/api/academic/departments/${department.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200);
    await request(app)
      .delete(`/api/academic/faculties/${faculty.id}`)
      .set('Cookie', cookie(ctx.adminSession))
      .expect(200);
  });
});

describe('academic assignment and attendance API routes', () => {
  test('covers assignment submission, grading, downloads, and attendance lifecycle', async () => {
    const term = (await request(app)
      .post('/api/academic/terms')
      .set('Cookie', cookie(ctx.adminSession))
      .send({
        name: `Assignment Term ${stamp('at')}`,
        academicYear: '2031-2032',
        semesterType: 'spring',
        startDate: '2032-02-01',
        endDate: '2032-06-01'
      })
      .expect(201)).body;

    const offering = (await request(app)
      .post('/api/academic/offerings')
      .set('Cookie', cookie(ctx.adminSession))
      .send({
        courseId: ctx.course.id,
        termId: term.id,
        instructorId: ctx.teacher.id,
        capacity: 10,
        status: 'active'
      })
      .expect(201)).body;

    await request(app)
      .post('/api/academic/enrollments')
      .set('Cookie', cookie(ctx.adminSession))
      .send({ courseOfferingId: offering.id, studentId: ctx.student.id, status: 'active' })
      .expect(201);

    await request(app)
      .get('/api/academic/assignments')
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200);

    const assignment = (await request(app)
      .post('/api/academic/assignments')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        courseOfferingId: offering.id,
        title: 'Route Assignment',
        description: 'Assignment via academic route.',
        dueDate: '2099-01-01',
        status: 'published'
      })
      .expect(201)).body;

    await request(app)
      .get(`/api/academic/assignments/${assignment.id}`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200);

    const submission = (await request(app)
      .post(`/api/academic/assignments/${assignment.id}/submissions`)
      .set('Cookie', cookie(ctx.studentSession))
      .send({ submissionText: 'My route answer' })
      .expect(201)).body;

    await request(app)
      .get(`/api/academic/assignments/${assignment.id}/submissions`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .put(`/api/academic/submissions/${submission.id}/grade`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ grade: '88', feedback: 'Good route work.' })
      .expect(200);

    await request(app)
      .get(`/api/academic/submissions/${submission.id}/download`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(404);

    await request(app)
      .put(`/api/academic/assignments/${assignment.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ title: 'Route Assignment Updated' })
      .expect(200);

    const selfSession = (await request(app)
      .post('/api/academic/attendance/sessions')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        courseOfferingId: offering.id,
        sessionDate: '2099-01-01T10:00:00.000Z',
        topic: 'Self Attendance',
        expiresAt: '2099-01-01T11:00:00.000Z'
      })
      .expect(201)).body;

    const selfRecord = (await request(app)
      .post(`/api/academic/attendance/sessions/${selfSession.id}/self`)
      .set('Cookie', cookie(ctx.studentSession))
      .expect(201)).body;

    await request(app)
      .get('/api/academic/attendance/my')
      .set('Cookie', cookie(ctx.studentSession))
      .expect(200);

    await request(app)
      .get('/api/academic/attendance/sessions')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .get(`/api/academic/attendance/sessions/${selfSession.id}/records`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .get('/api/academic/attendance/records')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .put(`/api/academic/attendance/records/${selfRecord.id}/remove`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ reason: 'Duplicate route scan' })
      .expect(200);

    const instructorSession = (await request(app)
      .post('/api/academic/attendance/sessions')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({
        courseOfferingId: offering.id,
        sessionDate: '2099-01-02T10:00:00.000Z',
        topic: 'Instructor Attendance'
      })
      .expect(201)).body;

    await request(app)
      .post(`/api/academic/attendance/sessions/${instructorSession.id}/records`)
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ records: [{ studentId: ctx.student.id, status: 'present', note: 'Here' }] })
      .expect(200);

    await request(app)
      .put(`/api/academic/attendance/sessions/${instructorSession.id}/close`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .get(`/api/academic/attendance/offerings/${offering.id}/summary`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await request(app)
      .delete(`/api/academic/assignments/${assignment.id}`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);
  });
});
