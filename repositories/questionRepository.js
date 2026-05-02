const { getDatabase } = require('../database/db');

function list(filters = {}, validTypes = [], validDifficulties = []) {
  const db = getDatabase();
  let query = `
    SELECT q.*, c.name as categoryName, c.courseId, courses.title as courseTitle
    FROM questions q
    LEFT JOIN categories c ON c.id = q.categoryId
    LEFT JOIN courses ON courses.id = c.courseId
    WHERE 1=1
  `;
  const params = [];

  if (filters.categoryId) {
    query += ' AND q.categoryId = ?';
    params.push(filters.categoryId);
  }
  if (filters.courseId) {
    query += ' AND c.courseId = ?';
    params.push(filters.courseId);
  }
  if (filters.user && filters.user.role !== 'admin') {
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

function getById(id) {
  return getDatabase().prepare(`
    SELECT q.*, c.name as categoryName, c.courseId, courses.title as courseTitle
    FROM questions q
    LEFT JOIN categories c ON c.id = q.categoryId
    LEFT JOIN courses ON courses.id = c.courseId
    WHERE q.id = ?
  `).get(id) || null;
}

function getRandom(opts = {}, validDifficulties = []) {
  const db = getDatabase();
  let query = `
    SELECT q.*, c.name as categoryName, c.courseId, courses.title as courseTitle
    FROM questions q
    LEFT JOIN categories c ON c.id = q.categoryId
    LEFT JOIN courses ON courses.id = c.courseId
    WHERE 1=1
  `;
  const params = [];

  if (opts.categoryId) {
    query += ' AND q.categoryId = ?';
    params.push(opts.categoryId);
  }
  if (opts.courseId) {
    query += ' AND c.courseId = ?';
    params.push(opts.courseId);
  }
  if (opts.user && opts.user.role !== 'admin') {
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
    'INSERT INTO questions (categoryId, text, type, options, correctAnswer, difficulty, points, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    payload.categoryId,
    payload.text,
    payload.type,
    JSON.stringify(payload.options),
    payload.correctAnswer,
    payload.difficulty,
    payload.points,
    userId || null
  );
}

function update(id, payload) {
  return getDatabase().prepare(
    'UPDATE questions SET categoryId = ?, text = ?, type = ?, options = ?, correctAnswer = ?, difficulty = ?, points = ? WHERE id = ?'
  ).run(
    payload.categoryId,
    payload.text,
    payload.type,
    JSON.stringify(payload.options),
    payload.correctAnswer,
    payload.difficulty,
    payload.points,
    id
  );
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

function findByIdsWithCourse(questionIds) {
  if (!questionIds.length) return [];
  const placeholders = questionIds.map(() => '?').join(',');
  return getDatabase().prepare(`
    SELECT q.id, q.points, c.courseId
    FROM questions q
    JOIN categories c ON c.id = q.categoryId
    WHERE q.id IN (${placeholders})
  `).all(...questionIds);
}

function clearCreatedBy(userId) {
  return getDatabase().prepare('UPDATE questions SET createdBy = NULL WHERE createdBy = ?').run(userId);
}

module.exports = {
  clearCreatedBy,
  deleteByCategoryId,
  deleteByCategoryIds,
  deleteById,
  findByIdsWithCourse,
  getById,
  getRandom,
  insert,
  list,
  update
};
