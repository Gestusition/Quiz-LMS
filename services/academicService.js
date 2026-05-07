const academicRepository = require('../repositories/academicRepository');
const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const userRepository = require('../repositories/userRepository');
const restrictionService = require('./restrictionService');
const auditService = require('./auditService');
const validationIssueService = require('./validationIssueService');
const importService = require('./importService');
const { nowIso } = require('../utils/security');
const {
  validateAssignment,
  validateAttendanceRecord,
  validateAttendanceSession,
  validateClassYear,
  validateCourseOffering,
  validateDepartment,
  validateFaculty,
  validateOfferingEnrollment,
  validateSection,
  validateSubmission,
  validateSubmissionGrade,
  validateTerm
} = require('../validators/academicValidators');

class AcademicService {
  listFaculties() {
    return academicRepository.listFaculties();
  }

  createFaculty(data) {
    const payload = validateFaculty(data);
    if (academicRepository.findFacultyDuplicate(payload.code)) {
      throw new Error('A faculty with this code already exists.');
    }
    const result = academicRepository.insertFaculty(payload);
    return academicRepository.findFacultyById(result.lastInsertRowid);
  }

  updateFaculty(id, data) {
    const existing = requireRow(academicRepository.findFacultyById(id), 'Faculty not found.');
    const payload = validateFaculty({
      name: data.name !== undefined ? data.name : existing.name,
      code: data.code !== undefined ? data.code : existing.code
    });
    if (academicRepository.findFacultyDuplicate(payload.code, id)) {
      throw new Error('A faculty with this code already exists.');
    }
    academicRepository.updateFaculty(id, payload, nowIso());
    return academicRepository.findFacultyById(id);
  }

  deleteFaculty(id) {
    requireRow(academicRepository.findFacultyById(id), 'Faculty not found.');
    academicRepository.deleteFaculty(id);
    return true;
  }

  listDepartments(filters = {}) {
    return academicRepository.listDepartments(normalizeFilters(filters));
  }

  createDepartment(data) {
    const payload = validateDepartment(data);
    requireRow(academicRepository.findFacultyById(payload.facultyId), 'Faculty not found.');
    if (academicRepository.findDepartmentDuplicate(payload.facultyId, payload.code)) {
      throw new Error('A department with this code already exists in this faculty.');
    }
    const result = academicRepository.insertDepartment(payload);
    return academicRepository.findDepartmentById(result.lastInsertRowid);
  }

  updateDepartment(id, data) {
    const existing = requireRow(academicRepository.findDepartmentById(id), 'Department not found.');
    const payload = validateDepartment({
      facultyId: data.facultyId !== undefined ? data.facultyId : existing.facultyId,
      name: data.name !== undefined ? data.name : existing.name,
      code: data.code !== undefined ? data.code : existing.code
    });
    requireRow(academicRepository.findFacultyById(payload.facultyId), 'Faculty not found.');
    if (academicRepository.findDepartmentDuplicate(payload.facultyId, payload.code, id)) {
      throw new Error('A department with this code already exists in this faculty.');
    }
    academicRepository.updateDepartment(id, payload, nowIso());
    return academicRepository.findDepartmentById(id);
  }

  deleteDepartment(id) {
    requireRow(academicRepository.findDepartmentById(id), 'Department not found.');
    academicRepository.deleteDepartment(id);
    return true;
  }

  listClassYears(filters = {}) {
    return academicRepository.listClassYears(normalizeFilters(filters));
  }

  createClassYear(data) {
    const payload = validateClassYear(data);
    requireRow(academicRepository.findDepartmentById(payload.departmentId), 'Department not found.');
    if (academicRepository.findClassYearDuplicate(payload.departmentId, payload.yearNumber)) {
      throw new Error('A class year with this year number already exists in this department.');
    }
    const result = academicRepository.insertClassYear(payload);
    return academicRepository.findClassYearById(result.lastInsertRowid);
  }

