const { getDatabase } = require('../database/db');

function list(filters = {}, validTypes = [], validDifficulties = []) {
  const db = getDatabase();
  const viewerId = filters.user && filters.user.role === 'teacher' ? Number(filters.user.id) : null;
  let query = `
    SELECT q.*, c.name as categoryName, c.courseId, c.createdBy as categoryCreatedBy, courses.title as courseTitle,
      creator.name as createdByName,
      updater.name as updatedByName,
      ${viewerId ? 'qs.points' : 'NULL'} as viewerPoints,
      ${viewerId ? 'qs.gradingType' : 'NULL'} as viewerGradingType,
      ${viewerId ? `
        COALESCE(
          (SELECT qg.accessLevel FROM users.resource_access_grants qg
            WHERE qg.resourceType = 'question' AND qg.resourceId = q.id AND qg.teacherUserId = ?
            LIMIT 1),
          (SELECT cg.accessLevel FROM users.resource_access_grants cg
            WHERE cg.resourceType = 'category' AND cg.resourceId = c.id AND cg.teacherUserId = ?
            LIMIT 1)
        )
      ` : 'NULL'} as accessLevel
    FROM questions q
    LEFT JOIN categories c ON c.id = q.categoryId
    LEFT JOIN courses ON courses.id = c.courseId
    LEFT JOIN users creator ON creator.id = q.createdBy
    LEFT JOIN users updater ON updater.id = q.updatedBy
    ${viewerId ? 'LEFT JOIN question_user_settings qs ON qs.questionId = q.id AND qs.userId = ?' : ''}
    WHERE 1=1
  `;
  const params = [];
  if (viewerId) params.push(viewerId, viewerId, viewerId);

  if (filters.categoryId) {
    query += ' AND q.categoryId = ?';
    params.push(filters.categoryId);
  }
  if (filters.courseId) {
    query += ' AND c.courseId = ?';
    params.push(filters.courseId);
  }
  if (filters.user && filters.user.role === 'teacher') {
    query += ` AND (
      q.createdBy = ?
      OR c.createdBy = ?
      OR EXISTS (
        SELECT 1 FROM users.resource_access_grants qg
        WHERE qg.resourceType = 'question'
          AND qg.resourceId = q.id
          AND qg.teacherUserId = ?
      )
      OR EXISTS (
        SELECT 1 FROM users.resource_access_grants cg
        WHERE cg.resourceType = 'category'
          AND cg.resourceId = c.id
          AND cg.teacherUserId = ?
      )
    )`;
    params.push(filters.user.id, filters.user.id, filters.user.id, filters.user.id);
  } else if (filters.user && filters.user.role === 'student') {
    query += ` AND c.courseId IN (
      SELECT courseId FROM enrollments WHERE userId = ? AND status = 'active'
    )`;
    params.push(filters.user.id);
  }
  if (filters.difficulty && validDifficulties.includes(filters.difficulty)) {
    query += ' AND q.difficulty = ?';
    params.push(filters.difficulty);
  }
  if (filters.type && validTypes.includes(filters.type)) {
    query += ' AND q.type = ?';
    params.push(filters.type);
  }
  if (filters.search) {
    query += ' AND q.text LIKE ?';
    params.push(`%${filters.search}%`);
  }

  query += ' ORDER BY q.createdAt DESC';
  return db.prepare(query).all(...params);
}

function getById(id, user = null) {
  const viewerId = user && user.role === 'teacher' ? Number(user.id) : null;
  const params = [];
  if (viewerId) params.push(viewerId, viewerId, viewerId);
  params.push(id);
  return getDatabase().prepare(`
    SELECT q.*, c.name as categoryName, c.courseId, c.createdBy as categoryCreatedBy, courses.title as courseTitle,
      creator.name as createdByName,
      updater.name as updatedByName,
      ${viewerId ? 'qs.points' : 'NULL'} as viewerPoints,
      ${viewerId ? 'qs.gradingType' : 'NULL'} as viewerGradingType,
      ${viewerId ? `
        COALESCE(
          (SELECT qg.accessLevel FROM users.resource_access_grants qg
            WHERE qg.resourceType = 'question' AND qg.resourceId = q.id AND qg.teacherUserId = ?
            LIMIT 1),
          (SELECT cg.accessLevel FROM users.resource_access_grants cg
            WHERE cg.resourceType = 'category' AND cg.resourceId = c.id AND cg.teacherUserId = ?
            LIMIT 1)
        )
      ` : 'NULL'} as accessLevel
    FROM questions q
    LEFT JOIN categories c ON c.id = q.categoryId
    LEFT JOIN courses ON courses.id = c.courseId
    LEFT JOIN users creator ON creator.id = q.createdBy
    LEFT JOIN users updater ON updater.id = q.updatedBy
    ${viewerId ? 'LEFT JOIN question_user_settings qs ON qs.questionId = q.id AND qs.userId = ?' : ''}
    WHERE q.id = ?
  `).get(...params) || null;
}

