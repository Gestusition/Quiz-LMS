const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { requireAuth, getSessionToken, SESSION_COOKIE_NAME } = require('../middleware/auth');
const { sendError } = require('../utils/appError');

function sessionCookieOptions(expiresAt) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    expires: new Date(expiresAt)
  };
}

function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/'
  });
}

function sendSession(res, session) {
  res.cookie(SESSION_COOKIE_NAME, session.token, sessionCookieOptions(session.expiresAt));
  res.json({
    expiresAt: session.expiresAt,
    user: session.user
  });
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email or academic identifier and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSession'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
router.post('/login', (req, res) => {
  try {
    const identifier = req.body.identifier || req.body.login || req.body.email || req.body.student_number;
    const session = authService.login(identifier, req.body.password);
    sendSession(res, session);
  } catch (err) {
    sendError(res, err, 401);
  }
});

/**
 * @swagger
 * /api/auth/password-reset/request:
 *   post:
 *     summary: Request a password reset code
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordResetRequest'
 *     responses:
 *       200:
 *         description: Reset code sent or request accepted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
router.post('/password-reset/request', (req, res) => {
  try {
    const identifier = req.body.identifier || req.body.login || req.body.username;
    res.json(authService.requestPasswordReset(identifier));
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/auth/password-reset/complete:
 *   post:
 *     summary: Complete password reset using a code
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordResetCompleteRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 */
router.post('/password-reset/complete', (req, res) => {
  try {
    res.json(authService.completePasswordReset(req.body));
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/auth/change-credentials:
 *   post:
 *     summary: Change current user's credentials
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeCredentialsRequest'
 *     responses:
 *       200:
 *         description: Credentials updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
router.post('/change-credentials', requireAuth, (req, res) => {
  try {
    const user = authService.changeOwnCredentials(req.user.id, req.authToken, req.body);
    res.json(user);
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
router.post('/logout', (req, res) => {
  authService.logout(getSessionToken(req));
  clearSessionCookie(res);
  res.json({ message: 'Logged out successfully.' });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CurrentUser'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
