const express = require('express');
const router = express.Router();
const academicService = require('../services/academicService');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

/**
 * @swagger
 * /api/analytics/admin:
 *   get:
 *     summary: Get admin academic analytics
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Admin analytics summary
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.get('/admin', requireRole('admin'), (req, res) => {
  try {
    res.json(academicService.adminAnalytics());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
