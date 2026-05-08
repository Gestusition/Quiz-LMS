const { getDatabase } = require('../database/db');

function create(userId, tokenHash, expiresAt) {
  return getDatabase().prepare(`
    INSERT INTO users.sessions (userId, tokenHash, expiresAt)
    VALUES (?, ?, ?)
  `).run(userId, tokenHash, expiresAt);
}

function deleteByTokenHash(tokenHash) {
  return getDatabase().prepare('DELETE FROM users.sessions WHERE tokenHash = ?').run(tokenHash);
}

function deleteById(id) {
  return getDatabase().prepare('DELETE FROM users.sessions WHERE id = ?').run(id);
}

function deleteByUserId(userId) {
  return getDatabase().prepare('DELETE FROM users.sessions WHERE userId = ?').run(userId);
}

function deleteOtherUserSessions(userId, currentTokenHash) {
  return getDatabase().prepare('DELETE FROM users.sessions WHERE userId = ? AND tokenHash != ?').run(userId, currentTokenHash);
}

function findById(id) {
  return getDatabase().prepare('SELECT * FROM users.sessions WHERE id = ?').get(id) || null;
}

function findUserByTokenHash(tokenHash) {
  return getDatabase().prepare(`
    SELECT u.*, s.id as sessionId, s.expiresAt,
      ap.displayName as displayName,
      ap.adminTitle as adminTitle,
      tp.department as department,
      tp.officeHours as officeHours,
      tp.academicTitle as academicTitle,
      tp.staffNumber as staffNumber,
      sp.studentNumber as studentNumber,
      sp.cohort as cohort,
      COALESCE(sp.facultyId, tp.facultyId, ap.facultyId) as facultyId,
      COALESCE(sp.departmentId, tp.departmentId, ap.departmentId) as departmentId,
      sp.classYearId as classYearId,
      sp.sectionId as sectionId,
      f.name as facultyName,
      f.code as facultyCode,
      d.name as departmentName,
      d.code as departmentCode,
      cy.name as classYearName,
      cy.yearNumber as yearNumber,
      sec.name as sectionName
    FROM users.sessions s
    JOIN users.users u ON u.id = s.userId
    LEFT JOIN admin.admin_profiles ap ON ap.userId = u.id
    LEFT JOIN teacher.teacher_profiles tp ON tp.userId = u.id
    LEFT JOIN student.student_profiles sp ON sp.userId = u.id
    LEFT JOIN learning.faculties f ON f.id = COALESCE(sp.facultyId, tp.facultyId, ap.facultyId)
    LEFT JOIN learning.departments d ON d.id = COALESCE(sp.departmentId, tp.departmentId, ap.departmentId)
    LEFT JOIN learning.class_years cy ON cy.id = sp.classYearId
    LEFT JOIN learning.sections sec ON sec.id = sp.sectionId
    WHERE s.tokenHash = ?
  `).get(tokenHash) || null;
}

function updateLastSeen(id, timestamp) {
  return getDatabase().prepare('UPDATE users.sessions SET lastSeenAt = ? WHERE id = ?').run(timestamp, id);
}

function updateTokenHash(id, tokenHash) {
  return getDatabase().prepare('UPDATE users.sessions SET tokenHash = ? WHERE id = ?').run(tokenHash, id);
}

module.exports = {
  create,
  deleteById,
  deleteByTokenHash,
  deleteByUserId,
  deleteOtherUserSessions,
  findById,
  findUserByTokenHash,
  updateLastSeen,
  updateTokenHash
};