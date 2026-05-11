const path = require('path');
const fs = require('fs');
const request = require('supertest');
const app = require('../server');
const {
  initDatabase,
  seedDatabase,
  closeDatabase,
  resolveDatabaseFiles,
  getDatabase
} = require('../database/db');
const authService = require('../services/authService');
const settingsService = require('../services/settingsService');

const TEST_DB = path.join(__dirname, 'test_maintenance.db');

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

function cookie(session) {
  return `auth_token=${session.token}`;
}

function createAdminSession() {
  const stamp = Date.now();
  const admin = authService.createUser({
    name: `Maintenance Admin ${stamp}`,
    username: `maintenance-admin-${stamp}`,
    email: `maintenance-admin-${stamp}@example.com`,
    role: 'admin',
    password: 'Maintenance123!'
  });
  return authService.login(admin.username, 'Maintenance123!');
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

describe('maintenance mode', () => {
  test('fresh installs start with maintenance mode enabled', () => {
    expect(settingsService.getMaintenanceMode().enabled).toBe(true);
    expect(authService.login('admin', 'Admin123!').user.role).toBe('admin');
    expect(() => authService.login('teacher@example.com', 'Teacher123!')).toThrow(/maintenance mode/i);
    expect(() => authService.login('STU-0003', 'Student123!')).toThrow(/maintenance mode/i);
  });

  test('login API blocks teachers and students while maintenance mode is on', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'teacher@example.com', password: 'Teacher123!' })
      .expect(403)
      .expect(response => {
        expect(response.body.code).toBe('MAINTENANCE_MODE');
      });
  });

  test('admins can toggle maintenance mode and enabling it revokes non-admin sessions', async () => {
    const adminSession = createAdminSession();

    await request(app)
      .put('/api/settings/maintenance')
      .set('Cookie', cookie(adminSession))
      .send({ enabled: false })
      .expect(200)
      .expect(response => {
        expect(response.body.enabled).toBe(false);
      });

    const teacherSession = authService.login('teacher@example.com', 'Teacher123!');
    const studentSession = authService.login('STU-0003', 'Student123!');

    await request(app).get('/api/auth/me').set('Cookie', cookie(teacherSession)).expect(200);
    await request(app).get('/api/auth/me').set('Cookie', cookie(studentSession)).expect(200);

    await request(app)
      .put('/api/settings/maintenance')
      .set('Cookie', cookie(adminSession))
      .send({ enabled: true })
      .expect(200)
      .expect(response => {
        expect(response.body.enabled).toBe(true);
        expect(response.body.revokedSessions).toBeGreaterThanOrEqual(2);
      });

    await request(app).get('/api/auth/me').set('Cookie', cookie(teacherSession)).expect(401);
    await request(app).get('/api/auth/me').set('Cookie', cookie(studentSession)).expect(401);
    await request(app).get('/api/auth/me').set('Cookie', cookie(adminSession)).expect(200);

    const db = getDatabase();
    expect(db.prepare(`
      SELECT COUNT(*) as count
      FROM sessions s
      JOIN users u ON u.id = s.userId
      WHERE u.role IN ('teacher', 'student')
    `).get().count).toBe(0);
  });
});
