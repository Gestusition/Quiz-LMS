const express = require('express');
const router = express.Router();
const importService = require('../services/importService');
const auditService = require('../services/auditService');
const validationIssueService = require('../services/validationIssueService');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendError } = require('../utils/appError');

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/batches', (req, res) => {
  try {
    res.json(importService.listBatches({
      type: req.query.type,
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit
    }));
  } catch (err) {
    sendError(res, err, 400);
  }
});

router.post('/batches', (req, res) => {
  try {
    const batch = importService.createBatch(req.body, req.user.id);
    auditService.log({
      actorUserId: req.user.id,
      action: 'IMPORT_BATCH_CREATED',
      entityType: 'import_batch',
      entityId: batch.id,
      details: { type: batch.type, fileName: batch.fileName }
    });
    res.status(201).json(batch);
  } catch (err) {
    sendError(res, err, 400);
  }
});

router.get('/batches/:id/errors', (req, res) => {
  try {
    const batchId = Number(req.params.id);
    res.json(importService.listErrors(batchId, {
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit
    }));
  } catch (err) {
    sendError(res, err, 400);
  }
});

router.post('/batches/:id/errors', (req, res) => {
  try {
    const batchId = Number(req.params.id);
    const error = importService.addError(batchId, req.body);
    validationIssueService.create({
      entityType: 'import_error',
      entityId: error.id,
      severity: 'warning',
      field: error.errorField,
      message: error.errorMessage,
      status: 'open',
      visibleToUser: false
    });
    auditService.log({
      actorUserId: req.user.id,
      action: 'IMPORT_ROW_INVALID',
      entityType: 'import_error',
      entityId: error.id,
      details: { batchId: error.batchId, rowNumber: error.rowNumber, field: error.errorField }
    });
    res.status(201).json(error);
  } catch (err) {
    sendError(res, err, 400);
  }
});

router.put('/errors/:id/resolve', (req, res) => {
  try {
    const errorId = Number(req.params.id);
    const updated = importService.resolveError(errorId, req.body, req.user.id);
    auditService.log({
      actorUserId: req.user.id,
      action: 'IMPORT_ROW_FIXED',
      entityType: 'import_error',
      entityId: updated.id,
      details: { status: updated.status }
    });
    res.json(updated);
  } catch (err) {
    sendError(res, err, 400);
  }
});

module.exports = router;
