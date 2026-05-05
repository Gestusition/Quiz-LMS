const { getDatabase } = require('../database/db');
const { parsePagination } = require('../utils/validation');

function list(filters = {}) {
  const paging = parsePagination(filters);
  let query = `
    SELECT r.*, u.name as userName, u.email as userEmail, creator.name as createdByName
    FROM user_restrictions r
    JOIN users u ON u.id = r.userId
    LEFT JOIN users creator ON creator.id = r.createdBy
    WHERE 1=1
  `;
  const params = [];

  if (filters.userId) {
    query += ' AND r.userId = ?';
    params.push(Number(filters.userId));
  }
  if (filters.restrictionType) {
    query += ' AND r.restrictionType = ?';
    params.push(filters.restrictionType);
  }
  if (filters.scopeType) {
    query += ' AND r.scopeType = ?';
    params.push(filters.scopeType);
  }
  if (filters.scopeId) {
    query += ' AND r.scopeId = ?';
    params.push(Number(filters.scopeId));
  }
  if (filters.activeOnly) {
    query += ' AND r.isActive = 1';
  }

  const total = getDatabase().prepare(`
    SELECT COUNT(*) as count
    FROM user_restrictions r
    WHERE 1=1
    ${filters.userId ? 'AND r.userId = ?' : ''}
    ${filters.restrictionType ? 'AND r.restrictionType = ?' : ''}
    ${filters.scopeType ? 'AND r.scopeType = ?' : ''}
    ${filters.scopeId ? 'AND r.scopeId = ?' : ''}
    ${filters.activeOnly ? 'AND r.isActive = 1' : ''}
  `).get(...params).count;

  query += ' ORDER BY r.isActive DESC, r.createdAt DESC LIMIT ? OFFSET ?';
  const items = getDatabase().prepare(query).all(...params, paging.limit, paging.offset);
  return {
    items,
    pagination: {
      page: paging.page,
      limit: paging.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / paging.limit))
    }
  };
}

function create(payload) {
  return getDatabase().prepare(`
    INSERT INTO user_restrictions (
      userId, restrictionType, scopeType, scopeId, reason, startsAt, endsAt, createdBy, isActive
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.userId,
    payload.restrictionType,
    payload.scopeType,
    payload.scopeId || null,
    payload.reason || '',
    payload.startsAt,
    payload.endsAt || '',
    payload.createdBy || null,
    payload.isActive ? 1 : 0
  );
}

function findById(id) {
  return getDatabase().prepare('SELECT * FROM user_restrictions WHERE id = ?').get(id) || null;
}

function deactivate(id) {
  return getDatabase().prepare(`
    UPDATE user_restrictions
    SET isActive = 0
    WHERE id = ?
  `).run(id);
}

function findActiveForUser(userId, nowIso) {
  return getDatabase().prepare(`
    SELECT *
    FROM user_restrictions
    WHERE userId = ?
      AND isActive = 1
      AND (TRIM(COALESCE(startsAt, '')) = '' OR startsAt <= ?)
      AND (TRIM(COALESCE(endsAt, '')) = '' OR endsAt >= ?)
    ORDER BY createdAt DESC
  `).all(userId, nowIso, nowIso);
}

function countActive() {
  return getDatabase().prepare(`
    SELECT COUNT(*) as count FROM user_restrictions WHERE isActive = 1
  `).get().count;
}

module.exports = {
  countActive,
  create,
  deactivate,
  findActiveForUser,
  findById,
  list
};
