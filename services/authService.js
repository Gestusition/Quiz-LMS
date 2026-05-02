const { getDatabase } = require('../database/db');
const {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  nowIso,
  sessionExpiryDate,
  verifyPassword
} = require('../utils/security');

const VALID_ROLES = ['admin', 'teacher', 'student'];

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt
  };
}

class AuthService {
  login(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(String(email).trim());

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

    const hashed = hashPassword(payload.password);
    const result = db.prepare(`
      INSERT INTO users (name, email, role, passwordHash, passwordSalt, passwordAlgorithm, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      payload.name,
      payload.email,
      payload.role,
      hashed.passwordHash,
      hashed.passwordSalt,
      hashed.passwordAlgorithm,
      payload.status
    );

    return this.getUserById(result.lastInsertRowid);
  }

  getAllUsers(filters = {}) {
    const db = getDatabase();
    let query = `
      SELECT id, name, email, role, status, createdAt
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (filters.role && VALID_ROLES.includes(filters.role)) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters.search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY role ASC, name ASC';
    return db.prepare(query).all(...params);
  }

  getUserById(id) {
    const db = getDatabase();
    const user = db.prepare(`
      SELECT id, name, email, role, status, createdAt
      FROM users
      WHERE id = ?
    `).get(id);
    return user || null;
  }

  updateUser(id, data) {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('User not found.');
    }

    const payload = this.validateUserPayload({
      name: data.name !== undefined ? data.name : existing.name,
      email: data.email !== undefined ? data.email : existing.email,
      role: data.role !== undefined ? data.role : existing.role,
      status: data.status !== undefined ? data.status : existing.status,
      password: data.password
    }, false);

    const duplicate = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?')
      .get(payload.email, id);
    if (duplicate) {
      throw new Error('A user with this email already exists.');
    }

    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare(`
        UPDATE users
        SET name = ?, email = ?, role = ?, status = ?, updatedAt = ?
        WHERE id = ?
      `).run(payload.name, payload.email, payload.role, payload.status, nowIso(), id);

      if (payload.password) {
        const hashed = hashPassword(payload.password);
        db.prepare(`
          UPDATE users
          SET passwordHash = ?, passwordSalt = ?, passwordAlgorithm = ?, updatedAt = ?
          WHERE id = ?
        `).run(hashed.passwordHash, hashed.passwordSalt, hashed.passwordAlgorithm, nowIso(), id);
        db.prepare('DELETE FROM sessions WHERE userId = ?').run(id);
      }

      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    return this.getUserById(id);
  }

  deleteUser(id) {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('User not found.');
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return true;
  }

  validateUserPayload(data, requirePassword) {
    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim().toLowerCase();
    const role = String(data.role || '').trim();
    const status = data.status ? String(data.status).trim() : 'active';
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
      if (!password || password.length < 8 || password.length > 128) {
        throw new Error('Password must be between 8 and 128 characters.');
      }
      if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        throw new Error('Password must include uppercase, lowercase, and number characters.');
      }
    }

    return { name, email, role, status, password };
  }
}

module.exports = new AuthService();
