const userRepository = require('../repositories/userRepository');
const sessionRepository = require('../repositories/sessionRepository');
const passwordResetRepository = require('../repositories/passwordResetRepository');
const profileRepository = require('../repositories/profileRepository');
const userService = require('./userService');
const {
  createOneTimeCode,
  createSessionToken,
  hashOneTimeCode,
  hashPassword,
  hashSessionToken,
  nowIso,
  sessionExpiryDate,
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

const RESETTABLE_ROLES = [roles.teacher, roles.student];
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60;

class AuthService {
  login(identifier, password) {
    if (!identifier || !password) {
      throw new Error('Username/email/student number and password are required.');
    }

    const user = userRepository.findByIdentifier(identifier);

    if (!user || user.status !== 'active') {
      throw new Error('Invalid email or password.');
    }

    if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      throw new Error('Invalid email or password.');
    }

    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = sessionExpiryDate();

    sessionRepository.create(user.id, tokenHash, expiresAt);

    return {
      token,
      expiresAt,
      user: serializeCurrentUser(user)
    };
  }

  logout(token) {
    if (!token) return true;
    sessionRepository.deleteByTokenHash(hashSessionToken(token));
    return true;
  }

  getUserByToken(token) {
    if (!token) return null;

    const row = sessionRepository.findUserByTokenHash(hashSessionToken(token));
    if (!row) return null;

    if (new Date(row.expiresAt).getTime() <= Date.now() || row.status !== 'active') {
      sessionRepository.deleteById(row.sessionId);
      return null;
    }

    sessionRepository.updateLastSeen(row.sessionId, nowIso());
    return serializeCurrentUser(row);
  }

  requestPasswordReset(identifier) {
    const requestedUsername = String(identifier || '').trim().toLowerCase();
    if (!requestedUsername) {
      throw new Error('Username, email, or student number is required.');
    }

    const user = userRepository.findResettableByIdentifier(requestedUsername);

    if (user && user.status === 'active' && RESETTABLE_ROLES.includes(user.role)) {
      passwordResetRepository.expireActiveForUser(user.id);
      passwordResetRepository.createRequested(user.id, user.username || requestedUsername);
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
      throw new Error('User not found.');
    }
    if (user.status !== 'active' || !RESETTABLE_ROLES.includes(user.role)) {
      throw new Error('Password reset codes can only be issued for active teachers and students.');
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
    const username = String(data.username || '').trim().toLowerCase();
    const code = String(data.code || '').trim();
    const newPassword = String(data.newPassword || '');

    if (!username || !code || !newPassword) {
      throw new Error('Username, reset code, and new password are required.');
    }
    validatePassword(newPassword);

    this.expireResetCodes();

    const user = userRepository.findByIdentifier(username);
    if (!user || user.status !== 'active' || !RESETTABLE_ROLES.includes(user.role)) {
      throw new Error('Invalid or expired reset code.');
    }
    if (verifyPassword(newPassword, user.passwordSalt, user.passwordHash)) {
      throw new Error('New password must be different from the current password.');
    }

    const reset = passwordResetRepository.findLatestIssuedForUser(user.id, nowIso());
    if (!reset || !verifyOneTimeCode(code, reset.codeHash)) {
      throw new Error('Invalid or expired reset code.');
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
      throw new Error('User not found.');
    }

    const username = validateUsername(data.username);
    const currentPassword = String(data.currentPassword || '');
    const newPassword = String(data.newPassword || '');

    if (!verifyPassword(currentPassword, existing.passwordSalt, existing.passwordHash)) {
      throw new Error('Current password is incorrect.');
    }
    if (username.toLowerCase() === String(existing.username || '').toLowerCase()) {
      throw new Error('New username must be different from the current username.');
    }
    if (verifyPassword(newPassword, existing.passwordSalt, existing.passwordHash)) {
      throw new Error('New password must be different from the current password.');
    }

    validatePassword(newPassword);

    const duplicateUsername = userRepository.findDuplicateUsername(username, userId);
    if (duplicateUsername) {
      throw new Error('A user with this username already exists.');
    }

    const hashed = hashPassword(newPassword);
    userRepository.withTransaction(() => {
      userRepository.updateOwnCredentials(userId, username, hashed, nowIso());
      sessionRepository.deleteOtherUserSessions(userId, hashSessionToken(token));
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
}

module.exports = new AuthService();
