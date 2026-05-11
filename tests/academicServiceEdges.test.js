const path = require('path');
const fs = require('fs');
const {
  initDatabase,
  seedDatabase,
  closeDatabase,
  resolveDatabaseFiles,
  getDatabase
} = require('../database/db');
const authService = require('../services/authService');
const settingsService = require('../services/settingsService');
const courseService = require('../services/courseService');
const academicService = require('../services/academicService');
const restrictionService = require('../services/restrictionService');

const TEST_DB = path.join(__dirname, 'test_academic_service_edges.db');

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

let ctx;

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();
  settingsService.setMaintenanceMode(false);

  const stamp = String(Date.now()).slice(-8);
  const admin = authService.createUser({
    name: `Academic Edge Admin ${stamp}`,
    username: `ae-admin-${stamp}`,
    email: `academic-edge-admin-${stamp}@example.com`,
    role: 'admin',
    password: 'AcademicEdge123!'
  });
  const teacher = authService.createUser({
    name: `Academic Edge Teacher ${stamp}`,
    username: `ae-teacher-${stamp}`,
    email: `academic-edge-teacher-${stamp}@example.com`,
    role: 'teacher',
    password: 'AcademicEdge123!',
    staffNumber: `AET-${stamp}`
  });
  const otherTeacher = authService.createUser({
    name: `Academic Edge Other Teacher ${stamp}`,
    username: `ae-other-${stamp}`,
    email: `academic-edge-other-teacher-${stamp}@example.com`,
    role: 'teacher',
    password: 'AcademicEdge123!',
    staffNumber: `AEOT-${stamp}`
  });
  const student = authService.createUser({
    name: `Academic Edge Student ${stamp}`,
    username: `ae-student-${stamp}`,
    email: `academic-edge-student-${stamp}@example.com`,
    role: 'student',
    password: 'AcademicEdge123!',
    studentNumber: `AES-${stamp}`
  });
  const secondStudent = authService.createUser({
    name: `Academic Edge Student Two ${stamp}`,
    username: `ae-student2-${stamp}`,
    email: `academic-edge-student-two-${stamp}@example.com`,
    role: 'student',
    password: 'AcademicEdge123!',
    studentNumber: `AES2-${stamp}`
  });
  const inactiveStudent = authService.createUser({
    name: `Academic Edge Disabled ${stamp}`,
    username: `ae-disabled-${stamp}`,
    email: `academic-edge-disabled-${stamp}@example.com`,
    role: 'student',
    status: 'disabled',
    password: 'AcademicEdge123!',
    studentNumber: `AED-${stamp}`
  });

  const course = courseService.create({
    code: `AEDGE-${stamp}`,
    title: `Academic Edge Course ${stamp}`,
    visibility: 'published'
  }, teacher);

  ctx = { stamp, admin, teacher, otherTeacher, student, secondStudent, inactiveStudent, course };
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('academic hierarchy and term edge cases', () => {
  test('covers hierarchy lists, update defaults, duplicate update checks, and filter parsing', () => {
    const facultyA = academicService.createFaculty({ name: 'List Faculty A', code: `LFA${ctx.stamp}` });
    const facultyB = academicService.createFaculty({ name: 'List Faculty B', code: `LFB${ctx.stamp}` });
    expect(academicService.listFaculties().map(item => item.id)).toContain(facultyA.id);
    expect(() => academicService.updateFaculty(facultyB.id, { code: facultyA.code }))
      .toThrow(/faculty with this code/i);
    expect(academicService.updateFaculty(facultyA.id, {}).code).toBe(facultyA.code);

    const deptA = academicService.createDepartment({ facultyId: facultyA.id, name: 'List Dept A', code: `LDA${ctx.stamp}` });
    const deptB = academicService.createDepartment({ facultyId: facultyA.id, name: 'List Dept B', code: `LDB${ctx.stamp}` });
    expect(academicService.listDepartments({ facultyId: facultyA.id }).map(item => item.id)).toContain(deptA.id);
    expect(() => academicService.updateDepartment(deptB.id, { code: deptA.code }))
      .toThrow(/department with this code/i);
    expect(() => academicService.updateDepartment(deptA.id, { facultyId: 999999 }))
      .toThrow(/faculty not found/i);
    expect(academicService.updateDepartment(deptA.id, { name: 'List Dept A Updated' }).name)
      .toMatch(/Updated/);

    const yearA = academicService.createClassYear({ departmentId: deptA.id, yearNumber: 1, name: 'Year A' });
    const yearB = academicService.createClassYear({ departmentId: deptA.id, yearNumber: 2, name: 'Year B' });
    expect(academicService.listClassYears({ departmentId: deptA.id }).map(item => item.id)).toContain(yearA.id);
    expect(() => academicService.updateClassYear(yearB.id, { yearNumber: 1 }))
      .toThrow(/class year with this year number/i);
    expect(() => academicService.updateClassYear(yearA.id, { departmentId: 999999 }))
      .toThrow(/department not found/i);
    expect(academicService.updateClassYear(yearA.id, { name: 'Year A Updated' }).name)
      .toMatch(/Updated/);

    const sectionA = academicService.createSection({ classYearId: yearA.id, name: 'A' });
    const sectionB = academicService.createSection({ classYearId: yearA.id, name: 'B' });
    expect(academicService.listSections({ classYearId: yearA.id }).map(item => item.id)).toContain(sectionA.id);
    expect(() => academicService.updateSection(sectionB.id, { name: 'A' }))
      .toThrow(/section with this name/i);
    expect(() => academicService.updateSection(sectionA.id, { classYearId: 999999 }))
      .toThrow(/class year not found/i);
    expect(academicService.updateSection(sectionA.id, { name: 'C' }).name).toBe('C');

    expect(academicService.deleteSection(sectionB.id)).toBe(true);
    expect(academicService.deleteSection(sectionA.id)).toBe(true);
    expect(academicService.deleteClassYear(yearB.id)).toBe(true);
    expect(academicService.deleteClassYear(yearA.id)).toBe(true);
    expect(academicService.deleteDepartment(deptB.id)).toBe(true);
    expect(academicService.deleteDepartment(deptA.id)).toBe(true);
    expect(academicService.deleteFaculty(facultyB.id)).toBe(true);
    expect(academicService.deleteFaculty(facultyA.id)).toBe(true);
  });

  test('rejects duplicates and missing hierarchy records', () => {
    const faculty = academicService.createFaculty({ name: 'Edge Faculty', code: `EF${ctx.stamp}` });
    expect(faculty.code).toBe(`EF${ctx.stamp}`);
    expect(() => academicService.createFaculty({ name: 'Duplicate Faculty', code: `EF${ctx.stamp}` }))
      .toThrow(/faculty with this code/i);
    expect(academicService.updateFaculty(faculty.id, { name: 'Edge Faculty Updated' }).name)
      .toMatch(/Updated/);
    expect(() => academicService.updateFaculty(999999, { name: 'Missing', code: 'MISS' }))
      .toThrow(/faculty not found/i);

    const department = academicService.createDepartment({
      facultyId: faculty.id,
      name: 'Edge Department',
      code: `ED${ctx.stamp}`
    });
    expect(() => academicService.createDepartment({
      facultyId: faculty.id,
      name: 'Duplicate Department',
      code: `ED${ctx.stamp}`
    })).toThrow(/department with this code/i);
    expect(() => academicService.createDepartment({
      facultyId: 999999,
      name: 'Missing Faculty Department',
      code: 'MFD'
    })).toThrow(/faculty not found/i);

    const classYear = academicService.createClassYear({
      departmentId: department.id,
      yearNumber: 3,
      name: 'Third Year'
    });
    expect(() => academicService.createClassYear({
      departmentId: department.id,
      yearNumber: 3
    })).toThrow(/class year with this year number/i);
    expect(() => academicService.createClassYear({
      departmentId: 999999,
      yearNumber: 1
    })).toThrow(/department not found/i);

    const section = academicService.createSection({ classYearId: classYear.id, name: 'B' });
    expect(() => academicService.createSection({ classYearId: classYear.id, name: 'B' }))
      .toThrow(/section with this name/i);
    expect(() => academicService.createSection({ classYearId: 999999, name: 'Z' }))
      .toThrow(/class year not found/i);

    expect(academicService.deleteSection(section.id)).toBe(true);
    expect(() => academicService.deleteSection(section.id)).toThrow(/section not found/i);
    expect(academicService.deleteClassYear(classYear.id)).toBe(true);
    expect(academicService.deleteDepartment(department.id)).toBe(true);
    expect(academicService.deleteFaculty(faculty.id)).toBe(true);
  });

  test('protects active term lifecycle', () => {
    const inactive = academicService.createTerm({
      name: `Edge Inactive ${ctx.stamp}`,
      academicYear: '2025-2026',
      semesterType: 'summer',
      startDate: '2026-06-01',
      endDate: '2026-08-15'
    });
    expect(academicService.listTerms().map(item => item.id)).toContain(inactive.id);
    expect(academicService.updateTerm(inactive.id, { name: `Edge Inactive Updated ${ctx.stamp}` }).name)
      .toMatch(/Updated/);
    expect(academicService.updateTerm(inactive.id, { isActive: true }).isActive).toBe(1);

    const active = academicService.createTerm({
      name: `Edge Active ${ctx.stamp}`,
      academicYear: '2026-2027',
      semesterType: 'fall',
      startDate: '2026-09-01',
      endDate: '2027-01-15',
      isActive: true
    });
    const fallback = academicService.createTerm({
      name: `Edge Fallback ${ctx.stamp}`,
      academicYear: '2027-2028',
      semesterType: 'spring',
      startDate: '2027-02-01',
      endDate: '2027-06-01'
    });

    expect(() => academicService.updateTerm(active.id, { isActive: false }))
      .toThrow(/at least one term/i);
    expect(academicService.setActiveTerm(fallback.id).isActive).toBe(1);
    expect(academicService.setActiveTerm(active.id).isActive).toBe(1);
    expect(academicService.deleteTerm(active.id)).toBe(true);
    expect(() => academicService.deleteTerm(999999)).toThrow(/term not found/i);
  });
});

