const userRepository = require('../repositories/userRepository');
const sessionRepository = require('../repositories/sessionRepository');
const passwordResetRepository = require('../repositories/passwordResetRepository');
const profileRepository = require('../repositories/profileRepository');
const userService = require('./userService');
const {
  createOneTimeCode,
  hashOneTimeCode,
  hashPassword,
  hashSessionToken,
  nowIso,
  sessionExpiryDate,
  signJwt,
  verifyJwt,
  verifyOneTimeCode,
  verifyPassword
} = require('../utils/security');
const {
  validatePassword,
  validateUserPayload,
  validateUsername
} = require('../validators/authValidators');
const { roles } = require('../constants/enums');
const { serializeCurrentUser } = require('../serializers/userSerializer');
const restrictionService = require('./restrictionService');
const settingsService = require('./settingsService');
const {
  AppError,
  conflictError,
  notFoundError,
  unauthorizedError,
  validationError
} = require('../utils/appError');

const RESETTABLE_ROLES = [roles.teacher, roles.student];
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60;
const LOGIN_MATCH_TYPES_BY_ROLE = Object.freeze({
  [roles.admin]: ['email', 'username'],
  [roles.teacher]: ['email'],
  [roles.student]: ['student_number']
});

class AuthService {
  login(identifier, password) {
    if (!identifier || !password) {
      throw validationError('identifier', 'Email or academic identifier and password are required.');
    }

    const user = this.resolveLoginIdentifier(identifier);

    if (!user || user.status !== 'active') {
      throw unauthorizedError('Invalid credentials.');
    }

    if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      throw unauthorizedError('Invalid credentials.');
    }

    restrictionService.assertAccessAllowed({
      user,
      restrictionType: 'account_suspended',
      scopeType: 'global',
      safeMessage: 'Your account access is restricted. Please contact your instructor or administrator.'
    });
    settingsService.assertLoginAllowed(user);

    const expiresAt = sessionExpiryDate();
    const sessionResult = sessionRepository.createPendingJwt(user.id, expiresAt);
    const token = signJwt({ userId: user.id, role: user.role }, sessionResult.lastInsertRowid);
    const tokenHash = hashSessionToken(token);
    sessionRepository.updateTokenHash(sessionResult.lastInsertRowid, tokenHash);

