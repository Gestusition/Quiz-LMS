const path = require('path');
const fs = require('fs');
const request = require('supertest');
const app = require('../server');
const database = require('../database/db');
const { initDatabase, seedDatabase, closeDatabase, resolveDatabaseFiles, getDatabase } = database;
const authService = require('../services/authService');
const { APP_VERSION } = require('../utils/appVersion');

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
  test('admin API index advertises docs, health, and top-level routes', async () => {
    const session = createAdminSession();

    await request(app)
      .get('/api')
      .expect(401);

    await request(app)
      .get('/api')
      .set('Cookie', `auth_token=${session.token}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body).toEqual(expect.objectContaining({
          name: 'Quiz LMS API',
          version: APP_VERSION,
          status: 'ok',
          database: 'ok',
          docs: '/api-docs',
          docsJson: '/api-docs.json',
          health: '/api/health'
        }));
        expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
        expect(response.body.routes).toEqual(expect.objectContaining({
          auth: '/api/auth/login',
          courses: '/api/courses',
          users: '/api/users',
          analytics: '/api/analytics/admin',
          settings: '/api/settings/maintenance',
          ai: '/api/ai/settings/status'
        }));
      });
  });

  test('admin API index mirrors health status when the database check fails', async () => {
    const session = createAdminSession();
    const getDatabaseSpy = jest.spyOn(database, 'getDatabase').mockImplementation(() => {
      throw new Error('database unavailable');
    });

    try {
      await request(app)
        .get('/api')
        .set('Cookie', `auth_token=${session.token}`)
        .expect(503)
        .expect('Content-Type', /json/)
        .expect(response => {
          expect(response.body).toEqual(expect.objectContaining({
            name: 'Quiz LMS API',
            status: 'not_ok',
            database: 'not_ok',
            docs: '/api-docs',
            docsJson: '/api-docs.json',
            health: '/api/health'
          }));
          expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
          expect(response.body.routes).toEqual(expect.objectContaining({
          auth: '/api/auth/login',
          settings: '/api/settings/maintenance',
          ai: '/api/ai/settings/status'
          }));
        });
    } finally {
      getDatabaseSpy.mockRestore();
    }
  });

  test('public API health endpoint returns JSON without authentication', async () => {
    await request(app)
      .get('/api/health')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body.status).toBe('ok');
        expect(response.body.database).toBe('ok');
        expect(response.body.version).toBe(APP_VERSION);
        expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
      });
  });

  test('public application version script exposes the detected release version', async () => {
    await request(app)
      .get('/app-version.js')
      .expect(200)
      .expect('Content-Type', /javascript/)
      .expect('Cache-Control', 'no-store')
      .expect(response => {
        expect(response.text).toContain(APP_VERSION);
      });
  });

  test('public API health endpoint returns not_ok when the database check fails', async () => {
    const getDatabaseSpy = jest.spyOn(database, 'getDatabase').mockImplementation(() => {
      throw new Error('database unavailable');
    });

    try {
      await request(app)
        .get('/api/health')
        .expect(503)
        .expect('Content-Type', /json/)
        .expect(response => {
          expect(response.body.status).toBe('not_ok');
          expect(response.body.database).toBe('not_ok');
          expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
        });
    } finally {
      getDatabaseSpy.mockRestore();
    }
  });

  test('every mounted API group has a reachable smoke endpoint', async () => {
    const db = getDatabase();
    const course = db.prepare('SELECT id FROM courses WHERE code = ?').get('DEMO101');
    const session = createAdminSession();
    const authCookie = `auth_token=${session.token}`;

    const mountedRoutes = [
      { name: 'index', path: '/api', auth: true },
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
      { name: 'settings', path: '/api/settings/maintenance', auth: true },
      { name: 'ai', path: '/api/ai/settings/status', auth: true },
      { name: 'ai-conversations', path: '/api/ai/conversations', auth: true }
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
        expect(response.headers['content-security-policy']).toContain('font-src');
        expect(response.headers['content-security-policy']).toContain('https://cdn.jsdelivr.net');
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

  test('Swagger docs are admin-only and expose maintenance plus conversational AI contracts', async () => {
    const session = createAdminSession();
    const authCookie = `auth_token=${session.token}`;

    await request(app)
      .get('/api-docs')
      .expect(401);

    await request(app)
      .get('/api-docs.json')
      .expect(401);

    await request(app)
      .get('/api-docs/')
      .set('Cookie', authCookie)
      .expect(200)
      .expect('Content-Type', /html/);

    await request(app)
      .get('/api-docs.json')
      .set('Cookie', authCookie)
      .expect(200)
      .expect(response => {
        expect(response.body.info.version).toBe(APP_VERSION);
        const paths = response.body.paths || {};
        expect(paths['/api']?.get).toBeDefined();
        expect(paths['/api/health']?.get).toBeDefined();
        expect(paths['/api/settings/maintenance']?.get).toBeDefined();
        expect(paths['/api/settings/maintenance']?.put).toBeDefined();
        expect(paths['/api/auth/login']?.post?.responses?.['403']).toBeDefined();
        expect(JSON.stringify(paths['/api/auth/login'].post.responses['403'])).toContain('MAINTENANCE_MODE');
        [
          ['post', '/api/ai/conversations'],
          ['get', '/api/ai/conversations'],
          ['get', '/api/ai/conversations/{id}'],
          ['delete', '/api/ai/conversations/{id}'],
          ['post', '/api/ai/conversations/{id}/messages'],
          ['patch', '/api/ai/conversations/{id}/plan'],
          ['post', '/api/ai/conversations/{id}/generate'],
          ['get', '/api/ai/conversations/{id}/generation-status'],
          ['post', '/api/ai/conversations/{id}/cancel'],
          ['post', '/api/ai/conversations/{id}/revise'],
          ['post', '/api/ai/conversations/{id}/revisions/{revisionId}/apply'],
          ['post', '/api/ai/conversations/{id}/regenerate-questions'],
          ['put', '/api/ai/conversations/{id}/draft'],
          ['post', '/api/ai/settings/test'],
          ['post', '/api/courses/{courseId}/ai/materials/paste'],
          ['delete', '/api/courses/{courseId}/ai/materials/{materialId}'],
          ['get', '/api/courses/{courseId}/ai/source-chunks/{chunkId}']
        ].forEach(([method, routePath]) => {
          expect(paths[routePath]?.[method]).toBeDefined();
        });
        expect(response.body.tags).toEqual(expect.arrayContaining([
          expect.objectContaining({ name: 'AI Assistant' })
        ]));
      });
  });

  test('frontend exposes admin API links and maintenance health status consistently', () => {
    const appSource = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'app.js'), 'utf8');
    const apiSource = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'api.js'), 'utf8');
    const dashboardSource = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'pages', 'dashboardPage.js'), 'utf8');

    expect(appSource.indexOf('Maintenance')).toBeLessThan(appSource.indexOf('href="/api"'));
    expect(appSource.indexOf('href="/api"')).toBeLessThan(appSource.indexOf('href="/api-docs"'));
    expect(apiSource).toContain('getHealth()');
    expect(apiSource).toContain("`${this.BASE}/health`");
    expect(apiSource).toContain('body: { questionIndexes: indexes, ...(instruction ? { instruction } : {}) }');
    expect(apiSource).toContain('`/courses/${courseId}/ai/source-chunks/${chunkId}`');
    expect(apiSource).toContain("database: data.database || (data.status === 'ok' && response.ok ? 'ok' : 'not_ok')");
    expect(dashboardSource).toContain('API.getHealth()');
    expect(dashboardSource).toContain('API Health');
    expect(dashboardSource).not.toContain('API is responding');
    expect(dashboardSource).not.toContain('API health check needs attention');
    expect(dashboardSource).toContain('Source: /api/health');
    expect(dashboardSource).not.toContain('Database:');
    expect(dashboardSource).not.toContain('href="/api" target="_blank">API</a>');
    expect(dashboardSource).toContain("const database = apiHealth.database || (status === 'ok' ? 'ok' : 'not_ok')");
  });
});
