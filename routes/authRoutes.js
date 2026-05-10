const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const auditService = require('../services/auditService');
const { authenticate, extractToken } = require('../middleware/auth');
const {
  createRateLimiter,
  extractLoginIdentifier,
  identifierKey,
  accountLockoutGuard,
  recordLoginFailure,
  recordLoginSuccess
} = require('../middleware/rateLimit');
const { sendError } = require('../utils/appError');
const { LIMITS } = require('../constants/limits');

// ── Rate Limiters ────────────────────────────────────────────

const loginIpLimiter = createRateLimiter({
  windowMs: LIMITS.rateLimits.loginGlobalIpWindowMs,
  max: LIMITS.rateLimits.loginGlobalIpMax,
  message: 'Too many login attempts from this address. Please try again later.'
});

const loginLimiter = createRateLimiter({
  windowMs: LIMITS.rateLimits.loginWindowMs,
  max: LIMITS.rateLimits.loginMax,
  key: identifierKey,
  message: 'Too many login attempts. Please try again later.'
});

const resetLimiter = createRateLimiter({
  windowMs: LIMITS.rateLimits.passwordResetWindowMs,
  max: LIMITS.rateLimits.passwordResetMax,
  key: identifierKey,
  message: 'Too many password reset attempts. Please try again later.'
});

// ── Session cookie helpers ───────────────────────────────────

const SESSION_COOKIE_NAME = 'auth_token';

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

function auditFailedLogin(req, identifier, err) {
  const subject = authService.findAuditSubjectForIdentifier(identifier);
  if (!subject) return;

  auditService.log({
    actorUserId: subject.id,
    action: 'LOGIN_FAILED',
    entityType: 'user',
    entityId: subject.id,
    details: {
      identifierType: subject.matchType,
      identifier: String(identifier || '').trim(),
      reason: loginFailureReason(err),
      ip: req.ip || req.socket?.remoteAddress || '',
      userAgent: String(req.get('user-agent') || '').slice(0, 200)
    }
  });
}

function loginFailureReason(err) {
  if (err && err.status === 403) return 'access_restricted';
  if (err && err.status === 409) return 'ambiguous_identifier';
  if (err && err.status === 400) return 'invalid_request';
  return 'invalid_credentials';
}

// ── Routes ───────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with role-specific academic identifier and password
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
 *       429:
 *         description: Too many login attempts (rate-limited or account locked)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 retryAfterSeconds:
 *                   type: integer
 */
router.post('/login',
  loginIpLimiter,
  accountLockoutGuard,
  loginLimiter,
  (req, res) => {
    try {
      const identifier = extractLoginIdentifier(req.body);
      const session = authService.login(identifier, req.body.password);
      recordLoginSuccess(identifier);
      sendSession(res, session);
    } catch (err) {
      const identifier = extractLoginIdentifier(req.body);
      recordLoginFailure(identifier);
      auditFailedLogin(req, identifier, err);
      sendError(res, err, 401);
    }
  }
);

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
router.post('/password-reset/request', resetLimiter, (req, res) => {
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
router.post('/password-reset/complete', resetLimiter, (req, res) => {
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
router.post('/change-credentials', authenticate, (req, res) => {
  try {
    const user = authService.changeOwnCredentials(req.userId, req.token, req.body);
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
  const token = extractToken(req);
  authService.logout(token);
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
router.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});

module.exports = router;