  updateClassYear(id, data) {
    const existing = requireRow(academicRepository.findClassYearById(id), 'Class year not found.');
    const payload = validateClassYear({
      departmentId: data.departmentId !== undefined ? data.departmentId : existing.departmentId,
      yearNumber: data.yearNumber !== undefined ? data.yearNumber : existing.yearNumber,
      name: data.name !== undefined ? data.name : existing.name
    });
    requireRow(academicRepository.findDepartmentById(payload.departmentId), 'Department not found.');
    if (academicRepository.findClassYearDuplicate(payload.departmentId, payload.yearNumber, id)) {
      throw new Error('A class year with this year number already exists in this department.');
    }
    academicRepository.updateClassYear(id, payload, nowIso());
    return academicRepository.findClassYearById(id);
  }

  deleteClassYear(id) {
    requireRow(academicRepository.findClassYearById(id), 'Class year not found.');
    academicRepository.deleteClassYear(id);
    return true;
  }

  listSections(filters = {}) {
    return academicRepository.listSections(normalizeFilters(filters));
  }

  createSection(data) {
    const payload = validateSection(data);
    requireRow(academicRepository.findClassYearById(payload.classYearId), 'Class year not found.');
    if (academicRepository.findSectionDuplicate(payload.classYearId, payload.name)) {
      throw new Error('A section with this name already exists in this class year.');
    }
    const result = academicRepository.insertSection(payload);
    return academicRepository.findSectionById(result.lastInsertRowid);
  }

  updateSection(id, data) {
    const existing = requireRow(academicRepository.findSectionById(id), 'Section not found.');
    const payload = validateSection({
      classYearId: data.classYearId !== undefined ? data.classYearId : existing.classYearId,
      name: data.name !== undefined ? data.name : existing.name
    });
    requireRow(academicRepository.findClassYearById(payload.classYearId), 'Class year not found.');
    if (academicRepository.findSectionDuplicate(payload.classYearId, payload.name, id)) {
      throw new Error('A section with this name already exists in this class year.');
    }
    academicRepository.updateSection(id, payload, nowIso());
    return academicRepository.findSectionById(id);
  }

  deleteSection(id) {
    requireRow(academicRepository.findSectionById(id), 'Section not found.');
    academicRepository.deleteSection(id);
    return true;
  }

  listTerms() {
    return academicRepository.listTerms();
  }

  createTerm(data) {
    const payload = validateTerm(data);
    const termId = academicRepository.withTransaction(() => {
      const result = academicRepository.insertTerm({ ...payload, isActive: 0 });
      if (payload.isActive) {
        academicRepository.setActiveTerm(result.lastInsertRowid, nowIso());
      }
      return result.lastInsertRowid;
    });
    return academicRepository.findTermById(termId);
  }

  updateTerm(id, data) {
    const existing = requireRow(academicRepository.findTermById(id), 'Term not found.');
    const payload = validateTerm({
      name: data.name !== undefined ? data.name : existing.name,
      academicYear: data.academicYear !== undefined ? data.academicYear : existing.academicYear,
      semesterType: data.semesterType !== undefined ? data.semesterType : existing.semesterType,
      startDate: data.startDate !== undefined ? data.startDate : existing.startDate,
      endDate: data.endDate !== undefined ? data.endDate : existing.endDate,
      isActive: data.isActive !== undefined ? data.isActive : !!existing.isActive
    });
    if (existing.isActive && !payload.isActive) {
      throw new Error('At least one term must remain active. Mark another term active instead.');
    }

    academicRepository.withTransaction(() => {
      academicRepository.updateTerm(id, { ...payload, isActive: payload.isActive ? 1 : 0 }, nowIso());
      if (payload.isActive) {
        academicRepository.setActiveTerm(id, nowIso());
      }
    });
    return academicRepository.findTermById(id);
  }

  setActiveTerm(id) {
    requireRow(academicRepository.findTermById(id), 'Term not found.');
    academicRepository.withTransaction(() => {
      academicRepository.setActiveTerm(id, nowIso());
    });
    return academicRepository.findTermById(id);
  }

  deleteTerm(id) {
    const term = requireRow(academicRepository.findTermById(id), 'Term not found.');
    academicRepository.withTransaction(() => {
      const terms = academicRepository.listTerms();
      if (term.isActive && terms.length <= 1) {
        throw new Error('At least one term must remain active. Create or activate another term first.');
      }
      academicRepository.deleteTerm(id);
      if (term.isActive) {
        const fallback = academicRepository.listTerms()[0];
        if (fallback) academicRepository.setActiveTerm(fallback.id, nowIso());
      }
    });
    return true;
  }

