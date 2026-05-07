const express = require('express');
const router = express.Router();
const restrictionService = require('../services/restrictionService');
const auditService = require('../services/auditService');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendError } = require('../utils/appError');

router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * @swagger
 * /api/restrictions:
 *   get:
 *     summary: List user restrictions
 *     tags: [Restrictions]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: restrictionType
 *         schema:
 *           type: string
 *           enum: [account_suspended, quiz_blocked, assignment_blocked, chat_muted, course_access_blocked, manual_review_required]
 *       - in: query
 *         name: scopeType
 *         schema:
 *           type: string
 *           enum: [global, course, quiz, assignment]
 *       - in: query
 *         name: scopeId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
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
 *         description: Paginated restrictions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserRestriction'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.get('/', (req, res) => {
  try {
    const result = restrictionService.list({
      userId: req.query.userId,
      restrictionType: req.query.restrictionType,
      scopeType: req.query.scopeType,
      scopeId: req.query.scopeId,
      activeOnly: req.query.activeOnly === 'true' || req.query.activeOnly === '1',
      page: req.query.page,
      limit: req.query.limit
    });
    res.json(result);
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/restrictions:
 *   post:
 *     summary: Create a user restriction
 *     tags: [Restrictions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRestrictionRequest'
 *     responses:
 *       201:
 *         description: Created restriction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRestriction'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.post('/', (req, res) => {
  try {
    const created = restrictionService.create(req.body, req.user.id);
    auditService.log({
      actorUserId: req.user.id,
      action: 'USER_RESTRICTED',
      entityType: 'user_restriction',
      entityId: created.id,
      details: {
        userId: created.userId,
        restrictionType: created.restrictionType,
        scopeType: created.scopeType,
        scopeId: created.scopeId
      }
    });
    res.status(201).json(created);
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/restrictions/{id}/deactivate:
 *   put:
 *     summary: Deactivate a user restriction
 *     tags: [Restrictions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deactivated restriction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRestriction'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.put('/:id/deactivate', (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = restrictionService.deactivate(id);
    auditService.log({
      actorUserId: req.user.id,
      action: 'RESTRICTION_REMOVED',
      entityType: 'user_restriction',
      entityId: updated.id,
      details: { userId: updated.userId }
    });
    res.json(updated);
  } catch (err) {
    sendError(res, err, 400);
  }
});

module.exports = router;
