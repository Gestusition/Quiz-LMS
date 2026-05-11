const path = require('path');
const fs = require('fs');
const {
  initDatabase,
  seedDatabase,
  closeDatabase,
  getDatabase,
  resolveDatabaseFiles
} = require('../database/db');
const authService = require('../services/authService');
const settingsService = require('../services/settingsService');
const courseService = require('../services/courseService');
const categoryService = require('../services/categoryService');
const questionService = require('../services/questionService');
const academicService = require('../services/academicService');
const userRepository = require('../repositories/userRepository');
const questionRepository = require('../repositories/questionRepository');
const academicRepository = require('../repositories/academicRepository');
const categoryRepository = require('../repositories/categoryRepository');
const courseRepository = require('../repositories/courseRepository');
const gradeSchemeRepository = require('../repositories/gradeSchemeRepository');
const quizRepository = require('../repositories/quizRepository');
const profileRepository = require('../repositories/profileRepository');
const restrictionRepository = require('../repositories/restrictionRepository');
const {
  courseVisibilityValues,
  questionDifficultyValues,
  questionTypeValues
} = require('../constants/enums');

const TEST_DB = path.join(__dirname, 'test_repository_edges.db');
let counter = 0;
let ctx;

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

function stamp(prefix = 'repo') {
  counter += 1;
  return `${prefix}${String(Date.now()).slice(-6)}${counter}`;
}

function createUser(role, overrides = {}) {
  const id = stamp(role[0]);
  const payload = {
    name: `Repository ${role} ${id}`,
    username: `repo-${role}-${id}`,
    email: `repo-${role}-${id}@example.com`,
    role,
    password: 'Repository123!',
    ...overrides
  };
  if (role === 'teacher' && !payload.staffNumber) payload.staffNumber = `TR-${id}`;
  if (role === 'student' && !payload.studentNumber) payload.studentNumber = `SR-${id}`;
  return authService.createUser(payload);
}