  listCourseOfferings(user, filters = {}) {
    return academicRepository.listCourseOfferings(user, normalizeFilters(filters))
      .filter(offering => !this.isCourseAccessBlocked(user, offering.courseId));
  }

  getCourseOffering(id, user) {
    const offering = requireRow(academicRepository.findCourseOfferingById(id), 'Course offering not found.');
    if (!this.canAccessOffering(user, offering)) {
      throw forbidden();
    }
    return offering;
  }

  createCourseOffering(data) {
    const payload = validateCourseOffering(data);
    this.ensureOfferingReferences(payload);
    const result = academicRepository.insertCourseOffering(payload);
    if (payload.instructorId) {
      enrollmentRepository.insertCourseTeacher(payload.courseId, payload.instructorId);
    }
    return academicRepository.findCourseOfferingById(result.lastInsertRowid);
  }

  updateCourseOffering(id, data) {
    const existing = requireRow(academicRepository.findCourseOfferingById(id), 'Course offering not found.');
    const payload = validateCourseOffering({
      courseId: data.courseId !== undefined ? data.courseId : existing.courseId,
      termId: data.termId !== undefined ? data.termId : existing.termId,
      instructorId: data.instructorId !== undefined ? data.instructorId : existing.instructorId,
      departmentId: data.departmentId !== undefined ? data.departmentId : existing.departmentId,
      classYearId: data.classYearId !== undefined ? data.classYearId : existing.classYearId,
      sectionId: data.sectionId !== undefined ? data.sectionId : existing.sectionId,
      capacity: data.capacity !== undefined ? data.capacity : existing.capacity,
      status: data.status !== undefined ? data.status : existing.status
    });
    this.ensureOfferingReferences(payload);
    academicRepository.updateCourseOffering(id, payload, nowIso());
    if (payload.instructorId) {
      enrollmentRepository.insertCourseTeacher(payload.courseId, payload.instructorId);
    }
    return academicRepository.findCourseOfferingById(id);
  }

  deleteCourseOffering(id) {
    requireRow(academicRepository.findCourseOfferingById(id), 'Course offering not found.');
    academicRepository.deleteCourseOffering(id);
    return true;
  }

  listOfferingEnrollments(courseOfferingId, user) {
    const offering = requireRow(academicRepository.findCourseOfferingById(courseOfferingId), 'Course offering not found.');
    if (!this.canManageOffering(user, offering)) throw forbidden();
    return academicRepository.listOfferingEnrollments(courseOfferingId);
  }

  enrollInOffering(data) {
    const payload = validateOfferingEnrollment(data);
    const offering = requireRow(academicRepository.findCourseOfferingById(payload.courseOfferingId), 'Course offering not found.');
    const student = requireRow(userRepository.findById(payload.studentId), 'Student not found.');
    if (student.role !== 'student' || student.status !== 'active') {
      throw new Error('Only active student accounts can be enrolled in course offerings.');
    }
    const existing = academicRepository.findOfferingEnrollmentByStudent(payload.courseOfferingId, payload.studentId);
    if (existing) {
      if (payload.status === 'active') {
        this.ensureOfferingCapacity(offering, existing.id);
      }
      academicRepository.updateOfferingEnrollment(existing.id, payload, nowIso());
      return academicRepository.listOfferingEnrollments(payload.courseOfferingId)
        .find(item => item.id === existing.id);
    }
    if (payload.status === 'active') {
      this.ensureOfferingCapacity(offering);
    }
    const result = academicRepository.withTransaction(() => {
      const created = academicRepository.insertOfferingEnrollment(payload);
      academicRepository.ensureCourseEnrollment(offering.courseId, payload.studentId);
      return created;
    });
    return academicRepository.listOfferingEnrollments(payload.courseOfferingId)
      .find(item => item.id === result.lastInsertRowid);
  }

