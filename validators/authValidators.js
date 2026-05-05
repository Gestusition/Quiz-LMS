const { roleValues, userStatusValues } = require('../constants/enums');
const { LIMITS } = require('../constants/limits');
const { validationError } = require('../utils/appError');
const {
  optionalId,
  optionalText,
  requiredEmail,
  requiredText
} = require('../utils/validation');

function validateUsername(value) {
  const username = String(value || '').trim().toLowerCase();
  const { usernameMin, usernameMax } = LIMITS.users;
  if (!new RegExp(`^[a-z0-9._-]{${usernameMin},${usernameMax}}$`).test(username)) {
    throw validationError(
      'username',
      `Username must be ${usernameMin}-${usernameMax} characters and use only letters, numbers, dots, underscores, or hyphens.`
    );
  }
  return username;
}

function validatePassword(password) {
  const value = String(password || '');
  const { passwordMin, passwordMax } = LIMITS.users;
  if (value.length < passwordMin || value.length > passwordMax) {
    throw validationError('password', `Password must be between ${passwordMin} and ${passwordMax} characters.`);
  }
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value)) {
    throw validationError('password', 'Password must include uppercase, lowercase, and number characters.');
  }
}

function validateStudentNumber(value) {
  const studentNumber = String(value || '').trim();
  if (!studentNumber) {
    throw validationError('student_number', 'Student number is required for student users.');
  }
  const { studentNumberMin, studentNumberMax } = LIMITS.users;
  if (!new RegExp(`^[A-Za-z0-9._-]{${studentNumberMin},${studentNumberMax}}$`).test(studentNumber)) {
    throw validationError(
      'student_number',
      `Student number must be ${studentNumberMin}-${studentNumberMax} characters and use only letters, numbers, dots, underscores, or hyphens.`
    );
  }
  return studentNumber;
}

function validateEmployeeNumber(value, required = false) {
  const employeeNumber = String(value || '').trim();
  if (!employeeNumber) {
    if (required) {
      throw validationError('employee_number', 'Employee number is required.');
    }
    return '';
  }
  const { employeeNumberMin, employeeNumberMax } = LIMITS.users;
  if (!new RegExp(`^[A-Za-z0-9._-]{${employeeNumberMin},${employeeNumberMax}}$`).test(employeeNumber)) {
    throw validationError(
      'employee_number',
      `Employee number must be ${employeeNumberMin}-${employeeNumberMax} characters and use only letters, numbers, dots, underscores, or hyphens.`
    );
  }
  return employeeNumber;
}

function optionalPositiveId(value, fieldName) {
  return optionalId(value, fieldName);
}

function validateUserPayload(data, requirePassword) {
  const name = requiredText(data.name, 'name', {
    min: LIMITS.users.nameMin,
    max: LIMITS.users.nameMax
  });
  const username = validateUsername(data.username || usernameFromEmail(data.email));
  const email = requiredEmail(data.email);
  const role = String(data.role || '').trim();
  const status = data.status ? String(data.status).trim() : 'active';
  const mustChangeCredentials = !!data.mustChangeCredentials;
  const password = data.password !== undefined ? String(data.password) : undefined;
  const displayName = optionalText(data.displayName, 'display_name', LIMITS.profiles.displayNameMax);
  const department = optionalText(data.department, 'department', LIMITS.profiles.departmentLabelMax);
  const officeHours = optionalText(data.officeHours, 'office_hours', LIMITS.profiles.officeHoursMax);
  const cohort = optionalText(data.cohort, 'cohort', LIMITS.profiles.cohortMax);
  const studentNumber = role === 'student' ? validateStudentNumber(data.studentNumber) : '';
  const facultyId = optionalPositiveId(data.facultyId, 'facultyId');
  const departmentId = optionalPositiveId(data.departmentId, 'departmentId');
  const classYearId = optionalPositiveId(data.classYearId, 'classYearId');
  const sectionId = optionalPositiveId(data.sectionId, 'sectionId');
  const academicTitle = optionalText(data.academicTitle, 'academic_title', LIMITS.profiles.titleMax);
  const staffNumber = validateEmployeeNumber(data.staffNumber, false);
  const adminTitle = optionalText(data.adminTitle, 'admin_title', LIMITS.profiles.titleMax);

  if (!roleValues.includes(role)) {
    throw validationError('role', `Role must be one of: ${roleValues.join(', ')}.`);
  }
  if (!userStatusValues.includes(status)) {
    throw validationError('status', `Status must be one of: ${userStatusValues.join(', ')}.`);
  }
  if (requirePassword || password) {
    validatePassword(password);
  }

  return {
    name,
    username,
    email,
    role,
    status,
    mustChangeCredentials,
    password,
    displayName,
    department,
    officeHours,
    studentNumber,
    cohort,
    facultyId,
    departmentId,
    classYearId: role === 'student' ? classYearId : null,
    sectionId: role === 'student' ? sectionId : null,
    academicTitle,
    staffNumber,
    adminTitle
  };
}

function usernameFromEmail(email) {
  const username = String(email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return username || '';
}

module.exports = {
  validateEmployeeNumber,
  validatePassword,
  validateStudentNumber,
  validateUserPayload,
  validateUsername,
  usernameFromEmail,
  optionalPositiveId
};
