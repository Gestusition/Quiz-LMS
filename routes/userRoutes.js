const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { validateId } = require('../middleware/validation');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List platform users
 *     tags: [Users]
 */
router.get('/', (req, res) => {
  try {
    res.json(authService.getAllUsers({
      role: req.query.role,
      search: req.query.search
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', validateId, (req, res) => {
  try {
    const user = authService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    res.status(201).json(authService.createUser(req.body));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', validateId, (req, res) => {
  try {
    res.json(authService.updateUser(req.params.id, req.body));
  } catch (err) {
    if (err.message === 'User not found.') return res.status(404).json({ error: err.message });
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', validateId, (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }
    authService.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    if (err.message === 'User not found.') return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
