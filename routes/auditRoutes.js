const express = require('express');
const router = express.Router();
const auditService = require('../services/auditService');
const { requireAuth, requireRole } = require('../middleware/auth');

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
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  res.json(auditService.recent(limit));
});

module.exports = router;
