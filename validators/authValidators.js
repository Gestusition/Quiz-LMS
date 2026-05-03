const { roleValues, userStatusValues } = require('../constants/enums');

function validateUsername(value) {
  const username = String(value || '').trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
    throw new Error('Username must be 3-32 characters and use only letters, numbers, dots, underscores, or hyphens.');
  }
  return username;
}

function validatePassword(password) {
  if (!password || password.length < 8 || password.length > 128) {
    throw new Error('Password must be between 8 and 128 characters.');
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error('Password must include uppercase, lowercase, and number characters.');
  }
}

function validateStudentNumber(value) {
  const studentNumber = String(value || '').trim();
  if (!studentNumber) {
    throw new Error('Student number is required for student users.');
  }
  if (!/^[A-Za-z0-9._-]{3,32}$/.test(studentNumber)) {
    throw new Error('Student number must be 3-32 characters and use only letters, numbers, dots, underscores, or hyphens.');
  }
  return studentNumber;
}

function optionalPositiveId(value, fieldName) {
  if (value === undefined || value === null || value === '') return null;
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }
  return id;
}

function validateUserPayload(data, requirePassword) {
  const name = String(data.name || '').trim();
  const username = validateUsername(data.username || usernameFromEmail(data.email));
  const email = String(data.email || '').trim().toLowerCase();
  const role = String(data.role || '').trim();
  const status = data.status ? String(data.status).trim() : 'active';
  const mustChangeCredentials = !!data.mustChangeCredentials;
  const password = data.password !== undefined ? String(data.password) : undefined;
  const displayName = data.displayName !== undefined ? String(data.displayName || '').trim() : '';
  const department = data.department !== undefined ? String(data.department || '').trim() : '';
  const officeHours = data.officeHours !== undefined ? String(data.officeHours || '').trim() : '';
  const cohort = data.cohort !== undefined ? String(data.cohort || '').trim() : '';
  const studentNumber = role === 'student' ? validateStudentNumber(data.studentNumber) : '';
  const facultyId = optionalPositiveId(data.facultyId, 'facultyId');
  const departmentId = optionalPositiveId(data.departmentId, 'departmentId');
  const classYearId = optionalPositiveId(data.classYearId, 'classYearId');
  const sectionId = optionalPositiveId(data.sectionId, 'sectionId');
  const academicTitle = data.academicTitle !== undefined ? String(data.academicTitle || '').trim() : '';
  const staffNumber = data.staffNumber !== undefined ? String(data.staffNumber || '').trim() : '';
  const adminTitle = data.adminTitle !== undefined ? String(data.adminTitle || '').trim() : '';

  if (!name || name.length > 120) {
    throw new Error('User name is required and must be 120 characters or less.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('A valid email is required.');
  }
  if (!roleValues.includes(role)) {
    throw new Error(`Role must be one of: ${roleValues.join(', ')}.`);
  }
  if (!userStatusValues.includes(status)) {
    throw new Error('Status must be active or disabled.');
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
  validatePassword,
  validateStudentNumber,
  validateUserPayload,
  validateUsername,
  usernameFromEmail,
  optionalPositiveId
};
