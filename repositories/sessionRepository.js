const crypto = require('crypto');
const { getDatabase } = require('../database/db');

function createPendingJwt(userId, expiresAt) {
  const pendingHash = crypto
    .createHash('sha256')
    .update(`pending:${crypto.randomUUID()}`)
    .digest('hex');

  return getDatabase().prepare(`
    INSERT INTO users.sessions (userId, tokenHash, tokenType, expiresAt)
    VALUES (?, ?, 'jwt', ?)
  `).run(userId, pendingHash, expiresAt);
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

function updateLastSeen(id, timestamp) {
  return getDatabase().prepare('UPDATE users.sessions SET lastSeenAt = ? WHERE id = ?').run(timestamp, id);
}

function updateTokenHash(id, tokenHash) {
  return getDatabase().prepare(`
    UPDATE users.sessions
    SET tokenHash = ?, tokenType = 'jwt'
    WHERE id = ?
  `).run(tokenHash, id);
}

module.exports = {
  createPendingJwt,
  deleteById,
  deleteByTokenHash,
  deleteByUserId,
  deleteOtherUserSessions,
  findById,
  updateLastSeen,
  updateTokenHash
};
