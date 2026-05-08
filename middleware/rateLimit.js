const { LIMITS } = require('../constants/limits');

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

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(bucketKey, bucket);
    trimOldestBuckets(buckets, maxBuckets);

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({ error: message });
    }

    next();
  };
}

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

module.exports = {
  createRateLimiter,
  extractLoginIdentifier,
  identifierKey
};
