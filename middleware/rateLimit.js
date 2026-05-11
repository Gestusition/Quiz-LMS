const { LIMITS } = require('../constants/limits');

// ─── Layer 1: Generic sliding-window rate limiter (per-IP, per-IP+identifier, etc.)
function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 20,
  maxBuckets = LIMITS.rateLimits.maxBuckets,
  key = defaultKey,
  message = 'Too many requests. Please try again later.'
} = {}) {
  const buckets = new Map();

  return (req, res, next) => {
    const now = Date.now();
    pruneExpiredBuckets(buckets, now);
    const bucketKey = key(req);
    const bucket = buckets.get(bucketKey) || { count: 0, resetAt: now + windowMs };

    bucket.count += 1;
    buckets.set(bucketKey, bucket);
    trimOldestBuckets(buckets, maxBuckets);

    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: message,
        retryAfterSeconds: retryAfter
      });
    }

    next();
  };
}

// ─── Layer 2: Per-account lockout with progressive backoff
// Tracks consecutive failed login attempts per normalized identifier.
// After `threshold` failures the account is locked for an escalating duration.
const _accountLockouts = new Map();

const LOCKOUT_CONFIG = Object.freeze({
  threshold: LIMITS.rateLimits.lockoutThreshold,           // failures before first lockout
  baseLockoutMs: LIMITS.rateLimits.lockoutBaseDurationMs,   // initial lockout (30 s)
  maxLockoutMs: LIMITS.rateLimits.lockoutMaxDurationMs,     // cap (30 min)
  escalationFactor: 2,                                      // doubles each wave
  maxTrackedAccounts: LIMITS.rateLimits.maxBuckets
});

function getAccountLockoutState(identifier) {
  const key = String(identifier || '').trim().toLowerCase();
  if (!key) return null;
  return _accountLockouts.get(key) || null;
}

/**
 * Middleware: rejects requests when the target account is currently locked out.
 * Must be placed BEFORE the route handler (and ideally before the IP rate limiter
 * so locked-out accounts get fast 429s without consuming an IP budget hit).
 */
function accountLockoutGuard(req, res, next) {
  const identifier = extractLoginIdentifier(req.body);
  if (!identifier) return next();

  const state = getAccountLockoutState(identifier);
  if (!state || !state.lockedUntil) return next();

  const now = Date.now();
  if (state.lockedUntil > now) {
    const retryAfter = Math.ceil((state.lockedUntil - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({
      error: 'Account temporarily locked due to too many failed login attempts. Please try again later.',
      retryAfterSeconds: retryAfter
    });
  }

  // Lock has expired — allow through (failures will persist until a success resets them)
  next();
}

/**
 * Record a failed login attempt for the given identifier.
 * If failures exceed the threshold, compute the next lockout duration.
 */
function recordLoginFailure(identifier) {
  const key = String(identifier || '').trim().toLowerCase();
  if (!key) return;

  pruneExpiredLockouts();

  const state = _accountLockouts.get(key) || { failures: 0, lockoutWave: 0, lockedUntil: null };
  state.failures += 1;

  if (state.failures >= LOCKOUT_CONFIG.threshold) {
    state.lockoutWave += 1;
    const duration = Math.min(
      LOCKOUT_CONFIG.baseLockoutMs * Math.pow(LOCKOUT_CONFIG.escalationFactor, state.lockoutWave - 1),
      LOCKOUT_CONFIG.maxLockoutMs
    );
    state.lockedUntil = Date.now() + duration;
    // Reset failure count so the next wave starts fresh after unlock
    state.failures = 0;
  }

  _accountLockouts.set(key, state);
  trimOldestBuckets(_accountLockouts, LOCKOUT_CONFIG.maxTrackedAccounts);
}

/**
 * Clear lockout state on successful login.
 */
function recordLoginSuccess(identifier) {
  const key = String(identifier || '').trim().toLowerCase();
  if (key) _accountLockouts.delete(key);
}

function pruneExpiredLockouts() {
  const now = Date.now();
  for (const [k, state] of _accountLockouts) {
    // Remove entries that have no active lock and no recent failures
    if (state.lockedUntil && state.lockedUntil <= now && state.failures === 0) {
      _accountLockouts.delete(k);
    }
  }
}

// ─── Key functions ──────────────────────────────────────────────────────
function defaultKey(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function identifierKey(req) {
  const identifier = extractLoginIdentifier(req.body);
  return `${defaultKey(req)}:${identifier || 'none'}`;
}

function extractLoginIdentifier(body = {}) {
  const aliases = ['identifier', 'login', 'email', 'student_number', 'username'];
  for (const alias of aliases) {
    const value = body && body[alias];
    if (value === undefined || value === null) continue;
    const normalized = String(value).trim().toLowerCase();
    if (normalized) return normalized;
  }
  return '';
}

// ─── Helpers ────────────────────────────────────────────────────────────
function pruneExpiredBuckets(buckets, now) {
  for (const [bucketKey, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(bucketKey);
  }
}

function trimOldestBuckets(buckets, maxBuckets) {
  if (!Number.isInteger(maxBuckets) || maxBuckets < 1) return;
  while (buckets.size > maxBuckets) {
    const firstKey = buckets.keys().next().value;
    buckets.delete(firstKey);
  }
}

// ─── Expose for testing ─────────────────────────────────────────────────
function _resetAllLockouts() {
  _accountLockouts.clear();
}

module.exports = {
  createRateLimiter,
  extractLoginIdentifier,
  identifierKey,
  accountLockoutGuard,
  recordLoginFailure,
  recordLoginSuccess,
  _resetAllLockouts
};
