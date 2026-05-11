const path = require('path');
const fs = require('fs');
const request = require('supertest');
const app = require('../server');
const { initDatabase, seedDatabase, closeDatabase, resolveDatabaseFiles, getDatabase } = require('../database/db');
const authService = require('../services/authService');
const settingsService = require('../services/settingsService');

const TEST_DB = path.join(__dirname, 'test_academic.db');

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
  settingsService.setMaintenanceMode(false);
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('Academic management system', () => {
  let adminSession;
  let teacherSession;
  let studentSession;
  let faculty;
  let department;
  let classYear;
  let section;
  let activeTerm;
  let alternateTerm;
  let course;
  let offering;
  let assignment;
  let submission;
  let attendanceSession;

  test('creates role sessions used for academic flows', () => {
    const stamp = Date.now();
    const db = getDatabase();
    const seededDepartment = db.prepare('SELECT id, facultyId FROM departments LIMIT 1').get();
    const seededClassYear = db.prepare('SELECT id FROM class_years LIMIT 1').get();
    const seededSection = db.prepare('SELECT id FROM sections LIMIT 1').get();

    const admin = authService.createUser({
      name: 'Academic Admin',
      username: `academic-admin-${stamp}`,
      email: `academic-admin-${stamp}@example.com`,
      role: 'admin',
      password: 'AcademicAdmin123!',
      adminTitle: 'Registrar'
    });
    const teacher = authService.createUser({
      name: 'Academic Teacher',
      username: `academic-teacher-${stamp}`,
      email: `academic-teacher-${stamp}@example.com`,
      role: 'teacher',
      password: 'AcademicTeacher123!',
      facultyId: seededDepartment.facultyId,
      departmentId: seededDepartment.id,
      academicTitle: 'Lecturer',
      staffNumber: `STAFF-${stamp}`
    });
    const student = authService.createUser({
      name: 'Academic Student',
      username: `academic-student-${stamp}`,
      email: `academic-student-${stamp}@example.com`,
      role: 'student',
      password: 'AcademicStudent123!',
      studentNumber: `ASTU-${stamp}`,
      facultyId: seededDepartment.facultyId,
      departmentId: seededDepartment.id,
      classYearId: seededClassYear.id,
      sectionId: seededSection.id,
      cohort: '2026'
    });

    adminSession = authService.login(admin.username, 'AcademicAdmin123!');
    teacherSession = authService.login(teacher.email, 'AcademicTeacher123!');
    studentSession = authService.login(student.studentNumber, 'AcademicStudent123!');

    expect(adminSession.user.role).toBe('admin');
    expect(teacherSession.user.academicTitle).toBe('Lecturer');
    expect(studentSession.user.departmentName).toBeTruthy();
  });

  test('admin manages faculty, department, class year, and section hierarchy', async () => {
    faculty = (await request(app)
      .post('/api/academic/faculties')
      .set('Cookie', cookie(adminSession))
      .send({ name: 'Faculty of Science', code: 'SCI' })
      .expect(201)).body;

    department = (await request(app)
      .post('/api/academic/departments')
      .set('Cookie', cookie(adminSession))
      .send({ facultyId: faculty.id, name: 'Mathematics', code: 'MATH' })
      .expect(201)).body;

    classYear = (await request(app)
      .post('/api/academic/class-years')
      .set('Cookie', cookie(adminSession))
      .send({ departmentId: department.id, yearNumber: 2, name: 'Second Year' })
      .expect(201)).body;

    section = (await request(app)
      .post('/api/academic/sections')
      .set('Cookie', cookie(adminSession))
      .send({ classYearId: classYear.id, name: 'B' })
      .expect(201)).body;

    expect(department.facultyId).toBe(faculty.id);
    expect(classYear.departmentId).toBe(department.id);
    expect(section.classYearId).toBe(classYear.id);

    await request(app)
      .post('/api/academic/faculties')
      .set('Cookie', cookie(studentSession))
      .send({ name: 'Forbidden Faculty', code: 'NOPE' })
      .expect(403);
  });

  test('profile returns safe academic identity fields for the current user', async () => {
    await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie(studentSession))
      .expect(200)
      .expect(response => {
        expect(response.body.studentNumber).toMatch(/^ASTU-/);
        expect(response.body.facultyName).toBeTruthy();
        expect(response.body.departmentName).toBeTruthy();
        expect(response.body.passwordHash).toBeUndefined();
        expect(response.body.passwordSalt).toBeUndefined();
      });
  });

  test('admin creates terms and marks exactly one term active', async () => {
    activeTerm = (await request(app)
      .post('/api/academic/terms')
      .set('Cookie', cookie(adminSession))
      .send({
        name: '2026-2027 Fall',
        academicYear: '2026-2027',
        semesterType: 'fall',
        startDate: '2026-09-01',
        endDate: '2026-12-25',
        isActive: true
      })
      .expect(201)).body;

    alternateTerm = (await request(app)
      .post('/api/academic/terms')
      .set('Cookie', cookie(adminSession))
      .send({
        name: '2026-2027 Spring',
        academicYear: '2026-2027',
        semesterType: 'spring',
        startDate: '2027-02-01',
        endDate: '2027-06-11',
        isActive: false
      })
      .expect(201)).body;

    await request(app)
      .post(`/api/academic/terms/${alternateTerm.id}/active`)
      .set('Cookie', cookie(adminSession))
      .expect(200);

    await request(app)
      .get('/api/academic/terms')
      .set('Cookie', cookie(adminSession))
      .expect(200)
      .expect(response => {
        const active = response.body.filter(term => term.isActive);
        expect(active).toHaveLength(1);
        expect(active[0].id).toBe(alternateTerm.id);
      });

    await request(app)
      .put(`/api/academic/terms/${alternateTerm.id}`)
      .set('Cookie', cookie(adminSession))
      .send({ isActive: false })
      .expect(400)
      .expect(response => {
        expect(response.body.error).toMatch(/must remain active/i);
      });

    const temporaryActiveTerm = (await request(app)
      .post('/api/academic/terms')
      .set('Cookie', cookie(adminSession))
      .send({
        name: '2027-2028 Fall',
        academicYear: '2027-2028',
        semesterType: 'fall',
        startDate: '2027-09-01',
        endDate: '2027-12-22',
        isActive: true
      })
      .expect(201)).body;

    await request(app)
      .delete(`/api/academic/terms/${temporaryActiveTerm.id}`)
      .set('Cookie', cookie(adminSession))
      .expect(200);

    await request(app)
      .get('/api/academic/terms')
      .set('Cookie', cookie(adminSession))
      .expect(200)
      .expect(response => {
        expect(response.body.some(term => term.id === temporaryActiveTerm.id)).toBe(false);
        const active = response.body.filter(term => term.isActive);
        expect(active).toHaveLength(1);
        expect(active[0].id).toBe(alternateTerm.id);
      });
  });

  test('course offerings and enrollments are term-based and role-protected', async () => {
    course = (await request(app)
      .post('/api/courses')
      .set('Cookie', cookie(adminSession))
      .send({
        code: 'MATH201',
        title: 'Discrete Mathematics',
        description: 'Term-based course offering test.',
        departmentId: department.id,
        credits: 4,
        visibility: 'published'
      })
      .expect(201)).body;

    offering = (await request(app)
      .post('/api/academic/offerings')
      .set('Cookie', cookie(adminSession))
      .send({
        courseId: course.id,
        termId: alternateTerm.id,
        instructorId: teacherSession.user.id,
        departmentId: department.id,
        classYearId: classYear.id,
        sectionId: section.id,
        capacity: 35,
        status: 'active'
      })
      .expect(201)).body;

    await request(app)
      .post('/api/academic/enrollments')
      .set('Cookie', cookie(adminSession))
      .send({
        courseOfferingId: offering.id,
        studentId: studentSession.user.id,
        status: 'active'
      })
      .expect(201);

    await request(app)
      .get('/api/academic/offerings')
      .set('Cookie', cookie(studentSession))
      .expect(200)
      .expect(response => {
        expect(response.body.some(item => item.id === offering.id)).toBe(true);
      });
  });

  test('course offering capacity is enforced for active enrollments', async () => {
    const stamp = Date.now();
    const extraStudent = authService.createUser({
      name: `Capacity Student ${stamp}`,
      username: `capacity-student-${stamp}`,
      email: `capacity-student-${stamp}@example.com`,
      role: 'student',
      password: 'Capacity123!',
      studentNumber: `CAP-${stamp}`
    });

    const cappedOffering = (await request(app)
      .post('/api/academic/offerings')
      .set('Cookie', cookie(adminSession))
      .send({
        courseId: course.id,
        termId: alternateTerm.id,
        instructorId: teacherSession.user.id,
        departmentId: department.id,
        classYearId: classYear.id,
        sectionId: section.id,
        capacity: 1,
        status: 'active'
      })
      .expect(201)).body;

    await request(app)
      .post('/api/academic/enrollments')
      .set('Cookie', cookie(adminSession))
      .send({
        courseOfferingId: cappedOffering.id,
        studentId: studentSession.user.id,
        status: 'active'
      })
      .expect(201);

    await request(app)
      .post('/api/academic/enrollments')
      .set('Cookie', cookie(adminSession))
      .send({
        courseOfferingId: cappedOffering.id,
        studentId: extraStudent.id,
        status: 'active'
      })
      .expect(400)
      .expect(response => {
        expect(response.body.error).toMatch(/capacity/i);
      });
  });

  test('assignment creation, student submission, and instructor grading work', async () => {
    assignment = (await request(app)
      .post('/api/academic/assignments')
      .set('Cookie', cookie(teacherSession))
      .send({
        courseOfferingId: offering.id,
        title: 'Set Theory Homework',
        description: 'Submit text or a URL.',
        dueDate: '2027-03-01',
        status: 'published'
      })
      .expect(201)).body;

    await request(app)
      .get('/api/academic/assignments')
      .set('Cookie', cookie(studentSession))
      .expect(200)
      .expect(response => {
        expect(response.body.some(item => item.id === assignment.id)).toBe(true);
      });

    submission = (await request(app)
      .post(`/api/academic/assignments/${assignment.id}/submissions`)
      .set('Cookie', cookie(studentSession))
      .send({ submissionText: 'My proof is included here.' })
      .expect(201)).body;

    submission = (await request(app)
      .post(`/api/academic/assignments/${assignment.id}/submissions`)
      .set('Cookie', cookie(studentSession))
      .field('submissionText', 'My proof is attached.')
      .attach('file', Buffer.from('# Proof\n\nSee the argument below.\n'), {
        filename: 'proof.md',
        contentType: 'text/markdown'
      })
      .expect(201)).body;

    expect(submission.fileName).toBe('proof.md');
    expect(submission.fileSizeBytes).toBeGreaterThan(0);
    expect(submission.submissionUrl).toMatch(/^\/uploads\/submissions\/.+\.md$/);

    await request(app)
      .get(`/api/academic/assignments/${assignment.id}/submissions`)
      .set('Cookie', cookie(teacherSession))
      .expect(200)
      .expect(response => {
        expect(response.body).toHaveLength(1);
        expect(response.body[0].studentId).toBe(studentSession.user.id);
        expect(response.body[0].fileName).toBe('proof.md');
      });

    await request(app)
      .put(`/api/academic/submissions/${submission.id}/grade`)
      .set('Cookie', cookie(teacherSession))
      .send({ grade: '95', feedback: 'Clear reasoning.', status: 'graded' })
      .expect(200)
      .expect(response => {
        expect(response.body.grade).toBe('95');
        expect(response.body.status).toBe('graded');
      });
  });

  test('late assignment submissions are accepted but marked late', async () => {
    const lateAssignment = (await request(app)
      .post('/api/academic/assignments')
      .set('Cookie', cookie(teacherSession))
      .send({
        courseOfferingId: offering.id,
        title: 'Past Due Homework',
        description: 'Late flag check.',
        dueDate: '2020-01-01',
        status: 'published'
      })
      .expect(201)).body;

    await request(app)
      .post(`/api/academic/assignments/${lateAssignment.id}/submissions`)
      .set('Cookie', cookie(studentSession))
      .send({ submissionText: 'Submitted after the due date.' })
      .expect(201)
      .expect(response => {
        expect(response.body.late).toBe(1);
      });
  });

  test('attendance sessions can be marked by instructors and viewed by students', async () => {
    attendanceSession = (await request(app)
      .post('/api/academic/attendance/sessions')
      .set('Cookie', cookie(teacherSession))
      .send({
        courseOfferingId: offering.id,
        sessionDate: '2027-02-10',
        topic: 'Intro to proofs'
      })
      .expect(201)).body;

    await request(app)
      .post(`/api/academic/attendance/sessions/${attendanceSession.id}/records`)
      .set('Cookie', cookie(teacherSession))
      .send({
        records: [
          { studentId: studentSession.user.id, status: 'present', note: 'On time' }
        ]
      })
      .expect(200)
      .expect(response => {
        expect(response.body.records[0].status).toBe('present');
      });

    await request(app)
      .get('/api/academic/attendance/my')
      .set('Cookie', cookie(studentSession))
      .expect(200)
      .expect(response => {
        expect(response.body.some(item => item.sessionId === attendanceSession.id && item.status === 'present')).toBe(true);
      });
  });

  test('deleting a student clears academic records that do not have database foreign keys', async () => {
    const stamp = Date.now().toString().slice(-8);
    const transientStudent = authService.createUser({
      name: `Deleted Academic Student ${stamp}`,
      username: `del-acad-${stamp}`,
      email: `deleted-academic-student-${stamp}@example.com`,
      role: 'student',
      password: 'DeletedAcademic123!',
      studentNumber: `DEL-ACA-${stamp}`
    });
    const transientSession = authService.login(transientStudent.studentNumber, 'DeletedAcademic123!');

    await request(app)
      .post('/api/academic/enrollments')
      .set('Cookie', cookie(adminSession))
      .send({
        courseOfferingId: offering.id,
        studentId: transientStudent.id,
        status: 'active'
      })
      .expect(201);

    await request(app)
      .post(`/api/academic/assignments/${assignment.id}/submissions`)
      .set('Cookie', cookie(transientSession))
      .send({ submissionText: 'Temporary work.' })
      .expect(201);

    await request(app)
      .post(`/api/academic/attendance/sessions/${attendanceSession.id}/records`)
      .set('Cookie', cookie(teacherSession))
      .send({
        records: [
          { studentId: transientStudent.id, status: 'late', note: 'Temporary record' }
        ]
      })
      .expect(200);

    await request(app)
      .post('/api/restrictions')
      .set('Cookie', cookie(adminSession))
      .send({
        userId: transientStudent.id,
        restrictionType: 'course_access_blocked',
        scopeType: 'course',
        scopeId: course.id,
        reason: 'Temporary restriction'
      })
      .expect(201);

    await request(app)
      .delete(`/api/users/${transientStudent.id}`)
      .set('Cookie', cookie(adminSession))
      .expect(200);

    const db = getDatabase();
    expect(db.prepare('SELECT COUNT(*) as count FROM course_offering_enrollments WHERE studentId = ?').get(transientStudent.id).count).toBe(0);
    expect(db.prepare('SELECT COUNT(*) as count FROM assignment_submissions WHERE studentId = ?').get(transientStudent.id).count).toBe(0);
    expect(db.prepare('SELECT COUNT(*) as count FROM attendance_records WHERE studentId = ?').get(transientStudent.id).count).toBe(0);
    expect(db.prepare('SELECT COUNT(*) as count FROM user_restrictions WHERE userId = ?').get(transientStudent.id).count).toBe(0);
  });

  test('deleting an instructor clears course offering instructor references', async () => {
    const stamp = Date.now().toString().slice(-8);
    const transientTeacher = authService.createUser({
      name: `Deleted Instructor ${stamp}`,
      username: `del-teach-${stamp}`,
      email: `deleted-instructor-${stamp}@example.com`,
      role: 'teacher',
      password: 'DeletedTeacher123!',
      staffNumber: `DEL-T-${stamp}`
    });

    const transientOffering = (await request(app)
      .post('/api/academic/offerings')
      .set('Cookie', cookie(adminSession))
      .send({
        courseId: course.id,
        termId: alternateTerm.id,
        instructorId: transientTeacher.id,
        departmentId: department.id,
        classYearId: classYear.id,
        sectionId: section.id,
        capacity: 10,
        status: 'active'
      })
      .expect(201)).body;

    await request(app)
      .delete(`/api/users/${transientTeacher.id}`)
      .set('Cookie', cookie(adminSession))
      .expect(200);

    const db = getDatabase();
    expect(db.prepare('SELECT instructorId FROM course_offerings WHERE id = ?').get(transientOffering.id).instructorId).toBeNull();
    expect(db.prepare('SELECT COUNT(*) as count FROM enrollments WHERE userId = ?').get(transientTeacher.id).count).toBe(0);
  });

  test('admin analytics are role protected and include academic totals', async () => {
    await request(app)
      .get('/api/analytics/admin')
      .set('Cookie', cookie(studentSession))
      .expect(403);

    await request(app)
      .get('/api/analytics/admin')
      .set('Cookie', cookie(adminSession))
      .expect(200)
      .expect(response => {
        expect(response.body.totals.users).toBeGreaterThanOrEqual(3);
        expect(response.body.totals.faculties).toBeGreaterThanOrEqual(1);
        expect(response.body.totals.courseOfferings).toBeGreaterThanOrEqual(1);
        expect(response.body.totals.assignments).toBeGreaterThanOrEqual(1);
        expect(Array.isArray(response.body.departmentSummary)).toBe(true);
      });
  });

  test('admin audit logs and import batches can be filtered by date', async () => {
    const stamp = Date.now();
    const db = getDatabase();
    const oldAction = `FILTER_OLD_${stamp}`;
    const newAction = `FILTER_NEW_${stamp}`;
    const oldFileName = `old-import-${stamp}.csv`;
    const newFileName = `new-import-${stamp}.csv`;

    db.prepare(`
      INSERT INTO audit_logs (action, entityType, entityId, detailsJson, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(oldAction, 'test_entity', 1, '{}', '2026-05-01 09:00:00');
    db.prepare(`
      INSERT INTO audit_logs (action, entityType, entityId, detailsJson, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(newAction, 'test_entity', 2, '{}', '2026-05-02 09:00:00');

    await request(app)
      .get('/api/audit?date=2026-05-01&limit=50')
      .set('Cookie', cookie(adminSession))
      .expect(200)
      .expect(response => {
        const actions = response.body.map(item => item.action);
        expect(actions).toContain(oldAction);
        expect(actions).not.toContain(newAction);
      });

    db.prepare(`
      INSERT INTO import_batches (type, uploadedBy, fileName, status, totalRows, successCount, failedCount, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('users', null, oldFileName, 'processed', 2, 2, 0, '2026-05-01 08:00:00');
    db.prepare(`
      INSERT INTO import_batches (type, uploadedBy, fileName, status, totalRows, successCount, failedCount, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('users', null, newFileName, 'processed', 2, 2, 0, '2026-05-02 08:00:00');

    await request(app)
      .get('/api/imports/batches?date=2026-05-01&limit=50')
      .set('Cookie', cookie(adminSession))
      .expect(200)
      .expect(response => {
        const fileNames = response.body.items.map(item => item.fileName);
        expect(fileNames).toContain(oldFileName);
        expect(fileNames).not.toContain(newFileName);
      });
  });
});
