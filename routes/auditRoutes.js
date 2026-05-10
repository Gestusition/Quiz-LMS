const express = require('express');
const router = express.Router();
const auditService = require('../services/auditService');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendError } = require('../utils/appError');
const { dateOnlyValue } = require('../utils/validation');

router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * @swagger
 * /api/audit:
 *   get:
 *     summary: List recent audit logs
 *     tags: [Audit]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 200
 *           default: 20
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Recent audit log entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuditLog'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.get('/', (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const date = dateOnlyValue(req.query.date, 'date');
    res.json(auditService.recent(limit, { date }));
  } catch (err) {
    sendError(res, err, 400);
  }
});

module.exports = router;
