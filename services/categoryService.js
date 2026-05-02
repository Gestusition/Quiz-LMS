const { getDatabase } = require('../database/db');

/**
 * Business logic for Category operations.
 * Separated from routes to enable unit testing.
 */
class CategoryService {

  /**
   * Get all categories.
   * @returns {Array} List of all categories.
   */
  getAll(filters = {}) {
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
    const categories = db.prepare(query).all(...params);
    return categories;
  }

  /**
   * Get a single category by ID.
   * @param {number} id - The category ID.
   * @returns {Object|null} The category object or null if not found.
   */
  getById(id) {
    const db = getDatabase();
    const category = db.prepare(`
      SELECT c.*, courses.title as courseTitle, COUNT(q.id) as questionCount
      FROM categories c
      LEFT JOIN courses ON courses.id = c.courseId
      LEFT JOIN questions q ON q.categoryId = c.id
      WHERE c.id = ?
      GROUP BY c.id
    `).get(id);
    return category || null;
  }

  /**
   * Create a new category.
   * @param {Object} data - The category data.
   * @param {string} data.name - Category name (required).
   * @param {string} [data.description] - Category description.
   * @returns {Object} The created category.
   * @throws {Error} If validation fails or name already exists.
   */
  create(data) {
    const { name, description, courseId } = data;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Category name is required and must be a non-empty string.');
    }
    if (name.trim().length > 100) {
      throw new Error('Category name must be 100 characters or less.');
    }

    const db = getDatabase();

    if (courseId !== undefined && courseId !== null && courseId !== '') {
      const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(courseId);
      if (!course) {
        throw new Error('Course not found.');
      }
    }

    // Check for duplicate name
    const existing = db.prepare('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)').get(name.trim());
    if (existing) {
      throw new Error('A category with this name already exists.');
    }

    const result = db.prepare(
      'INSERT INTO categories (courseId, name, description) VALUES (?, ?, ?)'
    ).run(courseId || null, name.trim(), (description || '').trim());

    return this.getById(result.lastInsertRowid);
  }

  /**
   * Update an existing category.
   * @param {number} id - The category ID.
   * @param {Object} data - The fields to update.
   * @param {string} [data.name] - New category name.
   * @param {string} [data.description] - New category description.
   * @returns {Object} The updated category.
   * @throws {Error} If category not found or validation fails.
   */
  update(id, data) {
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Category not found.');
    }

    const name = data.name !== undefined ? data.name : existing.name;
    const description = data.description !== undefined ? data.description : existing.description;
    const courseId = data.courseId !== undefined ? data.courseId : existing.courseId;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Category name is required and must be a non-empty string.');
    }
    if (name.trim().length > 100) {
      throw new Error('Category name must be 100 characters or less.');
    }
    if (courseId !== undefined && courseId !== null && courseId !== '') {
      const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(courseId);
      if (!course) {
        throw new Error('Course not found.');
      }
    }

    // Check for duplicate name (exclude current)
    const duplicate = db.prepare('SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id != ?').get(name.trim(), id);
    if (duplicate) {
      throw new Error('A category with this name already exists.');
    }

    db.prepare('UPDATE categories SET courseId = ?, name = ?, description = ? WHERE id = ?')
      .run(courseId || null, name.trim(), (description || '').trim(), id);

    return this.getById(id);
  }

  /**
   * Delete a category by ID.
   * @param {number} id - The category ID.
   * @returns {boolean} True if deleted.
   * @throws {Error} If category not found.
   */
  delete(id) {
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Category not found.');
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return true;
  }
}

module.exports = new CategoryService();
