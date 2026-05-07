const SEMESTER_TYPES = ['fall', 'spring', 'summer', 'winter', 'full-year', 'other'];
const OFFERING_STATUSES = ['planned', 'active', 'completed', 'cancelled'];
const OFFERING_ENROLLMENT_STATUSES = ['active', 'dropped', 'completed'];
const ASSIGNMENT_STATUSES = ['draft', 'published', 'closed'];
const SUBMISSION_STATUSES = ['submitted', 'graded', 'returned'];
const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'excused'];
const { LIMITS } = require('../constants/limits');
const { validationError } = require('../utils/appError');
const {
  dateValue,
  ensureDateOrder,
  enumValue,
  intInRange,
  optionalId: parseOptionalId,
  optionalText,
  optionalUrl,
  requiredId: parseRequiredId,
  requiredText
} = require('../utils/validation');

function optionalId(value, field) {
  return parseOptionalId(value, field);
}

function requiredId(value, field) {
  return parseRequiredId(value, field);
}

function shortText(value, field, max = 120, required = true) {
  if (required) {
    return requiredText(value, field, { min: 1, max });
  }
  return optionalText(value, field, max);
}

function code(value, field = 'Code') {
  const text = shortText(value, field, 32).toUpperCase();
  if (!/^[A-Z0-9_-]+$/.test(text)) {
    throw validationError(field, `${field} may only contain letters, numbers, underscores, or hyphens.`);
  }
  return text;
}

function dateText(value, field, required = false) {
  return dateValue(value, field, { required });
}

function validateFaculty(data) {
  return {
    name: shortText(data.name, 'Faculty name', 120),
    code: code(data.code, 'Faculty code')
  };
}

function validateDepartment(data) {
  return {
    facultyId: requiredId(data.facultyId, 'facultyId'),
    name: shortText(data.name, 'Department name', 120),
    code: code(data.code, 'Department code')
  };
}

function validateClassYear(data) {
  const yearNumber = intInRange(data.yearNumber, 'yearNumber', 1, 8);
  return {
    departmentId: requiredId(data.departmentId, 'departmentId'),
    yearNumber,
    name: shortText(data.name || `Year ${yearNumber}`, 'Class year name', 80)
  };
}

function validateSection(data) {
  return {
    classYearId: requiredId(data.classYearId, 'classYearId'),
    name: shortText(data.name, 'Section name', 40)
  };
}

function validateTerm(data) {
  const semesterType = enumValue(
    String(data.semesterType || '').trim().toLowerCase(),
    'semesterType',
    SEMESTER_TYPES,
    'fall'
  );
  const startDate = dateText(data.startDate, 'startDate');
  const endDate = dateText(data.endDate, 'endDate');
  ensureDateOrder(startDate, endDate, 'startDate', 'endDate');
  return {
    name: shortText(data.name, 'Term name', LIMITS.terms.nameMax),
    academicYear: shortText(data.academicYear, 'Academic year', LIMITS.terms.yearMax),
    semesterType,
    startDate,
    endDate,
    isActive: data.isActive ? 1 : 0
  };
}

function validateCourseOffering(data) {
  const status = enumValue(data.status, 'status', OFFERING_STATUSES, 'planned');
  const capacity = intInRange(data.capacity, 'capacity', 0, LIMITS.offerings.capacityMax, {
    required: false,
    defaultValue: 0
  });
  return {
    courseId: requiredId(data.courseId, 'courseId'),
    termId: requiredId(data.termId, 'termId'),
    instructorId: optionalId(data.instructorId, 'instructorId'),
    departmentId: optionalId(data.departmentId, 'departmentId'),
    classYearId: optionalId(data.classYearId, 'classYearId'),
    sectionId: optionalId(data.sectionId, 'sectionId'),
    capacity,
    status
  };
}

function validateOfferingEnrollment(data) {
  const status = enumValue(data.status, 'status', OFFERING_ENROLLMENT_STATUSES, 'active');
  return {
    courseOfferingId: requiredId(data.courseOfferingId, 'courseOfferingId'),
    studentId: requiredId(data.studentId, 'studentId'),
    status,
    finalGrade: shortText(data.finalGrade, 'Final grade', 24, false)
  };
}

function validateAssignment(data) {
  const status = enumValue(data.status, 'status', ASSIGNMENT_STATUSES, 'draft');
  return {
    courseOfferingId: requiredId(data.courseOfferingId, 'courseOfferingId'),
    title: shortText(data.title, 'Assignment title', LIMITS.assignments.titleMax),
    description: shortText(data.description, 'Assignment description', LIMITS.assignments.descriptionMax, false),
    dueDate: dateText(data.dueDate, 'dueDate'),
    status
  };
}

function validateSubmission(data) {
  const submissionText = shortText(data.submissionText, 'Submission text', LIMITS.assignments.submissionTextMax, false);
  const submissionUrl = optionalUrl(data.submissionUrl, 'Submission URL', LIMITS.assignments.submissionUrlMax);
  if (!submissionText && !submissionUrl) {
    throw validationError('submission', 'Submission text or URL is required.');
  }
  return { submissionText, submissionUrl };
}

function validateSubmissionGrade(data) {
  const status = enumValue(data.status, 'status', SUBMISSION_STATUSES, 'graded');
  return {
    grade: shortText(data.grade, 'Grade', LIMITS.assignments.gradeMax, false),
    feedback: shortText(data.feedback, 'Feedback', LIMITS.assignments.feedbackMax, false),
    status
  };
}

function validateAttendanceSession(data) {
  return {
    courseOfferingId: requiredId(data.courseOfferingId, 'courseOfferingId'),
    sessionDate: dateText(data.sessionDate, 'sessionDate', true),
    topic: shortText(data.topic, 'Topic', LIMITS.attendance.topicMax, false)
  };
}

function validateAttendanceRecord(data) {
  const status = enumValue(data.status, 'status', ATTENDANCE_STATUSES);
  return {
    studentId: requiredId(data.studentId, 'studentId'),
    status,
    note: shortText(data.note, 'Note', LIMITS.attendance.noteMax, false)
  };
}

module.exports = {
  ASSIGNMENT_STATUSES,
  ATTENDANCE_STATUSES,
  OFFERING_ENROLLMENT_STATUSES,
  OFFERING_STATUSES,
  SEMESTER_TYPES,
  SUBMISSION_STATUSES,
  optionalId,
  requiredId,
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
};
