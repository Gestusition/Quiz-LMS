const express = require('express');
const router = express.Router();
const validationIssueService = require('../services/validationIssueService');
const auditService = require('../services/auditService');
const { requireAuth, requireRole, canManageCourse } = require('../middleware/auth');
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

    if (req.user.role === 'teacher' && filters.relatedCourseId) {
      if (!canManageCourse(req.user, Number(filters.relatedCourseId))) {
        return res.status(403).json({ error: 'Teacher or admin course access required.' });
      }
      delete filters.relatedUserId;
    } else if (req.user.role === 'teacher') {
      filters.relatedUserId = req.user.id;
    }

    res.json(validationIssueService.list(filters));
  } catch (err) {
    sendError(res, err, 400);
  }
});

router.post('/', requireRole(['admin', 'teacher']), (req, res) => {
  try {
    const relatedCourseId = req.body.relatedCourseId ? Number(req.body.relatedCourseId) : null;
    if (req.user.role === 'teacher' && relatedCourseId && !canManageCourse(req.user, relatedCourseId)) {
      return res.status(403).json({ error: 'Teacher or admin course access required.' });
    }
    const created = validationIssueService.create({
      ...req.body,
      relatedUserId: req.user.role === 'teacher' && !relatedCourseId
        ? req.user.id
        : (req.body.relatedUserId || null)
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
    if (!Number.isInteger(issueId) || issueId < 1) {
      return res.status(400).json({ error: 'Invalid validation issue ID.' });
    }
    const issue = validationIssueService.getById(issueId);
    if (req.user.role === 'teacher') {
      const canUpdateOwn = Number(issue.relatedUserId) === Number(req.user.id);
      const canUpdateCourse = issue.relatedCourseId && canManageCourse(req.user, Number(issue.relatedCourseId));
      if (!canUpdateOwn && !canUpdateCourse) {
        return res.status(403).json({ error: 'Teacher or admin course access required.' });
      }
    }
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
