const { getDatabase } = require('../database/db');

function getAnnouncements(courseId) {
  return getDatabase().prepare(`
    SELECT a.*, u.name as authorName
    FROM announcements a
    LEFT JOIN users u ON u.id = a.createdBy
    WHERE a.courseId = ?
    ORDER BY a.createdAt DESC
  `).all(courseId);
}

function insertAnnouncement(courseId, payload, userId) {
  return getDatabase().prepare(`
    INSERT INTO announcements (courseId, title, body, createdBy)
    VALUES (?, ?, ?, ?)
  `).run(courseId, payload.title, payload.body, userId);
}

function findAnnouncementById(id) {
  return getDatabase().prepare('SELECT id, courseId FROM announcements WHERE id = ?').get(id) || null;
}

function deleteAnnouncement(id) {
  return getDatabase().prepare('DELETE FROM announcements WHERE id = ?').run(id);
}

function deleteAnnouncementsByCourseId(courseId) {
  return getDatabase().prepare('DELETE FROM announcements WHERE courseId = ?').run(courseId);
}

function getResources(courseId) {
  return getDatabase().prepare(`
    SELECT r.*, u.name as authorName
    FROM resources r
    LEFT JOIN users u ON u.id = r.createdBy
    WHERE r.courseId = ?
    ORDER BY r.createdAt DESC
  `).all(courseId);
}

function insertResource(courseId, payload, userId) {
  return getDatabase().prepare(`
    INSERT INTO resources (courseId, title, type, url, description, fileName, fileSizeBytes, mimeType, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    courseId,
    payload.title,
    payload.type,
    payload.url,
    payload.description,
    payload.fileName || '',
    payload.fileSizeBytes || 0,
    payload.mimeType || '',
    userId
  );
}

function findResourceById(id) {
  return getDatabase().prepare('SELECT * FROM resources WHERE id = ?').get(id) || null;
}

function deleteResource(id) {
  return getDatabase().prepare('DELETE FROM resources WHERE id = ?').run(id);
}

function deleteResourcesByCourseId(courseId) {
  return getDatabase().prepare('DELETE FROM resources WHERE courseId = ?').run(courseId);
}

function findCourseId(table, id) {
  const row = getDatabase().prepare(`SELECT courseId FROM ${table} WHERE id = ?`).get(id);
  return row ? row.courseId : null;
}

function clearCreatedBy(userId) {
  const db = getDatabase();
  db.prepare('UPDATE announcements SET createdBy = NULL WHERE createdBy = ?').run(userId);
  db.prepare('UPDATE resources SET createdBy = NULL WHERE createdBy = ?').run(userId);
}

module.exports = {
  clearCreatedBy,
  deleteAnnouncement,
  deleteAnnouncementsByCourseId,
  deleteResource,
  deleteResourcesByCourseId,
  findAnnouncementById,
  findCourseId,
  findResourceById,
  getAnnouncements,
  getResources,
  insertAnnouncement,
  insertResource
};
