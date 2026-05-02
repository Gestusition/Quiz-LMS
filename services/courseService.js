const { getDatabase } = require('../database/db');
const { nowIso } = require('../utils/security');

class CourseService {
  getAll(user, filters = {}) {
    const db = getDatabase();
    let query = `
      SELECT c.*,
        COUNT(DISTINCT CASE WHEN e.role = 'student' THEN e.userId END) as studentCount,
        COUNT(DISTINCT CASE WHEN e.role = 'teacher' THEN e.userId END) as teacherCount,
        COUNT(DISTINCT q.id) as quizCount
      FROM courses c
      LEFT JOIN enrollments e ON e.courseId = c.id AND e.status = 'active'
      LEFT JOIN quizzes q ON q.courseId = c.id
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
    if (filters.visibility && ['private', 'published', 'archived'].includes(filters.visibility)) {
      query += ' AND c.visibility = ?';
      params.push(filters.visibility);
    }

    query += ' GROUP BY c.id ORDER BY c.createdAt DESC';
    return db.prepare(query).all(...params);
  }

  getById(id) {
    const db = getDatabase();
    const course = db.prepare(`
      SELECT c.*,
        COUNT(DISTINCT CASE WHEN e.role = 'student' THEN e.userId END) as studentCount,
        COUNT(DISTINCT CASE WHEN e.role = 'teacher' THEN e.userId END) as teacherCount,
        COUNT(DISTINCT q.id) as quizCount
      FROM courses c
      LEFT JOIN enrollments e ON e.courseId = c.id AND e.status = 'active'
      LEFT JOIN quizzes q ON q.courseId = c.id
      WHERE c.id = ?
      GROUP BY c.id
    `).get(id);
    return course || null;
  }

  create(data, user) {
    const payload = this.validateCourse(data);
    const db = getDatabase();
    const duplicate = db.prepare('SELECT id FROM courses WHERE LOWER(code) = LOWER(?)').get(payload.code);
    if (duplicate) {
      throw new Error('A course with this code already exists.');
    }

    db.exec('BEGIN TRANSACTION');
    try {
      const result = db.prepare(`
        INSERT INTO courses (code, title, description, visibility, startDate, endDate, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        payload.code,
        payload.title,
        payload.description,
        payload.visibility,
        payload.startDate,
        payload.endDate,
        user.id
      );

      const courseId = Number(result.lastInsertRowid);
      if (user.role === 'teacher') {
        db.prepare('INSERT INTO enrollments (courseId, userId, role) VALUES (?, ?, ?)')
          .run(courseId, user.id, 'teacher');
      }
      db.exec('COMMIT');
      return this.getById(courseId);
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }

  update(id, data) {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Course not found.');
    }

    const payload = this.validateCourse({
      code: data.code !== undefined ? data.code : existing.code,
      title: data.title !== undefined ? data.title : existing.title,
      description: data.description !== undefined ? data.description : existing.description,
      visibility: data.visibility !== undefined ? data.visibility : existing.visibility,
      startDate: data.startDate !== undefined ? data.startDate : existing.startDate,
      endDate: data.endDate !== undefined ? data.endDate : existing.endDate
    });

    const duplicate = db.prepare('SELECT id FROM courses WHERE LOWER(code) = LOWER(?) AND id != ?')
      .get(payload.code, id);
    if (duplicate) {
      throw new Error('A course with this code already exists.');
    }

