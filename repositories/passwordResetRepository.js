const { getDatabase } = require('../database/db');

function expireActiveForUser(userId) {
  return getDatabase().prepare(`
    UPDATE password_reset_codes
    SET status = 'expired'
    WHERE userId = ?
      AND status IN ('requested', 'issued')
  `).run(userId);
}

function expireIssuedBefore(timestamp) {
  return getDatabase().prepare(`
    UPDATE password_reset_codes
    SET status = 'expired'
    WHERE status = 'issued'
      AND expiresAt != ''
      AND expiresAt <= ?
  `).run(timestamp);
}

function createRequested(userId, requestedUsername) {
  return getDatabase().prepare(`
    INSERT INTO password_reset_codes (userId, requestedUsername, status)
    VALUES (?, ?, 'requested')
  `).run(userId, requestedUsername);
}

function listActive() {
  return getDatabase().prepare(`
    SELECT
      r.id,
      r.userId,
      r.requestedUsername,
      r.status,
      r.expiresAt,
      r.createdAt,
      r.issuedAt,
      u.name,
      u.username,
      u.email,
      u.role,
      u.status as userStatus
    FROM password_reset_codes r
    JOIN users u ON u.id = r.userId
    WHERE r.status IN ('requested', 'issued')
    ORDER BY r.createdAt DESC, r.id DESC
  `).all();
}

function createIssued(userId, requestedUsername, codeHash, expiresAt, issuedAt) {
  return getDatabase().prepare(`
    INSERT INTO password_reset_codes (userId, requestedUsername, codeHash, status, expiresAt, issuedAt)
    VALUES (?, ?, ?, 'issued', ?, ?)
  `).run(userId, requestedUsername, codeHash, expiresAt, issuedAt);
}

function findLatestIssuedForUser(userId, timestamp) {
  return getDatabase().prepare(`
    SELECT *
    FROM password_reset_codes
    WHERE userId = ?
      AND status = 'issued'
      AND expiresAt > ?
    ORDER BY id DESC
    LIMIT 1
  `).get(userId, timestamp) || null;
}

function markUsed(id, usedAt) {
  return getDatabase().prepare(`
    UPDATE password_reset_codes
    SET status = 'used', usedAt = ?
    WHERE id = ?
  `).run(usedAt, id);
}

function deleteByUserId(userId) {
  return getDatabase().prepare('DELETE FROM password_reset_codes WHERE userId = ?').run(userId);
}

module.exports = {
  createIssued,
  createRequested,
  deleteByUserId,
  expireActiveForUser,
  expireIssuedBefore,
  findLatestIssuedForUser,
  listActive,
  markUsed
};