function getRandom(opts = {}, validDifficulties = []) {
  const db = getDatabase();
  const viewerId = opts.user && opts.user.role === 'teacher' ? Number(opts.user.id) : null;
  let query = `
    SELECT q.*, c.name as categoryName, c.courseId, c.createdBy as categoryCreatedBy, courses.title as courseTitle,
      creator.name as createdByName,
      updater.name as updatedByName,
      ${viewerId ? 'qs.points' : 'NULL'} as viewerPoints,
      ${viewerId ? 'qs.gradingType' : 'NULL'} as viewerGradingType
    FROM questions q
    LEFT JOIN categories c ON c.id = q.categoryId
    LEFT JOIN courses ON courses.id = c.courseId
    LEFT JOIN users creator ON creator.id = q.createdBy
    LEFT JOIN users updater ON updater.id = q.updatedBy
    ${viewerId ? 'LEFT JOIN question_user_settings qs ON qs.questionId = q.id AND qs.userId = ?' : ''}
    WHERE 1=1
  `;
  const params = [];
  if (viewerId) params.push(viewerId);

  if (opts.categoryId) {
    query += ' AND q.categoryId = ?';
    params.push(opts.categoryId);
  }
  if (opts.courseId) {
    query += ' AND c.courseId = ?';
    params.push(opts.courseId);
  }
  if (opts.user && opts.user.role === 'teacher') {
    query += ` AND (
      q.createdBy = ?
      OR c.createdBy = ?
      OR EXISTS (
        SELECT 1 FROM users.resource_access_grants qg
        WHERE qg.resourceType = 'question'
          AND qg.resourceId = q.id
          AND qg.teacherUserId = ?
      )
      OR EXISTS (
        SELECT 1 FROM users.resource_access_grants cg
        WHERE cg.resourceType = 'category'
          AND cg.resourceId = c.id
          AND cg.teacherUserId = ?
      )
    )`;
    params.push(opts.user.id, opts.user.id, opts.user.id, opts.user.id);
  } else if (opts.user && opts.user.role === 'student') {
    query += ` AND c.courseId IN (
      SELECT courseId FROM enrollments WHERE userId = ? AND status = 'active'
    )`;
    params.push(opts.user.id);
  }
  if (opts.difficulty && validDifficulties.includes(opts.difficulty)) {
    query += ' AND q.difficulty = ?';
    params.push(opts.difficulty);
  }

  const limit = Math.min(Math.max(parseInt(opts.limit) || 10, 1), 50);
  query += ' ORDER BY RANDOM() LIMIT ?';
  params.push(limit);

  return db.prepare(query).all(...params);
}

function insert(payload, userId) {
  return getDatabase().prepare(
    `INSERT INTO questions (
      categoryId, text, type, options, correctAnswer, difficulty, points, createdBy,
      status, acceptedAnswers, caseSensitive, richText, explanationText, hintText, mediaUrl, gradingType
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'valid', ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    payload.categoryId,
    payload.text,
    payload.type,
    JSON.stringify(payload.options),
    payload.correctAnswer,
    payload.difficulty,
    payload.points,
    userId || null,
    JSON.stringify(payload.acceptedAnswers || []),
    payload.caseSensitive ? 1 : 0,
    payload.richText || '',
    payload.explanationText || '',
    payload.hintText || '',
    payload.mediaUrl || '',
    payload.gradingType || 'standard'
  );
}

function update(id, payload, actorUserId = null) {
  return getDatabase().prepare(
    `UPDATE questions
    SET categoryId = ?, text = ?, type = ?, options = ?, correctAnswer = ?, difficulty = ?, points = ?,
      acceptedAnswers = ?, caseSensitive = ?, richText = ?, explanationText = ?, hintText = ?, mediaUrl = ?,
      gradingType = ?, status = 'valid', validationMessage = '', updatedBy = ?, updatedAt = datetime('now')
    WHERE id = ?`
  ).run(
    payload.categoryId,
    payload.text,
    payload.type,
    JSON.stringify(payload.options),
    payload.correctAnswer,
    payload.difficulty,
    payload.points,
    JSON.stringify(payload.acceptedAnswers || []),
    payload.caseSensitive ? 1 : 0,
    payload.richText || '',
    payload.explanationText || '',
    payload.hintText || '',
    payload.mediaUrl || '',
    payload.gradingType || 'standard',
    actorUserId,
    id
  );
}

function upsertUserSettings(questionId, userId, settings) {
  return getDatabase().prepare(`
    INSERT INTO question_user_settings (questionId, userId, points, gradingType, updatedAt)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(questionId, userId)
    DO UPDATE SET
      points = COALESCE(excluded.points, question_user_settings.points),
      gradingType = CASE
        WHEN excluded.gradingType IS NULL OR excluded.gradingType = '' THEN question_user_settings.gradingType
        ELSE excluded.gradingType
      END,
      updatedAt = datetime('now')
  `).run(
    questionId,
    userId,
    settings.points !== undefined ? settings.points : null,
    settings.gradingType || ''
  );
}

// ── Question Parts (for MP type) ──

function insertParts(questionId, parts) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO question_parts (questionId, partLabel, partText, answerType, correctAnswer, acceptedAnswers, placeholder, validationRule, position, points)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  parts.forEach((part, index) => {
    stmt.run(
      questionId,
      part.partLabel || '',
      part.partText || '',
      part.answerType || 'text',
      part.correctAnswer || '',
      JSON.stringify(part.acceptedAnswers || []),
      part.placeholder || '',
      typeof part.validationRule === 'object' ? JSON.stringify(part.validationRule) : (part.validationRule || ''),
      part.position !== undefined ? part.position : index,
      part.points || 1
    );
  });
}

function getParts(questionId) {
  return getDatabase().prepare(`
    SELECT * FROM question_parts WHERE questionId = ? ORDER BY position ASC
  `).all(questionId);
}

function deleteParts(questionId) {
  return getDatabase().prepare('DELETE FROM question_parts WHERE questionId = ?').run(questionId);
}

// ── Table Config (for MT type) ──

function insertTableConfig(questionId, config) {
  return getDatabase().prepare(`
    INSERT INTO question_table_config (questionId, columnsJson, rowCount, prefillJson, correctDataJson, validationJson)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    questionId,
    JSON.stringify(config.columns || []),
    config.rowCount || 1,
    JSON.stringify(config.prefill || {}),
    JSON.stringify(config.correctData || {}),
    JSON.stringify(config.validation || {})
  );
}

