const { getDatabase } = require('../database/db');

function list(user, filters = {}, validVisibility = []) {
  const db = getDatabase();
  let query = `
    SELECT c.*,
      d.name as departmentName,
      d.code as departmentCode,
      MIN(NULLIF(TRIM(w.startsAt), '')) as firstWeekStartsAt,
      MAX(NULLIF(TRIM(w.endsAt), '')) as lastWeekEndsAt,
      COUNT(DISTINCT CASE WHEN e.role = 'student' THEN e.userId END) as studentCount,
      COUNT(DISTINCT CASE WHEN e.role = 'teacher' THEN e.userId END) as teacherCount,
      COUNT(DISTINCT q.id) as quizCount,
      COUNT(DISTINCT co.id) as offeringCount
    FROM courses c
    LEFT JOIN departments d ON d.id = c.departmentId
    LEFT JOIN course_weeks w ON w.courseId = c.id
    LEFT JOIN enrollments e ON e.courseId = c.id AND e.status = 'active'
    LEFT JOIN quizzes q ON q.courseId = c.id
    LEFT JOIN course_offerings co ON co.courseId = c.id
    WHERE 1=1
  `;
  const params = [];

  if (user.role !== 'admin') {
    query += ` AND c.id IN (
      SELECT courseId FROM enrollments
      WHERE userId = ? AND status = 'active'
    )`;
    params.push(user.id);
  }
  if (filters.search) {
    query += ' AND (c.title LIKE ? OR c.code LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.visibility && validVisibility.includes(filters.visibility)) {
    query += ' AND c.visibility = ?';
    params.push(filters.visibility);
  }

  query += ' GROUP BY c.id ORDER BY c.createdAt DESC';
  return db.prepare(query).all(...params);
}

function findById(id) {
  return getDatabase().prepare('SELECT * FROM courses WHERE id = ?').get(id) || null;
}

function getById(id) {
  return getDatabase().prepare(`
    SELECT c.*,
      d.name as departmentName,
      d.code as departmentCode,
      MIN(NULLIF(TRIM(w.startsAt), '')) as firstWeekStartsAt,
      MAX(NULLIF(TRIM(w.endsAt), '')) as lastWeekEndsAt,
      COUNT(DISTINCT CASE WHEN e.role = 'student' THEN e.userId END) as studentCount,
      COUNT(DISTINCT CASE WHEN e.role = 'teacher' THEN e.userId END) as teacherCount,
      COUNT(DISTINCT q.id) as quizCount,
      COUNT(DISTINCT co.id) as offeringCount
    FROM courses c
    LEFT JOIN departments d ON d.id = c.departmentId
    LEFT JOIN course_weeks w ON w.courseId = c.id
    LEFT JOIN enrollments e ON e.courseId = c.id AND e.status = 'active'
    LEFT JOIN quizzes q ON q.courseId = c.id
    LEFT JOIN course_offerings co ON co.courseId = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(id) || null;
}

function findDuplicateCode(code, excludeId) {
  const db = getDatabase();
  if (excludeId) {
    return db.prepare('SELECT id FROM courses WHERE LOWER(code) = LOWER(?) AND id != ?').get(code, excludeId) || null;
  }
  return db.prepare('SELECT id FROM courses WHERE LOWER(code) = LOWER(?)').get(code) || null;
}

function insert(payload, userId) {
  return getDatabase().prepare(`
    INSERT INTO courses (code, title, description, departmentId, credits, visibility, startDate, endDate, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.code,
    payload.title,
    payload.description,
    payload.departmentId,
    payload.credits,
    payload.visibility,
    payload.startDate,
    payload.endDate,
    userId
  );
}

function update(id, payload, updatedAt) {
  return getDatabase().prepare(`
    UPDATE courses
    SET code = ?, title = ?, description = ?, departmentId = ?, credits = ?,
      visibility = ?, startDate = ?, endDate = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    payload.code,
    payload.title,
    payload.description,
    payload.departmentId,
    payload.credits,
    payload.visibility,
    payload.startDate,
    payload.endDate,
    updatedAt,
    id
  );
}

function deleteById(id) {
  return getDatabase().prepare('DELETE FROM courses WHERE id = ?').run(id);
}

function clearCreatedBy(userId) {
  return getDatabase().prepare('UPDATE courses SET createdBy = NULL WHERE createdBy = ?').run(userId);
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
  clearCreatedBy,
  deleteById,
  findById,
  findDuplicateCode,
  getById,
  insert,
  list,
  update,
  withTransaction
};