function questionPayload(categoryId, text, overrides = {}) {
  return {
    categoryId,
    text,
    type: 'TF',
    options: [],
    correctAnswer: 'true',
    difficulty: 'EASY',
    points: 2,
    acceptedAnswers: [],
    caseSensitive: false,
    ...overrides
  };
}

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();
  settingsService.setMaintenanceMode(false);

  const batch = stamp('batch');
  const admin = createUser('admin');
  const teacher = createUser('teacher');
  const otherTeacher = createUser('teacher');
  const student = createUser('student');
  const outsider = createUser('student');

  const faculty = academicService.createFaculty({
    name: `Repository Faculty ${batch}`,
    code: `RF${batch}`.toUpperCase()
  });
  const department = academicService.createDepartment({
    facultyId: faculty.id,
    name: `Repository Department ${batch}`,
    code: `RD${batch}`.toUpperCase()
  });
  const classYear = academicService.createClassYear({
    departmentId: department.id,
    yearNumber: 3,
    name: `Repository Year ${batch}`
  });
  const section = academicService.createSection({
    classYearId: classYear.id,
    name: `Repository Section ${batch}`
  });

  const db = getDatabase();
  db.prepare(`
    UPDATE student_profiles
    SET facultyId = ?, departmentId = ?, classYearId = ?, sectionId = ?, cohort = ?
    WHERE userId = ?
  `).run(faculty.id, department.id, classYear.id, section.id, '2026', student.id);
  db.prepare(`
    UPDATE teacher_profiles
    SET facultyId = ?, departmentId = ?, department = ?
    WHERE userId IN (?, ?)
  `).run(faculty.id, department.id, 'Repository Sciences', teacher.id, otherTeacher.id);
  db.prepare(`
    UPDATE admin_profiles
    SET facultyId = ?, departmentId = ?, displayName = ?
    WHERE userId = ?
  `).run(faculty.id, department.id, 'Repository Admin', admin.id);

  const course = courseService.create({
    code: `REPO-${batch}`.toUpperCase(),
    title: `Repository Query Course ${batch}`,
    description: 'Course for repository edge tests.',
    departmentId: department.id,
    visibility: 'published'
  }, teacher);
  courseService.enroll(course.id, student.id, 'student');

  const category = categoryService.create({
    name: `Repository Category ${batch}`,
    courseId: course.id,
    description: 'Question repository test category.'
  }, teacher);
  const question = questionService.create(
    questionPayload(category.id, `Repository visible question ${batch}`, {
      richText: '<p>Repository visible question</p>',
      explanationText: 'Because the repository says so.',
      hintText: 'Look for the visible question.'
    }),
    teacher
  );
  const shared = categoryService.share(category.id, {
    teacherEmail: otherTeacher.email,
    accessLevel: 'read'
  }, teacher);
  questionRepository.upsertUserSettings(question.id, otherTeacher.id, {
    points: 8,
    gradingType: 'negative'
  });

  const privateCategory = categoryService.create({
    name: `Repository Private ${batch}`,
    courseId: course.id
  }, otherTeacher);
  const privateQuestion = questionService.create(
    questionPayload(privateCategory.id, `Repository private question ${batch}`, {
      difficulty: 'HARD',
      points: 5
    }),
    otherTeacher
  );

  ctx = {
    batch,
    admin,
    teacher,
    otherTeacher,
    student,
    outsider,
    faculty,
    department,
    classYear,
    section,
    course,
    category,
    question,
    shared,
    privateQuestion
  };
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('user repository edges', () => {
  test('filters users by academic profile data and searches joined profile columns', () => {
    const result = userRepository.list({
      role: 'student',
      status: 'active',
      departmentId: ctx.department.id,
      classYearId: ctx.classYear.id,
      sectionId: ctx.section.id,
      search: ctx.student.studentNumber,
      page: 1,
      limit: 5
    }, ['admin', 'teacher', 'student']);

    expect(result.pagination.total).toBe(1);
    expect(result.items[0]).toMatchObject({
      id: ctx.student.id,
      departmentId: ctx.department.id,
      classYearId: ctx.classYear.id,
      sectionId: ctx.section.id,
      sectionName: ctx.section.name
    });

    const teacherSearch = userRepository.list({
      role: 'teacher',
      departmentId: ctx.department.id,
      search: 'Repository Sciences'
    }, ['teacher']);
    expect(teacherSearch.items.map(item => item.id)).toEqual(expect.arrayContaining([ctx.teacher.id, ctx.otherTeacher.id]));
  });

  test('finds login and reset candidates across role-specific identifiers', () => {
    expect(userRepository.findByIdentifier(ctx.admin.username).id).toBe(ctx.admin.id);
    expect(userRepository.findByIdentifier(ctx.student.studentNumber).id).toBe(ctx.student.id);
    expect(userRepository.findByIdentifier(ctx.teacher.email).id).toBe(ctx.teacher.id);
    expect(userRepository.findByUsername(ctx.admin.username).email).toBe(ctx.admin.email);
    expect(userRepository.findActiveTeacherByEmail(ctx.teacher.email).id).toBe(ctx.teacher.id);
    expect(userRepository.findResettableByIdentifier(ctx.teacher.staffNumber).id).toBe(ctx.teacher.id);
    expect(userRepository.findResettableByIdentifier(ctx.student.studentNumber).id).toBe(ctx.student.id);
    expect(userRepository.findLoginCandidates('')).toEqual([]);
    expect(userRepository.findLoginCandidates(ctx.teacher.staffNumber)[0].matchType).toBe('employee_number');
    expect(userRepository.findAuditIdentityCandidate(ctx.teacher.staffNumber).matchType).toBe('employee_number');
    expect(userRepository.findDuplicateEmail(ctx.teacher.email, ctx.teacher.id)).toBeNull();
    expect(userRepository.findDuplicateUsername(ctx.admin.username, ctx.admin.id)).toBeNull();
  });

  test('updates public user fields and rolls back failed transactions', () => {
    const before = userRepository.findById(ctx.otherTeacher.id);
    userRepository.update(ctx.otherTeacher.id, {
      name: `${before.name} Updated`,
      username: before.username,
      email: before.email,
      role: before.role,
      status: before.status,
      mustChangeCredentials: false
    }, '2026-05-11T00:00:00.000Z');

    expect(userRepository.findPublicById(ctx.otherTeacher.id).name).toMatch(/Updated$/);

    const rollbackCode = `ROLL${ctx.batch}`.toUpperCase();
    expect(() => userRepository.withTransaction(() => {
      getDatabase().prepare('INSERT INTO faculties (name, code) VALUES (?, ?)')
        .run('Rollback Faculty', rollbackCode);
      throw new Error('force rollback');
    })).toThrow('force rollback');
    expect(getDatabase().prepare('SELECT id FROM faculties WHERE code = ?').get(rollbackCode)).toBeUndefined();
  });
});

