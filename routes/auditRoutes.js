const express = require('express');
const router = express.Router();
const auditService = require('../services/auditService');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/', (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  res.json(auditService.recent(limit));
});

module.exports = router;
