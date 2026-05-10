const { getDatabase } = require('../database/db');

function create(entry) {
  return getDatabase().prepare(`
    INSERT INTO audit_logs (actorUserId, action, entityType, entityId, detailsJson)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    entry.actorUserId || null,
    entry.action,
    entry.entityType,
    entry.entityId || null,
    JSON.stringify(entry.details || {})
  );
}

function listRecent(limit = 20, filters = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 200);
  const clauses = [];
  const params = [];

  if (filters.date) {
    clauses.push('date(l.createdAt) = ?');
    params.push(filters.date);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return getDatabase().prepare(`
    SELECT l.*, u.name as actorName, u.role as actorRole
    FROM audit_logs l
    LEFT JOIN users u ON u.id = l.actorUserId
    ${where}
    ORDER BY l.createdAt DESC, l.id DESC
    LIMIT ?
  `).all(...params, safeLimit);
}

function listForEntity(entityType, entityId, limit = 20) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  return getDatabase().prepare(`
    SELECT l.*, u.name as actorName, u.role as actorRole
    FROM audit_logs l
    LEFT JOIN users u ON u.id = l.actorUserId
    WHERE l.entityType = ? AND l.entityId = ?
    ORDER BY l.createdAt DESC, l.id DESC
    LIMIT ?
  `).all(entityType, Number(entityId), safeLimit);
}

module.exports = {
  create,
  listForEntity,
  listRecent
};
