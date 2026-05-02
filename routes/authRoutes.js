const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/auth');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 */
router.post('/login', (req, res) => {
  try {
    const session = authService.login(req.body.email, req.body.password);
    res.json(session);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

router.post('/logout', requireAuth, (req, res) => {
  authService.logout(req.authToken);
  res.json({ message: 'Logged out successfully.' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
