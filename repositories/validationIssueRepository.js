const { getDatabase } = require('../database/db');
const { parsePagination } = require('../utils/validation');

function list(filters = {}) {
  const paging = parsePagination(filters);
  let query = `
    SELECT vi.*, u.name as resolvedByName
    FROM validation_issues vi
    LEFT JOIN users u ON u.id = vi.resolvedBy
    WHERE 1=1
  `;
  const params = [];

  if (filters.entityType) {
    query += ' AND vi.entityType = ?';
    params.push(filters.entityType);
  }
  if (filters.entityId) {
    query += ' AND vi.entityId = ?';
    params.push(Number(filters.entityId));
  }
  if (filters.status) {
    query += ' AND vi.status = ?';
    params.push(filters.status);
  }
  if (filters.severity) {
    query += ' AND vi.severity = ?';
    params.push(filters.severity);
  }
  if (filters.relatedCourseId) {
    query += ' AND vi.relatedCourseId = ?';
    params.push(Number(filters.relatedCourseId));
  }
  if (filters.relatedUserId) {
    query += ' AND vi.relatedUserId = ?';
    params.push(Number(filters.relatedUserId));
  }

  const total = getDatabase().prepare(`
    SELECT COUNT(*) as count
    FROM validation_issues vi
    WHERE 1=1
    ${filters.entityType ? 'AND vi.entityType = ?' : ''}
    ${filters.entityId ? 'AND vi.entityId = ?' : ''}
    ${filters.status ? 'AND vi.status = ?' : ''}
    ${filters.severity ? 'AND vi.severity = ?' : ''}
    ${filters.relatedCourseId ? 'AND vi.relatedCourseId = ?' : ''}
    ${filters.relatedUserId ? 'AND vi.relatedUserId = ?' : ''}
  `).get(...params).count;

  query += ' ORDER BY CASE vi.severity WHEN \'critical\' THEN 1 WHEN \'error\' THEN 2 WHEN \'warning\' THEN 3 ELSE 4 END, vi.createdAt DESC';
  query += ' LIMIT ? OFFSET ?';
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

function create(issue) {
  return getDatabase().prepare(`
    INSERT INTO validation_issues (
      entityType, entityId, severity, field, message, status, visibleToUser, relatedCourseId, relatedUserId
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    issue.entityType,
    issue.entityId || null,
    issue.severity || 'error',
    issue.field || '',
    issue.message,
    issue.status || 'open',
    issue.visibleToUser ? 1 : 0,
    issue.relatedCourseId || null,
    issue.relatedUserId || null
  );
}

function updateStatus(id, status, resolvedBy, resolvedAt) {
  return getDatabase().prepare(`
    UPDATE validation_issues
    SET status = ?, resolvedBy = ?, resolvedAt = ?
    WHERE id = ?
  `).run(status, resolvedBy || null, resolvedAt || '', id);
}

function findById(id) {
  return getDatabase().prepare('SELECT * FROM validation_issues WHERE id = ?').get(id) || null;
}

function countOpen() {
  return getDatabase().prepare(`
    SELECT COUNT(*) as count FROM validation_issues WHERE status = 'open'
  `).get().count;
}

module.exports = {
  countOpen,
  create,
  findById,
  list,
  updateStatus
};
