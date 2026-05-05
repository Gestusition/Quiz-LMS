const express = require('express');
const router = express.Router();
const validationIssueService = require('../services/validationIssueService');
const auditService = require('../services/auditService');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendError } = require('../utils/appError');

router.use(requireAuth);

router.get('/', requireRole(['admin', 'teacher']), (req, res) => {
  try {
    const filters = {
      entityType: req.query.entityType,
      entityId: req.query.entityId,
      severity: req.query.severity,
      status: req.query.status,
      relatedCourseId: req.query.relatedCourseId,
      relatedUserId: req.query.relatedUserId,
      page: req.query.page,
      limit: req.query.limit
    };

    if (req.user.role === 'teacher') {
      filters.relatedUserId = req.user.id;
    }

    res.json(validationIssueService.list(filters));
  } catch (err) {
    sendError(res, err, 400);
  }
});

router.post('/', requireRole(['admin', 'teacher']), (req, res) => {
  try {
    const created = validationIssueService.create({
      ...req.body,
      relatedUserId: req.body.relatedUserId || (req.user.role === 'teacher' ? req.user.id : null)
    });
    auditService.log({
      actorUserId: req.user.id,
      action: 'VALIDATION_ISSUE_CREATED',
      entityType: 'validation_issue',
      entityId: created.id,
      details: { entityType: created.entityType, entityId: created.entityId, severity: created.severity }
    });
    res.status(201).json(created);
  } catch (err) {
    sendError(res, err, 400);
  }
});

router.put('/:id/status', requireRole(['admin', 'teacher']), (req, res) => {
  try {
    const issueId = Number(req.params.id);
    const updated = validationIssueService.updateStatus(issueId, req.body.status, req.user.id);
    auditService.log({
      actorUserId: req.user.id,
      action: 'VALIDATION_ISSUE_UPDATED',
      entityType: 'validation_issue',
      entityId: updated.id,
      details: { status: updated.status }
    });
    res.json(updated);
  } catch (err) {
    sendError(res, err, 400);
  }
});

module.exports = router;
