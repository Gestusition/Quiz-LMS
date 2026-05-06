const crypto = require('crypto');

const PASSWORD_KEY_LENGTH = 64;
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

function getPasswordSpice() {
  if (process.env.NODE_ENV === 'production' && !process.env.PASSWORD_SPICE) {
    throw new Error('PASSWORD_SPICE is required in production.');
  }

  return process.env.PASSWORD_SPICE || 'quiz-web-local-development-spice';
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

function createSessionToken() {
  return crypto.randomBytes(32).toString('base64url');
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

module.exports = {
  createOneTimeCode,
  createSessionToken,
  hashPassword,
  hashOneTimeCode,
  hashSessionToken,
  nowIso,
  sessionExpiryDate,
  verifyOneTimeCode,
  verifyPassword
};
