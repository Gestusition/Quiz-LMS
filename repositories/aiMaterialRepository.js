const { getDatabase } = require('../database/db');
const {
  AI_LIMITS,
  AI_MATERIAL_SOURCE_TYPE,
  AI_MATERIAL_SOURCE_TYPES,
  AI_MATERIAL_STATUS,
  AI_MATERIAL_STATUSES
} = require('../constants/ai');

function insertMaterial(courseId, file, chunkCount, uploadedBy) {
  return getDatabase().prepare(`
    INSERT INTO ai_course_materials (
      courseId, originalName, mimeType, byteSize, chunkCount, uploadedBy,
      sourceType, status, errorMessage, characterCount, contentHash, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    courseId,
    file.originalName || file.originalname || file.title || file.name || 'material',
    file.mimeType || file.mimetype || 'application/octet-stream',
    Number(file.byteSize ?? file.size ?? file.buffer?.length ?? 0),
    Number(chunkCount || 0),
    uploadedBy || null,
    normalizeSourceType(file.sourceType),
    normalizeStatus(file.status || AI_MATERIAL_STATUS.ready),
    String(file.errorMessage || '').slice(0, 1000),
    Number(file.characterCount || 0),
    String(file.contentHash || '')
  );
}

function createMaterialRecord(courseId, material, uploadedBy) {
  const result = insertMaterial(courseId, {
    ...material,
    sourceType: material.sourceType || AI_MATERIAL_SOURCE_TYPE.file,
    status: material.status || AI_MATERIAL_STATUS.pending
  }, 0, uploadedBy);
  return getMaterial(Number(result.lastInsertRowid));
}

function insertChunks(materialId, courseId, chunks, embeddings, sourceLabel) {
  const statement = getDatabase().prepare(`
    INSERT INTO ai_material_chunks
      (materialId, courseId, chunkIndex, content, embeddingJson, sourceLabel)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  chunks.forEach((content, index) => {
    statement.run(materialId, courseId, index, content, JSON.stringify(embeddings[index]), sourceLabel);
  });
}

function storeMaterialWithChunks(courseId, file, chunks, embeddings, uploadedBy) {
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION');
  try {
    const result = insertMaterial(courseId, {
      ...file,
      status: AI_MATERIAL_STATUS.ready,
      characterCount: file.characterCount || chunks.reduce((sum, chunk) => sum + String(chunk).length, 0)
    }, chunks.length, uploadedBy);
    const materialId = Number(result.lastInsertRowid);
    insertChunks(materialId, courseId, chunks, embeddings, file.originalName);
    db.exec('COMMIT');
    return getMaterial(materialId);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function replaceMaterialChunks(materialId, courseId, chunks, embeddings, sourceLabel) {
  if (!Array.isArray(chunks) || !Array.isArray(embeddings) || chunks.length !== embeddings.length) {
    throw new Error('Material chunks and embeddings must have matching lengths.');
  }
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION');
  try {
    db.prepare('DELETE FROM ai_material_chunks WHERE materialId = ? AND courseId = ?')
      .run(materialId, courseId);
    insertChunks(materialId, courseId, chunks, embeddings, sourceLabel);
    db.prepare(`
      UPDATE ai_course_materials
      SET chunkCount = ?,
        characterCount = ?,
        status = 'ready',
        errorMessage = '',
        updatedAt = datetime('now')
      WHERE id = ? AND courseId = ?
    `).run(
      chunks.length,
      chunks.reduce((sum, chunk) => sum + String(chunk).length, 0),
      materialId,
      courseId
    );
    db.exec('COMMIT');
    return getMaterialForCourse(materialId, courseId);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function getMaterial(id) {
  return getDatabase().prepare(`
    ${materialSelect()}
    FROM ai_course_materials WHERE id = ?
  `).get(id) || null;
}

function getMaterialForCourse(id, courseId) {
  return getDatabase().prepare(`
    ${materialSelect()}
    FROM ai_course_materials WHERE id = ? AND courseId = ?
  `).get(id, courseId) || null;
}

function getOwnedMaterial(id, ownerUserId) {
  return getDatabase().prepare(`
    ${materialSelect()}
    FROM ai_course_materials WHERE id = ? AND uploadedBy = ?
  `).get(id, ownerUserId) || null;
}

function findByContentHash(courseId, contentHash) {
  if (!contentHash) return null;
  return getDatabase().prepare(`
    ${materialSelect()}
    FROM ai_course_materials
    WHERE courseId = ? AND contentHash = ? AND status != 'failed'
    ORDER BY id DESC LIMIT 1
  `).get(courseId, contentHash) || null;
}

function listByCourse(courseId, options = {}) {
  const clauses = ['courseId = ?'];
  const params = [courseId];
  if (options.status) {
    clauses.push('status = ?');
    params.push(normalizeStatus(options.status));
  }
  if (options.sourceType) {
    clauses.push('sourceType = ?');
    params.push(normalizeSourceType(options.sourceType));
  }
  const limit = safeLimit(options.limit, 500);
  params.push(limit);
  return getDatabase().prepare(`
    ${materialSelect()}
    FROM ai_course_materials
    WHERE ${clauses.join(' AND ')}
    ORDER BY id DESC LIMIT ?
  `).all(...params);
}

function listOwnedByCourse(courseId, ownerUserId, options = {}) {
  const clauses = ['courseId = ?', 'uploadedBy = ?'];
  const params = [courseId, ownerUserId];
  if (options.status) {
    clauses.push('status = ?');
    params.push(normalizeStatus(options.status));
  }
  const limit = safeLimit(options.limit, 500);
  params.push(limit);
  return getDatabase().prepare(`
    ${materialSelect()}
    FROM ai_course_materials
    WHERE ${clauses.join(' AND ')}
    ORDER BY id DESC LIMIT ?
  `).all(...params);
}

function listChunksByCourse(courseId, options = {}) {
  const materialIds = normalizeIdList(options.materialIds);
  if (Array.isArray(options.materialIds) && options.materialIds.length && !materialIds.length) {
    return [];
  }
  if (materialIds.length) {
    const placeholders = materialIds.map(() => '?').join(', ');
    return getDatabase().prepare(`
      SELECT id, materialId, courseId, chunkIndex, content, embeddingJson, sourceLabel, createdAt
      FROM ai_material_chunks
      WHERE courseId = ? AND materialId IN (${placeholders})
      ORDER BY materialId DESC, chunkIndex ASC
    `).all(courseId, ...materialIds);
  }
  return getDatabase().prepare(`
    SELECT id, materialId, courseId, chunkIndex, content, embeddingJson, sourceLabel, createdAt
    FROM ai_material_chunks WHERE courseId = ? ORDER BY materialId DESC, chunkIndex ASC
  `).all(courseId);
}

function listSuggestionChunksByCourse(courseId, options = {}) {
  const materialIds = normalizeIdList(options.materialIds)
    .slice(0, AI_LIMITS.suggestionMaterialsMax);
  if (Array.isArray(options.materialIds) && options.materialIds.length && !materialIds.length) {
    return [];
  }
  const limit = safePositiveBound(
    options.limit,
    AI_LIMITS.suggestionChunksMax,
    AI_LIMITS.suggestionChunksMax
  );
  const contentChars = safePositiveBound(
    options.contentChars,
    AI_LIMITS.suggestionChunkCharsMax,
    AI_LIMITS.suggestionChunkCharsMax
  );
  const clauses = [
    'c.courseId = ?',
    'm.courseId = c.courseId',
    "m.status = 'ready'",
    'c.chunkIndex < 2'
  ];
  const params = [contentChars, courseId];
  if (materialIds.length) {
    clauses.push(`c.materialId IN (${materialIds.map(() => '?').join(', ')})`);
    params.push(...materialIds);
  }
  params.push(limit);
  return getDatabase().prepare(`
    SELECT c.id, c.materialId, c.courseId, c.chunkIndex,
      substr(c.content, 1, ?) AS content,
      c.sourceLabel, m.originalName
    FROM ai_material_chunks c
    JOIN ai_course_materials m ON m.id = c.materialId
    WHERE ${clauses.join(' AND ')}
    ORDER BY c.materialId DESC, c.chunkIndex ASC
    LIMIT ?
  `).all(...params);
}

function listChunksByMaterial(materialId, courseId = null) {
  if (courseId) {
    return getDatabase().prepare(`
      SELECT id, materialId, courseId, chunkIndex, content, embeddingJson, sourceLabel, createdAt
      FROM ai_material_chunks
      WHERE materialId = ? AND courseId = ?
      ORDER BY chunkIndex ASC
    `).all(materialId, courseId);
  }
  return getDatabase().prepare(`
    SELECT id, materialId, courseId, chunkIndex, content, embeddingJson, sourceLabel, createdAt
    FROM ai_material_chunks
    WHERE materialId = ?
    ORDER BY chunkIndex ASC
  `).all(materialId);
}

function getChunkById(id) {
  return getDatabase().prepare(`
    SELECT id, materialId, courseId, chunkIndex, content, embeddingJson, sourceLabel, createdAt
    FROM ai_material_chunks WHERE id = ?
  `).get(id) || null;
}

function getChunkForCourse(id, courseId) {
  return getDatabase().prepare(`
    SELECT id, materialId, courseId, chunkIndex, content, embeddingJson, sourceLabel, createdAt
    FROM ai_material_chunks WHERE id = ? AND courseId = ?
  `).get(id, courseId) || null;
}

function listChunksByIdsForCourse(chunkIds, courseId) {
  const ids = normalizeIdList(chunkIds);
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(', ');
  return getDatabase().prepare(`
    SELECT id, materialId, courseId, chunkIndex, content, embeddingJson, sourceLabel, createdAt
    FROM ai_material_chunks
    WHERE courseId = ? AND id IN (${placeholders})
    ORDER BY materialId DESC, chunkIndex ASC
  `).all(courseId, ...ids);
}

function updateMaterialStatus(id, status, details = {}) {
  const normalized = normalizeStatus(status);
  getDatabase().prepare(`
    UPDATE ai_course_materials
    SET status = ?,
      errorMessage = ?,
      chunkCount = COALESCE(?, chunkCount),
      characterCount = COALESCE(?, characterCount),
      updatedAt = datetime('now')
    WHERE id = ?
  `).run(
    normalized,
    normalized === AI_MATERIAL_STATUS.failed ? String(details.errorMessage || '').slice(0, 1000) : '',
    details.chunkCount === undefined ? null : Number(details.chunkCount),
    details.characterCount === undefined ? null : Number(details.characterCount),
    id
  );
  return getMaterial(id);
}

function updateOwnedMaterialStatus(id, ownerUserId, status, details = {}) {
  const normalized = normalizeStatus(status);
  getDatabase().prepare(`
    UPDATE ai_course_materials
    SET status = ?,
      errorMessage = ?,
      chunkCount = COALESCE(?, chunkCount),
      characterCount = COALESCE(?, characterCount),
      updatedAt = datetime('now')
    WHERE id = ? AND uploadedBy = ?
  `).run(
    normalized,
    normalized === AI_MATERIAL_STATUS.failed ? String(details.errorMessage || '').slice(0, 1000) : '',
    details.chunkCount === undefined ? null : Number(details.chunkCount),
    details.characterCount === undefined ? null : Number(details.characterCount),
    id,
    ownerUserId
  );
  return getOwnedMaterial(id, ownerUserId);
}

function deleteMaterial(id) {
  return getDatabase().prepare('DELETE FROM ai_course_materials WHERE id = ?').run(id);
}

function deleteOwnedMaterial(id, ownerUserId) {
  return getDatabase().prepare(`
    DELETE FROM ai_course_materials WHERE id = ? AND uploadedBy = ?
  `).run(id, ownerUserId);
}

function deleteMaterialForCourse(id, courseId) {
  return getDatabase().prepare(`
    DELETE FROM ai_course_materials WHERE id = ? AND courseId = ?
  `).run(id, courseId);
}

function deleteByCourseId(courseId) {
  return getDatabase().prepare('DELETE FROM ai_course_materials WHERE courseId = ?').run(courseId);
}

function clearUploadedBy(ownerUserId) {
  return getDatabase().prepare(`
    UPDATE ai_course_materials
    SET uploadedBy = NULL, updatedAt = datetime('now')
    WHERE uploadedBy = ?
  `).run(ownerUserId);
}

function materialSelect() {
  return `SELECT id, courseId, originalName, mimeType, byteSize, chunkCount, uploadedBy,
    sourceType, status, errorMessage, characterCount, contentHash, createdAt, updatedAt`;
}

function normalizeStatus(status) {
  if (!AI_MATERIAL_STATUSES.includes(status)) throw new Error('Invalid AI material status.');
  return status;
}

function normalizeSourceType(sourceType) {
  const value = sourceType || AI_MATERIAL_SOURCE_TYPE.file;
  if (!AI_MATERIAL_SOURCE_TYPES.includes(value)) throw new Error('Invalid AI material source type.');
  return value;
}

function normalizeIdList(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map(Number).filter(value => Number.isSafeInteger(value) && value > 0))];
}

function safeLimit(value, max) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? Math.min(number, max) : max;
}

function safePositiveBound(value, fallback, max) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0
    ? Math.min(number, max)
    : fallback;
}

module.exports = {
  clearUploadedBy,
  createMaterialRecord,
  deleteByCourseId,
  deleteMaterial,
  deleteMaterialForCourse,
  deleteOwnedMaterial,
  findByContentHash,
  getChunkById,
  getChunkForCourse,
  getMaterial,
  getMaterialForCourse,
  getOwnedMaterial,
  insertChunks,
  insertMaterial,
  listByCourse,
  listChunksByIdsForCourse,
  listChunksByCourse,
  listChunksByMaterial,
  listSuggestionChunksByCourse,
  listOwnedByCourse,
  replaceMaterialChunks,
  storeMaterialWithChunks,
  updateMaterialStatus,
  updateOwnedMaterialStatus
};
