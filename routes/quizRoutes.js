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
 *     summary: List quizzes available to the current user
 *     tags: [Quizzes]
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

router.get('/:id', loadQuiz, requireQuizAccess, (req, res) => {
  try {
    const includeCorrect = canManageCourse(req.user, req.quiz.courseId);
    res.json(quizService.getById(req.quizId, { includeQuestions: true, includeCorrect }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', loadQuiz, requireQuizManager, (req, res) => {
  try {
    res.json(quizService.update(req.quizId, req.body));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', loadQuiz, requireQuizManager, (req, res) => {
  try {
    quizService.delete(req.quizId);
    res.json({ message: 'Quiz deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/questions', loadQuiz, requireQuizManager, (req, res) => {
  try {
    res.json(quizService.setQuestions(req.quizId, req.body.questionIds));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

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

router.post('/:id/attempts', loadQuiz, requireQuizAccess, (req, res) => {
  try {
    res.status(201).json(quizService.startAttempt(req.quizId, req.user));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