    db.prepare(`
      UPDATE courses
      SET code = ?, title = ?, description = ?, visibility = ?, startDate = ?, endDate = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      payload.code,
      payload.title,
      payload.description,
      payload.visibility,
      payload.startDate,
      payload.endDate,
      nowIso(),
      id
    );

    return this.getById(id);
  }

  delete(id) {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM courses WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Course not found.');
    }

    const categories = db.prepare('SELECT id FROM categories WHERE courseId = ?').all(id);
    const categoryIds = categories.map(category => category.id);

    db.exec('BEGIN TRANSACTION');
    try {
      if (categoryIds.length > 0) {
        const placeholders = categoryIds.map(() => '?').join(',');
        db.prepare(`DELETE FROM questions WHERE categoryId IN (${placeholders})`).run(...categoryIds);
      }
      db.prepare('DELETE FROM quizzes WHERE courseId = ?').run(id);
      db.prepare('DELETE FROM announcements WHERE courseId = ?').run(id);
      db.prepare('DELETE FROM resources WHERE courseId = ?').run(id);
      db.prepare('DELETE FROM courses WHERE id = ?').run(id);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
    return true;
  }

  getParticipants(courseId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT e.id as enrollmentId, e.role as courseRole, e.status as enrollmentStatus,
        e.createdAt as enrolledAt, u.id, u.name, u.email, u.role, u.status
      FROM enrollments e
      JOIN users u ON u.id = e.userId
      WHERE e.courseId = ?
      ORDER BY e.role DESC, u.name ASC
    `).all(courseId);
  }

  enroll(courseId, userId, role) {
    if (!['teacher', 'student'].includes(role)) {
      throw new Error('Enrollment role must be teacher or student.');
    }

    const db = getDatabase();
    const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(courseId);
    if (!course) {
      throw new Error('Course not found.');
    }
    const user = db.prepare('SELECT id, role FROM users WHERE id = ? AND status = ?').get(userId, 'active');
    if (!user) {
      throw new Error('Active user not found.');
    }
    if (role === 'teacher' && user.role !== 'teacher') {
      throw new Error('Only teacher accounts can be enrolled as course teachers.');
    }
    if (role === 'student' && user.role !== 'student') {
      throw new Error('Only student accounts can be enrolled as course students.');
    }

    const existing = db.prepare(`
      SELECT id FROM enrollments WHERE courseId = ? AND userId = ? AND role = ?
    `).get(courseId, userId, role);

    if (existing) {
      db.prepare('UPDATE enrollments SET status = ? WHERE id = ?').run('active', existing.id);
      return this.getParticipants(courseId).find(p => p.enrollmentId === existing.id);
    }

    const result = db.prepare(`
      INSERT INTO enrollments (courseId, userId, role)
      VALUES (?, ?, ?)
    `).run(courseId, userId, role);

    return this.getParticipants(courseId).find(p => p.enrollmentId === result.lastInsertRowid);
  }

  updateEnrollment(enrollmentId, status) {
    if (!['active', 'suspended'].includes(status)) {
      throw new Error('Enrollment status must be active or suspended.');
    }

    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(enrollmentId);
    if (!existing) {
      throw new Error('Enrollment not found.');
    }

    db.prepare('UPDATE enrollments SET status = ? WHERE id = ?').run(status, enrollmentId);
    return this.getParticipants(existing.courseId).find(p => p.enrollmentId === enrollmentId);
  }

  deleteEnrollment(enrollmentId) {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM enrollments WHERE id = ?').get(enrollmentId);
    if (!existing) {
      throw new Error('Enrollment not found.');
    }

    db.prepare('DELETE FROM enrollments WHERE id = ?').run(enrollmentId);
    return true;
  }

  validateCourse(data) {
    const code = String(data.code || '').trim().toUpperCase();
    const title = String(data.title || '').trim();
    const description = String(data.description || '').trim();
    const visibility = data.visibility ? String(data.visibility).trim() : 'private';
    const startDate = data.startDate ? String(data.startDate).trim() : '';
    const endDate = data.endDate ? String(data.endDate).trim() : '';

    if (!code || code.length > 32 || !/^[A-Z0-9_-]+$/.test(code)) {
      throw new Error('Course code is required and may only contain letters, numbers, underscores, or hyphens.');
    }
    if (!title || title.length > 160) {
      throw new Error('Course title is required and must be 160 characters or less.');
    }
    if (description.length > 1000) {
      throw new Error('Course description must be 1000 characters or less.');
    }
    if (!['private', 'published', 'archived'].includes(visibility)) {
      throw new Error('Course visibility must be private, published, or archived.');
    }

    return { code, title, description, visibility, startDate, endDate };
  }
}

module.exports = new CourseService();