    return {
      token,
      expiresAt,
      user: serializeCurrentUser(user)
    };
  }

  logout(token) {
    if (!token) return true;

    const decoded = verifyJwt(token);
    if (decoded && decoded.jti) {
      sessionRepository.deleteById(Number(decoded.jti));
      return true;
    }

    sessionRepository.deleteByTokenHash(hashSessionToken(token));
    return true;
  }

  getUserByToken(token) {
    if (!token) return null;

    const decoded = verifyJwt(token);
    if (decoded && decoded.sub && decoded.jti) {
      const session = sessionRepository.findById(Number(decoded.jti));
      if (!session) return null;
      if (session.tokenType !== 'jwt') return null;

      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        sessionRepository.deleteById(Number(decoded.jti));
        return null;
      }

      // Fetch user with full profile joins
      const user = userRepository.findPublicById(decoded.sub);
      if (!user || user.status !== 'active') {
        sessionRepository.deleteById(Number(decoded.jti));
        return null;
      }

      sessionRepository.updateLastSeen(Number(decoded.jti), nowIso());

      return serializeCurrentUser(user);
    }

    return null;
  }

  requestPasswordReset(identifier) {
    const requestedIdentifier = String(identifier || '').trim().toLowerCase();
    if (!requestedIdentifier) {
      throw validationError('identifier', 'Email or academic identifier is required.');
    }

    let user;
    try {
      user = this.resolveLoginIdentifier(requestedIdentifier, { forReset: true });
    } catch (err) {
      if (err instanceof AppError && err.status === 409) {
        user = null;
      } else {
        throw err;
      }
    }

    if (user && user.status === 'active' && RESETTABLE_ROLES.includes(user.role)) {
      passwordResetRepository.expireActiveForUser(user.id);
      passwordResetRepository.createRequested(user.id, user.username || requestedIdentifier);
    }

    return {
      message: 'If the identifier matches an active teacher or student account, an admin reset request has been created.'
    };
  }

  getPasswordResetRequests() {
    this.expireResetCodes();
    return passwordResetRepository.listActive();
  }

  issuePasswordResetCode(userId) {
    const user = userRepository.findResettableById(userId);

    if (!user) {
      throw notFoundError('User not found.');
    }
    if (user.status !== 'active' || !RESETTABLE_ROLES.includes(user.role)) {
      throw validationError('user', 'Password reset codes can only be issued for active teachers and students.');
    }

    const code = createOneTimeCode();
    const codeHash = hashOneTimeCode(code);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS).toISOString();
    const issuedAt = nowIso();

    const resetId = userRepository.withTransaction(() => {
      passwordResetRepository.expireActiveForUser(user.id);
      const result = passwordResetRepository.createIssued(user.id, user.username, codeHash, expiresAt, issuedAt);
      return result.lastInsertRowid;
    });

    return {
      id: resetId,
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      code,
      expiresAt
    };
  }

  completePasswordReset(data) {
    const identifier = String(data.identifier || data.username || data.login || '').trim().toLowerCase();
    const code = String(data.code || '').trim();
    const newPassword = String(data.newPassword || '');

    if (!identifier || !code || !newPassword) {
      throw validationError('identifier', 'Identifier, reset code, and new password are required.');
    }
    validatePassword(newPassword);

    this.expireResetCodes();

    const user = this.resolveLoginIdentifier(identifier, { forReset: true });
    if (!user || user.status !== 'active' || !RESETTABLE_ROLES.includes(user.role)) {
      throw validationError('code', 'Invalid or expired reset code.');
    }
    if (verifyPassword(newPassword, user.passwordSalt, user.passwordHash)) {
      throw validationError('new_password', 'New password must be different from the current password.');
    }

    const reset = passwordResetRepository.findLatestIssuedForUser(user.id, nowIso());
    if (!reset || !verifyOneTimeCode(code, reset.codeHash)) {
      throw validationError('code', 'Invalid or expired reset code.');
    }

    const hashed = hashPassword(newPassword);
    userRepository.withTransaction(() => {
      userRepository.updatePassword(user.id, hashed, nowIso());
      sessionRepository.deleteByUserId(user.id);
      passwordResetRepository.markUsed(reset.id, nowIso());
    });

    return { message: 'Password updated. Sign in with the new password.' };
  }

  changeOwnCredentials(userId, token, data) {
    const existing = userRepository.findById(userId);
    if (!existing || existing.status !== 'active') {
      throw notFoundError('User not found.');
    }

    const username = validateUsername(data.username);
    const currentPassword = String(data.currentPassword || '');
    const newPassword = String(data.newPassword || '');

    if (!verifyPassword(currentPassword, existing.passwordSalt, existing.passwordHash)) {
      throw validationError('current_password', 'Current password is incorrect.');
    }
    if (username.toLowerCase() === String(existing.username || '').toLowerCase()) {
      throw validationError('username', 'New username must be different from the current username.');
    }
    if (verifyPassword(newPassword, existing.passwordSalt, existing.passwordHash)) {
      throw validationError('new_password', 'New password must be different from the current password.');
    }

    validatePassword(newPassword);

    const duplicateUsername = userRepository.findDuplicateUsername(username, userId);
    if (duplicateUsername) {
      throw conflictError('username', 'A user with this username already exists.');
    }

    const hashed = hashPassword(newPassword);
    userRepository.withTransaction(() => {
      userRepository.updateOwnCredentials(userId, username, hashed, nowIso());

      // Invalidate all other sessions for this user except the current one
      const tokenHash = hashSessionToken(token);
      sessionRepository.deleteOtherUserSessions(userId, tokenHash);

      profileRepository.touchAdminCredentialRotation(userId, nowIso());
    });

    return userService.getUserById(userId);
  }

  createUser(data) {
    return userService.createUser(data);
  }

  getAllUsers(filters = {}) {
    return userService.getAllUsers(filters);
  }

  getUserById(id) {
    return userService.getUserById(id);
  }

  updateUser(id, data) {
    return userService.updateUser(id, data);
  }

  setUserPassword(id, password) {
    return userService.setUserPassword(id, password);
  }

  deleteUser(id) {
    return userService.deleteUser(id);
  }

  validateUserPayload(data, requirePassword) {
    return validateUserPayload(data, requirePassword);
  }

  validateUsername(value) {
    return validateUsername(value);
  }

  validatePassword(password) {
    return validatePassword(password);
  }

  expireResetCodes() {
    passwordResetRepository.expireIssuedBefore(nowIso());
  }

  resolveLoginIdentifier(identifier, { forReset = false } = {}) {
    const value = String(identifier || '').trim();
    const candidates = userRepository.findLoginCandidates(value);
    const uniqueUsers = [...new Map(candidates.map(item => [item.id, item])).values()];
    if (uniqueUsers.length > 1) {
      throw conflictError(
        'identifier',
        'This login identifier is ambiguous. Please use your email or contact administrator.'
      );
    }
    const priority = ['email', 'student_number', 'employee_number', 'username'];

    for (const type of priority) {
      const matches = candidates.filter(candidate => candidate.matchType === type);
      if (matches.length === 0) continue;
      const selected = matches[0];
      if (!forReset && !this.isAllowedLoginMatchType(selected.role, type)) {
        throw unauthorizedError('Invalid credentials.');
      }
      return forReset
        ? userRepository.findResettableById(selected.id)
        : selected;
    }

    return null;
  }

  findAuditSubjectForIdentifier(identifier) {
    return userRepository.findAuditIdentityCandidate(identifier);
  }

  isAllowedLoginMatchType(role, matchType) {
    const allowed = LOGIN_MATCH_TYPES_BY_ROLE[role] || ['email'];
    return allowed.includes(matchType);
  }
}

module.exports = new AuthService();