describe('question repository edges', () => {
  test('applies teacher and student access filters with viewer-specific question settings', () => {
    const teacherRows = questionRepository.list({
      user: ctx.teacher,
      categoryId: ctx.category.id,
      courseId: ctx.course.id,
      difficulty: 'EASY',
      type: 'TF',
      search: 'visible question'
    }, questionTypeValues, questionDifficultyValues);
    expect(teacherRows.map(row => row.id)).toContain(ctx.question.id);

    const sharedRows = questionRepository.list({
      user: ctx.otherTeacher,
      courseId: ctx.course.id,
      search: 'visible question'
    }, questionTypeValues, questionDifficultyValues);
    expect(sharedRows).toHaveLength(1);
    expect(sharedRows[0]).toMatchObject({
      id: ctx.question.id,
      viewerPoints: 8,
      viewerGradingType: 'negative',
      accessLevel: 'read'
    });

    const studentRows = questionRepository.list({
      user: ctx.student,
      courseId: ctx.course.id,
      type: 'TF',
      difficulty: 'EASY'
    }, questionTypeValues, questionDifficultyValues);
    expect(studentRows.map(row => row.id)).toContain(ctx.question.id);

    const outsiderRows = questionRepository.list({
      user: ctx.outsider,
      courseId: ctx.course.id
    }, questionTypeValues, questionDifficultyValues);
    expect(outsiderRows).toEqual([]);
  });

  test('returns random and explicit question batches with access-aware point overrides', () => {
    const viewed = questionRepository.getById(ctx.question.id, ctx.otherTeacher);
    expect(viewed).toMatchObject({
      id: ctx.question.id,
      viewerPoints: 8,
      viewerGradingType: 'negative',
      accessLevel: 'read'
    });

    const randomForTeacher = questionRepository.getRandom({
      user: ctx.otherTeacher,
      courseId: ctx.course.id,
      categoryId: ctx.category.id,
      difficulty: 'EASY',
      limit: 99
    }, questionDifficultyValues);
    expect(randomForTeacher.length).toBeGreaterThanOrEqual(1);
    expect(randomForTeacher.length).toBeLessThanOrEqual(50);
    expect(randomForTeacher[0].viewerPoints).toBe(8);

    const randomForStudent = questionRepository.getRandom({
      user: ctx.student,
      courseId: ctx.course.id,
      limit: -5
    }, questionDifficultyValues);
    expect(randomForStudent.length).toBeGreaterThanOrEqual(1);
    expect(randomForStudent.length).toBeLessThanOrEqual(1);

    expect(questionRepository.findByIdsWithCourse([], ctx.teacher)).toEqual([]);
    expect(questionRepository.findByIdsWithCourse([ctx.question.id], ctx.otherTeacher)[0].points).toBe(8);
    expect(questionRepository.findByIdsWithCourse([ctx.privateQuestion.id], ctx.teacher)).toEqual([]);
  });

  test('updates status, question data, and no-op category deletion paths', () => {
    questionRepository.setValidationStatus(ctx.question.id, 'invalid', 'Needs review');
    expect(questionRepository.getById(ctx.question.id).validationMessage).toBe('Needs review');

    questionRepository.update(ctx.question.id, questionPayload(ctx.category.id, 'Repository updated question', {
      correctAnswer: 'false',
      difficulty: 'MEDIUM',
      points: 3
    }), ctx.teacher.id);
    const updated = questionRepository.getById(ctx.question.id);
    expect(updated).toMatchObject({
      text: 'Repository updated question',
      difficulty: 'MEDIUM',
      points: 3,
      updatedBy: ctx.teacher.id,
      status: 'valid'
    });

    expect(questionRepository.deleteByCategoryIds([])).toBeUndefined();
    expect(questionRepository.clearCreatedBy(999999).changes).toBe(0);
  });
});

