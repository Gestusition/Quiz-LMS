const express = require('express');
const aiQuizService = require('../services/aiQuizService');
const ragService = require('../services/ragService');
const { requireAuth, requireRole, canManageCourse } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimit');
const { aiMaterialUpload } = require('../middleware/upload');
const { sendError } = require('../utils/appError');
const { parseRequiredPositiveInt } = require('../utils/validation');

const settingsRouter = express.Router();
const courseRouter = express.Router();

const settingsLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  key: req => `ai-settings:${req.user?.id || req.ip}`,
  message: 'Too many AI settings requests. Please try again later.'
});
const generationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  key: req => `ai-generation:${req.user?.id || req.ip}`,
  message: 'AI generation limit reached. Please wait before trying again.'
});
const uploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  key: req => `ai-upload:${req.user?.id || req.ip}`,
  message: 'Course material upload limit reached. Please try again later.'
});

settingsRouter.use(requireAuth, requireRole('admin', 'teacher'));

settingsRouter.get('/settings/status', settingsLimiter, (req, res) => {
  try {
    res.json(aiQuizService.getSettingsStatus(req.user.id));
  } catch (error) {
    sendError(res, error);
  }
});

settingsRouter.post('/settings', settingsLimiter, (req, res) => {
  try {
    res.json(aiQuizService.saveSettings(req.user.id, req.body));
  } catch (error) {
    sendError(res, error, 400);
  }
});

courseRouter.use(requireAuth, requireRole('admin', 'teacher'));
courseRouter.use('/:courseId', (req, res, next) => {
  try {
    req.courseId = parseRequiredPositiveInt(req.params.courseId, 'courseId');
  } catch (error) {
    return sendError(res, error, 400);
  }
  if (!canManageCourse(req.user, req.courseId)) {
    return res.status(403).json({ error: 'Teacher or admin course access required.' });
  }
  next();
});

function uploadSingleMaterial(req, res, next) {
  aiMaterialUpload.single('file')(req, res, error => {
    if (!error) return next();
    const isSize = error.code === 'LIMIT_FILE_SIZE';
    return res.status(400).json({
      error: isSize ? 'Course material must be 10 MB or smaller.' : (error.message || 'Course material upload failed.')
    });
  });
}

courseRouter.post('/:courseId/ai/materials', uploadLimiter, uploadSingleMaterial, async (req, res) => {
  try {
    const config = aiQuizService.getConfigForUser(req.user.id);
    const material = await ragService.ingestCourseMaterial(req.courseId, req.file, config, req.user.id);
    res.status(201).json(material);
  } catch (error) {
    sendError(res, error, 400);
  }
});

courseRouter.get('/:courseId/ai/materials', (req, res) => {
  try {
    res.json(ragService.listCourseMaterials(req.courseId));
  } catch (error) {
    sendError(res, error);
  }
});

courseRouter.post('/:courseId/ai/generate-quiz', generationLimiter, async (req, res) => {
  try {
    const draft = await aiQuizService.generateQuizDraft(req.body, { courseId: req.courseId, user: req.user });
    res.status(201).json(draft);
  } catch (error) {
    sendError(res, error, 400);
  }
});

courseRouter.post('/:courseId/ai/regenerate-question', generationLimiter, async (req, res) => {
  try {
    const config = aiQuizService.getConfigForUser(req.user.id);
    const contextChunks = req.body.useCourseMaterial
      ? await ragService.retrieveRelevantChunks(req.courseId, req.body.topic || req.body.question?.text || '', config)
      : [];
    if (req.body.useCourseMaterial && !contextChunks.length) {
      return res.status(400).json({ error: 'No indexed course material is available. Upload material first.' });
    }
    res.json(await aiQuizService.regenerateQuestion({ ...req.body, contextChunks }, config));
  } catch (error) {
    sendError(res, error, 400);
  }
});

courseRouter.post('/:courseId/ai/generate-explanation', generationLimiter, async (req, res) => {
  try {
    const config = aiQuizService.getConfigForUser(req.user.id);
    res.json(await aiQuizService.generateExplanation(req.body, config));
  } catch (error) {
    sendError(res, error, 400);
  }
});

courseRouter.get('/:courseId/ai/drafts', (req, res) => {
  try {
    res.json(aiQuizService.listQuizDrafts(req.courseId));
  } catch (error) {
    sendError(res, error);
  }
});

courseRouter.get('/:courseId/ai/drafts/:draftId', (req, res) => {
  try {
    const draft = aiQuizService.getQuizDraft(parseRequiredPositiveInt(req.params.draftId, 'draftId'));
    if (Number(draft.courseId) !== req.courseId) return res.status(404).json({ error: 'AI quiz draft not found.' });
    res.json(draft);
  } catch (error) {
    sendError(res, error, 400);
  }
});

courseRouter.put('/:courseId/ai/drafts/:draftId', (req, res) => {
  try {
    const draftId = parseRequiredPositiveInt(req.params.draftId, 'draftId');
    const existing = aiQuizService.getQuizDraft(draftId);
    if (Number(existing.courseId) !== req.courseId) return res.status(404).json({ error: 'AI quiz draft not found.' });
    res.json(aiQuizService.updateQuizDraft(draftId, req.body));
  } catch (error) {
    sendError(res, error, 400);
  }
});

courseRouter.post('/:courseId/ai/drafts/:draftId/publish', (req, res) => {
  try {
    const draftId = parseRequiredPositiveInt(req.params.draftId, 'draftId');
    const existing = aiQuizService.getQuizDraft(draftId);
    if (Number(existing.courseId) !== req.courseId) return res.status(404).json({ error: 'AI quiz draft not found.' });
    res.status(201).json(aiQuizService.publishQuizDraft(draftId, req.user));
  } catch (error) {
    sendError(res, error, 400);
  }
});

courseRouter.post('/:courseId/quizzes/:quizId/ai/add-questions', (req, res) => {
  try {
    const draftId = parseRequiredPositiveInt(req.body.draftId, 'draftId');
    const quizId = parseRequiredPositiveInt(req.params.quizId, 'quizId');
    const draft = aiQuizService.getQuizDraft(draftId);
    if (Number(draft.courseId) !== req.courseId) return res.status(404).json({ error: 'AI quiz draft not found.' });
    res.json(aiQuizService.addDraftQuestionsToQuiz(draftId, quizId, req.user));
  } catch (error) {
    sendError(res, error, 400);
  }
});

module.exports = settingsRouter;
module.exports.settingsRouter = settingsRouter;
module.exports.courseRouter = courseRouter;
