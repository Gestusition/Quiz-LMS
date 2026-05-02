const { getDatabase } = require('../database/db');

const VALID_TYPES = ['MC', 'TF', 'FB'];
const VALID_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

/**
 * Business logic for Question operations.
 * Separated from routes to enable unit testing.
 */
class QuestionService {

  /**
   * Get all questions with optional filtering.
   * @param {Object} [filters] - Optional filters.
   * @param {number} [filters.categoryId] - Filter by category.
   * @param {string} [filters.difficulty] - Filter by difficulty.
   * @param {string} [filters.type] - Filter by question type.
   * @param {string} [filters.search] - Search in question text.
   * @returns {Array} List of questions.
   */
  getAll(filters = {}) {
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
    if (filters.difficulty && VALID_DIFFICULTIES.includes(filters.difficulty)) {
      query += ' AND q.difficulty = ?';
      params.push(filters.difficulty);
    }
    if (filters.type && VALID_TYPES.includes(filters.type)) {
      query += ' AND q.type = ?';
      params.push(filters.type);
    }
    if (filters.search) {
      query += ' AND q.text LIKE ?';
      params.push(`%${filters.search}%`);
    }

    query += ' ORDER BY q.createdAt DESC';

    const questions = db.prepare(query).all(...params);
    return questions.map(q => ({
      ...q,
      options: JSON.parse(q.options || '[]')
    }));
  }

  /**
   * Get a single question by ID.
   * @param {number} id - The question ID.
   * @returns {Object|null} The question object or null.
   */
  getById(id) {
    const db = getDatabase();
    const question = db.prepare(`
      SELECT q.*, c.name as categoryName, c.courseId, courses.title as courseTitle
      FROM questions q
      LEFT JOIN categories c ON c.id = q.categoryId
      LEFT JOIN courses ON courses.id = c.courseId
      WHERE q.id = ?
    `).get(id);

    if (!question) return null;

    return {
      ...question,
      options: JSON.parse(question.options || '[]')
    };
  }

  /**
   * Get random questions for a quiz.
   * @param {Object} [opts] - Options.
   * @param {number} [opts.categoryId] - Category filter.
   * @param {string} [opts.difficulty] - Difficulty filter.
   * @param {number} [opts.limit=10] - Number of questions.
   * @returns {Array} Random questions.
   */
  getRandom(opts = {}) {
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
    if (opts.difficulty && VALID_DIFFICULTIES.includes(opts.difficulty)) {
      query += ' AND q.difficulty = ?';
      params.push(opts.difficulty);
    }

    const limit = Math.min(Math.max(parseInt(opts.limit) || 10, 1), 50);
    query += ' ORDER BY RANDOM() LIMIT ?';
    params.push(limit);

    const questions = db.prepare(query).all(...params);
    return questions.map(q => ({
      ...q,
      options: JSON.parse(q.options || '[]')
    }));
  }

  /**
   * Create a new question.
   * @param {Object} data - The question data.
   * @returns {Object} The created question.
   * @throws {Error} If validation fails.
   */
  create(data) {
    this._validate(data);

    const db = getDatabase();

    // Verify category exists
    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(data.categoryId);
    if (!category) {
      throw new Error('Category not found.');
    }

    const result = db.prepare(
      'INSERT INTO questions (categoryId, text, type, options, correctAnswer, difficulty, points, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      data.categoryId,
      data.text.trim(),
      data.type,
      JSON.stringify(data.options || []),
      String(data.correctAnswer).trim(),
      data.difficulty || 'MEDIUM',
      data.points || 1,
      data.createdBy || null
    );

    return this.getById(result.lastInsertRowid);
  }

  /**
   * Update an existing question.
   * @param {number} id - The question ID.
   * @param {Object} data - The fields to update.
   * @returns {Object} The updated question.
   * @throws {Error} If question not found or validation fails.
   */
  update(id, data) {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM questions WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Question not found.');
    }

    const merged = {
      categoryId: data.categoryId !== undefined ? data.categoryId : existing.categoryId,
      text: data.text !== undefined ? data.text : existing.text,
      type: data.type !== undefined ? data.type : existing.type,
      options: data.options !== undefined ? data.options : JSON.parse(existing.options || '[]'),
      correctAnswer: data.correctAnswer !== undefined ? data.correctAnswer : existing.correctAnswer,
      difficulty: data.difficulty !== undefined ? data.difficulty : existing.difficulty,
      points: data.points !== undefined ? data.points : existing.points
    };

    this._validate(merged);

    // Verify category exists
    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(merged.categoryId);
    if (!category) {
      throw new Error('Category not found.');
    }

    db.prepare(
      'UPDATE questions SET categoryId = ?, text = ?, type = ?, options = ?, correctAnswer = ?, difficulty = ?, points = ? WHERE id = ?'
    ).run(
      merged.categoryId,
      merged.text.trim(),
      merged.type,
      JSON.stringify(merged.options || []),
      String(merged.correctAnswer).trim(),
      merged.difficulty,
      merged.points || 1,
      id
    );

    return this.getById(id);
  }

  /**
   * Delete a question by ID.
   * @param {number} id - The question ID.
   * @returns {boolean} True if deleted.
   * @throws {Error} If question not found.
   */
  delete(id) {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM questions WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Question not found.');
    }

    db.prepare('DELETE FROM questions WHERE id = ?').run(id);
    return true;
  }

  /**
   * Validate question data.
   * @param {Object} data - The question data to validate.
   * @throws {Error} If validation fails.
   * @private
   */
  _validate(data) {
    if (!data.text || typeof data.text !== 'string' || data.text.trim().length === 0) {
      throw new Error('Question text is required.');
    }
    if (data.text.trim().length > 500) {
      throw new Error('Question text must be 500 characters or less.');
    }
    if (!data.type || !VALID_TYPES.includes(data.type)) {
      throw new Error(`Question type must be one of: ${VALID_TYPES.join(', ')}.`);
    }
    if (!data.categoryId || typeof data.categoryId !== 'number') {
      throw new Error('A valid category ID is required.');
    }
    if (data.correctAnswer === undefined || data.correctAnswer === null || String(data.correctAnswer).trim() === '') {
      throw new Error('Correct answer is required.');
    }
    if (data.difficulty && !VALID_DIFFICULTIES.includes(data.difficulty)) {
      throw new Error(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}.`);
    }
    const points = Number(data.points || 1);
    if (!Number.isFinite(points) || points <= 0 || points > 100) {
      throw new Error('Question points must be between 0 and 100.');
    }

    // Type-specific validation
    if (data.type === 'MC') {
      if (!Array.isArray(data.options) || data.options.length < 2) {
        throw new Error('Multiple choice questions must have at least 2 options.');
      }
      const idx = parseInt(data.correctAnswer);
      if (isNaN(idx) || idx < 0 || idx >= data.options.length) {
        throw new Error('Correct answer index must be a valid option index.');
      }
    }
    if (data.type === 'TF') {
      const answer = String(data.correctAnswer).toLowerCase();
      if (answer !== 'true' && answer !== 'false') {
        throw new Error('True/False questions must have "true" or "false" as the correct answer.');
      }
    }
  }
}

module.exports = new QuestionService();
