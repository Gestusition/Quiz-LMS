const SEMESTER_TYPES = ['fall', 'spring', 'summer', 'winter', 'full-year', 'other'];
const OFFERING_STATUSES = ['planned', 'active', 'completed', 'cancelled'];
const OFFERING_ENROLLMENT_STATUSES = ['active', 'dropped', 'completed'];
const ASSIGNMENT_STATUSES = ['draft', 'published', 'closed'];
const SUBMISSION_STATUSES = ['submitted', 'graded', 'returned'];
const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'excused'];

function optionalId(value, field) {
  if (value === undefined || value === null || value === '') return null;
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new Error(`${field} must be a positive integer.`);
  }
  return id;
}

function requiredId(value, field) {
  const id = optionalId(value, field);
  if (!id) throw new Error(`${field} is required.`);
  return id;
}

function shortText(value, field, max = 120, required = true) {
  const text = String(value || '').trim();
  if (required && !text) throw new Error(`${field} is required.`);
  if (text.length > max) throw new Error(`${field} must be ${max} characters or less.`);
  return text;
}

function code(value, field = 'Code') {
  const text = shortText(value, field, 32).toUpperCase();
  if (!/^[A-Z0-9_-]+$/.test(text)) {
    throw new Error(`${field} may only contain letters, numbers, underscores, or hyphens.`);
  }
  return text;
}

function dateText(value, field, required = false) {
  const text = String(value || '').trim();
  if (required && !text) throw new Error(`${field} is required.`);
  if (text && Number.isNaN(Date.parse(text))) {
    throw new Error(`${field} must be a valid date.`);
  }
  return text;
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
  const yearNumber = Number(data.yearNumber);
  if (!Number.isInteger(yearNumber) || yearNumber < 1 || yearNumber > 8) {
    throw new Error('yearNumber must be an integer between 1 and 8.');
  }
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
  const semesterType = String(data.semesterType || '').trim().toLowerCase();
  if (!SEMESTER_TYPES.includes(semesterType)) {
    throw new Error(`semesterType must be one of: ${SEMESTER_TYPES.join(', ')}.`);
  }
  const startDate = dateText(data.startDate, 'startDate');
  const endDate = dateText(data.endDate, 'endDate');
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error('startDate must be before endDate.');
  }
  return {
    name: shortText(data.name, 'Term name', 120),
    academicYear: shortText(data.academicYear, 'Academic year', 24),
    semesterType,
    startDate,
    endDate,
    isActive: data.isActive ? 1 : 0
  };
}

function validateCourseOffering(data) {
  const status = String(data.status || 'planned').trim();
  if (!OFFERING_STATUSES.includes(status)) {
    throw new Error(`status must be one of: ${OFFERING_STATUSES.join(', ')}.`);
  }
  const capacity = data.capacity === undefined || data.capacity === ''
    ? 0
    : Number(data.capacity);
  if (!Number.isInteger(capacity) || capacity < 0) {
    throw new Error('capacity must be a non-negative integer.');
  }
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
  const status = String(data.status || 'active').trim();
  if (!OFFERING_ENROLLMENT_STATUSES.includes(status)) {
    throw new Error(`status must be one of: ${OFFERING_ENROLLMENT_STATUSES.join(', ')}.`);
  }
  return {
    courseOfferingId: requiredId(data.courseOfferingId, 'courseOfferingId'),
    studentId: requiredId(data.studentId, 'studentId'),
    status,
    finalGrade: shortText(data.finalGrade, 'Final grade', 24, false)
  };
}

function validateAssignment(data) {
  const status = String(data.status || 'draft').trim();
  if (!ASSIGNMENT_STATUSES.includes(status)) {
    throw new Error(`status must be one of: ${ASSIGNMENT_STATUSES.join(', ')}.`);
  }
  return {
    courseOfferingId: requiredId(data.courseOfferingId, 'courseOfferingId'),
    title: shortText(data.title, 'Assignment title', 160),
    description: shortText(data.description, 'Assignment description', 3000, false),
    dueDate: dateText(data.dueDate, 'dueDate'),
    status
  };
}

function validateSubmission(data) {
  const submissionText = shortText(data.submissionText, 'Submission text', 5000, false);
  const submissionUrl = shortText(data.submissionUrl, 'Submission URL', 500, false);
  if (!submissionText && !submissionUrl) {
    throw new Error('Submission text or URL is required.');
  }
  return { submissionText, submissionUrl };
}

function validateSubmissionGrade(data) {
  const status = String(data.status || 'graded').trim();
  if (!SUBMISSION_STATUSES.includes(status)) {
    throw new Error(`status must be one of: ${SUBMISSION_STATUSES.join(', ')}.`);
  }
  return {
    grade: shortText(data.grade, 'Grade', 40, false),
    feedback: shortText(data.feedback, 'Feedback', 3000, false),
    status
  };
}

function validateAttendanceSession(data) {
  return {
    courseOfferingId: requiredId(data.courseOfferingId, 'courseOfferingId'),
    sessionDate: dateText(data.sessionDate, 'sessionDate', true),
    topic: shortText(data.topic, 'Topic', 160, false)
  };
}

function validateAttendanceRecord(data) {
  const status = String(data.status || '').trim();
  if (!ATTENDANCE_STATUSES.includes(status)) {
    throw new Error(`status must be one of: ${ATTENDANCE_STATUSES.join(', ')}.`);
  }
  return {
    studentId: requiredId(data.studentId, 'studentId'),
    status,
    note: shortText(data.note, 'Note', 500, false)
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
