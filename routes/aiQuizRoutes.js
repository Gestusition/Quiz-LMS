const express = require('express');
const aiQuizService = require('../services/aiQuizService');
const aiConversationService = require('../services/aiConversationService');
const ragService = require('../services/ragService');
const { requireAuth, requireRole, canManageCourse } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimit');
const { aiMaterialUpload } = require('../middleware/upload');
const { sendError } = require('../utils/appError');
const { parseRequiredPositiveInt } = require('../utils/validation');
const { validatePastedMaterial } = require('../validators/aiConversationValidator');

const settingsRouter = express.Router();
const courseRouter = express.Router();

const settingsLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  key: req => `ai-settings:${req.user?.id || req.ip}`,
  message: 'Too many AI settings requests. Please try again later.'
});
const planningLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  key: req => `ai-planning:${req.user?.id || req.ip}`,
  message: 'AI conversation limit reached. Please wait before sending another message.'
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

/**
 * @swagger
 * /api/ai/settings/status:
 *   get:
 *     summary: Read the current user's private Azure AI configuration status
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Masked configuration status
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
settingsRouter.get('/settings/status', settingsLimiter, (req, res) => {
  try {
    res.json(aiQuizService.getSettingsStatus(req.user.id));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/settings:
 *   post:
 *     summary: Save private Azure AI settings for the current user
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Masked saved configuration status
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
settingsRouter.post('/settings', settingsLimiter, (req, res) => {
  try {
    res.json(aiQuizService.saveSettings(req.user.id, req.body));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/settings/test:
 *   post:
 *     summary: Test chat and embedding deployments without exposing credentials
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Separate safe chat and embedding test results
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       429:
 *         $ref: '#/components/responses/429TooManyRequests'
 */
