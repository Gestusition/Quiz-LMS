const { getDatabase } = require('../database/db');

function listSchemes(filters = {}) {
  let query = `SELECT * FROM grade_schemes WHERE 1=1`;
  const params = [];
  if (filters.courseId) {
    query += ' AND courseId = ?';
    params.push(Number(filters.courseId));
  }
  query += ' ORDER BY isDefault DESC, id DESC';
  return getDatabase().prepare(query).all(...params);
}

function findSchemeById(id) {
  return getDatabase().prepare('SELECT * FROM grade_schemes WHERE id = ?').get(id) || null;
}

function findDefaultByCourse(courseId) {
  return getDatabase().prepare(`
    SELECT * FROM grade_schemes
    WHERE courseId = ? AND isDefault = 1
    ORDER BY id DESC
    LIMIT 1
  `).get(courseId) || null;
}

function createScheme(payload) {
  return getDatabase().prepare(`
    INSERT INTO grade_schemes (courseId, name, status, isDefault, createdBy)
    VALUES (?, ?, ?, ?, ?)
  `).run(payload.courseId || null, payload.name, payload.status || 'active', payload.isDefault ? 1 : 0, payload.createdBy || null);
}

function updateSchemeStatus(id, status) {
  return getDatabase().prepare('UPDATE grade_schemes SET status = ?, updatedAt = datetime(\'now\') WHERE id = ?').run(status, id);
}

function replaceThresholds(schemeId, thresholds) {
  const db = getDatabase();
  db.prepare('DELETE FROM grade_thresholds WHERE gradeSchemeId = ?').run(schemeId);
  const insert = db.prepare(`
    INSERT INTO grade_thresholds (gradeSchemeId, letterGrade, minScore, maxScore, position)
    VALUES (?, ?, ?, ?, ?)
  `);
  thresholds.forEach((item, index) => {
    insert.run(schemeId, item.letterGrade, item.minScore, item.maxScore, index + 1);
  });
}

function listThresholds(schemeId) {
  return getDatabase().prepare(`
    SELECT * FROM grade_thresholds
    WHERE gradeSchemeId = ?
    ORDER BY position ASC, minScore DESC
  `).all(schemeId);
}

module.exports = {
  createScheme,
  findDefaultByCourse,
  findSchemeById,
  listSchemes,
  listThresholds,
  replaceThresholds,
  updateSchemeStatus
};
