const express = require('express');
const router = express.Router();
const quizService = require('../services/quizService');
const { requireAuth, canAccessCourse, canManageCourse } = require('../middleware/auth');

router.use(requireAuth);

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function loadQuiz(req, res, next) {
  const quizId = parseId(req.params.id);
  if (!quizId) return res.status(400).json({ error: 'Invalid quiz ID.' });
  const quiz = quizService.getById(quizId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
  req.quiz = quiz;
  req.quizId = quizId;
  next();
}

function requireQuizAccess(req, res, next) {
  if (!canAccessCourse(req.user, req.quiz.courseId)) {
    return res.status(403).json({ error: 'Course access required.' });
  }
  next();
}

function requireQuizManager(req, res, next) {
  if (!canManageCourse(req.user, req.quiz.courseId)) {
    return res.status(403).json({ error: 'Teacher or admin course access required.' });
  }
  next();
}

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: List quizzes available to the current user (Course Access)
 *     tags: [Quizzes]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, closed]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quiz'
 */
router.get('/', (req, res) => {
  try {
    res.json(quizService.getAll(req.user, {
      courseId: req.query.courseId ? Number(req.query.courseId) : undefined,
      status: req.query.status,
      search: req.query.search
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Create a new quiz (Course Manager)
 *     tags: [Quizzes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuizRequest'
 *     responses:
 *       201:
 *         description: Quiz created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.post('/', (req, res) => {
  const courseId = Number(req.body.courseId);
  if (!courseId || !canManageCourse(req.user, courseId)) {
    return res.status(403).json({ error: 'Teacher or admin course access required.' });
  }

  try {
    res.status(201).json(quizService.create(req.body, req.user));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/quizzes/attempts/{id}:
 *   get:
 *     summary: Get a specific attempt by ID (Course Access)
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The attempt details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttempt'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.get('/attempts/:id', (req, res) => {
  const attemptId = parseId(req.params.id);
  if (!attemptId) return res.status(400).json({ error: 'Invalid attempt ID.' });

  try {
    const attempt = quizService.getAttempt(attemptId, req.user, {
      includeAnswers: true,
      includeQuestions: true
    });
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    if (!canAccessCourse(req.user, attempt.courseId)) {
      return res.status(403).json({ error: 'Course access required.' });
    }
    res.json(attempt);
  } catch (err) {
    if (err.message === 'Attempt not found.') return res.status(404).json({ error: err.message });
    res.status(403).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/quizzes/attempts/{id}/submit:
 *   post:
 *     summary: Submit a quiz attempt (Course Access)
 *     tags: [Quizzes]
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
 *             $ref: '#/components/schemas/SubmitAttemptRequest'
 *     responses:
 *       200:
 *         description: Attempt submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttempt'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.post('/attempts/:id/submit', (req, res) => {
  const attemptId = parseId(req.params.id);
  if (!attemptId) return res.status(400).json({ error: 'Invalid attempt ID.' });

  try {
    const attempt = quizService.submitAttempt(attemptId, req.user, req.body);
    res.json(attempt);
  } catch (err) {
    if (err.message === 'Attempt not found.') return res.status(404).json({ error: err.message });
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Get a quiz by ID (Course Access)
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The quiz details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.get('/:id', loadQuiz, requireQuizAccess, (req, res) => {
  try {
    const includeCorrect = canManageCourse(req.user, req.quiz.courseId);
    res.json(quizService.getById(req.quizId, { includeQuestions: true, includeCorrect }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/quizzes/{id}:
 *   put:
 *     summary: Update a quiz (Course Manager)
 *     tags: [Quizzes]
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
 *             $ref: '#/components/schemas/UpdateQuizRequest'
 *     responses:
 *       200:
 *         description: Quiz updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.put('/:id', loadQuiz, requireQuizManager, (req, res) => {
  try {
    res.json(quizService.update(req.quizId, req.body));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     summary: Delete a quiz (Course Manager)
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quiz deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.delete('/:id', loadQuiz, requireQuizManager, (req, res) => {
  try {
    quizService.delete(req.quizId);
    res.json({ message: 'Quiz deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/quizzes/{id}/questions:
 *   put:
 *     summary: Set quiz questions (Course Manager)
 *     tags: [Quizzes]
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
 *             $ref: '#/components/schemas/SetQuizQuestionsRequest'
 *     responses:
 *       200:
 *         description: Questions set successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.put('/:id/questions', loadQuiz, requireQuizManager, (req, res) => {
  try {
    res.json(quizService.setQuestions(req.quizId, req.body.questionIds));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/quizzes/{id}/attempts:
 *   get:
 *     summary: Get attempts for a quiz (Course Access)
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuizAttempt'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.get('/:id/attempts', loadQuiz, requireQuizAccess, (req, res) => {
  if (req.user.role !== 'student' && !canManageCourse(req.user, req.quiz.courseId)) {
    return res.status(403).json({ error: 'Teacher or admin course access required.' });
  }

  try {
    res.json(quizService.getAttemptsForQuiz(req.quizId, req.user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/quizzes/{id}/attempts:
 *   post:
 *     summary: Start a new attempt (Student)
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Attempt started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttempt'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.post('/:id/attempts', loadQuiz, requireQuizAccess, (req, res) => {
  try {
    res.status(201).json(quizService.startAttempt(req.quizId, req.user));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
