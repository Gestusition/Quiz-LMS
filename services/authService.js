const { getDatabase } = require('../database/db');
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

const VALID_ROLES = ['admin', 'teacher', 'student'];
const RESETTABLE_ROLES = ['teacher', 'student'];
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60;

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    mustChangeCredentials: !!user.mustChangeCredentials,
    createdAt: user.createdAt
  };
}

class AuthService {
  login(identifier, password) {
    if (!identifier || !password) {
      throw new Error('Username/email and password are required.');
    }

    const db = getDatabase();
    const user = db.prepare(`
      SELECT * FROM users
      WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)
    `).get(String(identifier).trim(), String(identifier).trim());

    if (!user || user.status !== 'active') {
      throw new Error('Invalid email or password.');
    }

    if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      throw new Error('Invalid email or password.');
    }

    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = sessionExpiryDate();

    db.prepare(`
      INSERT INTO sessions (userId, tokenHash, expiresAt)
      VALUES (?, ?, ?)
    `).run(user.id, tokenHash, expiresAt);

    return {
      token,
      expiresAt,
      user: publicUser(user)
    };
  }

  logout(token) {
    if (!token) return true;

    const db = getDatabase();
    db.prepare('DELETE FROM sessions WHERE tokenHash = ?').run(hashSessionToken(token));
    return true;
  }

  getUserByToken(token) {
    if (!token) return null;

    const db = getDatabase();
    const row = db.prepare(`
      SELECT u.*, s.id as sessionId, s.expiresAt
      FROM sessions s
      JOIN users u ON u.id = s.userId
      WHERE s.tokenHash = ?
    `).get(hashSessionToken(token));

    if (!row) return null;

    if (new Date(row.expiresAt).getTime() <= Date.now() || row.status !== 'active') {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(row.sessionId);
      return null;
    }

    db.prepare('UPDATE sessions SET lastSeenAt = ? WHERE id = ?').run(nowIso(), row.sessionId);
    return publicUser(row);
  }

  createUser(data) {
    const payload = this.validateUserPayload(data, true);
    const db = getDatabase();

    const duplicate = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(payload.email);
    if (duplicate) {
      throw new Error('A user with this email already exists.');
    }

    const duplicateUsername = db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?)').get(payload.username);
    if (duplicateUsername) {
      throw new Error('A user with this username already exists.');
    }

    const hashed = hashPassword(payload.password);
    const result = db.prepare(`
      INSERT INTO users (name, username, email, role, passwordHash, passwordSalt, passwordAlgorithm, status, mustChangeCredentials)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      payload.name,
      payload.username,
      payload.email,
      payload.role,
      hashed.passwordHash,
      hashed.passwordSalt,
      hashed.passwordAlgorithm,
      payload.status,
      payload.mustChangeCredentials ? 1 : 0
    );
    this.syncRoleProfile(result.lastInsertRowid, payload);

    return this.getUserById(result.lastInsertRowid);
  }

  getAllUsers(filters = {}) {
    const db = getDatabase();
    let query = `
      SELECT id, name, email, role, status, createdAt
      , username, mustChangeCredentials
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (filters.role && VALID_ROLES.includes(filters.role)) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters.search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR username LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY role ASC, name ASC';
    return db.prepare(query).all(...params);
  }

  getUserById(id) {
    const db = getDatabase();
    const user = db.prepare(`
      SELECT id, name, username, email, role, status, mustChangeCredentials, createdAt
      FROM users
      WHERE id = ?
    `).get(id);
    return user || null;
  }

  requestPasswordReset(identifier) {
    const requestedUsername = String(identifier || '').trim().toLowerCase();
    if (!requestedUsername) {
      throw new Error('Username is required.');
    }

    const db = getDatabase();
    const user = db.prepare(`
      SELECT id, username, email, role, status
      FROM users
      WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)
    `).get(requestedUsername, requestedUsername);

    if (user && user.status === 'active' && RESETTABLE_ROLES.includes(user.role)) {
      db.prepare(`
        UPDATE password_reset_codes
        SET status = 'expired'
        WHERE userId = ?
          AND status IN ('requested', 'issued')
      `).run(user.id);

      db.prepare(`
        INSERT INTO password_reset_codes (userId, requestedUsername, status)
        VALUES (?, ?, 'requested')
      `).run(user.id, user.username || requestedUsername);
    }

    return {
      message: 'If the username matches an active teacher or student account, an admin reset request has been created.'
    };
  }

  getPasswordResetRequests() {
    const db = getDatabase();
    this.expireResetCodes(db);

    return db.prepare(`
      SELECT
        r.id,
        r.userId,
        r.requestedUsername,
        r.status,
        r.expiresAt,
        r.createdAt,
        r.issuedAt,
        u.name,
        u.username,
        u.email,
        u.role,
        u.status as userStatus
      FROM password_reset_codes r
      JOIN users u ON u.id = r.userId
      WHERE r.status IN ('requested', 'issued')
      ORDER BY r.createdAt DESC, r.id DESC
    `).all();
  }

  issuePasswordResetCode(userId) {
    const db = getDatabase();
    const user = db.prepare(`
      SELECT id, name, username, email, role, status
      FROM users
      WHERE id = ?
    `).get(userId);

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

    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare(`
        UPDATE password_reset_codes
        SET status = 'expired'
        WHERE userId = ?
          AND status IN ('requested', 'issued')
      `).run(user.id);

      const result = db.prepare(`
        INSERT INTO password_reset_codes (userId, requestedUsername, codeHash, status, expiresAt, issuedAt)
        VALUES (?, ?, ?, 'issued', ?, ?)
      `).run(user.id, user.username, codeHash, expiresAt, issuedAt);

      db.exec('COMMIT');

      return {
        id: result.lastInsertRowid,
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        code,
        expiresAt
      };
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }

  completePasswordReset(data) {
    const username = String(data.username || '').trim().toLowerCase();
    const code = String(data.code || '').trim();
    const newPassword = String(data.newPassword || '');

    if (!username || !code || !newPassword) {
      throw new Error('Username, reset code, and new password are required.');
    }
    this.validatePassword(newPassword);

    const db = getDatabase();
    this.expireResetCodes(db);

    const user = db.prepare(`
      SELECT *
      FROM users
      WHERE LOWER(username) = LOWER(?)
    `).get(username);
    if (!user || user.status !== 'active' || !RESETTABLE_ROLES.includes(user.role)) {
      throw new Error('Invalid or expired reset code.');
    }
    if (verifyPassword(newPassword, user.passwordSalt, user.passwordHash)) {
      throw new Error('New password must be different from the current password.');
    }

    const reset = db.prepare(`
      SELECT *
      FROM password_reset_codes
      WHERE userId = ?
        AND status = 'issued'
        AND expiresAt > ?
      ORDER BY id DESC
      LIMIT 1
    `).get(user.id, nowIso());
    if (!reset || !verifyOneTimeCode(code, reset.codeHash)) {
      throw new Error('Invalid or expired reset code.');
    }

    const hashed = hashPassword(newPassword);
    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare(`
        UPDATE users
        SET passwordHash = ?, passwordSalt = ?, passwordAlgorithm = ?, updatedAt = ?
        WHERE id = ?
      `).run(hashed.passwordHash, hashed.passwordSalt, hashed.passwordAlgorithm, nowIso(), user.id);
      db.prepare('DELETE FROM sessions WHERE userId = ?').run(user.id);
      db.prepare(`
        UPDATE password_reset_codes
        SET status = 'used', usedAt = ?
        WHERE id = ?
      `).run(nowIso(), reset.id);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    return { message: 'Password updated. Sign in with the new password.' };
  }

  updateUser(id, data) {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('User not found.');
    }

    const payload = this.validateUserPayload({
      name: data.name !== undefined ? data.name : existing.name,
      username: data.username !== undefined ? data.username : existing.username,
      email: data.email !== undefined ? data.email : existing.email,
      role: data.role !== undefined ? data.role : existing.role,
      status: data.status !== undefined ? data.status : existing.status,
      mustChangeCredentials: data.mustChangeCredentials !== undefined
        ? data.mustChangeCredentials
        : !!existing.mustChangeCredentials,
      password: data.password
    }, false);

    const duplicate = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?')
      .get(payload.email, id);
    if (duplicate) {
      throw new Error('A user with this email already exists.');
    }
    const duplicateUsername = db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?')
      .get(payload.username, id);
    if (duplicateUsername) {
      throw new Error('A user with this username already exists.');
    }

    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare(`
        UPDATE users
        SET name = ?, username = ?, email = ?, role = ?, status = ?, mustChangeCredentials = ?, updatedAt = ?
        WHERE id = ?
      `).run(
        payload.name,
        payload.username,
        payload.email,
        payload.role,
        payload.status,
        payload.mustChangeCredentials ? 1 : 0,
        nowIso(),
        id
      );

      if (payload.password) {
        const hashed = hashPassword(payload.password);
        db.prepare(`
          UPDATE users
          SET passwordHash = ?, passwordSalt = ?, passwordAlgorithm = ?, updatedAt = ?
          WHERE id = ?
        `).run(hashed.passwordHash, hashed.passwordSalt, hashed.passwordAlgorithm, nowIso(), id);
        db.prepare('DELETE FROM sessions WHERE userId = ?').run(id);
      }
      this.syncRoleProfile(id, payload);

      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    return this.getUserById(id);
  }

  setUserPassword(id, password) {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('User not found.');
    }

    const newPassword = String(password || '');
    this.validatePassword(newPassword);

    const hashed = hashPassword(newPassword);
    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare(`
        UPDATE users
        SET passwordHash = ?, passwordSalt = ?, passwordAlgorithm = ?, updatedAt = ?
        WHERE id = ?
      `).run(hashed.passwordHash, hashed.passwordSalt, hashed.passwordAlgorithm, nowIso(), id);
      db.prepare('DELETE FROM sessions WHERE userId = ?').run(id);
      db.prepare(`
        UPDATE password_reset_codes
        SET status = 'expired'
        WHERE userId = ?
          AND status IN ('requested', 'issued')
      `).run(id);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    return this.getUserById(id);
  }

  changeOwnCredentials(userId, token, data) {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!existing || existing.status !== 'active') {
      throw new Error('User not found.');
    }

    const username = this.validateUsername(data.username);
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

    this.validatePassword(newPassword);

    const duplicateUsername = db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?')
      .get(username, userId);
    if (duplicateUsername) {
      throw new Error('A user with this username already exists.');
    }

    const hashed = hashPassword(newPassword);
    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare(`
        UPDATE users
        SET username = ?, passwordHash = ?, passwordSalt = ?, passwordAlgorithm = ?,
          mustChangeCredentials = 0, updatedAt = ?
        WHERE id = ?
      `).run(
        username,
        hashed.passwordHash,
        hashed.passwordSalt,
        hashed.passwordAlgorithm,
        nowIso(),
        userId
      );

      const currentTokenHash = hashSessionToken(token);
      db.prepare('DELETE FROM sessions WHERE userId = ? AND tokenHash != ?').run(userId, currentTokenHash);
      db.prepare('UPDATE admin_profiles SET lastCredentialRotationAt = ?, updatedAt = ? WHERE userId = ?')
        .run(nowIso(), nowIso(), userId);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    return this.getUserById(userId);
  }

  deleteUser(id) {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('User not found.');
    }

    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare('DELETE FROM enrollments WHERE userId = ?').run(id);
      db.prepare('DELETE FROM quiz_attempts WHERE userId = ?').run(id);
      db.prepare('UPDATE courses SET createdBy = NULL WHERE createdBy = ?').run(id);
      db.prepare('UPDATE questions SET createdBy = NULL WHERE createdBy = ?').run(id);
      db.prepare('UPDATE quizzes SET createdBy = NULL WHERE createdBy = ?').run(id);
      db.prepare('UPDATE announcements SET createdBy = NULL WHERE createdBy = ?').run(id);
      db.prepare('UPDATE resources SET createdBy = NULL WHERE createdBy = ?').run(id);
      db.prepare('DELETE FROM password_reset_codes WHERE userId = ?').run(id);
      db.prepare('DELETE FROM admin_profiles WHERE userId = ?').run(id);
      db.prepare('DELETE FROM teacher_profiles WHERE userId = ?').run(id);
      db.prepare('DELETE FROM student_profiles WHERE userId = ?').run(id);
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
    return true;
  }

  validateUserPayload(data, requirePassword) {
    const name = String(data.name || '').trim();
    const username = this.validateUsername(data.username || usernameFromEmail(data.email));
    const email = String(data.email || '').trim().toLowerCase();
    const role = String(data.role || '').trim();
    const status = data.status ? String(data.status).trim() : 'active';
    const mustChangeCredentials = !!data.mustChangeCredentials;
    const password = data.password !== undefined ? String(data.password) : undefined;

    if (!name || name.length > 120) {
      throw new Error('User name is required and must be 120 characters or less.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('A valid email is required.');
    }
    if (!VALID_ROLES.includes(role)) {
      throw new Error(`Role must be one of: ${VALID_ROLES.join(', ')}.`);
    }
    if (!['active', 'disabled'].includes(status)) {
      throw new Error('Status must be active or disabled.');
    }
    if (requirePassword || password) {
      this.validatePassword(password);
    }

    return { name, username, email, role, status, mustChangeCredentials, password };
  }

  validateUsername(value) {
    const username = String(value || '').trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      throw new Error('Username must be 3-32 characters and use only letters, numbers, dots, underscores, or hyphens.');
    }
    return username;
  }

  validatePassword(password) {
    if (!password || password.length < 8 || password.length > 128) {
      throw new Error('Password must be between 8 and 128 characters.');
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      throw new Error('Password must include uppercase, lowercase, and number characters.');
    }
  }

  syncRoleProfile(userId, payload) {
    const db = getDatabase();
    db.prepare('DELETE FROM admin_profiles WHERE userId = ?').run(userId);
    db.prepare('DELETE FROM teacher_profiles WHERE userId = ?').run(userId);
    db.prepare('DELETE FROM student_profiles WHERE userId = ?').run(userId);

    if (payload.role === 'admin') {
      db.prepare(`
        INSERT INTO admin_profiles (userId, displayName, securityNotes)
        VALUES (?, ?, ?)
      `).run(userId, payload.name, payload.mustChangeCredentials ? 'Credential rotation required.' : '');
    } else if (payload.role === 'teacher') {
      db.prepare(`
        INSERT INTO teacher_profiles (userId, displayName, department)
        VALUES (?, ?, ?)
      `).run(userId, payload.name, 'General');
    } else if (payload.role === 'student') {
      db.prepare(`
        INSERT INTO student_profiles (userId, displayName, studentNumber)
        VALUES (?, ?, ?)
      `).run(userId, payload.name, `STU-${String(userId).padStart(4, '0')}`);
    }
  }

  expireResetCodes(db = getDatabase()) {
    db.prepare(`
      UPDATE password_reset_codes
      SET status = 'expired'
      WHERE status = 'issued'
        AND expiresAt != ''
        AND expiresAt <= ?
    `).run(nowIso());
  }
}

function usernameFromEmail(email) {
  const username = String(email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return username || '';
}

module.exports = new AuthService();
