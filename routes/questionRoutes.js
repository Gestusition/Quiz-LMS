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
 * /api/questions:
 *   get:
 *     summary: Get all questions with optional filters (Admin/Teacher only)
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter by course ID
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
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
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
 *     summary: Get random questions for a quiz (Admin/Teacher only)
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter by course
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
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
 *     summary: Get a question by ID (Admin/Teacher only)
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
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
 *     summary: Create a new question (Admin/Teacher only)
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuestionRequest'
 *     responses:
 *       201:
 *         description: Question created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.post('/', requireRole(['admin', 'teacher']), requireFields(['categoryId', 'text', 'type']), sanitizeStrings(['text']), (req, res) => {
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
 *     summary: Update a question (Admin/Teacher only)
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
 *             $ref: '#/components/schemas/UpdateQuestionRequest'
 *     responses:
 *       200:
 *         description: Question updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
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
 *     summary: Delete a question (Admin/Teacher only)
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
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

/**
 * @swagger
 * /api/questions/{id}/duplicate:
 *   post:
 *     summary: Duplicate a question (Admin/Teacher only)
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Duplicated question
 */
router.post('/:id/duplicate', requireRole(['admin', 'teacher']), validateId, (req, res) => {
  try {
    const existing = questionService.getById(req.params.id);
    if (!ensureQuestionManager(req, res, existing)) return;
    const duplicate = questionService.duplicate(req.params.id);
    res.status(201).json(duplicate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const { upload } = require('../middleware/upload');

/**
 * @swagger
 * /api/questions/upload:
 *   post:
 *     summary: Upload an image for a question (Admin/Teacher only)
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload successful
 */
router.post('/upload', requireRole(['admin', 'teacher']), upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
  }
  res.json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size
  });
});

module.exports = router;