settingsRouter.post('/settings/test', settingsLimiter, async (req, res) => {
  try {
    res.json(await aiQuizService.testConnection(req.user.id, req.body));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/conversations:
 *   post:
 *     summary: Start a private AI quiz-planning conversation
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Conversation with initial assistant greeting
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
settingsRouter.post('/conversations', planningLimiter, async (req, res) => {
  try {
    res.status(201).json(await aiConversationService.createConversation(req.body, req.user));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/conversations:
 *   get:
 *     summary: List the current user's authorized AI conversations
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Paginated private conversation list
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
settingsRouter.get('/conversations', (req, res) => {
  try {
    res.json(aiConversationService.listConversations(req.query, req.user));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/conversations/{id}:
 *   get:
 *     summary: Read one private AI conversation and its current workspace state
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Conversation, messages, plan, draft, generation, and revisions
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
settingsRouter.get('/conversations/:id', (req, res) => {
  try {
    res.json(aiConversationService.getConversation(conversationId(req), req.user));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/conversations/{id}:
 *   delete:
 *     summary: Permanently delete one owned AI conversation and its chat history
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Conversation deleted
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 *       409:
 *         $ref: '#/components/responses/409Conflict'
 */
settingsRouter.delete('/conversations/:id', (req, res) => {
  try {
    res.json(aiConversationService.deleteConversation(conversationId(req), req.user));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/conversations/{id}/messages:
 *   post:
 *     summary: Add a teacher message and receive a structured planning response
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Persisted messages and updated quiz plan
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       429:
 *         $ref: '#/components/responses/429TooManyRequests'
 */
settingsRouter.post('/conversations/:id/messages', planningLimiter, async (req, res) => {
  try {
    res.json(await aiConversationService.addMessage(conversationId(req), req.body, req.user));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/conversations/{id}/plan:
 *   patch:
 *     summary: Update fields in the shared conversational quiz plan
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Conversation with server-recomputed readiness
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       409:
 *         $ref: '#/components/responses/409Conflict'
 */
settingsRouter.patch('/conversations/:id/plan', (req, res) => {
  try {
    res.json(aiConversationService.updateQuizPlan(conversationId(req), req.body, req.user));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/conversations/{id}/generate:
 *   post:
 *     summary: Explicitly generate and save a review-only quiz draft
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Validated draft, generation run, and review state
 *       409:
 *         $ref: '#/components/responses/409Conflict'
 *       429:
 *         $ref: '#/components/responses/429TooManyRequests'
 */
settingsRouter.post('/conversations/:id/generate', generationLimiter, async (req, res) => {
  try {
    const result = await aiConversationService.generateDraft(conversationId(req), {
      ...req.body,
      idempotencyKey: req.get('Idempotency-Key') || req.body.idempotencyKey
    }, req.user);
    res.status(result.repeated ? 200 : 201).json(result);
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/conversations/{id}/generation-status:
 *   get:
 *     summary: Read the latest real generation stage and cancellation state
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Latest persisted and in-process generation state
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
settingsRouter.get('/conversations/:id/generation-status', (req, res) => {
  try {
    res.json(aiConversationService.getGenerationStatus(conversationId(req), req.user));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/conversations/{id}/cancel:
 *   post:
 *     summary: Request cancellation of an active generation
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cancellation request status
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
settingsRouter.post('/conversations/:id/cancel', (req, res) => {
  try {
    res.json(aiConversationService.cancelGeneration(conversationId(req), req.user));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/conversations/{id}/revise:
 *   post:
 *     summary: Preview a controlled chat-requested whole-draft revision
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Auditable revision preview requiring confirmation
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
settingsRouter.post('/conversations/:id/revise', generationLimiter, async (req, res) => {
  try {
    res.status(201).json(await aiConversationService.previewDraftRevision(
      conversationId(req),
      req.body,
      req.user
    ));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/conversations/{id}/revisions/{revisionId}/apply:
 *   post:
 *     summary: Apply a previously previewed draft revision
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Applied revision and updated review draft
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
settingsRouter.post('/conversations/:id/revisions/:revisionId/apply', (req, res) => {
  try {
    res.json(aiConversationService.applyDraftRevision(
      conversationId(req),
      parseRequiredPositiveInt(req.params.revisionId, 'revisionId'),
      req.user
    ));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/conversations/{id}/regenerate-questions:
 *   post:
 *     summary: Regenerate one or more selected draft questions
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Updated draft and auditable regeneration revision
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
settingsRouter.post('/conversations/:id/regenerate-questions', generationLimiter, async (req, res) => {
  try {
    res.json(await aiConversationService.regenerateQuestions(
      conversationId(req),
      req.body,
      req.user
    ));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/ai/conversations/{id}/draft:
 *   put:
 *     summary: Save manual review edits to an AI-generated draft
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Saved draft that remains unpublished
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
settingsRouter.put('/conversations/:id/draft', (req, res) => {
  try {
    res.json({
      draft: aiConversationService.saveReviewedDraft(conversationId(req), req.body, req.user)
    });
  } catch (error) {
    sendError(res, error);
  }
});

courseRouter.use(requireAuth, requireRole('admin', 'teacher'));
courseRouter.use('/:courseId', (req, res, next) => {
  try {
    req.courseId = parseRequiredPositiveInt(req.params.courseId, 'courseId');
  } catch (error) {
    return sendError(res, error);
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

/**
 * @swagger
 * /api/courses/{courseId}/ai/materials:
 *   post:
 *     summary: Upload and index an authorized course document
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Indexed course material metadata
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
courseRouter.post('/:courseId/ai/materials', uploadLimiter, uploadSingleMaterial, async (req, res) => {
  try {
    const config = aiQuizService.getConfigForUser(req.user.id);
    const material = await ragService.ingestCourseMaterial(req.courseId, req.file, config, req.user.id);
    res.status(201).json(material);
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/ai/materials:
 *   get:
 *     summary: List indexed materials for one authorized course
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Course-scoped material list and indexing states
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
courseRouter.get('/:courseId/ai/materials', (req, res) => {
  try {
    res.json(ragService.listCourseMaterials(req.courseId));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/ai/materials/paste:
 *   post:
 *     summary: Paste and index trusted teacher-provided course notes
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Indexed pasted-text material
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
courseRouter.post('/:courseId/ai/materials/paste', uploadLimiter, async (req, res) => {
  try {
    const input = validatePastedMaterial(req.body);
    const config = aiQuizService.getConfigForUser(req.user.id);
    const material = await ragService.ingestPastedMaterial(
      req.courseId,
      input,
      config,
      req.user.id
    );
    res.status(201).json(material);
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/ai/materials/{materialId}:
 *   delete:
 *     summary: Remove an authorized course material and its chunks
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Material removal confirmation
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
courseRouter.delete('/:courseId/ai/materials/:materialId', (req, res) => {
  try {
    res.json(ragService.removeCourseMaterial(
      req.courseId,
      parseRequiredPositiveInt(req.params.materialId, 'materialId')
    ));
  } catch (error) {
    if (error?.field === 'materialId') error.status = 404;
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/ai/source-chunks/{chunkId}:
 *   get:
 *     summary: Inspect a human-readable course-material source excerpt
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Course-scoped source excerpt
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
courseRouter.get('/:courseId/ai/source-chunks/:chunkId', (req, res) => {
  try {
    res.json(ragService.getSourceChunk(
      req.courseId,
      parseRequiredPositiveInt(req.params.chunkId, 'chunkId')
    ));
  } catch (error) {
    if (error?.field === 'chunkId') error.status = 404;
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/ai/generate-quiz:
 *   post:
 *     summary: Generate a legacy form-based AI quiz draft
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Review-only AI quiz draft
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
courseRouter.post('/:courseId/ai/generate-quiz', generationLimiter, async (req, res) => {
  try {
    const draft = await aiQuizService.generateQuizDraft(req.body, {
      courseId: req.courseId,
      user: req.user
    });
    res.status(201).json(draft);
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/ai/regenerate-question:
 *   post:
 *     summary: Generate a legacy replacement for one draft question
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Validated replacement question
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
courseRouter.post('/:courseId/ai/regenerate-question', generationLimiter, async (req, res) => {
  try {
    const config = aiQuizService.getConfigForUser(req.user.id);
    const contextChunks = req.body.useCourseMaterial
      ? await ragService.retrieveRelevantChunks(
          req.courseId,
          req.body.topic || req.body.question?.text || '',
          config
        )
      : [];
    if (req.body.useCourseMaterial && !contextChunks.length) {
      return res.status(400).json({ error: 'No indexed course material is available. Upload material first.' });
    }
    res.json(await aiQuizService.regenerateQuestion({ ...req.body, contextChunks }, config));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/ai/generate-explanation:
 *   post:
 *     summary: Generate a concise explanation for one draft question
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Validated explanation text
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
courseRouter.post('/:courseId/ai/generate-explanation', generationLimiter, async (req, res) => {
  try {
    const config = aiQuizService.getConfigForUser(req.user.id);
    res.json(await aiQuizService.generateExplanation(req.body, config));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/ai/drafts:
 *   get:
 *     summary: List the current user's AI drafts for an authorized course
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Owner-scoped AI draft summaries
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
courseRouter.get('/:courseId/ai/drafts', (req, res) => {
  try {
    res.json(aiQuizService.listQuizDrafts(req.courseId, req.user));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/ai/drafts/{draftId}:
 *   get:
 *     summary: Read one owner-scoped AI quiz draft
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: AI draft review data
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
courseRouter.get('/:courseId/ai/drafts/:draftId', (req, res) => {
  try {
    const draft = aiQuizService.getQuizDraft(
      parseRequiredPositiveInt(req.params.draftId, 'draftId'),
      req.user
    );
    if (Number(draft.courseId) !== req.courseId) {
      return res.status(404).json({ error: 'AI quiz draft not found.' });
    }
    res.json(draft);
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/ai/drafts/{draftId}:
 *   put:
 *     summary: Update one owner-scoped review draft
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Saved unpublished AI draft
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
courseRouter.put('/:courseId/ai/drafts/:draftId', (req, res) => {
  try {
    const draftId = parseRequiredPositiveInt(req.params.draftId, 'draftId');
    const existing = aiQuizService.getQuizDraft(draftId, req.user);
    if (Number(existing.courseId) !== req.courseId) {
      return res.status(404).json({ error: 'AI quiz draft not found.' });
    }
    res.json(aiQuizService.updateQuizDraft(draftId, req.body, req.user));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/ai/drafts/{draftId}/publish:
 *   post:
 *     summary: Manually publish a separately reviewed AI draft
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Published LMS quiz after explicit manual action
 *       409:
 *         $ref: '#/components/responses/409Conflict'
 */
courseRouter.post('/:courseId/ai/drafts/:draftId/publish', (req, res) => {
  try {
    const draftId = parseRequiredPositiveInt(req.params.draftId, 'draftId');
    const existing = aiQuizService.getQuizDraft(draftId, req.user);
    if (Number(existing.courseId) !== req.courseId) {
      return res.status(404).json({ error: 'AI quiz draft not found.' });
    }
    res.status(201).json(aiQuizService.publishQuizDraft(draftId, req.user));
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/quizzes/{quizId}/ai/add-questions:
 *   post:
 *     summary: Add reviewed AI draft questions to an authorized LMS draft quiz
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Updated LMS draft quiz
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
courseRouter.post('/:courseId/quizzes/:quizId/ai/add-questions', (req, res) => {
  try {
    const draftId = parseRequiredPositiveInt(req.body.draftId, 'draftId');
    const quizId = parseRequiredPositiveInt(req.params.quizId, 'quizId');
    const draft = aiQuizService.getQuizDraft(draftId, req.user);
    if (Number(draft.courseId) !== req.courseId) {
      return res.status(404).json({ error: 'AI quiz draft not found.' });
    }
    res.json(aiQuizService.addDraftQuestionsToQuiz(draftId, quizId, req.user));
  } catch (error) {
    sendError(res, error);
  }
});

function conversationId(req) {
  return parseRequiredPositiveInt(req.params.id, 'conversationId');
}

module.exports = settingsRouter;
module.exports.settingsRouter = settingsRouter;
module.exports.courseRouter = courseRouter;
