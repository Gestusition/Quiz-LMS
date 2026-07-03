const { getDatabase } = require('../database/db');

function deserialize(row) {
  if (!row) return null;
  return { ...row, draft: JSON.parse(row.dataJson) };
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

function listByCourse(courseId) {
  return getDatabase().prepare(`
    SELECT id, courseId, createdBy, status, quizId, createdAt, updatedAt, publishedAt,
      json_extract(dataJson, '$.title') AS title,
      json_array_length(json_extract(dataJson, '$.questions')) AS questionCount
    FROM ai_quiz_drafts WHERE courseId = ? ORDER BY id DESC
  `).all(courseId);
}

function updateDraft(id, quizDraft) {
  getDatabase().prepare(`
    UPDATE ai_quiz_drafts SET dataJson = ?, updatedAt = datetime('now')
    WHERE id = ? AND status = 'draft'
  `).run(JSON.stringify(quizDraft), id);
  return getById(id);
}

function markConverted(id, quizId, status = 'published') {
  getDatabase().prepare(`
    UPDATE ai_quiz_drafts
    SET status = ?, quizId = ?, publishedAt = datetime('now'), updatedAt = datetime('now')
    WHERE id = ? AND status = 'draft'
  `).run(status, quizId, id);
  return getById(id);
}

function deleteByCourseId(courseId) {
  return getDatabase().prepare('DELETE FROM ai_quiz_drafts WHERE courseId = ?').run(courseId);
}

module.exports = { deleteByCourseId, getById, listByCourse, markConverted, saveQuizDraft, updateDraft };