describe('academic repository edges', () => {
  test('handles hierarchy duplicates, filters, and direct updates', () => {
    const suffix = stamp('acad').toUpperCase();
    const facultyId = Number(academicRepository.insertFaculty({
      name: `Direct Faculty ${suffix}`,
      code: `DF${suffix}`
    }).lastInsertRowid);
    expect(academicRepository.findFacultyDuplicate(`DF${suffix}`).id).toBe(facultyId);
    expect(academicRepository.findFacultyDuplicate(`DF${suffix}`, facultyId)).toBeNull();
    academicRepository.updateFaculty(facultyId, {
      name: `Direct Faculty Updated ${suffix}`,
      code: `DFU${suffix}`
    }, '2026-05-11T00:00:00.000Z');
    expect(academicRepository.listFaculties().map(item => item.id)).toContain(facultyId);

    const departmentId = Number(academicRepository.insertDepartment({
      facultyId,
      name: `Direct Department ${suffix}`,
      code: `DD${suffix}`
    }).lastInsertRowid);
    expect(academicRepository.findDepartmentDuplicate(facultyId, `DD${suffix}`).id).toBe(departmentId);
    expect(academicRepository.findDepartmentDuplicate(facultyId, `DD${suffix}`, departmentId)).toBeNull();
    academicRepository.updateDepartment(departmentId, {
      facultyId,
      name: `Direct Department Updated ${suffix}`,
      code: `DDU${suffix}`
    }, '2026-05-11T00:00:00.000Z');
    expect(academicRepository.listDepartments({ facultyId }).map(item => item.id)).toContain(departmentId);

    const classYearId = Number(academicRepository.insertClassYear({
      departmentId,
      yearNumber: 4,
      name: `Direct Year ${suffix}`
    }).lastInsertRowid);
    expect(academicRepository.findClassYearDuplicate(departmentId, 4).id).toBe(classYearId);
    expect(academicRepository.findClassYearDuplicate(departmentId, 4, classYearId)).toBeNull();
    academicRepository.updateClassYear(classYearId, {
      departmentId,
      yearNumber: 5,
      name: `Direct Year Updated ${suffix}`
    }, '2026-05-11T00:00:00.000Z');
    expect(academicRepository.listClassYears({ departmentId }).map(item => item.id)).toContain(classYearId);

    const sectionId = Number(academicRepository.insertSection({
      classYearId,
      name: `Direct Section ${suffix}`
    }).lastInsertRowid);
    expect(academicRepository.findSectionDuplicate(classYearId, `Direct Section ${suffix}`).id).toBe(sectionId);
    expect(academicRepository.findSectionDuplicate(classYearId, `Direct Section ${suffix}`, sectionId)).toBeNull();
    academicRepository.updateSection(sectionId, {
      classYearId,
      name: `Direct Section Updated ${suffix}`
    }, '2026-05-11T00:00:00.000Z');
    expect(academicRepository.listSections({ classYearId }).map(item => item.id)).toContain(sectionId);
  });

  test('handles terms, offerings, enrollments, and academic transaction rollback', () => {
    const suffix = stamp('term').toUpperCase();
    const termId = Number(academicRepository.insertTerm({
      name: `Direct Term ${suffix}`,
      academicYear: '2026-2027',
      semesterType: 'fall',
      startDate: '2026-09-01',
      endDate: '2027-01-15',
      isActive: 0
    }).lastInsertRowid);
    academicRepository.updateTerm(termId, {
      name: `Direct Term Updated ${suffix}`,
      academicYear: '2026-2027',
      semesterType: 'spring',
      startDate: '2027-02-01',
      endDate: '2027-06-15',
      isActive: 1
    }, '2026-05-11T00:00:00.000Z');
    academicRepository.setActiveTerm(termId, '2026-05-11T00:00:00.000Z');
    expect(academicRepository.findActiveTerm().id).toBe(termId);
    expect(academicRepository.listTerms().map(item => item.id)).toContain(termId);

    const offeringId = Number(academicRepository.insertCourseOffering({
      courseId: ctx.course.id,
      termId,
      instructorId: ctx.teacher.id,
      departmentId: ctx.department.id,
      classYearId: ctx.classYear.id,
      sectionId: ctx.section.id,
      capacity: 3,
      status: 'active'
    }).lastInsertRowid);
    academicRepository.updateCourseOffering(offeringId, {
      courseId: ctx.course.id,
      termId,
      instructorId: ctx.teacher.id,
      departmentId: ctx.department.id,
      classYearId: ctx.classYear.id,
      sectionId: ctx.section.id,
      capacity: 4,
      status: 'planned'
    }, '2026-05-11T00:00:00.000Z');
    expect(academicRepository.findCourseOfferingById(offeringId).capacity).toBe(4);
    expect(academicRepository.listCourseOfferings(ctx.teacher, {
      termId,
      courseId: ctx.course.id,
      activeTerm: true
    }).map(item => item.id)).toContain(offeringId);

    const enrollmentId = Number(academicRepository.insertOfferingEnrollment({
      courseOfferingId: offeringId,
      studentId: ctx.student.id,
      status: 'active',
      finalGrade: ''
    }).lastInsertRowid);
    academicRepository.ensureCourseEnrollment(ctx.course.id, ctx.student.id);
    expect(academicRepository.findOfferingEnrollment(enrollmentId).studentId).toBe(ctx.student.id);
    expect(academicRepository.findOfferingEnrollmentByStudent(offeringId, ctx.student.id).id).toBe(enrollmentId);
    expect(academicRepository.listCourseOfferings(ctx.student, { courseId: ctx.course.id }).map(item => item.id))
      .toContain(offeringId);
    expect(academicRepository.countActiveOfferingEnrollments(offeringId)).toBe(1);
    expect(academicRepository.countActiveOfferingEnrollments(offeringId, enrollmentId)).toBe(0);
    academicRepository.updateOfferingEnrollment(enrollmentId, {
      status: 'completed',
      finalGrade: 'AA'
    }, '2026-05-11T00:00:00.000Z');
    expect(academicRepository.listOfferingEnrollments(offeringId)[0].finalGrade).toBe('AA');

    const rollbackCode = `AR${suffix}`;
    expect(() => academicRepository.withTransaction(() => {
      academicRepository.insertFaculty({ name: 'Academic Rollback', code: rollbackCode });
      throw new Error('academic rollback');
    })).toThrow('academic rollback');
    expect(academicRepository.findFacultyDuplicate(rollbackCode)).toBeNull();
  });

  test('covers assignment and attendance query branches for teacher and student views', () => {
    const suffix = stamp('work').toUpperCase();
    const termId = Number(academicRepository.insertTerm({
      name: `Work Term ${suffix}`,
      academicYear: '2027-2028',
      semesterType: 'fall',
      startDate: '2027-09-01',
      endDate: '2028-01-15',
      isActive: 0
    }).lastInsertRowid);
    academicRepository.setActiveTerm(termId, '2026-05-11T00:00:00.000Z');

    const offeringId = Number(academicRepository.insertCourseOffering({
      courseId: ctx.course.id,
      termId,
      instructorId: ctx.teacher.id,
      departmentId: ctx.department.id,
      classYearId: ctx.classYear.id,
      sectionId: ctx.section.id,
      capacity: 25,
      status: 'active'
    }).lastInsertRowid);
    academicRepository.insertOfferingEnrollment({
      courseOfferingId: offeringId,
      studentId: ctx.student.id,
      status: 'active',
      finalGrade: ''
    });
    academicRepository.ensureCourseEnrollment(ctx.course.id, ctx.student.id);

    const assignmentId = Number(academicRepository.insertAssignment({
      courseOfferingId: offeringId,
      title: `Repository Assignment ${suffix}`,
      description: 'Direct assignment repository test.',
      dueDate: '2028-01-01T00:00:00.000Z',
      status: 'published'
    }, termId, ctx.teacher.id).lastInsertRowid);
    expect(academicRepository.listAssignments(ctx.teacher, { courseOfferingId: offeringId, termId }).map(item => item.id))
      .toContain(assignmentId);
    expect(academicRepository.listAssignments(ctx.student, { courseOfferingId: offeringId, termId }).map(item => item.id))
      .toContain(assignmentId);

    const submittedAt = '2026-05-11T00:00:00.000Z';
    const submissionId = Number(academicRepository.upsertSubmission(assignmentId, ctx.student.id, {
      submissionText: 'First submission',
      submissionUrl: '',
      fileName: '',
      fileSizeBytes: 0,
      mimeType: ''
    }, submittedAt, false).lastInsertRowid);
    academicRepository.upsertSubmission(assignmentId, ctx.student.id, {
      submissionText: 'Updated submission',
      submissionUrl: '',
      fileName: '',
      fileSizeBytes: 0,
      mimeType: ''
    }, submittedAt, true);
    academicRepository.gradeSubmission(submissionId, {
      grade: '95',
      feedback: 'Good work',
      status: 'graded'
    }, submittedAt, ctx.teacher.id);
    expect(academicRepository.listSubmissions(assignmentId)[0].grade).toBe('95');
    expect(academicRepository.findSubmission(submissionId).studentId).toBe(ctx.student.id);
    expect(academicRepository.listSubmissionsByStudent(ctx.student.id).map(item => item.id)).toContain(submissionId);

    const sessionId = Number(academicRepository.insertAttendanceSession({
      courseOfferingId: offeringId,
      sessionDate: '2027-10-01',
      topic: `Repository Attendance ${suffix}`,
      status: 'open',
      openedAt: submittedAt,
      expiresAt: '2027-10-01T12:00:00.000Z'
    }, termId, ctx.teacher.id).lastInsertRowid);
    expect(academicRepository.listAttendanceSessions(ctx.teacher, { courseOfferingId: offeringId }).map(item => item.id))
      .toContain(sessionId);
    expect(academicRepository.listAttendanceSessions(ctx.student, { courseOfferingId: offeringId }).map(item => item.id))
      .toContain(sessionId);

    academicRepository.upsertAttendanceRecord(sessionId, {
      studentId: ctx.student.id,
      status: 'present',
      note: 'Arrived on time'
    }, ctx.teacher.id, submittedAt);
    academicRepository.upsertAttendanceRecord(sessionId, {
      studentId: ctx.student.id,
      status: 'late',
      note: 'Updated note'
    }, ctx.teacher.id, submittedAt);
    expect(academicRepository.findAttendanceRecord(sessionId, ctx.student.id).status).toBe('late');
    expect(academicRepository.listAttendanceRecordDetails(ctx.teacher, {
      status: 'late',
      courseOfferingId: offeringId
    }).map(item => item.sessionId)).toContain(sessionId);
    expect(academicRepository.listAttendanceForStudent(ctx.student.id).map(item => item.sessionId)).toContain(sessionId);
  });

  test('covers academic service offering defaults, existing enrollments, active filters, and validation edges', () => {
    const suffix = stamp('svc').toUpperCase();
    const term = academicService.createTerm({
      name: `Service Term ${suffix}`,
      academicYear: '2028-2029',
      semesterType: 'spring',
      startDate: '2029-02-01',
      endDate: '2029-06-15',
      isActive: true
    });
    const defaultedOffering = academicService.createCourseOffering({
      courseId: ctx.course.id,
      termId: term.id,
      instructorId: ctx.teacher.id,
      classYearId: ctx.classYear.id,
      sectionId: ctx.section.id,
      capacity: 2,
      status: 'active'
    });
    expect(defaultedOffering.departmentId).toBe(ctx.department.id);
    expect(academicService.listCourseOfferings(ctx.teacher, { activeTerm: '1' }).map(item => item.id))
      .toContain(defaultedOffering.id);

    const firstEnrollment = academicService.enrollInOffering({
      courseOfferingId: defaultedOffering.id,
      studentId: ctx.student.id,
      status: 'active',
      finalGrade: ''
    });
    const updatedEnrollment = academicService.enrollInOffering({
      courseOfferingId: defaultedOffering.id,
      studentId: ctx.student.id,
      status: 'active',
      finalGrade: 'BA'
    });
    expect(updatedEnrollment.id).toBe(firstEnrollment.id);
    expect(updatedEnrollment.finalGrade).toBe('BA');

    const otherYear = academicService.createClassYear({
      departmentId: ctx.department.id,
      yearNumber: 6,
      name: `Other Year ${suffix}`
    });
    expect(() => academicService.createCourseOffering({
      courseId: ctx.course.id,
      termId: term.id,
      instructorId: ctx.teacher.id,
      departmentId: ctx.department.id,
      classYearId: otherYear.id,
      sectionId: ctx.section.id,
      capacity: 5,
      status: 'planned'
    })).toThrow(/selected class year/i);
  });
});

