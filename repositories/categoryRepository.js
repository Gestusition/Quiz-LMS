const { getDatabase } = require('../database/db');

function list(filters = {}) {
  const db = getDatabase();
  let query = `
    SELECT c.*, courses.title as courseTitle, COUNT(q.id) as questionCount
    FROM categories c
    LEFT JOIN courses ON courses.id = c.courseId
    LEFT JOIN questions q ON q.categoryId = c.id
    WHERE 1=1
  `;
  const params = [];

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

  query += ' GROUP BY c.id ORDER BY c.name ASC';
  return db.prepare(query).all(...params);
}

function getById(id) {
  return getDatabase().prepare(`
    SELECT c.*, courses.title as courseTitle, COUNT(q.id) as questionCount
    FROM categories c
    LEFT JOIN courses ON courses.id = c.courseId
    LEFT JOIN questions q ON q.categoryId = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(id) || null;
}

function findById(id) {
  return getDatabase().prepare('SELECT * FROM categories WHERE id = ?').get(id) || null;
}

function findDuplicateName(name, excludeId) {
  const db = getDatabase();
  if (excludeId) {
    return db.prepare('SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id != ?').get(name, excludeId) || null;
  }
  return db.prepare('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)').get(name) || null;
}

function findIdsByCourseId(courseId) {
  return getDatabase().prepare('SELECT id FROM categories WHERE courseId = ?').all(courseId);
}

function insert(payload) {
  return getDatabase().prepare(
    'INSERT INTO categories (courseId, name, description) VALUES (?, ?, ?)'
  ).run(payload.courseId || null, payload.name, payload.description);
}

function update(id, payload) {
  return getDatabase().prepare('UPDATE categories SET courseId = ?, name = ?, description = ? WHERE id = ?')
    .run(payload.courseId || null, payload.name, payload.description, id);
}

function deleteById(id) {
  return getDatabase().prepare('DELETE FROM categories WHERE id = ?').run(id);
}

function deleteByCourseId(courseId) {
  return getDatabase().prepare('DELETE FROM categories WHERE courseId = ?').run(courseId);
}

function withTransaction(work) {
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION');
  try {
    const result = work();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

module.exports = {
  deleteByCourseId,
  deleteById,
  findById,
  findDuplicateName,
  findIdsByCourseId,
  getById,
  insert,
  list,
  update,
  withTransaction
};
