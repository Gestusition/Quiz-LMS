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
      INSERT INTO admin_profiles (userId, displayName, securityNotes)
      VALUES (?, ?, ?)
    `).run(userId, payload.displayName || payload.name, payload.mustChangeCredentials ? 'Credential rotation required.' : '');
  } else if (payload.role === 'teacher') {
    db.prepare(`
      INSERT INTO teacher_profiles (userId, displayName, department, officeHours)
      VALUES (?, ?, ?, ?)
    `).run(userId, payload.name, payload.department || '', payload.officeHours || '');
  } else if (payload.role === 'student') {
    db.prepare(`
      INSERT INTO student_profiles (userId, displayName, studentNumber, cohort)
      VALUES (?, ?, ?, ?)
    `).run(userId, payload.name, payload.studentNumber, payload.cohort || '');
  }
}

function getForUser(userId, role) {
  const db = getDatabase();
  if (role === 'admin') {
    return db.prepare('SELECT displayName FROM admin_profiles WHERE userId = ?').get(userId) || {};
  }
  if (role === 'teacher') {
    return db.prepare('SELECT department, officeHours FROM teacher_profiles WHERE userId = ?').get(userId) || {};
  }
  if (role === 'student') {
    return db.prepare('SELECT studentNumber, cohort FROM student_profiles WHERE userId = ?').get(userId) || {};
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

function touchAdminCredentialRotation(userId, timestamp) {
  return getDatabase().prepare(`
    UPDATE admin_profiles
    SET lastCredentialRotationAt = ?, updatedAt = ?
    WHERE userId = ?
  `).run(timestamp, timestamp, userId);
}

module.exports = {
  deleteForUser,
  findDuplicateStudentNumber,
  getForUser,
  replaceForUser,
  touchAdminCredentialRotation
};