  updateOfferingEnrollment(id, data) {
    const existing = requireRow(academicRepository.findOfferingEnrollment(id), 'Enrollment not found.');
    const payload = validateOfferingEnrollment({
      courseOfferingId: existing.courseOfferingId,
      studentId: existing.studentId,
      status: data.status !== undefined ? data.status : existing.status,
      finalGrade: data.finalGrade !== undefined ? data.finalGrade : existing.finalGrade
    });
    if (payload.status === 'active') {
      const offering = requireRow(academicRepository.findCourseOfferingById(payload.courseOfferingId), 'Course offering not found.');
      this.ensureOfferingCapacity(offering, existing.id);
    }
    academicRepository.updateOfferingEnrollment(id, payload, nowIso());
    return academicRepository.listOfferingEnrollments(existing.courseOfferingId)
      .find(item => item.id === id);
  }

  deleteOfferingEnrollment(id) {
    requireRow(academicRepository.findOfferingEnrollment(id), 'Enrollment not found.');
    academicRepository.deleteOfferingEnrollment(id);
    return true;
  }

  listAssignments(user, filters = {}) {
    return academicRepository.listAssignments(user, normalizeFilters(filters))
      .filter(assignment => !this.isCourseAccessBlocked(user, assignment.courseId));
  }

  getAssignment(id, user) {
    const assignment = requireRow(academicRepository.findAssignmentById(id), 'Assignment not found.');
    if (!this.canAccessAssignment(user, assignment)) throw forbidden();
    return assignment;
  }

  createAssignment(data, user) {
    const payload = validateAssignment(data);
    const offering = requireRow(academicRepository.findCourseOfferingById(payload.courseOfferingId), 'Course offering not found.');
    if (!this.canManageOffering(user, offering)) throw forbidden();
    const result = academicRepository.insertAssignment(payload, offering.termId, user.id);
    return academicRepository.findAssignmentById(result.lastInsertRowid);
  }

  updateAssignment(id, data, user) {
    const existing = requireRow(academicRepository.findAssignmentById(id), 'Assignment not found.');
    if (!this.canManageOffering(user, existing)) throw forbidden();
    const payload = validateAssignment({
      courseOfferingId: data.courseOfferingId !== undefined ? data.courseOfferingId : existing.courseOfferingId,
      title: data.title !== undefined ? data.title : existing.title,
      description: data.description !== undefined ? data.description : existing.description,
      dueDate: data.dueDate !== undefined ? data.dueDate : existing.dueDate,
      status: data.status !== undefined ? data.status : existing.status
    });
    const offering = requireRow(academicRepository.findCourseOfferingById(payload.courseOfferingId), 'Course offering not found.');
    if (!this.canManageOffering(user, offering)) throw forbidden();
    academicRepository.updateAssignment(id, payload, offering.termId, nowIso());
    return academicRepository.findAssignmentById(id);
  }

  deleteAssignment(id, user) {
    const assignment = requireRow(academicRepository.findAssignmentById(id), 'Assignment not found.');
    if (!this.canManageOffering(user, assignment)) throw forbidden();
    academicRepository.deleteAssignment(id);
    return true;
  }

  listSubmissions(assignmentId, user) {
    const assignment = requireRow(academicRepository.findAssignmentById(assignmentId), 'Assignment not found.');
    if (!this.canManageOffering(user, assignment)) throw forbidden();
    return academicRepository.listSubmissions(assignmentId);
  }

  submitAssignment(assignmentId, data, user) {
    if (user.role !== 'student') {
      throw new Error('Only students can submit assignment work.');
    }
    const assignment = requireRow(academicRepository.findAssignmentById(assignmentId), 'Assignment not found.');
    if (assignment.status !== 'published') {
      throw new Error('This assignment is not open for submissions.');
    }
    if (!academicRepository.findOfferingEnrollmentByStudent(assignment.courseOfferingId, user.id)) {
      throw forbidden();
    }
    restrictionService.assertAccessAllowed({
      user,
      restrictionType: 'course_access_blocked',
      scopeType: 'course',
      scopeId: assignment.courseId,
      safeMessage: 'Your access to this course is restricted. Please contact your instructor or administrator.'
    });

    restrictionService.assertAccessAllowed({
      user,
      restrictionType: 'assignment_blocked',
      scopeType: 'assignment',
      scopeId: assignment.id,
      safeMessage: 'Your assignment submission access is restricted. Please contact your instructor or administrator.'
    });

    const payload = validateSubmission(data);
    const timestamp = nowIso();
    const late = isPastDue(assignment.dueDate, timestamp);
    const result = academicRepository.upsertSubmission(assignmentId, user.id, payload, timestamp, late);
    const saved = academicRepository.findSubmissionByAssignmentStudent(assignmentId, user.id) ||
      academicRepository.findSubmission(result.lastInsertRowid);
    auditService.log({
      actorUserId: user.id,
      action: 'ASSIGNMENT_SUBMITTED',
      entityType: 'assignment_submission',
      entityId: saved.id,
      details: { assignmentId: assignment.id }
    });
    return saved;
  }

