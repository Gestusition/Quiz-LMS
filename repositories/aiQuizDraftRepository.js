const { getDatabase } = require('../database/db');

function deserialize(row) {
  if (!row) return null;
  return { ...row, draft: parseJson(row.dataJson, {}) };
}

function saveQuizDraft(courseId, quizDraft, createdBy) {
  const result = getDatabase().prepare(`
    INSERT INTO ai_quiz_drafts (courseId, createdBy, dataJson, status)
    VALUES (?, ?, ?, 'draft')
  `).run(courseId, createdBy, JSON.stringify(quizDraft));
  return getById(Number(result.lastInsertRowid));
}

function getById(id) {
  return deserialize(getDatabase().prepare('SELECT * FROM ai_quiz_drafts WHERE id = ?').get(id));
}

function getByIdForCourse(id, courseId) {
  return deserialize(getDatabase().prepare(`
    SELECT * FROM ai_quiz_drafts WHERE id = ? AND courseId = ?
  `).get(id, courseId));
}

function getByIdForOwner(id, ownerUserId) {
  return deserialize(getDatabase().prepare(`
    SELECT * FROM ai_quiz_drafts WHERE id = ? AND createdBy = ?
  `).get(id, ownerUserId));
}

function getByIdForOwnerAndCourse(id, ownerUserId, courseId) {
  return deserialize(getDatabase().prepare(`
    SELECT * FROM ai_quiz_drafts
    WHERE id = ? AND createdBy = ? AND courseId = ?
  `).get(id, ownerUserId, courseId));
}

function listByCourse(courseId, options = {}) {
  const limit = safeLimit(options.limit, 500);
  return getDatabase().prepare(`
    ${draftSummarySelect()}
    FROM ai_quiz_drafts
    WHERE courseId = ?
    ORDER BY id DESC LIMIT ?
  `).all(courseId, limit);
}

function listByCourseForOwner(courseId, ownerUserId, options = {}) {
  const limit = safeLimit(options.limit, 500);
  return getDatabase().prepare(`
    ${draftSummarySelect()}
    FROM ai_quiz_drafts
    WHERE courseId = ? AND createdBy = ?
    ORDER BY id DESC LIMIT ?
  `).all(courseId, ownerUserId, limit);
}

function listByOwner(ownerUserId, options = {}) {
  const clauses = ['createdBy = ?'];
  const params = [ownerUserId];
  if (options.courseId) {
    clauses.push('courseId = ?');
    params.push(options.courseId);
  }
  if (options.status) {
    clauses.push('status = ?');
    params.push(options.status);
  }
  const limit = safeLimit(options.limit, 500);
  params.push(limit);
  return getDatabase().prepare(`
    ${draftSummarySelect()}
    FROM ai_quiz_drafts
    WHERE ${clauses.join(' AND ')}
    ORDER BY id DESC LIMIT ?
  `).all(...params);
}

function updateDraft(id, quizDraft) {
  getDatabase().prepare(`
    UPDATE ai_quiz_drafts SET dataJson = ?, updatedAt = datetime('now')
    WHERE id = ? AND status = 'draft'
  `).run(JSON.stringify(quizDraft), id);
  return getById(id);
}

function updateDraftForOwner(id, ownerUserId, quizDraft) {
  getDatabase().prepare(`
    UPDATE ai_quiz_drafts
    SET dataJson = ?, updatedAt = datetime('now')
    WHERE id = ? AND createdBy = ? AND status = 'draft'
  `).run(JSON.stringify(quizDraft), id, ownerUserId);
  return getByIdForOwner(id, ownerUserId);
}

function updateDraftForOwnerAndCourse(id, ownerUserId, courseId, quizDraft) {
  getDatabase().prepare(`
    UPDATE ai_quiz_drafts
    SET dataJson = ?, updatedAt = datetime('now')
    WHERE id = ? AND createdBy = ? AND courseId = ? AND status = 'draft'
  `).run(JSON.stringify(quizDraft), id, ownerUserId, courseId);
  return getByIdForOwnerAndCourse(id, ownerUserId, courseId);
}

function markConverted(id, quizId, status = 'published') {
  getDatabase().prepare(`
    UPDATE ai_quiz_drafts
    SET status = ?, quizId = ?, publishedAt = datetime('now'), updatedAt = datetime('now')
    WHERE id = ? AND status = 'draft'
  `).run(status, quizId, id);
  return getById(id);
}

function markConvertedForOwner(id, ownerUserId, quizId, status = 'published') {
  const result = getDatabase().prepare(`
    UPDATE ai_quiz_drafts
    SET status = ?, quizId = ?, publishedAt = datetime('now'), updatedAt = datetime('now')
    WHERE id = ? AND createdBy = ? AND status = 'draft'
  `).run(status, quizId, id, ownerUserId);
  return {
    converted: !!result.changes,
    draft: getByIdForOwner(id, ownerUserId)
  };
}

function deleteByIdForOwner(id, ownerUserId) {
  return getDatabase().prepare(`
    DELETE FROM ai_quiz_drafts
    WHERE id = ? AND createdBy = ? AND status = 'draft'
  `).run(id, ownerUserId);
}

function deleteByOwnerUserId(ownerUserId) {
  return getDatabase().prepare(`
    DELETE FROM ai_quiz_drafts WHERE createdBy = ?
  `).run(ownerUserId);
}

function deleteByCourseId(courseId) {
  return getDatabase().prepare('DELETE FROM ai_quiz_drafts WHERE courseId = ?').run(courseId);
}

function draftSummarySelect() {
  return `SELECT id, courseId, createdBy, status, quizId, createdAt, updatedAt, publishedAt,
    json_extract(dataJson, '$.title') AS title,
    json_array_length(json_extract(dataJson, '$.questions')) AS questionCount`;
}

function parseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value || 'null');
    return parsed === null ? fallback : parsed;
  } catch (error) {
    return fallback;
  }
}

function safeLimit(value, max) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? Math.min(number, max) : max;
}

module.exports = {
  deleteByCourseId,
  deleteByIdForOwner,
  deleteByOwnerUserId,
  getById,
  getByIdForCourse,
  getByIdForOwner,
  getByIdForOwnerAndCourse,
  listByCourse,
  listByCourseForOwner,
  listByOwner,
  markConverted,
  markConvertedForOwner,
  saveQuizDraft,
  updateDraft,
  updateDraftForOwner,
  updateDraftForOwnerAndCourse
};