describe('course offering and enrollment edge cases', () => {
  test('validates offering references, instructor roles, class-year/section consistency, and capacity', () => {
    const faculty = academicService.createFaculty({ name: 'Offering Faculty', code: `OF${ctx.stamp}` });
    const deptA = academicService.createDepartment({ facultyId: faculty.id, name: 'Dept A', code: `ODA${ctx.stamp}` });
    const deptB = academicService.createDepartment({ facultyId: faculty.id, name: 'Dept B', code: `ODB${ctx.stamp}` });
    const classYearA = academicService.createClassYear({ departmentId: deptA.id, yearNumber: 1, name: 'Dept A Year' });
    const sectionA = academicService.createSection({ classYearId: classYearA.id, name: 'A' });
    const term = academicService.createTerm({
      name: `Offering Term ${ctx.stamp}`,
      academicYear: '2028-2029',
      semesterType: 'fall',
      startDate: '2028-09-01',
      endDate: '2029-01-15'
    });

    expect(() => academicService.createCourseOffering({
      courseId: ctx.course.id,
      termId: term.id,
      instructorId: ctx.student.id
    })).toThrow(/active teacher/i);
    expect(() => academicService.createCourseOffering({
      courseId: 999999,
      termId: term.id
    })).toThrow(/course not found/i);
    expect(() => academicService.createCourseOffering({
      courseId: ctx.course.id,
      termId: 999999
    })).toThrow(/term not found/i);
    expect(() => academicService.createCourseOffering({
      courseId: ctx.course.id,
      termId: term.id,
      departmentId: deptB.id,
      classYearId: classYearA.id
    })).toThrow(/class year must belong/i);

    const offering = academicService.createCourseOffering({
      courseId: ctx.course.id,
      termId: term.id,
      instructorId: ctx.teacher.id,
      departmentId: deptA.id,
      classYearId: classYearA.id,
      sectionId: sectionA.id,
      capacity: 1,
      status: 'active'
    });
    expect(offering.instructorId).toBe(ctx.teacher.id);
    expect(academicService.listCourseOfferings(ctx.teacher, { courseId: ctx.course.id }).map(item => item.id))
      .toContain(offering.id);
    expect(academicService.getCourseOffering(offering.id, ctx.teacher).id).toBe(offering.id);
    expect(() => academicService.getCourseOffering(offering.id, ctx.secondStudent)).toThrow(/permission/i);
    expect(() => academicService.listOfferingEnrollments(offering.id, ctx.secondStudent)).toThrow(/permission/i);
    expect(() => academicService.updateCourseOffering(offering.id, {
      departmentId: deptB.id
    })).toThrow(/class year must belong/i);
    expect(() => academicService.updateCourseOffering(999999, { status: 'active' }))
      .toThrow(/course offering not found/i);
    expect(academicService.updateCourseOffering(offering.id, { status: 'active' }).status)
      .toBe('active');

    const enrolled = academicService.enrollInOffering({
      courseOfferingId: offering.id,
      studentId: ctx.student.id,
      status: 'active'
    });
    expect(enrolled.studentId).toBe(ctx.student.id);
    expect(() => academicService.enrollInOffering({
      courseOfferingId: offering.id,
      studentId: ctx.secondStudent.id,
      status: 'active'
    })).toThrow(/capacity/i);
    expect(() => academicService.enrollInOffering({
      courseOfferingId: offering.id,
      studentId: ctx.teacher.id,
      status: 'active'
    })).toThrow(/active student/i);
    expect(() => academicService.enrollInOffering({
      courseOfferingId: offering.id,
      studentId: ctx.inactiveStudent.id,
      status: 'active'
    })).toThrow(/active student/i);

    const dropped = academicService.updateOfferingEnrollment(enrolled.id, { status: 'dropped' });
    expect(dropped.status).toBe('dropped');
    expect(academicService.updateOfferingEnrollment(enrolled.id, { status: 'active' }).status).toBe('active');
    expect(academicService.enrollInOffering({
      courseOfferingId: offering.id,
      studentId: ctx.student.id,
      status: 'dropped'
    }).status).toBe('dropped');
    expect(academicService.updateOfferingEnrollment(enrolled.id, { status: 'active' }).status).toBe('active');
    expect(academicService.listOfferingEnrollments(offering.id, ctx.teacher).map(item => item.id))
      .toContain(enrolled.id);
    expect(() => academicService.updateOfferingEnrollment(999999, { status: 'active' })).toThrow(/enrollment not found/i);
    expect(academicService.deleteOfferingEnrollment(enrolled.id)).toBe(true);
    expect(() => academicService.deleteOfferingEnrollment(enrolled.id)).toThrow(/enrollment not found/i);
    expect(academicService.deleteCourseOffering(offering.id)).toBe(true);
  });
});

