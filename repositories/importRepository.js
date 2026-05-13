const { getDatabase } = require('../database/db');
const { parsePagination } = require('../utils/validation');

const BATCH_SELECT = `
  b.*,
  u.name as uploadedByName,
  u.email as uploadedByEmail,
  u.role as uploadedByRole
`;

function toCount(value) {
  return Math.max(0, Number(value) || 0);
}

function normalizeBatch(row) {
  if (!row) return null;
  const id = Number(row.id);
  const createdCount = toCount(row.createdCount ?? row.successCount);
  const updatedCount = toCount(row.updatedCount);
  const skippedCount = toCount(row.skippedCount);
  const failedCount = toCount(row.failedCount);
  const validationErrorCount = toCount(row.validationErrorCount ?? (failedCount + skippedCount));
  const successCount = toCount(row.successCount ?? (createdCount + updatedCount));

  return {
    ...row,
    id,
    importBatchId: id,
    batchNumber: `Batch #${id}`,
    uploadedBy: row.uploadedBy === null || row.uploadedBy === undefined ? null : Number(row.uploadedBy),
    importerName: row.uploadedByName || '',
    importerEmail: row.uploadedByEmail || '',
    fileSizeBytes: toCount(row.fileSizeBytes),
    successCount,
    failedCount,
    createdCount,
    updatedCount,
    skippedCount,
    validationErrorCount,
    successRows: successCount,
    failedRows: failedCount,
    createdRows: createdCount,
    updatedRows: updatedCount,
    skippedRows: skippedCount,
    validationErrors: validationErrorCount
  };
}

function parseJsonField(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
}

function normalizeError(row) {
  if (!row) return null;
  return {
    ...row,
    id: Number(row.id),
    batchId: Number(row.batchId),
    rowNumber: Number(row.rowNumber),
    resolvedBy: row.resolvedBy === null || row.resolvedBy === undefined ? null : Number(row.resolvedBy),
    rawData: parseJsonField(row.rawDataJson),
    fixedData: parseJsonField(row.fixedDataJson)
  };
}

function normalizeCountPayload(payload = {}) {
  const createdCount = toCount(payload.createdCount ?? payload.createdRows ?? payload.successRows ?? payload.successCount);
  const updatedCount = toCount(payload.updatedCount ?? payload.updatedRows);
  const skippedCount = toCount(payload.skippedCount ?? payload.skippedRows);
  const failedCount = toCount(payload.failedCount ?? payload.failedRows);
  const successCount = toCount(payload.successRows ?? payload.successCount ?? (createdCount + updatedCount));
  const validationErrorCount = toCount(
    payload.validationErrorCount ?? payload.validationErrors ?? (failedCount + skippedCount)
  );
  return {
    successCount,
    failedCount,
    createdCount,
    updatedCount,
    skippedCount,
    validationErrorCount
  };
}

function listBatches(filters = {}) {
  const paging = parsePagination(filters);
  const clauses = [];
  const params = [];

  if (filters.type) {
    clauses.push('b.type = ?');
    params.push(filters.type);
  }
  if (filters.status) {
    clauses.push('b.status = ?');
    params.push(filters.status);
  }
  if (filters.date) {
    clauses.push('date(b.createdAt) = ?');
    params.push(filters.date);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const total = getDatabase().prepare(`
    SELECT COUNT(*) as count
    FROM import_batches b
    ${where}
  `).get(...params).count;

  const query = `
    SELECT ${BATCH_SELECT}
    FROM import_batches b
    LEFT JOIN users u ON u.id = b.uploadedBy
    ${where}
    ORDER BY b.createdAt DESC, b.id DESC
    LIMIT ? OFFSET ?
  `;
  const items = getDatabase().prepare(query).all(...params, paging.limit, paging.offset).map(normalizeBatch);
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
  const counts = normalizeCountPayload(payload);
  return getDatabase().prepare(`
    INSERT INTO import_batches (
      type, uploadedBy, fileName, fileType, mimeType, fileSizeBytes, status, totalRows,
      successCount, failedCount, createdCount, updatedCount, skippedCount, validationErrorCount
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.type,
    payload.uploadedBy || null,
    payload.fileName,
    payload.fileType || '',
    payload.mimeType || '',
    toCount(payload.fileSizeBytes),
    payload.status || 'pending',
    payload.totalRows || 0,
    counts.successCount,
    counts.failedCount,
    counts.createdCount,
    counts.updatedCount,
    counts.skippedCount,
    counts.validationErrorCount
  );
}

function updateBatch(id, payload) {
  const counts = normalizeCountPayload(payload);
  return getDatabase().prepare(`
    UPDATE import_batches
    SET status = ?,
        totalRows = ?,
        successCount = ?,
        failedCount = ?,
        createdCount = ?,
        updatedCount = ?,
        skippedCount = ?,
        validationErrorCount = ?
    WHERE id = ?
  `).run(
    payload.status,
    payload.totalRows,
    counts.successCount,
    counts.failedCount,
    counts.createdCount,
    counts.updatedCount,
    counts.skippedCount,
    counts.validationErrorCount,
    id
  );
}

function findBatchById(id) {
  return normalizeBatch(getDatabase().prepare(`
    SELECT ${BATCH_SELECT}
    FROM import_batches b
    LEFT JOIN users u ON u.id = b.uploadedBy
    WHERE b.id = ?
  `).get(id));
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
  const items = getDatabase().prepare(query).all(...params, paging.limit, paging.offset).map(normalizeError);

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
  return normalizeError(getDatabase().prepare('SELECT * FROM import_errors WHERE id = ?').get(id) || null);
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
