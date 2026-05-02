const express = require('express');
const router = express.Router();
const questionService = require('../services/questionService');
const categoryService = require('../services/categoryService');
const { validateId, requireFields, sanitizeStrings } = require('../middleware/validation');
const { requireAuth, requireRole, canManageCourse } = require('../middleware/auth');

router.use(requireAuth);

function ensureQuestionManager(req, res, question) {
  if (!question) {
    res.status(404).json({ error: 'Question not found.' });
    return false;
  }
  if (!question.courseId && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Teacher or admin course access required.' });
    return false;
  }
  if (question.courseId && !canManageCourse(req.user, question.courseId)) {
    res.status(403).json({ error: 'Teacher or admin course access required.' });
    return false;
  }
  return true;
}

function ensureCategoryManager(req, res, categoryId) {
  const category = categoryService.getById(categoryId);
  if (!category) {
    res.status(400).json({ error: 'Category not found.' });
    return false;
  }
  if (!category.courseId && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Teacher course category required.' });
    return false;
  }
  if (category.courseId && !canManageCourse(req.user, category.courseId)) {
    res.status(403).json({ error: 'Teacher or admin course access required.' });
    return false;
  }
  return true;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       required:
 *         - categoryId
 *         - text
 *         - type
 *         - correctAnswer
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         categoryId:
 *           type: integer
 *           description: FK to categories table
 *         categoryName:
 *           type: string
 *           description: Name of the parent category
 *         text:
 *           type: string
 *           description: The question text
 *         type:
 *           type: string
 *           enum: [MC, TF, FB]
 *           description: "Question type: MC=Multiple Choice, TF=True/False, FB=Fill Blank"
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: Options for multiple choice questions
 *         correctAnswer:
 *           type: string
 *           description: "Correct answer (index for MC, true/false for TF, text for FB)"
 *         difficulty:
 *           type: string
 *           enum: [EASY, MEDIUM, HARD]
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         categoryId: 1
 *         categoryName: JavaScript
 *         text: "Which keyword is used to declare a constant?"
 *         type: MC
 *         options: ["var", "let", "const", "define"]
 *         correctAnswer: "2"
 *         difficulty: EASY
 */

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get all questions with optional filters
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [EASY, MEDIUM, HARD]
 *         description: Filter by difficulty
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [MC, TF, FB]
 *         description: Filter by question type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in question text
 *     responses:
 *       200:
 *         description: List of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 */
router.get('/', requireRole(['admin', 'teacher']), (req, res) => {
  try {
    const filters = {
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined,
      courseId: req.query.courseId ? parseInt(req.query.courseId) : undefined,
      difficulty: req.query.difficulty,
      type: req.query.type,
      search: req.query.search,
      user: req.user
    };
    const questions = questionService.getAll(filters);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/questions/random:
 *   get:
 *     summary: Get random questions for a quiz
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [EASY, MEDIUM, HARD]
 *         description: Filter by difficulty
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of questions (max 50)
 *     responses:
 *       200:
 *         description: Random questions
 */
router.get('/random', requireRole(['admin', 'teacher']), (req, res) => {
  try {
    const opts = {
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined,
      courseId: req.query.courseId ? parseInt(req.query.courseId) : undefined,
      difficulty: req.query.difficulty,
      limit: req.query.limit,
      user: req.user
    };
    const questions = questionService.getRandom(opts);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The question
 *       404:
 *         description: Question not found
 */
router.get('/:id', requireRole(['admin', 'teacher']), validateId, (req, res) => {
  try {
    const question = questionService.getById(req.params.id);
    if (!ensureQuestionManager(req, res, question)) return;
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - text
 *               - type
 *               - correctAnswer
 *             properties:
 *               categoryId:
 *                 type: integer
 *               text:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [MC, TF, FB]
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctAnswer:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [EASY, MEDIUM, HARD]
 *     responses:
 *       201:
 *         description: Question created
 *       400:
 *         description: Validation error
 */
router.post('/', requireRole(['admin', 'teacher']), requireFields(['categoryId', 'text', 'type', 'correctAnswer']), sanitizeStrings(['text', 'correctAnswer']), (req, res) => {
  try {
    // Ensure categoryId is a number
    req.body.categoryId = parseInt(req.body.categoryId);
    if (!ensureCategoryManager(req, res, req.body.categoryId)) return;
    req.body.createdBy = req.user.id;
    const question = questionService.create(req.body);
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Update a question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: integer
 *               text:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [MC, TF, FB]
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctAnswer:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [EASY, MEDIUM, HARD]
 *     responses:
 *       200:
 *         description: Question updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Question not found
 */
router.put('/:id', requireRole(['admin', 'teacher']), validateId, sanitizeStrings(['text', 'correctAnswer']), (req, res) => {
  try {
    const existing = questionService.getById(req.params.id);
    if (!ensureQuestionManager(req, res, existing)) return;
    if (req.body.categoryId !== undefined) {
      req.body.categoryId = parseInt(req.body.categoryId);
      if (!ensureCategoryManager(req, res, req.body.categoryId)) return;
    }
    const question = questionService.update(req.params.id, req.body);
    res.json(question);
  } catch (err) {
    if (err.message === 'Question not found.') {
      return res.status(404).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete a question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Question deleted
 *       404:
 *         description: Question not found
 */
router.delete('/:id', requireRole(['admin', 'teacher']), validateId, (req, res) => {
  try {
    const existing = questionService.getById(req.params.id);
    if (!ensureQuestionManager(req, res, existing)) return;
    questionService.delete(req.params.id);
    res.json({ message: 'Question deleted successfully.' });
  } catch (err) {
    if (err.message === 'Question not found.') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
