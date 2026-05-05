const express = require('express');
const router = express.Router();
const discussionService = require('../services/discussionService');
const auditService = require('../services/auditService');
const { requireAuth } = require('../middleware/auth');
const { sendError } = require('../utils/appError');

router.use(requireAuth);

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

router.put('/threads/:id/status', (req, res) => {
  try {
    const threadId = Number(req.params.id);
    const thread = discussionService.updateThreadStatus(threadId, req.user, req.body.status);
    res.json(thread);
  } catch (err) {
    sendError(res, err, 400);
  }
});

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
