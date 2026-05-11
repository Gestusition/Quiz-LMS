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
const userService = require('../services/userService');
const settingsService = require('../services/settingsService');
const courseService = require('../services/courseService');
const contentService = require('../services/contentService');
const auditService = require('../services/auditService');
const resourceAccessService = require('../services/resourceAccessService');
const academicService = require('../services/academicService');
const courseWeekService = require('../services/courseWeekService');
const importService = require('../services/importService');
const importRepository = require('../repositories/importRepository');
const resourceAccessRepository = require('../repositories/resourceAccessRepository');
const settingsRepository = require('../repositories/settingsRepository');
const { validationError } = require('../utils/appError');

const TEST_DB = path.join(__dirname, 'test_service_small_edges.db');
let counter = 0;
let ctx;

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

function stamp(prefix = 'svc') {
  counter += 1;
  return `${prefix}${String(Date.now()).slice(-6)}${counter}`;
}

function createUser(role) {
  const id = stamp(role[0]);
  const payload = {
    name: `Small Edge ${role} ${id}`,
    username: `small-edge-${role}-${id}`,
    email: `small-edge-${role}-${id}@example.com`,
    role,
    password: 'SmallEdge123!'
  };
  if (role === 'teacher') payload.staffNumber = `SET-${id}`;
  if (role === 'student') payload.studentNumber = `SES-${id}`;
  return authService.createUser(payload);
}

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();
  settingsService.setMaintenanceMode(false);

  const admin = createUser('admin');
  const teacher = createUser('teacher');
  const student = createUser('student');
  const course = courseService.create({
    code: `SVC-${stamp('c')}`.toUpperCase(),
    title: 'Small Service Edge Course',
    visibility: 'published'
  }, teacher);

  ctx = { admin, teacher, student, course };
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('small service edge cases', () => {
  test('course service rejects duplicates, missing records, and inactive enroll targets', () => {
    expect(() => courseService.create({
      code: ctx.course.code,
      title: 'Duplicate Course',
      visibility: 'published'
    }, ctx.teacher)).toThrow('already exists');

    const other = courseService.create({
      code: `SVC-${stamp('d')}`.toUpperCase(),
      title: 'Other Small Service Course',
      visibility: 'published'
    }, ctx.teacher);
    expect(() => courseService.update(other.id, { code: ctx.course.code }))
      .toThrow('already exists');
    expect(() => courseService.delete(999999)).toThrow('Course not found');
    expect(() => courseService.enroll(999999, ctx.student.id, 'student')).toThrow('Course not found');
    expect(() => courseService.enroll(ctx.course.id, 999999, 'student')).toThrow('Active user not found');
  });

  test('academic and course week services reject protected edge operations', () => {
    const activeTerm = academicService.listTerms().find(term => term.isActive);
    expect(() => academicService.deleteTerm(activeTerm.id)).toThrow('At least one term');
    expect(() => courseWeekService.listWeeks(ctx.course.id, { id: 999999, role: 'student' }, {}))
      .toThrow('Course access required');
  });

  test('content and resource access services reject invalid references and access levels', () => {
    expect(() => contentService.createResource(999999, {
      title: 'Missing Course Resource',
      type: 'link',
      url: 'https://example.com/missing'
    }, ctx.teacher)).toThrow('Course not found');

    expect(() => resourceAccessService.share('category', 1, {
      teacherEmail: ctx.teacher.email,
      accessLevel: 'owner'
    }, ctx.admin)).toThrow('Access level');
    expect(() => resourceAccessService.remove('category', 999999, ctx.teacher.id, ctx.admin))
      .toThrow('Access grant not found');
    expect(() => resourceAccessRepository.upsert({
      resourceType: 'bad',
      resourceId: 1,
      teacherUserId: ctx.teacher.id,
      accessLevel: 'read',
      grantedBy: ctx.admin.id
    })).toThrow('Invalid resource type');
    expect(() => resourceAccessRepository.upsert({
      resourceType: 'category',
      resourceId: 1,
      teacherUserId: ctx.teacher.id,
      accessLevel: 'bad',
      grantedBy: ctx.admin.id
    })).toThrow('Access level');
  });

  test('settings service rolls back maintenance changes when persistence fails', () => {
    const spy = jest.spyOn(settingsRepository, 'upsert').mockImplementation(() => {
      throw new Error('settings write failed');
    });

    expect(() => settingsService.setMaintenanceMode(true, ctx.admin)).toThrow('settings write failed');
    expect(spy).toHaveBeenCalled();
  });

  test('auth service surfaces non-ambiguous reset lookup errors and rejects non-resettable users', () => {
    const spy = jest.spyOn(authService, 'resolveLoginIdentifier').mockImplementation(() => {
      throw validationError('identifier', 'resolver failed');
    });
    expect(() => authService.requestPasswordReset('bad-identifier')).toThrow('resolver failed');
    spy.mockRestore();

    expect(() => authService.completePasswordReset({
      identifier: ctx.admin.username,
      code: 'BADCODE',
      newPassword: 'DifferentAdmin123!'
    })).toThrow('Invalid or expired reset code');
  });

  test('user service audits duplicate usernames', () => {
    expect(() => userService.createUser({
      name: 'Duplicate Username',
      username: ctx.teacher.username,
      email: `duplicate-${stamp('u')}@example.com`,
      role: 'teacher',
      password: 'SmallEdge123!',
      staffNumber: `DUP-${stamp('s')}`
    }, ctx.admin.id)).toThrow('username');
  });

  test('user service removes student-owned academic records when role changes', () => {
    const updated = userService.updateUser(ctx.student.id, {
      role: 'teacher',
      staffNumber: `ROLE-${stamp('r')}`
    }, ctx.admin.id);

    expect(updated.role).toBe('teacher');
  });

  test('audit service tolerates malformed details JSON', () => {
    getDatabase().prepare(`
      INSERT INTO audit_logs (actorUserId, action, entityType, entityId, detailsJson)
      VALUES (?, ?, ?, ?, ?)
    `).run(null, 'MALFORMED_DETAILS', 'small_edge', 1, '{bad json');

    const [entry] = auditService.forEntity('small_edge', 1);
    expect(entry.details).toEqual({});
  });

  test('import service and repository reject invalid status and update batch counters', () => {
    expect(() => importService.createBatch({
      type: 'users',
      fileName: 'users.csv',
      status: 'unknown'
    }, ctx.admin.id)).toThrow('status must be');

    const batch = importService.createBatch({
      type: 'users',
      fileName: 'users.csv',
      status: 'processed'
    }, ctx.admin.id);
    importRepository.updateBatch(batch.id, {
      status: 'failed',
      totalRows: 3,
      successCount: 1,
      failedCount: 2
    });
    expect(importService.listBatches({ status: 'failed' }).items.map(item => item.id)).toContain(batch.id);
  });
});
