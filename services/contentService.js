const { getDatabase } = require('../database/db');

class ContentService {
  getAnnouncements(courseId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT a.*, u.name as authorName
      FROM announcements a
      LEFT JOIN users u ON u.id = a.createdBy
      WHERE a.courseId = ?
      ORDER BY a.createdAt DESC
    `).all(courseId);
  }

  createAnnouncement(courseId, data, user) {
    const payload = this.validateAnnouncement(data);
    const db = getDatabase();
    const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(courseId);
    if (!course) {
      throw new Error('Course not found.');
    }

    const result = db.prepare(`
      INSERT INTO announcements (courseId, title, body, createdBy)
      VALUES (?, ?, ?, ?)
    `).run(courseId, payload.title, payload.body, user.id);

    return this.getAnnouncements(courseId).find(item => item.id === result.lastInsertRowid);
  }

  deleteAnnouncement(id) {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM announcements WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Announcement not found.');
    }
    db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
    return true;
  }

  getResources(courseId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT r.*, u.name as authorName
      FROM resources r
      LEFT JOIN users u ON u.id = r.createdBy
      WHERE r.courseId = ?
      ORDER BY r.createdAt DESC
    `).all(courseId);
  }

  createResource(courseId, data, user) {
    const payload = this.validateResource(data);
    const db = getDatabase();
    const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(courseId);
    if (!course) {
      throw new Error('Course not found.');
    }

    const result = db.prepare(`
      INSERT INTO resources (courseId, title, type, url, description, createdBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(courseId, payload.title, payload.type, payload.url, payload.description, user.id);

    return this.getResources(courseId).find(item => item.id === result.lastInsertRowid);
  }

  deleteResource(id) {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM resources WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Resource not found.');
    }
    db.prepare('DELETE FROM resources WHERE id = ?').run(id);
    return true;
  }

  validateAnnouncement(data) {
    const title = String(data.title || '').trim();
    const body = String(data.body || '').trim();

    if (!title || title.length > 160) {
      throw new Error('Announcement title is required and must be 160 characters or less.');
    }
    if (!body || body.length > 2000) {
      throw new Error('Announcement body is required and must be 2000 characters or less.');
    }

    return { title, body };
  }

  validateResource(data) {
    const title = String(data.title || '').trim();
    const type = data.type ? String(data.type).trim() : 'link';
    const url = data.url ? String(data.url).trim() : '';
    const description = data.description ? String(data.description).trim() : '';

    if (!title || title.length > 160) {
      throw new Error('Resource title is required and must be 160 characters or less.');
    }
    if (!['link', 'file', 'page'].includes(type)) {
      throw new Error('Resource type must be link, file, or page.');
    }
    if (url.length > 500 || description.length > 1000) {
      throw new Error('Resource URL or description is too long.');
    }

    return { title, type, url, description };
  }
}

module.exports = new ContentService();
