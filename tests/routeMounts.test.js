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

  test('server middleware sets browser security headers and CORS only for local origins', async () => {
    await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:3000')
      .expect(200)
      .expect(response => {
        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.headers['x-frame-options']).toBe('DENY');
        expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
        expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      });

    await request(app)
      .get('/api/health')
      .set('Origin', 'https://not-allowed.example.com')
      .expect(200)
      .expect(response => {
        expect(response.headers['access-control-allow-origin']).toBeUndefined();
      });
  });

  test('server protects uploaded course file roots and serves the SPA fallback', async () => {
    await request(app)
      .get('/uploads/resources/private.txt')
      .expect(404)
      .expect(response => {
        expect(response.body.error).toMatch(/protected download endpoint/i);
      });

    await request(app)
      .get('/uploads/submissions/private.txt')
      .expect(404)
      .expect(response => {
        expect(response.body.error).toMatch(/protected download endpoint/i);
      });

    await request(app)
      .get('/teacher/dashboard')
      .expect(200)
      .expect('Content-Type', /html/);
  });

  test('Swagger docs expose maintenance settings and maintenance login errors', async () => {
    const session = createAdminSession();
    const authCookie = `auth_token=${session.token}`;

    await request(app)
      .get('/api-docs.json')
      .set('Cookie', authCookie)
      .expect(200)
      .expect(response => {
        const paths = response.body.paths || {};
        expect(paths['/api/settings/maintenance']?.get).toBeDefined();
        expect(paths['/api/settings/maintenance']?.put).toBeDefined();
        expect(paths['/api/auth/login']?.post?.responses?.['403']).toBeDefined();
        expect(JSON.stringify(paths['/api/auth/login'].post.responses['403'])).toContain('MAINTENANCE_MODE');
      });
  });
});
