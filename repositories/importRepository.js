const { getDatabase } = require('../database/db');
const { parsePagination } = require('../utils/validation');

function listBatches(filters = {}) {
  const paging = parsePagination(filters);
  let query = `SELECT * FROM import_batches WHERE 1=1`;
  const params = [];
  if (filters.type) {
    query += ' AND type = ?';
    params.push(filters.type);
  }
  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  const total = getDatabase().prepare(`
    SELECT COUNT(*) as count FROM import_batches WHERE 1=1
    ${filters.type ? 'AND type = ?' : ''}
    ${filters.status ? 'AND status = ?' : ''}
  `).get(...params).count;

  query += ' ORDER BY createdAt DESC, id DESC LIMIT ? OFFSET ?';
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

function createBatch(payload) {
  return getDatabase().prepare(`
    INSERT INTO import_batches (type, uploadedBy, fileName, status, totalRows, successCount, failedCount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.type,
    payload.uploadedBy || null,
    payload.fileName,
    payload.status || 'processed',
    payload.totalRows || 0,
    payload.successCount || 0,
    payload.failedCount || 0
  );
}

function updateBatch(id, payload) {
  return getDatabase().prepare(`
    UPDATE import_batches
    SET status = ?, totalRows = ?, successCount = ?, failedCount = ?
    WHERE id = ?
  `).run(payload.status, payload.totalRows, payload.successCount, payload.failedCount, id);
}

function findBatchById(id) {
  return getDatabase().prepare('SELECT * FROM import_batches WHERE id = ?').get(id) || null;
}

function listErrors(batchId, filters = {}) {
  const paging = parsePagination(filters);
  let query = `SELECT * FROM import_errors WHERE batchId = ?`;
  const params = [batchId];
  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  const total = getDatabase().prepare(`
    SELECT COUNT(*) as count FROM import_errors
    WHERE batchId = ? ${filters.status ? 'AND status = ?' : ''}
  `).get(...params).count;

  query += ' ORDER BY rowNumber ASC, id ASC LIMIT ? OFFSET ?';
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

function createError(payload) {
  return getDatabase().prepare(`
    INSERT INTO import_errors (
      batchId, rowNumber, rawDataJson, errorField, errorMessage, status, fixedDataJson, resolvedBy, resolvedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.batchId,
    payload.rowNumber,
    payload.rawDataJson || '',
    payload.errorField || '',
    payload.errorMessage,
    payload.status || 'unresolved',
    payload.fixedDataJson || '',
    payload.resolvedBy || null,
    payload.resolvedAt || ''
  );
}

function findErrorById(id) {
  return getDatabase().prepare('SELECT * FROM import_errors WHERE id = ?').get(id) || null;
}

function updateError(id, payload) {
  return getDatabase().prepare(`
    UPDATE import_errors
    SET status = ?, fixedDataJson = ?, resolvedBy = ?, resolvedAt = ?
    WHERE id = ?
  `).run(payload.status, payload.fixedDataJson || '', payload.resolvedBy || null, payload.resolvedAt || '', id);
}

function countOpenErrors() {
  return getDatabase().prepare(`
    SELECT COUNT(*) as count FROM import_errors WHERE status = 'unresolved'
  `).get().count;
}

function clearUserReferences(userId) {
  const db = getDatabase();
  db.prepare('UPDATE import_batches SET uploadedBy = NULL WHERE uploadedBy = ?').run(userId);
  db.prepare('UPDATE import_errors SET resolvedBy = NULL WHERE resolvedBy = ?').run(userId);
}

module.exports = {
  clearUserReferences,
  countOpenErrors,
  createBatch,
  createError,
  findBatchById,
  findErrorById,
  listBatches,
  listErrors,
  updateBatch,
  updateError
};
