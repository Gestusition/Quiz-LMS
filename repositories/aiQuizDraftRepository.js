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

function getByQuizId(quizId) {
  return deserialize(getDatabase().prepare(`
    SELECT * FROM ai_quiz_drafts WHERE quizId = ?
    ORDER BY id DESC LIMIT 1
  `).get(quizId));
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

function linkQuiz(id, quizId) {
  const existingLink = getByQuizId(quizId);
  if (existingLink && Number(existingLink.id) !== Number(id)) {
    return { linked: false, draft: getById(id) };
  }
  const result = getDatabase().prepare(`
    UPDATE ai_quiz_drafts
    SET quizId = ?, updatedAt = datetime('now')
    WHERE id = ? AND status = 'draft' AND (quizId IS NULL OR quizId = ?)
  `).run(quizId, id, quizId);
  let draft = getById(id);
  if (result.changes && draft?.draft?.generation?.lmsQuizDeletedAt) {
    const generation = { ...draft.draft.generation };
    delete generation.lmsQuizDeletedAt;
    delete generation.lmsQuizDeletedId;
    updateDraft(id, { ...draft.draft, generation });
    draft = getById(id);
  }
  return {
    linked: !!result.changes,
    draft
  };
}

function clearQuizLink(id, expectedQuizId = null) {
  const params = [id];
  let condition = '';
  if (expectedQuizId) {
    condition = ' AND quizId = ?';
    params.push(expectedQuizId);
  }
  const result = getDatabase().prepare(`
    UPDATE ai_quiz_drafts
    SET quizId = NULL, updatedAt = datetime('now')
    WHERE id = ?${condition}
  `).run(...params);
  return {
    cleared: !!result.changes,
    draft: getById(id)
  };
}

function transitionForLinkedQuiz(quizId, quizStatus) {
  const existing = getByQuizId(quizId);
  if (!existing || existing.status === 'added_to_quiz') return null;
  const nextStatus = quizStatus === 'draft' ? 'draft' : 'published';
  getDatabase().prepare(`
    UPDATE ai_quiz_drafts
    SET status = ?,
      publishedAt = CASE WHEN ? = 'published' THEN datetime('now') ELSE '' END,
      updatedAt = datetime('now')
    WHERE id = ?
  `).run(nextStatus, nextStatus, existing.id);
  return getById(existing.id);
}

function updateLinkedDraftMetadata(quizId, data = {}) {
  const existing = getByQuizId(quizId);
  if (!existing || existing.status === 'added_to_quiz') return existing;
  const draft = {
    ...existing.draft,
    title: data.title !== undefined ? data.title : existing.draft.title,
    description: data.description !== undefined ? data.description : existing.draft.description
  };
  updateDraft(existing.id, draft);
  return getById(existing.id);
}

function detachQuiz(quizId) {
  const rows = getDatabase().prepare(`
    SELECT * FROM ai_quiz_drafts WHERE quizId = ?
  `).all(quizId).map(deserialize);
  if (!rows.length) return [];
  getDatabase().prepare(`
    UPDATE ai_quiz_drafts
    SET quizId = NULL, status = 'draft', publishedAt = '', updatedAt = datetime('now')
    WHERE quizId = ?
  `).run(quizId);
  const deletedAt = new Date().toISOString();
  rows.forEach(row => {
    updateDraft(row.id, {
      ...row.draft,
      generation: {
        ...(row.draft.generation || {}),
        lmsQuizDeletedAt: deletedAt,
        lmsQuizDeletedId: Number(quizId)
      }
    });
  });
  return rows.map(row => Number(row.id));
}

function markConverted(id, quizId, status = 'published') {
  const result = getDatabase().prepare(`
    UPDATE ai_quiz_drafts
    SET status = ?, quizId = ?, publishedAt = datetime('now'), updatedAt = datetime('now')
    WHERE id = ? AND status = 'draft'
  `).run(status, quizId, id);
  const draft = getById(id);
  return {
    converted: !!result.changes ||
      Boolean(draft && draft.status === status && Number(draft.quizId) === Number(quizId)),
    draft
  };
}

function markConvertedForOwner(id, ownerUserId, quizId, status = 'published') {
  const result = getDatabase().prepare(`
    UPDATE ai_quiz_drafts
    SET status = ?, quizId = ?, publishedAt = datetime('now'), updatedAt = datetime('now')
    WHERE id = ? AND createdBy = ? AND status = 'draft'
  `).run(status, quizId, id, ownerUserId);
  const draft = getByIdForOwner(id, ownerUserId);
  return {
    converted: !!result.changes ||
      Boolean(draft && draft.status === status && Number(draft.quizId) === Number(quizId)),
    draft
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
  clearQuizLink,
  deleteByCourseId,
  deleteByIdForOwner,
  deleteByOwnerUserId,
  detachQuiz,
  getById,
  getByIdForCourse,
  getByIdForOwner,
  getByIdForOwnerAndCourse,
  getByQuizId,
  linkQuiz,
  listByCourse,
  listByCourseForOwner,
  listByOwner,
  markConverted,
  markConvertedForOwner,
  saveQuizDraft,
  transitionForLinkedQuiz,
  updateDraft,
  updateDraftForOwner,
  updateDraftForOwnerAndCourse,
  updateLinkedDraftMetadata
};