  gradeSubmission(submissionId, data, user) {
    const submission = requireRow(academicRepository.findSubmission(submissionId), 'Submission not found.');
    if (!this.canManageOffering(user, submission)) throw forbidden();
    const payload = validateSubmissionGrade(data);
    academicRepository.gradeSubmission(submissionId, payload, nowIso(), user.id);
    const graded = academicRepository.findSubmission(submissionId);
    auditService.log({
      actorUserId: user.id,
      action: 'ASSIGNMENT_GRADED',
      entityType: 'assignment_submission',
      entityId: graded.id,
      details: { status: graded.status, grade: graded.grade }
    });
    return graded;
  }

  listAttendanceSessions(user, filters = {}) {
    return academicRepository.listAttendanceSessions(user, normalizeFilters(filters))
      .filter(session => !this.isCourseAccessBlocked(user, session.courseId));
  }

  createAttendanceSession(data, user) {
    const payload = validateAttendanceSession(data);
    const offering = requireRow(academicRepository.findCourseOfferingById(payload.courseOfferingId), 'Course offering not found.');
    if (!this.canManageOffering(user, offering)) throw forbidden();
    const result = academicRepository.insertAttendanceSession(payload, offering.termId, user.id);
    return {
      ...academicRepository.findAttendanceSessionById(result.lastInsertRowid),
      records: []
    };
  }

