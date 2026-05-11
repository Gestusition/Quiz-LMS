const path = require('path');
const fs = require('fs');
const {
  initDatabase,
  seedDatabase,
  closeDatabase,
  getDatabase,
  resolveDatabaseFiles
} = require('../database/db');
const authService = require('../services/authService');
const settingsService = require('../services/settingsService');
const courseService = require('../services/courseService');
const settingsRepository = require('../repositories/settingsRepository');
const sessionRepository = require('../repositories/sessionRepository');
const { verifyJwt } = require('../utils/security');
const {
  authenticate,
  optionallyAuthenticate,
  validateSession,
  requireRole,
  extractToken,
  canAccessCourse,
  canManageCourse
} = require('../middleware/auth');

const TEST_DB = path.join(__dirname, 'test_auth_middleware_edges.db');

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

function fakeResponse() {
  return {
    statusCode: 200,
    body: null,
    clearedCookies: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    clearCookie(name, options) {
      this.clearedCookies.push({ name, options });
      return this;
    }
  };
}

function runMiddleware(middleware, req = {}) {
  const request = {
    headers: {},
    originalUrl: '/api/courses',
    path: '/api/courses',
    ...req
  };
  const response = fakeResponse();
  const next = jest.fn();
  middleware(request, response, next);
  return { req: request, res: response, next };
}

function cookieFor(session) {
  return `theme=light; auth_token=${session.token}; other=value`;
}

