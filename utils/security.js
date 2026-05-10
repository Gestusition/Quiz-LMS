const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const PASSWORD_KEY_LENGTH = 64;
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const JWT_ALGORITHM = 'HS256';

function getPasswordSpice() {
  if (process.env.NODE_ENV === 'production' && !process.env.PASSWORD_SPICE) {
    throw new Error('PASSWORD_SPICE is required in production.');
  }

  return process.env.PASSWORD_SPICE || 'quiz-web-local-development-spice';
}

function getJwtSecret() {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production.');
  }

  return process.env.JWT_SECRET || 'quiz-web-local-jwt-secret';
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required.');
  }

  const hash = crypto
    .scryptSync(`${password}${getPasswordSpice()}`, salt, PASSWORD_KEY_LENGTH)
    .toString('hex');

  return {
    passwordHash: hash,
    passwordSalt: salt,
    passwordAlgorithm: 'scrypt+salt+spice'
  };
}

function verifyPassword(password, salt, expectedHash) {
  if (!password || !salt || !expectedHash) return false;

  const candidate = crypto.scryptSync(
    `${password}${getPasswordSpice()}`,
    salt,
    Buffer.from(expectedHash, 'hex').length
  );
  const expected = Buffer.from(expectedHash, 'hex');

  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

function hashSessionToken(token) {
  return crypto
    .createHash('sha256')
    .update(`${token}${getPasswordSpice()}`)
    .digest('hex');
}

function createOneTimeCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

function hashOneTimeCode(code) {
  return crypto
    .createHash('sha256')
    .update(`${String(code || '').trim().toUpperCase()}${getPasswordSpice()}`)
    .digest('hex');
}

function verifyOneTimeCode(code, expectedHash) {
  if (!code || !expectedHash) return false;

  const candidate = Buffer.from(hashOneTimeCode(code), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');

  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

function sessionExpiryDate() {
  return new Date(Date.now() + SESSION_TTL_MS).toISOString();
}

function nowIso() {
  return new Date().toISOString();
}

// ── JWT functions ──────────────────────────────────────────────

/**
 * Sign a JWT for the authenticated user session.
 * @param {object} payload - { userId, role }
 * @param {number|string} sessionId - the sessions table row id
 * @returns {string} signed JWT
 */
function signJwt(payload, sessionId) {
  return jwt.sign(
    {
      sub: payload.userId,
      role: payload.role,
      jti: String(sessionId)
    },
    getJwtSecret(),
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: Math.floor(SESSION_TTL_MS / 1000) // seconds
    }
  );
}

/**
 * Verify a JWT and return the decoded payload.
 * @param {string} token
 * @returns {{ sub: number, role: string, jti: string, iat: number, exp: number } | null}
 */
function verifyJwt(token) {
  try {
    return jwt.verify(token, getJwtSecret(), {
      algorithms: [JWT_ALGORITHM],
      maxAge: Math.floor(SESSION_TTL_MS / 1000)
    });
  } catch (err) {
    return null;
  }
}

module.exports = {
  createOneTimeCode,
  hashPassword,
  hashOneTimeCode,
  hashSessionToken,
  nowIso,
  sessionExpiryDate,
  signJwt,
  verifyJwt,
  verifyOneTimeCode,
  verifyPassword
};
