const { getDatabase } = require('../database/db');

function list(filters = {}) {
  const db = getDatabase();
  const viewerId = filters.user && filters.user.role === 'teacher' ? Number(filters.user.id) : null;
  let query = `
    SELECT c.*, courses.title as courseTitle,
      creator.name as createdByName,
      updater.name as updatedByName,
      ${viewerId ? `(SELECT cg.accessLevel FROM users.resource_access_grants cg
        WHERE cg.resourceType = 'category' AND cg.resourceId = c.id AND cg.teacherUserId = ?
        LIMIT 1)` : 'NULL'} as accessLevel,
      COUNT(q.id) as questionCount
    FROM categories c
    LEFT JOIN courses ON courses.id = c.courseId
    LEFT JOIN questions q ON q.categoryId = c.id
    LEFT JOIN users creator ON creator.id = c.createdBy
    LEFT JOIN users updater ON updater.id = c.updatedBy
    WHERE 1=1
  `;
  const params = [];
  if (viewerId) params.push(viewerId);

  if (filters.courseId) {
    query += ' AND c.courseId = ?';
    params.push(filters.courseId);
  }
  if (filters.user && filters.user.role === 'teacher') {
    query += ` AND (
      c.createdBy = ?
      OR EXISTS (
        SELECT 1 FROM users.resource_access_grants cg
        WHERE cg.resourceType = 'category'
          AND cg.resourceId = c.id
          AND cg.teacherUserId = ?
      )
      OR EXISTS (
        SELECT 1 FROM questions ownq
        WHERE ownq.categoryId = c.id
          AND ownq.createdBy = ?
      )
      OR EXISTS (
        SELECT 1
        FROM questions sharedq
        JOIN users.resource_access_grants qg
          ON qg.resourceType = 'question'
          AND qg.resourceId = sharedq.id
          AND qg.teacherUserId = ?
        WHERE sharedq.categoryId = c.id
      )
    )`;
    params.push(filters.user.id, filters.user.id, filters.user.id, filters.user.id);
  } else if (filters.user && filters.user.role === 'student') {
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
    SELECT c.*, courses.title as courseTitle,
      creator.name as createdByName,
      updater.name as updatedByName,
      COUNT(q.id) as questionCount
    FROM categories c
    LEFT JOIN courses ON courses.id = c.courseId
    LEFT JOIN questions q ON q.categoryId = c.id
    LEFT JOIN users creator ON creator.id = c.createdBy
    LEFT JOIN users updater ON updater.id = c.updatedBy
    WHERE c.id = ?
    GROUP BY c.id
  `).get(id) || null;
}

function findById(id) {
  return getDatabase().prepare('SELECT * FROM categories WHERE id = ?').get(id) || null;
}

function findDuplicateName(name, courseId = null, excludeId = null) {
  const db = getDatabase();
  const normalizedCourseId = courseId || null;
  if (excludeId) {
    return db.prepare(`
      SELECT id
      FROM categories
      WHERE LOWER(name) = LOWER(?)
        AND COALESCE(courseId, 0) = COALESCE(?, 0)
        AND id != ?
    `).get(name, normalizedCourseId, excludeId) || null;
  }
  return db.prepare(`
    SELECT id
    FROM categories
    WHERE LOWER(name) = LOWER(?)
      AND COALESCE(courseId, 0) = COALESCE(?, 0)
  `).get(name, normalizedCourseId) || null;
}

function findIdsByCourseId(courseId) {
  return getDatabase().prepare('SELECT id FROM categories WHERE courseId = ?').all(courseId);
}

function insert(payload, actorUserId = null) {
  return getDatabase().prepare(
    'INSERT INTO categories (courseId, name, description, createdBy, updatedBy) VALUES (?, ?, ?, ?, ?)'
  ).run(payload.courseId || null, payload.name, payload.description, actorUserId, actorUserId);
}

function update(id, payload, actorUserId = null) {
  return getDatabase().prepare(`
    UPDATE categories
    SET courseId = ?, name = ?, description = ?, updatedBy = ?, updatedAt = datetime('now')
    WHERE id = ?
  `).run(payload.courseId || null, payload.name, payload.description, actorUserId, id);
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