describe('remaining repository utility edges', () => {
  test('covers category, course, grade scheme, profile, restriction, and quiz repository utilities', () => {
    const visibleCourses = courseRepository.list(ctx.admin, {
      visibility: 'published',
      search: 'Repository Query'
    }, courseVisibilityValues);
    expect(visibleCourses.map(item => item.id)).toContain(ctx.course.id);

    expect(() => courseRepository.withTransaction(() => {
      courseRepository.insert({
        code: `ROLLCOURSE-${ctx.batch}`.toUpperCase(),
        title: 'Rollback Course',
        description: '',
        departmentId: null,
        credits: 3,
        visibility: 'private',
        startDate: '',
        endDate: ''
      }, ctx.teacher.id);
      throw new Error('course rollback');
    })).toThrow('course rollback');

    const studentCategories = categoryRepository.list({
      user: ctx.student,
      courseId: ctx.course.id
    });
    expect(studentCategories.map(item => item.id)).toContain(ctx.category.id);

    expect(() => categoryRepository.withTransaction(() => {
      categoryRepository.insert({
        name: `Rollback Category ${ctx.batch}`,
        description: '',
        courseId: ctx.course.id
      }, ctx.teacher.id);
      throw new Error('category rollback');
    })).toThrow('category rollback');

    const schemeId = Number(gradeSchemeRepository.createScheme({
      courseId: ctx.course.id,
      name: `Repository Scheme ${ctx.batch}`,
      status: 'active',
      isDefault: false,
      createdBy: ctx.teacher.id
    }).lastInsertRowid);
    gradeSchemeRepository.replaceThresholds(schemeId, [
      { letterGrade: 'AA', minScore: 90, maxScore: 100 },
      { letterGrade: 'FF', minScore: 0, maxScore: 89.99 }
    ]);
    expect(gradeSchemeRepository.listSchemes({ courseId: ctx.course.id }).map(item => item.id)).toContain(schemeId);
    expect(gradeSchemeRepository.listSchemes({ user: ctx.teacher }).map(item => item.id)).toContain(schemeId);

    expect(profileRepository.getForUser(ctx.teacher.id, 'unknown')).toEqual({});
    expect(restrictionRepository.list({ scopeType: 'course' }).pagination.total).toBeGreaterThanOrEqual(0);

    const quizId = Number(quizRepository.insert({
      courseId: ctx.course.id,
      title: `Repository Utility Quiz ${ctx.batch}`,
      description: '',
      status: 'draft',
      startAt: '2026-05-11T00:00:00.000Z',
      endAt: '2026-05-12T00:00:00.000Z',
      durationMinutes: 10,
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
      showCorrectAnswers: true,
      showResultPolicy: 'immediately',
      gradingMode: 'standard',
      penaltyEnabled: false,
      penaltyPerWrong: 0,
      penaltyRatio: 0,
      requiresSeb: false,
      sebConfigName: '',
      sebConfigUrl: '',
      templateName: ''
    }, ctx.teacher.id).lastInsertRowid);
    const attemptId = Number(quizRepository.createAttempt(
      quizId,
      ctx.student.id,
      1,
      1,
      '2026-05-12T00:00:00.000Z'
    ).lastInsertRowid);
    quizRepository.insertAttemptAnswerWithJson(attemptId, ctx.question.id, 'true', true, 1, '{"raw":"true"}');
    expect(quizRepository.getAttemptAnswers(attemptId)).toHaveLength(1);
    expect(quizRepository.deleteAttemptsByUserId(999999).changes).toBe(0);
    quizRepository.clearCreatedBy(999999);

    expect(() => quizRepository.withTransaction(() => {
      quizRepository.insert({
        courseId: ctx.course.id,
        title: `Rollback Quiz ${ctx.batch}`,
        description: '',
        status: 'draft',
        startAt: '2026-05-11T00:00:00.000Z',
        endAt: '2026-05-12T00:00:00.000Z',
        durationMinutes: 10,
        maxAttempts: 1,
        shuffleQuestions: false,
        shuffleOptions: false,
        showCorrectAnswers: true,
        showResultPolicy: 'immediately',
        gradingMode: 'standard',
        penaltyEnabled: false,
        penaltyPerWrong: 0,
        penaltyRatio: 0,
        requiresSeb: false,
        sebConfigName: '',
        sebConfigUrl: '',
        templateName: ''
      }, ctx.teacher.id);
      throw new Error('quiz rollback');
    })).toThrow('quiz rollback');
  });
});
