const express = require('express');
const router = express.Router();
const settingsService = require('../services/settingsService');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendError } = require('../utils/appError');

router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * @swagger
 * /api/settings/maintenance:
 *   get:
 *     summary: Get maintenance mode status (Admin only)
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Current maintenance mode setting
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaintenanceMode'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.get('/maintenance', (req, res) => {
  try {
    res.json(settingsService.getMaintenanceMode());
  } catch (err) {
    sendError(res, err, 500);
  }
});

/**
 * @swagger
 * /api/settings/maintenance:
 *   put:
 *     summary: Enable or disable maintenance mode (Admin only)
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMaintenanceModeRequest'
 *     responses:
 *       200:
 *         description: Updated maintenance mode setting; enabling revokes teacher/student sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaintenanceMode'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.put('/maintenance', (req, res) => {
  try {
    res.json(settingsService.setMaintenanceMode(req.body.enabled, req.user));
  } catch (err) {
    sendError(res, err, 400);
  }
});

module.exports = router;
