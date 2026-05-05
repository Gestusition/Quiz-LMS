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

function listRecent(limit = 20) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 200);
  return getDatabase().prepare(`
    SELECT l.*, u.name as actorName, u.role as actorRole
    FROM audit_logs l
    LEFT JOIN users u ON u.id = l.actorUserId
    ORDER BY l.createdAt DESC, l.id DESC
    LIMIT ?
  `).all(safeLimit);
}

module.exports = {
  create,
  listRecent
};
