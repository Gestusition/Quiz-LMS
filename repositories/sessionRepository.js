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
    SELECT u.*, s.id as sessionId, s.expiresAt
    FROM sessions s
    JOIN users u ON u.id = s.userId
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