  markAttendance(sessionId, records, user) {
    const session = requireRow(academicRepository.findAttendanceSessionById(sessionId), 'Attendance session not found.');
    if (!this.canManageOffering(user, session)) throw forbidden();
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('At least one attendance record is required.');
    }
    const enrolled = new Set(
      academicRepository.listOfferingEnrollments(session.courseOfferingId)
        .filter(item => item.status === 'active')
        .map(item => Number(item.studentId))
    );
    const payloads = records.map(validateAttendanceRecord);
    payloads.forEach(record => {
      if (!enrolled.has(Number(record.studentId))) {
        throw new Error('Attendance can only be marked for students enrolled in the course offering.');
      }
    });
    academicRepository.withTransaction(() => {
      payloads.forEach(record => academicRepository.upsertAttendanceRecord(sessionId, record, user.id, nowIso()));
    });
    auditService.log({
      actorUserId: user.id,
      action: 'ATTENDANCE_MARKED',
      entityType: 'attendance_session',
      entityId: sessionId,
      details: { recordCount: payloads.length }
    });
    return {
      ...session,
      records: academicRepository.listAttendanceRecords(sessionId)
    };
  }

  listAttendanceRecords(sessionId, user) {
    const session = requireRow(academicRepository.findAttendanceSessionById(sessionId), 'Attendance session not found.');
    if (!this.canManageOffering(user, session)) throw forbidden();
    return academicRepository.listAttendanceRecords(sessionId);
  }

  getAttendanceForStudent(user) {
    if (user.role !== 'student') {
      throw new Error('Only students can use this attendance view.');
    }
    return academicRepository.listAttendanceForStudent(user.id)
      .filter(record => !this.isCourseAccessBlocked(user, record.courseId));
  }

  attendanceSummary(courseOfferingId, user) {
    const offering = requireRow(academicRepository.findCourseOfferingById(courseOfferingId), 'Course offering not found.');
    if (!this.canManageOffering(user, offering)) throw forbidden();
    return {
      courseOffering: offering,
      summary: academicRepository.attendanceSummary(courseOfferingId)
    };
  }

  adminAnalytics() {
    const base = academicRepository.adminAnalytics();
    return {
      ...base,
      systemHealth: {
        openValidationIssues: validationIssueService.countOpen(),
        openImportErrors: importService.countOpenErrors(),
        restrictedUsers: restrictionService.countActive()
      },
      recentAuditLogs: auditService.recent(15)
    };
  }

  canManageOffering(user, offering) {
    if (!user || !offering) return false;
    if (user.role === 'admin') return true;
    if (user.role !== 'teacher') return false;
    if (this.isCourseAccessBlocked(user, offering.courseId)) return false;
    if (Number(offering.instructorId) === Number(user.id)) return true;
    return enrollmentRepository.canManageCourse(user, offering.courseId);
  }

  canAccessOffering(user, offering) {
    if (!user || !offering) return false;
    if (this.canManageOffering(user, offering)) return true;
    if (user.role !== 'student') return false;
    if (this.isCourseAccessBlocked(user, offering.courseId)) return false;
    const enrollment = academicRepository.findOfferingEnrollmentByStudent(offering.id || offering.courseOfferingId, user.id);
    return !!enrollment && enrollment.status === 'active';
  }

  canAccessAssignment(user, assignment) {
    if (this.canManageOffering(user, assignment)) return true;
    if (user.role !== 'student') return false;
    if (this.isCourseAccessBlocked(user, assignment.courseId)) return false;
    if (!['published', 'closed'].includes(assignment.status)) return false;
    const enrollment = academicRepository.findOfferingEnrollmentByStudent(assignment.courseOfferingId, user.id);
    return !!enrollment && enrollment.status === 'active';
  }

  ensureOfferingReferences(payload) {
    const course = requireRow(courseRepository.findById(payload.courseId), 'Course not found.');
    requireRow(academicRepository.findTermById(payload.termId), 'Term not found.');
    if (payload.instructorId) {
      const instructor = requireRow(userRepository.findById(payload.instructorId), 'Instructor not found.');
      if (instructor.role !== 'teacher' || instructor.status !== 'active') {
        throw new Error('Instructor must be an active teacher account.');
      }
    }
    if (payload.departmentId) {
      requireRow(academicRepository.findDepartmentById(payload.departmentId), 'Department not found.');
    } else if (course.departmentId) {
      payload.departmentId = course.departmentId;
    }
    const classYear = payload.classYearId
      ? requireRow(academicRepository.findClassYearById(payload.classYearId), 'Class year not found.')
      : null;
    if (classYear && payload.departmentId && Number(classYear.departmentId) !== Number(payload.departmentId)) {
      throw new Error('Class year must belong to the selected department.');
    }
    if (payload.sectionId) {
      const section = requireRow(academicRepository.findSectionById(payload.sectionId), 'Section not found.');
      if (payload.classYearId && Number(section.classYearId) !== Number(payload.classYearId)) {
        throw new Error('Section must belong to the selected class year.');
      }
    }
  }

  ensureOfferingCapacity(offering, excludeEnrollmentId = null) {
    const capacity = Number(offering.capacity || 0);
    if (capacity <= 0) return;
    const activeCount = academicRepository.countActiveOfferingEnrollments(offering.id, excludeEnrollmentId);
    if (activeCount >= capacity) {
      throw new Error('Course offering capacity has been reached.');
    }
  }

  isCourseAccessBlocked(user, courseId) {
    if (!user || user.role === 'admin') return false;
    return restrictionService.hasActiveRestriction({
      user,
      restrictionType: 'course_access_blocked',
      scopeType: 'course',
      scopeId: courseId
    });
  }
}

function normalizeFilters(filters) {
  const result = {};
  ['facultyId', 'departmentId', 'classYearId', 'termId', 'courseId', 'courseOfferingId'].forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      const id = Number(filters[key]);
      if (Number.isInteger(id) && id > 0) result[key] = id;
    }
  });
  if (filters.activeTerm === true || filters.activeTerm === 'true' || filters.activeTerm === '1') {
    result.activeTerm = true;
  }
  return result;
}

function requireRow(row, message) {
  if (!row) throw new Error(message);
  return row;
}

function forbidden() {
  const error = new Error('You do not have permission to perform this action.');
  error.status = 403;
  return error;
}

function isPastDue(dueDate, submittedAt) {
  if (!dueDate) return false;
  const dueTs = new Date(dueDate).getTime();
  const submittedTs = new Date(submittedAt).getTime();
  return Number.isFinite(dueTs) && Number.isFinite(submittedTs) && submittedTs > dueTs;
}

module.exports = new AcademicService();
