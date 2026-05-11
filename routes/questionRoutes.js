const express = require('express');
const router = express.Router();
const questionService = require('../services/questionService');
const categoryService = require('../services/categoryService');
const { validateId, requireFields, sanitizeStrings } = require('../middleware/validation');
const { requireAuth, requireRole, canManageCourse } = require('../middleware/auth');
const { parseOptionalPositiveInt, parseRequiredPositiveInt } = require('../utils/validation');

router.use(requireAuth);

function ensureQuestionReader(req, res, question) {
  if (!question) {
    res.status(404).json({ error: 'Question not found.' });
    return false;
  }
  try {
    questionService.assertCanRead(question, req.user);
    return true;
  } catch (err) {
    res.status(err.status || 403).json({ error: err.message });
    return false;
  }
}

function ensureQuestionWriter(req, res, question) {
  if (!question) {
    res.status(404).json({ error: 'Question not found.' });
    return false;
  }
  try {
    questionService.assertCanWrite(question, req.user);
    return true;
  } catch (err) {
    res.status(err.status || 403).json({ error: err.message });
    return false;
  }
}

function ensureCategoryWriter(req, res, categoryId) {
  const category = categoryService.getById(categoryId);
  if (!category) {
    res.status(400).json({ error: 'Category not found.' });
    return false;
  }
  try {
    categoryService.assertCanWrite(category, req.user);
    return true;
  } catch (err) {
    res.status(err.status || 403).json({ error: err.message });
    return false;
  }
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
      categoryId: parseOptionalPositiveInt(req.query.categoryId, 'categoryId') || undefined,
      courseId: parseOptionalPositiveInt(req.query.courseId, 'courseId') || undefined,
      difficulty: req.query.difficulty,
      type: req.query.type,
      search: req.query.search,
      user: req.user
    };
    const questions = questionService.getAll(filters);
    res.json(questions);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
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
      categoryId: parseOptionalPositiveInt(req.query.categoryId, 'categoryId') || undefined,
      courseId: parseOptionalPositiveInt(req.query.courseId, 'courseId') || undefined,
      difficulty: req.query.difficulty,
      limit: parseOptionalPositiveInt(req.query.limit, 'limit') || undefined,
      user: req.user
    };
    const questions = questionService.getRandom(opts);
    res.json(questions);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
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
    const question = questionService.getById(req.params.id, req.user);
    if (!ensureQuestionReader(req, res, question)) return;
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
    req.body.categoryId = parseRequiredPositiveInt(req.body.categoryId, 'categoryId');
    if (!ensureCategoryWriter(req, res, req.body.categoryId)) return;
    req.body.createdBy = req.user.id;
    const question = questionService.create(req.body, req.user);
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
    const existing = questionService.getById(req.params.id, req.user);
    if (!ensureQuestionWriter(req, res, existing)) return;
    if (req.body.categoryId !== undefined) {
      req.body.categoryId = parseRequiredPositiveInt(req.body.categoryId, 'categoryId');
      if (!ensureCategoryWriter(req, res, req.body.categoryId)) return;
    }
    const question = questionService.update(req.params.id, req.body, req.user);
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
    const existing = questionService.getById(req.params.id, req.user);
    if (!ensureQuestionWriter(req, res, existing)) return;
    questionService.delete(req.params.id, req.user);
    res.json({ message: 'Question deleted successfully.' });
  } catch (err) {
    if (err.message === 'Question not found.') {
      return res.status(404).json({ error: err.message });
    }
    res.status(err.status || 500).json({ error: err.message });
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
    const existing = questionService.getById(req.params.id, req.user);
    if (!ensureQuestionReader(req, res, existing)) return;
    const duplicate = questionService.duplicate(req.params.id, req.user);
    res.status(201).json(duplicate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/questions/{id}/share:
 *   post:
 *     summary: Share a question with another teacher
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
 *             $ref: '#/components/schemas/ResourceAccessGrantRequest'
 *     responses:
 *       201:
 *         description: Question access grant created
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.post('/:id/share', requireRole(['admin', 'teacher']), validateId, (req, res) => {
  try {
    res.status(201).json(questionService.share(req.params.id, req.body, req.user));
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message, field: err.field });
  }
});

/**
 * @swagger
 * /api/questions/{id}/access:
 *   get:
 *     summary: View question sharing access
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Question access summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceAccessSummary'
 */
router.get('/:id/access', requireRole(['admin', 'teacher']), validateId, (req, res) => {
  try {
    res.json(questionService.accessSummary(req.params.id, req.user));
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message, field: err.field });
  }
});

/**
 * @swagger
 * /api/questions/{id}/access/{teacherId}:
 *   delete:
 *     summary: Remove a teacher's shared question access
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated question access summary
 */
router.delete('/:id/access/:teacherId', requireRole(['admin', 'teacher']), validateId, (req, res) => {
  try {
    const teacherId = parseRequiredPositiveInt(req.params.teacherId, 'teacherId');
    res.json(questionService.removeAccess(req.params.id, teacherId, req.user));
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message, field: err.field });
  }
});

const { upload, validateUploadedImage } = require('../middleware/upload');

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
router.post('/upload', requireRole(['admin', 'teacher']), upload.single('file'), validateUploadedImage, (req, res) => {
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
