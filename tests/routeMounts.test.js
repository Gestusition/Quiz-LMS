const path = require('path');
const fs = require('fs');
const request = require('supertest');
const app = require('../server');
const { initDatabase, seedDatabase, closeDatabase, resolveDatabaseFiles, getDatabase } = require('../database/db');
const authService = require('../services/authService');

const TEST_DB = path.join(__dirname, 'test_route_mounts.db');

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

function createAdminSession() {
  const stamp = Date.now();
  const admin = authService.createUser({
    name: `Route Mount Admin ${stamp}`,
    username: `route-mount-admin-${stamp}`,
    email: `route-mount-admin-${stamp}@example.com`,
    role: 'admin',
    password: 'RouteMount123!'
  });

  return authService.login(admin.username, 'RouteMount123!');
}

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('API route mounts', () => {
  test('every mounted API group has a reachable smoke endpoint', async () => {
    const db = getDatabase();
    const course = db.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');
    const session = createAdminSession();
    const authCookie = `auth_token=${session.token}`;

    const mountedRoutes = [
      { name: 'health', path: '/api/health', auth: false },
      { name: 'auth', path: '/api/auth/me', auth: true },
      { name: 'users', path: '/api/users?limit=1', auth: true },
      { name: 'courses', path: '/api/courses', auth: true },
      { name: 'categories', path: '/api/categories', auth: true },
      { name: 'questions', path: '/api/questions', auth: true },
      { name: 'quizzes', path: '/api/quizzes', auth: true },
      { name: 'academic', path: '/api/academic/faculties', auth: true },
      { name: 'analytics', path: '/api/analytics/admin', auth: true },
      { name: 'restrictions', path: '/api/restrictions?limit=1', auth: true },
      { name: 'issues', path: '/api/issues?limit=1', auth: true },
      { name: 'imports', path: '/api/imports/batches?limit=1', auth: true },
      { name: 'discussion', path: `/api/discussion/courses/${course.id}/threads`, auth: true },
      { name: 'weeks', path: `/api/weeks/courses/${course.id}/weeks`, auth: true },
      { name: 'audit', path: '/api/audit?limit=1', auth: true },
      { name: 'settings', path: '/api/settings/maintenance', auth: true }
    ];

    for (const route of mountedRoutes) {
      let call = request(app).get(route.path);
      if (route.auth) call = call.set('Cookie', authCookie);

      await call.expect(200).expect(response => {
        expect(response.body).not.toEqual(expect.objectContaining({
          error: 'API route not found.'
        }));
      });
    }
  });

  test('unknown API routes still use the API 404 fallback', async () => {
    await request(app)
      .get('/api/not-mounted-here')
      .expect(404)
      .expect(response => {
        expect(response.body.error).toBe('API route not found.');
      });
  });
});