let ctx;

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();
  settingsService.setMaintenanceMode(false);

  const stamp = String(Date.now()).slice(-6);
  const admin = authService.createUser({
    name: `Middleware Admin ${stamp}`,
    username: `mw-admin-${stamp}`,
    email: `mw-admin-${stamp}@example.com`,
    role: 'admin',
    password: 'Middleware123!'
  });
  const teacher = authService.createUser({
    name: `Middleware Teacher ${stamp}`,
    username: `mw-teacher-${stamp}`,
    email: `mw-teacher-${stamp}@example.com`,
    role: 'teacher',
    password: 'Middleware123!',
    staffNumber: `MWT-${stamp}`
  });
  const student = authService.createUser({
    name: `Middleware Student ${stamp}`,
    username: `mw-student-${stamp}`,
    email: `mw-student-${stamp}@example.com`,
    role: 'student',
    password: 'Middleware123!',
    studentNumber: `MWS-${stamp}`
  });
  const course = courseService.create({
    code: `MW-${stamp}`,
    title: `Middleware Course ${stamp}`,
    visibility: 'published'
  }, teacher);
  courseService.enroll(course.id, student.id, 'student');

  ctx = { admin, teacher, student, course };
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('auth middleware edge branches', () => {
  test('extracts only the auth cookie token', () => {
    expect(extractToken({ headers: {} })).toBe('');
    expect(extractToken({ headers: { cookie: 'theme=dark' } })).toBe('');
    expect(extractToken({ headers: { cookie: 'theme=dark; auth_token=abc123; mode=test' } })).toBe('abc123');
  });

  test('authenticate handles missing, invalid, valid, and credential-change sessions', () => {
    expect(runMiddleware(authenticate).res.statusCode).toBe(401);
    expect(runMiddleware(authenticate, { headers: { cookie: 'auth_token=bad-token' } }).res.body.message)
      .toMatch(/invalid/i);

    const session = authService.login(ctx.teacher.email, 'Middleware123!');
    const valid = runMiddleware(authenticate, { headers: { cookie: cookieFor(session) } });
    expect(valid.next).toHaveBeenCalled();
    expect(valid.req.user.id).toBe(ctx.teacher.id);
    expect(valid.req.ctx.sessionId).toBeGreaterThan(0);

    const seededAdminSession = authService.login('admin', 'Admin123!');
    const blocked = runMiddleware(authenticate, {
      originalUrl: '/api/courses',
      path: '/api/courses',
      headers: { cookie: cookieFor(seededAdminSession) }
    });
    expect(blocked.res.statusCode).toBe(403);
    expect(blocked.res.body.code).toBe('CREDENTIAL_CHANGE_REQUIRED');

    const allowedAuthRoute = runMiddleware(authenticate, {
      originalUrl: '/api/auth/me',
      path: '/api/auth/me',
      headers: { cookie: cookieFor(seededAdminSession) }
    });
    expect(allowedAuthRoute.next).toHaveBeenCalled();
  });

  test('authenticate revokes expired and inactive-user sessions', () => {
    const expiredSession = authService.login(ctx.teacher.email, 'Middleware123!');
    const expiredDecoded = verifyJwt(expiredSession.token);
    getDatabase().prepare('UPDATE sessions SET expiresAt = ? WHERE id = ?')
      .run('2000-01-01T00:00:00.000Z', Number(expiredDecoded.jti));

    const expired = runMiddleware(authenticate, { headers: { cookie: cookieFor(expiredSession) } });
    expect(expired.res.statusCode).toBe(401);
    expect(getDatabase().prepare('SELECT id FROM sessions WHERE id = ?').get(Number(expiredDecoded.jti))).toBeUndefined();

    const stamp = String(Date.now()).slice(-6);
    const disabled = authService.createUser({
      name: `Middleware Disabled ${stamp}`,
      username: `mw-disabled-${stamp}`,
      email: `mw-disabled-${stamp}@example.com`,
      role: 'teacher',
      password: 'Middleware123!',
      staffNumber: `MWD-${stamp}`
    });
    const disabledSession = authService.login(disabled.email, 'Middleware123!');
    const disabledDecoded = verifyJwt(disabledSession.token);
    getDatabase().prepare("UPDATE users SET status = 'disabled' WHERE id = ?").run(disabled.id);

    const inactive = runMiddleware(authenticate, { headers: { cookie: cookieFor(disabledSession) } });
    expect(inactive.res.statusCode).toBe(401);
    expect(getDatabase().prepare('SELECT id FROM sessions WHERE id = ?').get(Number(disabledDecoded.jti))).toBeUndefined();
  });

  test('authenticate clears blocked role sessions during maintenance mode', () => {
    const teacherSession = authService.login(ctx.teacher.email, 'Middleware123!');
    settingsRepository.upsert('maintenance_mode', 'true');

    const blocked = runMiddleware(authenticate, { headers: { cookie: cookieFor(teacherSession) } });
    expect(blocked.res.statusCode).toBe(401);
    expect(blocked.res.body.code).toBe(settingsService.MAINTENANCE_MODE_CODE);
    expect(blocked.res.clearedCookies[0].name).toBe('auth_token');

    settingsRepository.upsert('maintenance_mode', 'false');
  });

  test('optional auth always continues while attaching valid users', () => {
    settingsRepository.upsert('maintenance_mode', 'false');
    expect(runMiddleware(optionallyAuthenticate).next).toHaveBeenCalled();
    expect(runMiddleware(optionallyAuthenticate, { headers: { cookie: 'auth_token=bad' } }).next).toHaveBeenCalled();

    const session = authService.login(ctx.student.studentNumber, 'Middleware123!');
    const valid = runMiddleware(optionallyAuthenticate, { headers: { cookie: cookieFor(session) } });
    expect(valid.next).toHaveBeenCalled();
    expect(valid.req.user.id).toBe(ctx.student.id);

    const teacherBeforeBlock = authService.login(ctx.teacher.email, 'Middleware123!');
    settingsRepository.upsert('maintenance_mode', 'true');
    const maintenanceSession = authService.login(ctx.admin.username, 'Middleware123!');
    const adminResult = runMiddleware(optionallyAuthenticate, { headers: { cookie: cookieFor(maintenanceSession) } });
    expect(adminResult.req.user.role).toBe('admin');

    const blocked = runMiddleware(optionallyAuthenticate, { headers: { cookie: cookieFor(teacherBeforeBlock) } });
    expect(blocked.next).toHaveBeenCalled();
    expect(blocked.res.clearedCookies[0].name).toBe('auth_token');
    expect(blocked.req.user).toBeUndefined();
    settingsRepository.upsert('maintenance_mode', 'false');
  });

  test('middleware catches repository failures without leaking details', () => {
    const session = authService.login(ctx.teacher.email, 'Middleware123!');
    const spy = jest.spyOn(sessionRepository, 'findById').mockImplementation(() => {
      throw new Error('session store down');
    });

    try {
      const authenticated = runMiddleware(authenticate, { headers: { cookie: cookieFor(session) } });
      expect(authenticated.res.statusCode).toBe(500);
      expect(authenticated.res.body.message).toMatch(/internal error/i);

      const validated = runMiddleware(validateSession, { headers: { cookie: cookieFor(session) } });
      expect(validated.res.statusCode).toBe(500);
      expect(validated.res.body.message).toMatch(/validation failed/i);

      const optional = runMiddleware(optionallyAuthenticate, { headers: { cookie: cookieFor(session) } });
      expect(optional.next).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  test('validateSession handles token states and maintenance blocks', () => {
    settingsRepository.upsert('maintenance_mode', 'false');
    expect(runMiddleware(validateSession).res.body.message).toMatch(/missing/i);
    expect(runMiddleware(validateSession, { headers: { cookie: 'auth_token=bad' } }).res.body.message)
      .toMatch(/invalid/i);

    const session = authService.login(ctx.admin.username, 'Middleware123!');
    const valid = runMiddleware(validateSession, { headers: { cookie: cookieFor(session) } });
    expect(valid.next).toHaveBeenCalled();

    authService.logout(session.token);
    const revoked = runMiddleware(validateSession, { headers: { cookie: cookieFor(session) } });
    expect(revoked.res.statusCode).toBe(401);

    const teacherSession = authService.login(ctx.teacher.email, 'Middleware123!');
    settingsRepository.upsert('maintenance_mode', 'true');
    const blocked = runMiddleware(validateSession, { headers: { cookie: cookieFor(teacherSession) } });
    expect(blocked.res.statusCode).toBe(401);
    expect(blocked.res.body.code).toBe(settingsService.MAINTENANCE_MODE_CODE);
    expect(blocked.res.clearedCookies[0].options.httpOnly).toBe(true);
    settingsRepository.upsert('maintenance_mode', 'false');
  });

  test('role and course-access helpers expose expected decisions', () => {
    expect(runMiddleware(requireRole('admin'), { userRole: undefined }).res.statusCode).toBe(403);
    expect(runMiddleware(requireRole('admin'), { userRole: 'teacher' }).res.body.message).toMatch(/admin/i);
    expect(runMiddleware(requireRole(['admin', 'teacher']), { userRole: 'teacher' }).next).toHaveBeenCalled();

    expect(canAccessCourse(ctx.student, ctx.course.id)).toBe(true);
    expect(canManageCourse(ctx.teacher, ctx.course.id)).toBe(true);
    expect(canManageCourse(ctx.student, ctx.course.id)).toBe(false);
  });
});
