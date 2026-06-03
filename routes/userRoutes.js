const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const authService = require('../services/authService');
const { validateId } = require('../middleware/validation');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendError } = require('../utils/appError');

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
 *         description: Search by name, username, email, student number, employee number, cohort, or department
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, disabled]
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: classYearId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.get('/', (req, res) => {
  try {
    res.json(userService.getAllUsers({
      role: req.query.role,
      search: req.query.search,
      status: req.query.status,
      departmentId: req.query.departmentId,
      classYearId: req.query.classYearId,
      sectionId: req.query.sectionId,
      page: req.query.page,
      limit: req.query.limit
    }));
  } catch (err) {
    sendError(res, err, 400);
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
    sendError(res, err, 500);
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
    sendError(res, err, 500);
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
    res.status(201).json(userService.createUser(req.body, req.user.id));
  } catch (err) {
    sendError(res, err, 400);
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
    res.json(userService.updateUser(req.params.id, req.body, req.user.id));
  } catch (err) {
    sendError(res, err, 400);
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
    res.json(userService.setUserPassword(req.params.id, req.body.password, req.user.id));
  } catch (err) {
    sendError(res, err, 400);
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
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only; initial admin is protected)
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
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
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
    sendError(res, err, 500);
  }
});

module.exports = router;
