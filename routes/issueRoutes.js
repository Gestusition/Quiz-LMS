const express = require('express');
const router = express.Router();
const validationIssueService = require('../services/validationIssueService');
const auditService = require('../services/auditService');
const { requireAuth, requireRole, canManageCourse } = require('../middleware/auth');
const { sendError } = require('../utils/appError');

router.use(requireAuth);

/**
 * @swagger
 * /api/issues:
 *   get:
 *     summary: List validation issues
 *     tags: [Issues]
 *     parameters:
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [info, warning, error, critical]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, resolved, ignored]
 *       - in: query
 *         name: relatedCourseId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: relatedUserId
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
 *         description: Paginated validation issues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ValidationIssue'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
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

/**
 * @swagger
 * /api/issues:
 *   post:
 *     summary: Create a validation issue
 *     tags: [Issues]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateValidationIssueRequest'
 *     responses:
 *       201:
 *         description: Created validation issue
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationIssue'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
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

/**
 * @swagger
 * /api/issues/{id}/status:
 *   put:
 *     summary: Update validation issue status
 *     tags: [Issues]
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
 *             $ref: '#/components/schemas/UpdateValidationIssueStatusRequest'
 *     responses:
 *       200:
 *         description: Updated validation issue
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationIssue'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
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
