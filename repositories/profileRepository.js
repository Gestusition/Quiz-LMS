const { getDatabase } = require('../database/db');

function deleteForUser(userId) {
  const db = getDatabase();
  db.prepare('DELETE FROM admin_profiles WHERE userId = ?').run(userId);
  db.prepare('DELETE FROM teacher_profiles WHERE userId = ?').run(userId);
  db.prepare('DELETE FROM student_profiles WHERE userId = ?').run(userId);
}

function replaceForUser(userId, payload) {
  const db = getDatabase();
  deleteForUser(userId);

  if (payload.role === 'admin') {
    db.prepare(`
      INSERT INTO admin_profiles (userId, displayName, facultyId, departmentId, adminTitle, securityNotes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      payload.displayName || payload.name,
      payload.facultyId,
      payload.departmentId,
      payload.adminTitle || '',
      payload.mustChangeCredentials ? 'Credential rotation required.' : ''
    );
  } else if (payload.role === 'teacher') {
    db.prepare(`
      INSERT INTO teacher_profiles (
        userId, displayName, department, facultyId, departmentId, academicTitle, staffNumber, officeHours
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      payload.name,
      payload.department || '',
      payload.facultyId,
      payload.departmentId,
      payload.academicTitle || '',
      payload.staffNumber || '',
      payload.officeHours || ''
    );
  } else if (payload.role === 'student') {
    db.prepare(`
      INSERT INTO student_profiles (
        userId, displayName, studentNumber, cohort, facultyId, departmentId, classYearId, sectionId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      payload.name,
      payload.studentNumber,
      payload.cohort || '',
      payload.facultyId,
      payload.departmentId,
      payload.classYearId,
      payload.sectionId
    );
  }
}

function getForUser(userId, role) {
  const db = getDatabase();
  if (role === 'admin') {
    return db.prepare(`
      SELECT displayName, facultyId, departmentId, adminTitle
      FROM admin_profiles
      WHERE userId = ?
    `).get(userId) || {};
  }
  if (role === 'teacher') {
    return db.prepare(`
      SELECT department, officeHours, facultyId, departmentId, academicTitle, staffNumber
      FROM teacher_profiles
      WHERE userId = ?
    `).get(userId) || {};
  }
  if (role === 'student') {
    return db.prepare(`
      SELECT studentNumber, cohort, facultyId, departmentId, classYearId, sectionId
      FROM student_profiles
      WHERE userId = ?
    `).get(userId) || {};
  }
  return {};
}

function findDuplicateStudentNumber(studentNumber, excludeUserId) {
  const db = getDatabase();
  if (excludeUserId) {
    return db.prepare(`
      SELECT userId
      FROM student_profiles
      WHERE LOWER(studentNumber) = LOWER(?) AND userId != ?
    `).get(studentNumber, excludeUserId) || null;
  }
  return db.prepare(`
    SELECT userId
    FROM student_profiles
    WHERE LOWER(studentNumber) = LOWER(?)
  `).get(studentNumber) || null;
}

function findDuplicateStaffNumber(staffNumber, excludeUserId) {
  if (!String(staffNumber || '').trim()) return null;
  const db = getDatabase();
  if (excludeUserId) {
    return db.prepare(`
      SELECT userId
      FROM teacher_profiles
      WHERE LOWER(staffNumber) = LOWER(?) AND userId != ?
    `).get(staffNumber, excludeUserId) || null;
  }
  return db.prepare(`
    SELECT userId
    FROM teacher_profiles
    WHERE LOWER(staffNumber) = LOWER(?)
  `).get(staffNumber) || null;
}

function touchAdminCredentialRotation(userId, timestamp) {
  return getDatabase().prepare(`
    UPDATE admin_profiles
    SET lastCredentialRotationAt = ?, updatedAt = ?
    WHERE userId = ?
  `).run(timestamp, timestamp, userId);
}

module.exports = {
  deleteForUser,
  findDuplicateStaffNumber,
  findDuplicateStudentNumber,
  getForUser,
  replaceForUser,
  touchAdminCredentialRotation
};
