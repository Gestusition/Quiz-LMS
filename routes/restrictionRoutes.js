const express = require('express');
const router = express.Router();
const restrictionService = require('../services/restrictionService');
const auditService = require('../services/auditService');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendError } = require('../utils/appError');

router.use(requireAuth);
router.use(requireRole('admin'));

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
