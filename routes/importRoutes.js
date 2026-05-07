const express = require('express');
const router = express.Router();
const importService = require('../services/importService');
const auditService = require('../services/auditService');
const validationIssueService = require('../services/validationIssueService');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendError } = require('../utils/appError');

router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * @swagger
 * /api/imports/batches:
 *   get:
 *     summary: List import batches
 *     tags: [Imports]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [users, students, teachers, questions, enrollments]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [processed, partially_failed, failed, completed]
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
 *         description: Paginated import batches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ImportBatch'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
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

/**
 * @swagger
 * /api/imports/batches:
 *   post:
 *     summary: Create an import batch
 *     tags: [Imports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateImportBatchRequest'
 *     responses:
 *       201:
 *         description: Created import batch
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImportBatch'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
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

/**
 * @swagger
 * /api/imports/batches/{id}/errors:
 *   get:
 *     summary: List import errors for a batch
 *     tags: [Imports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [unresolved, fixed, ignored]
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
 *         description: Paginated import errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ImportError'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
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

/**
 * @swagger
 * /api/imports/batches/{id}/errors:
 *   post:
 *     summary: Create an import error for a batch
 *     tags: [Imports]
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
 *             $ref: '#/components/schemas/CreateImportErrorRequest'
 *     responses:
 *       201:
 *         description: Created import error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImportError'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
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

/**
 * @swagger
 * /api/imports/errors/{id}/resolve:
 *   put:
 *     summary: Resolve an import error
 *     tags: [Imports]
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
 *             $ref: '#/components/schemas/ResolveImportErrorRequest'
 *     responses:
 *       200:
 *         description: Updated import error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImportError'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
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
