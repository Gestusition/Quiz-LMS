const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { validateId } = require('../middleware/validation');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List platform users (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, username, email, student number, cohort, or department
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.get('/', (req, res) => {
  try {
    res.json(userService.getAllUsers({
      role: req.query.role,
      search: req.query.search
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/password-reset-requests:
 *   get:
 *     summary: List users who requested a password reset (Admin only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of reset requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PasswordResetRequestStatus'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.get('/password-reset-requests', (req, res) => {
  try {
    res.json(authService.getPasswordResetRequests());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.get('/:id', validateId, (req, res) => {
  try {
    const user = userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
router.post('/', (req, res) => {
  try {
    res.status(201).json(userService.createUser(req.body));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update an existing user (Admin only)
 *     tags: [Users]
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
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.put('/:id', validateId, (req, res) => {
  try {
    res.json(userService.updateUser(req.params.id, req.body));
  } catch (err) {
    if (err.message === 'User not found.') return res.status(404).json({ error: err.message });
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/{id}/password:
 *   put:
 *     summary: Set user password (Admin only)
 *     tags: [Users]
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
 *             $ref: '#/components/schemas/SetUserPasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.put('/:id/password', validateId, (req, res) => {
  try {
    res.json(userService.setUserPassword(req.params.id, req.body.password));
  } catch (err) {
    if (err.message === 'User not found.') return res.status(404).json({ error: err.message });
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/{id}/password-reset-code:
 *   post:
 *     summary: Issue a password reset code for a user (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Reset code issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasswordResetCodeResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.post('/:id/password-reset-code', validateId, (req, res) => {
  try {
    res.status(201).json(authService.issuePasswordResetCode(req.params.id));
  } catch (err) {
    if (err.message === 'User not found.') return res.status(404).json({ error: err.message });
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.delete('/:id', validateId, (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }
    userService.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    if (err.message === 'User not found.') return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
