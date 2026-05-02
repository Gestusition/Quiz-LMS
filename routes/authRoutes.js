const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/auth');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with username/email and password
 *     tags: [Auth]
 */
router.post('/login', (req, res) => {
  try {
    const identifier = req.body.username || req.body.email || req.body.identifier;
    const session = authService.login(identifier, req.body.password);
    res.json(session);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

router.post('/change-credentials', requireAuth, (req, res) => {
  try {
    const user = authService.changeOwnCredentials(req.user.id, req.authToken, req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
