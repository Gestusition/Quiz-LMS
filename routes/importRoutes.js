const express = require('express');
const router = express.Router();
const importService = require('../services/importService');
const auditService = require('../services/auditService');
const validationIssueService = require('../services/validationIssueService');
const { requireAuth, requireRole } = require('../middleware/auth');
const { importUpload } = require('../middleware/upload');
const { sendError, validationError } = require('../utils/appError');
const { dateOnlyValue, parseRequiredPositiveInt } = require('../utils/validation');

router.use(requireAuth);
router.use(requireRole('admin'));

function parseImportUpload(req, res, next) {
  if (!req.is('multipart/form-data')) return next();
  importUpload.single('file')(req, res, err => {
    if (err) return sendError(res, err, 400);
    next();
  });
}

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
 *           enum: [users, students, teachers, questions, courses, enrollments]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, completed_with_errors, failed]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
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
      date: dateOnlyValue(req.query.date, 'date'),
      page: req.query.page,
      limit: req.query.limit
    }));
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/imports/batches/{id}:
 *   get:
 *     summary: Get import batch details
 *     tags: [Imports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Import batch details with recent row errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImportBatchDetail'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.get('/batches/:id', (req, res) => {
  try {
    const batchId = parseRequiredPositiveInt(req.params.id, 'batchId');
    res.json(importService.getBatchDetail(batchId));
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [type, file]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [users, courses, enrollments]
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file only (.csv, text/csv compatible). Max size 100 MB.
 *           encoding:
 *             file:
 *               contentType: text/csv
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
router.post('/batches', parseImportUpload, (req, res) => {
  try {
    if (req.is('multipart/form-data') && !req.file) {
      throw validationError('file', 'CSV file is required.');
    }
    const batch = req.file
      ? importService.runCsvImport({
        type: req.body.type,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSizeBytes: req.file.size,
        buffer: req.file.buffer
      }, req.user)
      : importService.createBatch(req.body, req.user.id);
    auditService.log({
      actorUserId: req.user.id,
      action: req.file ? 'IMPORT_BATCH_RUN' : 'IMPORT_BATCH_CREATED',
      entityType: 'import_batch',
      entityId: batch.id,
      details: {
        type: batch.type,
        fileName: batch.fileName,
        fileType: batch.fileType,
        mimeType: batch.mimeType,
        fileSizeBytes: batch.fileSizeBytes,
        status: batch.status,
        totalRows: batch.totalRows,
        createdCount: batch.createdCount,
        updatedCount: batch.updatedCount,
        skippedCount: batch.skippedCount,
        validationErrorCount: batch.validationErrorCount,
        successRows: batch.successRows,
        failedRows: batch.failedRows
      }
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
    const batchId = parseRequiredPositiveInt(req.params.id, 'batchId');
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
    const batchId = parseRequiredPositiveInt(req.params.id, 'batchId');
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
    const errorId = parseRequiredPositiveInt(req.params.id, 'errorId');
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