function getTableConfig(questionId) {
  return getDatabase().prepare(`
    SELECT * FROM question_table_config WHERE questionId = ?
  `).get(questionId) || null;
}

function deleteTableConfig(questionId) {
  return getDatabase().prepare('DELETE FROM question_table_config WHERE questionId = ?').run(questionId);
}

// ── Status ──

function setValidationStatus(id, status, message) {
  return getDatabase().prepare(`
    UPDATE questions
    SET status = ?, validationMessage = ?
    WHERE id = ?
  `).run(status, message || '', id);
}

function deleteById(id) {
  return getDatabase().prepare('DELETE FROM questions WHERE id = ?').run(id);
}

function deleteByCategoryId(categoryId) {
  return getDatabase().prepare('DELETE FROM questions WHERE categoryId = ?').run(categoryId);
}

function deleteByCategoryIds(categoryIds) {
  if (!categoryIds.length) return;
  const placeholders = categoryIds.map(() => '?').join(',');
  getDatabase().prepare(`DELETE FROM questions WHERE categoryId IN (${placeholders})`).run(...categoryIds);
}

function findByIdsWithCourse(questionIds, user = null) {
  if (!questionIds.length) return [];
  const placeholders = questionIds.map(() => '?').join(',');
  const viewerId = user && user.role === 'teacher' ? Number(user.id) : null;
  const params = viewerId ? [viewerId, ...questionIds] : [...questionIds];
  const accessClause = user && user.role === 'teacher'
    ? ` AND (
      q.createdBy = ?
      OR c.createdBy = ?
      OR EXISTS (
        SELECT 1 FROM users.resource_access_grants qg
        WHERE qg.resourceType = 'question'
          AND qg.resourceId = q.id
          AND qg.teacherUserId = ?
      )
      OR EXISTS (
        SELECT 1 FROM users.resource_access_grants cg
        WHERE cg.resourceType = 'category'
          AND cg.resourceId = c.id
          AND cg.teacherUserId = ?
      )
    )`
    : '';
  if (user && user.role === 'teacher') {
    params.push(user.id, user.id, user.id, user.id);
  }
  return getDatabase().prepare(`
    SELECT q.id, ${viewerId ? 'COALESCE(qs.points, q.points)' : 'q.points'} as points, c.courseId, q.createdBy, c.createdBy as categoryCreatedBy
    FROM questions q
    JOIN categories c ON c.id = q.categoryId
    ${viewerId ? 'LEFT JOIN question_user_settings qs ON qs.questionId = q.id AND qs.userId = ?' : ''}
    WHERE q.id IN (${placeholders})
    ${accessClause}
  `).all(...params);
}

function clearCreatedBy(userId) {
  return getDatabase().prepare('UPDATE questions SET createdBy = NULL WHERE createdBy = ?').run(userId);
}

module.exports = {
  clearCreatedBy,
  deleteByCategoryId,
  deleteByCategoryIds,
  deleteById,
  deleteParts,
  deleteTableConfig,
  findByIdsWithCourse,
  getById,
  getParts,
  getRandom,
  getTableConfig,
  insert,
  insertParts,
  insertTableConfig,
  list,
  setValidationStatus,
  upsertUserSettings,
  update
};
