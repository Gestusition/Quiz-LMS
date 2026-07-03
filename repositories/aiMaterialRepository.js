const { getDatabase } = require('../database/db');

function insertMaterial(courseId, file, chunkCount, uploadedBy) {
  return getDatabase().prepare(`
    INSERT INTO ai_course_materials (courseId, originalName, mimeType, byteSize, chunkCount, uploadedBy)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(courseId, file.originalName, file.mimeType, file.byteSize, chunkCount, uploadedBy || null);
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
    const result = insertMaterial(courseId, file, chunks.length, uploadedBy);
    const materialId = Number(result.lastInsertRowid);
    insertChunks(materialId, courseId, chunks, embeddings, file.originalName);
    db.exec('COMMIT');
    return getMaterial(materialId);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function getMaterial(id) {
  return getDatabase().prepare(`
    SELECT id, courseId, originalName, mimeType, byteSize, chunkCount, uploadedBy, createdAt
    FROM ai_course_materials WHERE id = ?
  `).get(id) || null;
}

function listByCourse(courseId) {
  return getDatabase().prepare(`
    SELECT id, courseId, originalName, mimeType, byteSize, chunkCount, uploadedBy, createdAt
    FROM ai_course_materials WHERE courseId = ? ORDER BY id DESC
  `).all(courseId);
}

function listChunksByCourse(courseId) {
  return getDatabase().prepare(`
    SELECT id, materialId, chunkIndex, content, embeddingJson, sourceLabel
    FROM ai_material_chunks WHERE courseId = ? ORDER BY materialId DESC, chunkIndex ASC
  `).all(courseId);
}

module.exports = {
  getMaterial,
  insertChunks,
  insertMaterial,
  listByCourse,
  listChunksByCourse,
  storeMaterialWithChunks
};
