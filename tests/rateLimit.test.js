const {
  createRateLimiter,
  identifierKey,
  accountLockoutGuard,
  recordLoginFailure,
  recordLoginSuccess,
  _resetAllLockouts
} = require('../middleware/rateLimit');

function runLimiter(limiter, req = {}) {
  const response = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  let nextCalled = false;
  limiter({
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
    body: {},
    ...req
  }, response, () => {
    nextCalled = true;
  });
  return { nextCalled, response };
}

describe('rate limiter middleware', () => {
  test('blocks requests after the configured limit', () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 2,
      key: identifierKey,
      message: 'Limited.'
    });
    const req = { body: { identifier: 'student@example.com' } };

    expect(runLimiter(limiter, req).nextCalled).toBe(true);
    expect(runLimiter(limiter, req).nextCalled).toBe(true);

    const blocked = runLimiter(limiter, req);
    expect(blocked.nextCalled).toBe(false);
    expect(blocked.response.statusCode).toBe(429);
    expect(blocked.response.body.error).toBe('Limited.');
    expect(blocked.response.headers['Retry-After']).toBeDefined();
  });

  test('tracks different identifiers separately and trims stale buckets', () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 1,
      maxBuckets: 1,
      key: req => req.body.identifier
    });

    expect(runLimiter(limiter, { body: { identifier: 'one' } }).nextCalled).toBe(true);
    expect(runLimiter(limiter, { body: { identifier: 'two' } }).nextCalled).toBe(true);

    const allowedAgainAfterTrim = runLimiter(limiter, { body: { identifier: 'one' } });
    expect(allowedAgainAfterTrim.nextCalled).toBe(true);
  });

  test('login identifier aliases normalize to real buckets instead of none', () => {
    const aliases = [
      { identifier: ' Student@Example.com ' },
      { login: 'Student@Example.com' },
      { email: 'student@example.com' },
      { student_number: ' STU-0003 ' },
      { username: 'Admin' }
    ];

    const keys = aliases.map(body => identifierKey({ ip: '127.0.0.1', body }));
    expect(keys[0]).toBe('127.0.0.1:student@example.com');
    expect(keys[1]).toBe(keys[0]);
    expect(keys[2]).toBe(keys[0]);
    expect(keys[3]).toBe('127.0.0.1:stu-0003');
    expect(keys[4]).toBe('127.0.0.1:admin');
    keys.forEach(key => expect(key.endsWith(':none')).toBe(false));
    expect(identifierKey({ body: {} })).toBe('unknown:none');
  });

  test('resets buckets after the window and handles account lockout helpers', () => {
    let now = 1_000;
    const nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now);

    try {
      const limiter = createRateLimiter({ windowMs: 10, max: 1 });
      expect(runLimiter(limiter).nextCalled).toBe(true);
      now = 1_011;
      expect(runLimiter(limiter).nextCalled).toBe(true);
    } finally {
      nowSpy.mockRestore();
    }

    _resetAllLockouts();
    recordLoginFailure('');
    expect(runLimiter(accountLockoutGuard, { body: {} }).nextCalled).toBe(true);

    for (let index = 0; index < 5; index += 1) {
      recordLoginFailure('locked@example.com');
    }
    const blocked = runLimiter(accountLockoutGuard, { body: { identifier: 'locked@example.com' } });
    expect(blocked.response.statusCode).toBe(429);

    recordLoginSuccess('locked@example.com');
    expect(runLimiter(accountLockoutGuard, { body: { identifier: 'locked@example.com' } }).nextCalled).toBe(true);
  });
});
