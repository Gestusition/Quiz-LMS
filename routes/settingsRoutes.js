const express = require('express');
const router = express.Router();
const settingsService = require('../services/settingsService');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendError } = require('../utils/appError');

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/maintenance', (req, res) => {
  try {
    res.json(settingsService.getMaintenanceMode());
  } catch (err) {
    sendError(res, err, 500);
  }
});

router.put('/maintenance', (req, res) => {
  try {
    res.json(settingsService.setMaintenanceMode(req.body.enabled, req.user));
  } catch (err) {
    sendError(res, err, 400);
  }
});

module.exports = router;
