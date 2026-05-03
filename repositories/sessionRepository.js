const { getDatabase } = require('../database/db');

function create(userId, tokenHash, expiresAt) {
  return getDatabase().prepare(`
    INSERT INTO sessions (userId, tokenHash, expiresAt)
    VALUES (?, ?, ?)
  `).run(userId, tokenHash, expiresAt);
}

function deleteByTokenHash(tokenHash) {
  return getDatabase().prepare('DELETE FROM sessions WHERE tokenHash = ?').run(tokenHash);
}

function deleteById(id) {
  return getDatabase().prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

function deleteByUserId(userId) {
  return getDatabase().prepare('DELETE FROM sessions WHERE userId = ?').run(userId);
}

function deleteOtherUserSessions(userId, currentTokenHash) {
  return getDatabase().prepare('DELETE FROM sessions WHERE userId = ? AND tokenHash != ?').run(userId, currentTokenHash);
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
    FROM sessions s
    JOIN users u ON u.id = s.userId
    LEFT JOIN admin_profiles ap ON ap.userId = u.id
    LEFT JOIN teacher_profiles tp ON tp.userId = u.id
    LEFT JOIN student_profiles sp ON sp.userId = u.id
    LEFT JOIN faculties f ON f.id = COALESCE(sp.facultyId, tp.facultyId, ap.facultyId)
    LEFT JOIN departments d ON d.id = COALESCE(sp.departmentId, tp.departmentId, ap.departmentId)
    LEFT JOIN class_years cy ON cy.id = sp.classYearId
    LEFT JOIN sections sec ON sec.id = sp.sectionId
    WHERE s.tokenHash = ?
  `).get(tokenHash) || null;
}

function updateLastSeen(id, timestamp) {
  return getDatabase().prepare('UPDATE sessions SET lastSeenAt = ? WHERE id = ?').run(timestamp, id);
}

module.exports = {
  create,
  deleteById,
  deleteByTokenHash,
  deleteByUserId,
  deleteOtherUserSessions,
  findUserByTokenHash,
  updateLastSeen
};