describe('assignment, submission, and attendance edge cases', () => {
  let offering;

  beforeAll(() => {
    const db = getDatabase();
    const term = db.prepare('SELECT id FROM academic_terms WHERE isActive = 1 ORDER BY id DESC LIMIT 1').get();
    offering = academicService.createCourseOffering({
      courseId: ctx.course.id,
      termId: term.id,
      instructorId: ctx.teacher.id,
      capacity: 5,
      status: 'active'
    });
    academicService.enrollInOffering({
      courseOfferingId: offering.id,
      studentId: ctx.student.id,
      status: 'active'
    });
  });

  test('enforces assignment access, submission replacement, grading, and downloads', () => {
    const assignment = academicService.createAssignment({
      courseOfferingId: offering.id,
      title: 'Edge Assignment',
      description: 'Assignment edge coverage',
      dueDate: '2099-01-01',
      status: 'draft'
    }, ctx.teacher);

    expect(() => academicService.getAssignment(assignment.id, ctx.student)).toThrow(/permission/i);
    expect(() => academicService.submitAssignment(assignment.id, { submissionText: 'draft' }, ctx.student))
      .toThrow(/not open/i);
    expect(() => academicService.submitAssignment(assignment.id, { submissionText: 'teacher' }, ctx.teacher))
      .toThrow(/Only students/i);

    const published = academicService.updateAssignment(assignment.id, { status: 'published' }, ctx.teacher);
    expect(published.status).toBe('published');
    expect(() => academicService.updateAssignment(assignment.id, { status: 'published' }, ctx.otherTeacher))
      .toThrow(/permission/i);

    const submitted = academicService.submitAssignment(assignment.id, {
      submissionText: 'My answer',
      submissionUrl: '/uploads/submissions/answer.txt',
      fileName: 'answer.txt',
      fileSizeBytes: 12,
      mimeType: 'text/plain'
    }, ctx.student);
    expect(submitted.downloadUrl).toBe(`/api/academic/submissions/${submitted.id}/download`);

    const replaced = academicService.submitAssignment(assignment.id, {
      submissionText: 'Updated answer'
    }, ctx.student);
    expect(replaced.submissionText).toBe('Updated answer');
    expect(replaced.downloadUrl).toBeUndefined();
    expect(() => academicService.getSubmissionDownload(replaced.id, ctx.student)).toThrow(/file not found/i);

    const withFile = academicService.submitAssignment(assignment.id, {
      submissionUrl: '/uploads/submissions/final.txt',
      fileName: 'final.txt',
      fileSizeBytes: 10,
      mimeType: 'text/plain'
    }, ctx.student);
    expect(academicService.getSubmissionDownload(withFile.id, ctx.student).fileName).toBe('final.txt');
    expect(academicService.getSubmissionDownload(withFile.id, ctx.teacher).fileName).toBe('final.txt');
    expect(() => academicService.getSubmissionDownload(withFile.id, ctx.otherTeacher)).toThrow(/permission/i);
    expect(academicService.listAssignments(ctx.student).find(item => item.id === assignment.id).ownSubmissionDownloadUrl)
      .toBe(`/api/academic/submissions/${withFile.id}/download`);
    expect(() => academicService.submitAssignment(assignment.id, { submissionText: 'outsider' }, ctx.secondStudent))
      .toThrow(/permission/i);

    const graded = academicService.gradeSubmission(withFile.id, { grade: '95', feedback: 'Good' }, ctx.teacher);
    expect(graded.grade).toBe('95');
    expect(() => academicService.gradeSubmission(withFile.id, { grade: '0' }, ctx.otherTeacher)).toThrow(/permission/i);
    expect(academicService.listSubmissions(assignment.id, ctx.teacher).map(item => item.id)).toContain(withFile.id);
    expect(() => academicService.listSubmissions(assignment.id, ctx.otherTeacher)).toThrow(/permission/i);
    expect(academicService.deleteAssignment(assignment.id, ctx.teacher)).toBe(true);
    expect(() => academicService.deleteAssignment(assignment.id, ctx.teacher)).toThrow(/assignment not found/i);
  });

  test('covers attendance management, self marking conflicts, filtering, and blocked access', () => {
    const session = academicService.createAttendanceSession({
      courseOfferingId: offering.id,
      sessionDate: '2099-01-01T10:00:00.000Z',
      topic: 'Edge Attendance',
      expiresAt: '2099-01-01T11:00:00.000Z'
    }, ctx.teacher);
    expect(session.records).toEqual([]);

    expect(() => academicService.markAttendance(session.id, [], ctx.teacher)).toThrow(/at least one/i);
    expect(() => academicService.markAttendance(session.id, [{ studentId: ctx.secondStudent.id, status: 'present' }], ctx.teacher))
      .toThrow(/enrolled/i);

    const marked = academicService.markAttendance(session.id, [{
      studentId: ctx.student.id,
      status: 'present',
      note: 'Here'
    }], ctx.teacher);
    expect(marked.records[0].status).toBe('present');
    expect(academicService.listAttendanceRecords(session.id, ctx.teacher)).toHaveLength(1);
    expect(() => academicService.listAttendanceRecords(session.id, ctx.otherTeacher)).toThrow(/permission/i);

    const studentAttendance = academicService.getAttendanceForStudent(ctx.student);
    expect(studentAttendance.some(item => item.sessionId === session.id)).toBe(true);
    expect(() => academicService.getAttendanceForStudent(ctx.teacher)).toThrow(/Only students/i);
    expect(() => academicService.markSelfAttendance(session.id, ctx.teacher)).toThrow(/permission/i);
    expect(() => academicService.markSelfAttendance(session.id, ctx.student)).toThrow(/already been marked/i);

    const removed = academicService.removeAttendanceRecord(marked.records[0].id, { reason: 'Duplicate scan' }, ctx.teacher);
    expect(removed.status).toBe('removed');
    expect(() => academicService.markSelfAttendance(session.id, ctx.student)).toThrow(/removed by an instructor/i);

    const details = academicService.listAttendanceRecordDetails(ctx.teacher, { status: 'removed' });
    expect(details.some(item => item.id === removed.id)).toBe(true);
    expect(() => academicService.listAttendanceRecordDetails(ctx.student)).toThrow(/permission/i);
    expect(academicService.attendanceSummary(offering.id, ctx.teacher).courseOffering.id).toBe(offering.id);
    expect(() => academicService.attendanceSummary(offering.id, ctx.otherTeacher)).toThrow(/permission/i);

    const closedSession = academicService.createAttendanceSession({
      courseOfferingId: offering.id,
      sessionDate: '2099-01-02T10:00:00.000Z',
      topic: 'Closed Attendance',
      status: 'closed'
    }, ctx.teacher);
    expect(() => academicService.markSelfAttendance(closedSession.id, ctx.student)).toThrow(/closed/i);

    const selfSession = academicService.createAttendanceSession({
      courseOfferingId: offering.id,
      sessionDate: '2099-01-03T10:00:00.000Z',
      topic: 'Self Attendance',
      expiresAt: '2099-01-03T11:00:00.000Z'
    }, ctx.teacher);
    const selfRecord = academicService.markSelfAttendance(selfSession.id, ctx.student);
    expect(selfRecord.status).toBe('present');
    expect(academicService.listAttendanceSessions(ctx.student).find(item => item.id === selfSession.id).ownAttendanceStatus)
      .toBe('present');
    expect(academicService.getAttendanceForStudent(ctx.student).find(item => item.sessionId === selfSession.id).markedByName)
      .toBeUndefined();
    expect(academicService.closeAttendanceSession(selfSession.id, ctx.teacher).status).toBe('closed');

    const expiredSession = academicService.createAttendanceSession({
      courseOfferingId: offering.id,
      sessionDate: '2000-01-01T10:00:00.000Z',
      topic: 'Expired Attendance',
      expiresAt: '2000-01-01T11:00:00.000Z'
    }, ctx.teacher);
    expect(() => academicService.markSelfAttendance(expiredSession.id, ctx.student)).toThrow(/closed/i);

    restrictionService.create({
      userId: ctx.student.id,
      restrictionType: 'course_access_blocked',
      scopeType: 'course',
      scopeId: ctx.course.id,
      reason: 'Attendance edge block'
    }, ctx.admin.id);
    expect(academicService.listAttendanceSessions(ctx.student).some(item => item.id === session.id)).toBe(false);
    expect(academicService.getAttendanceForStudent(ctx.student).some(item => item.sessionId === session.id)).toBe(false);
  });
});
