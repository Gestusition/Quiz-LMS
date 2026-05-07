const express = require('express');
const router = express.Router();
const discussionService = require('../services/discussionService');
const auditService = require('../services/auditService');
const { requireAuth } = require('../middleware/auth');
const { sendError } = require('../utils/appError');

router.use(requireAuth);

/**
 * @swagger
 * /api/discussion/courses/{courseId}/threads:
 *   get:
 *     summary: List course discussion threads
 *     tags: [Discussion]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, locked, archived]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated discussion threads
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DiscussionThread'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.get('/courses/:courseId/threads', (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    res.json(discussionService.listThreads(courseId, req.user, {
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit
    }));
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/discussion/courses/{courseId}/threads:
 *   post:
 *     summary: Create a course discussion thread
 *     tags: [Discussion]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDiscussionThreadRequest'
 *     responses:
 *       201:
 *         description: Created discussion thread
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscussionThread'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.post('/courses/:courseId/threads', (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const thread = discussionService.createThread(courseId, req.user, req.body);
    auditService.log({
      actorUserId: req.user.id,
      action: 'DISCUSSION_POSTED',
      entityType: 'course_thread',
      entityId: thread.id,
      details: { courseId }
    });
    res.status(201).json(thread);
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/discussion/threads/{id}/status:
 *   put:
 *     summary: Update discussion thread status
 *     tags: [Discussion]
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
 *             $ref: '#/components/schemas/UpdateDiscussionThreadStatusRequest'
 *     responses:
 *       200:
 *         description: Updated discussion thread
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscussionThread'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.put('/threads/:id/status', (req, res) => {
  try {
    const threadId = Number(req.params.id);
    const thread = discussionService.updateThreadStatus(threadId, req.user, req.body.status);
    res.json(thread);
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/discussion/threads/{id}/replies:
 *   get:
 *     summary: List replies for a discussion thread
 *     tags: [Discussion]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated discussion replies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DiscussionReply'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.get('/threads/:id/replies', (req, res) => {
  try {
    const threadId = Number(req.params.id);
    res.json(discussionService.listReplies(threadId, req.user, {
      page: req.query.page,
      limit: req.query.limit
    }));
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/discussion/threads/{id}/replies:
 *   post:
 *     summary: Create a reply on a discussion thread
 *     tags: [Discussion]
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
 *             $ref: '#/components/schemas/CreateDiscussionReplyRequest'
 *     responses:
 *       201:
 *         description: Created discussion reply
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscussionReply'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.post('/threads/:id/replies', (req, res) => {
  try {
    const threadId = Number(req.params.id);
    const reply = discussionService.createReply(threadId, req.user, req.body);
    auditService.log({
      actorUserId: req.user.id,
      action: 'DISCUSSION_POSTED',
      entityType: 'course_thread_reply',
      entityId: reply ? reply.id : null,
      details: { threadId }
    });
    res.status(201).json(reply);
  } catch (err) {
    sendError(res, err, 400);
  }
});

module.exports = router;
