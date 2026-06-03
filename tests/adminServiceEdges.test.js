const path = require('path');
const fs = require('fs');
const {
  initDatabase,
  seedDatabase,
  closeDatabase,
  resolveDatabaseFiles,
  getDatabase
} = require('../database/db');
const authService = require('../services/authService');
const userService = require('../services/userService');
const settingsService = require('../services/settingsService');
const courseService = require('../services/courseService');
const gradeSchemeService = require('../services/gradeSchemeService');
const restrictionService = require('../services/restrictionService');
const validationIssueService = require('../services/validationIssueService');
const gradeSchemeRepository = require('../repositories/gradeSchemeRepository');
const sessionRepository = require('../repositories/sessionRepository');
const { hashSessionToken } = require('../utils/security');

const TEST_DB = path.join(__dirname, 'test_admin_service_edges.db');
let suffixCounter = 0;

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

function stamp(label) {
  suffixCounter += 1;
  return `${label}-${String(Date.now()).slice(-6)}-${suffixCounter}`;
}

function createRoleUser(role, overrides = {}) {
  const id = stamp(role);
  const base = {
    name: `Admin Edge ${role} ${id}`,
    username: `ae-${role}-${id}`,
    email: `ae-${role}-${id}@example.com`,
    role,
    password: 'AdminEdge123!'
  };
  if (role === 'student') base.studentNumber = `AES-${id}`;
  if (role === 'teacher') base.staffNumber = `AET-${id}`;
  return authService.createUser({ ...base, ...overrides });
}

let ctx;

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();
  settingsService.setMaintenanceMode(false);

  const admin = createRoleUser('admin');
  const teacher = createRoleUser('teacher');
  const student = createRoleUser('student');
  const otherTeacher = createRoleUser('teacher');
  const course = courseService.create({
    code: `ASE-${Date.now()}`,
    title: 'Admin Service Edge Course',
    visibility: 'published'
  }, teacher);
  courseService.enroll(course.id, student.id, 'student');

  ctx = { admin, teacher, student, otherTeacher, course };
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('auth service edge cases', () => {
  test('handles missing credentials, logout variants, and token lookup failures', () => {
    expect(() => authService.login('', '')).toThrow(/required/i);
    expect(authService.logout()).toBe(true);
    expect(authService.logout('opaque-token')).toBe(true);
    expect(authService.getUserByToken()).toBeNull();
    expect(authService.getUserByToken('not-a-jwt')).toBeNull();

    const session = authService.login(ctx.admin.username, 'AdminEdge123!');
    expect(authService.getUserByToken(session.token).id).toBe(ctx.admin.id);

    const decodedSession = getDatabase().prepare(`
      SELECT id FROM sessions
      WHERE userId = ?
      ORDER BY id DESC
      LIMIT 1
    `).get(ctx.admin.id);
    sessionRepository.deleteById(decodedSession.id);
    expect(authService.getUserByToken(session.token)).toBeNull();

    const expiredSession = authService.login(ctx.admin.username, 'AdminEdge123!');
    const expiredRecord = getDatabase().prepare(`
      SELECT id FROM sessions
      WHERE userId = ?
      ORDER BY id DESC
      LIMIT 1
    `).get(ctx.admin.id);
    getDatabase().prepare('UPDATE sessions SET expiresAt = ? WHERE id = ?')
      .run(new Date(Date.now() - 1000).toISOString(), expiredRecord.id);
    expect(authService.getUserByToken(expiredSession.token)).toBeNull();

    const wrongType = authService.login(ctx.admin.username, 'AdminEdge123!');
    const wrongTypeRecord = getDatabase().prepare(`
      SELECT id FROM sessions
      WHERE userId = ?
      ORDER BY id DESC
      LIMIT 1
    `).get(ctx.admin.id);
    getDatabase().prepare('UPDATE sessions SET tokenType = ? WHERE id = ?').run('opaque', wrongTypeRecord.id);
    expect(authService.getUserByToken(wrongType.token)).toBeNull();

    const inactive = createRoleUser('student', {
      username: `inactive-${stamp('student')}`,
      email: `inactive-${stamp('student')}@example.com`,
      studentNumber: `INACTIVE-${stamp('student')}`
    });
    const inactiveSession = authService.login(inactive.studentNumber, 'AdminEdge123!');
    getDatabase().prepare('UPDATE users SET status = ? WHERE id = ?').run('disabled', inactive.id);
    expect(authService.getUserByToken(inactiveSession.token)).toBeNull();
  });

  test('covers reset request, reset completion, credential change, and auth wrapper branches', () => {
    expect(() => authService.requestPasswordReset('')).toThrow(/required/i);
    expect(authService.requestPasswordReset(ctx.admin.username).message).toMatch(/admin reset request/i);

    const ambiguous = stamp('ambiguous');
    createRoleUser('student', {
      username: `amb-student-${ambiguous}`,
      email: `amb-student-${ambiguous}@example.com`,
      studentNumber: `AMB-${ambiguous}`
    });
    createRoleUser('teacher', {
      username: `amb-teacher-${ambiguous}`,
      email: `amb-teacher-${ambiguous}@example.com`,
      staffNumber: `AMB-${ambiguous}`
    });
    expect(authService.requestPasswordReset(`AMB-${ambiguous}`).message).toMatch(/admin reset request/i);

    expect(() => authService.issuePasswordResetCode(999999)).toThrow(/not found/i);
    expect(() => authService.issuePasswordResetCode(ctx.admin.id)).toThrow(/teachers and students/i);
    const disabledId = stamp('dt');
    const disabledTeacher = createRoleUser('teacher', {
      username: `disabled-${disabledId}`,
      email: `disabled-${disabledId}@example.com`,
      staffNumber: `DIS-${disabledId}`,
      status: 'disabled'
    });
    expect(() => authService.issuePasswordResetCode(disabledTeacher.id)).toThrow(/active teachers and students/i);

    expect(() => authService.completePasswordReset({})).toThrow(/required/i);
    const issued = authService.issuePasswordResetCode(ctx.student.id);
    expect(() => authService.completePasswordReset({
      identifier: ctx.student.studentNumber,
      code: issued.code,
      newPassword: 'AdminEdge123!'
    })).toThrow(/different from the current/i);

    expect(() => authService.changeOwnCredentials(999999, '', {
      username: 'missing-user',
      currentPassword: 'AdminEdge123!',
      newPassword: 'Different123!'
    })).toThrow(/not found/i);
    expect(() => authService.changeOwnCredentials(ctx.admin.id, '', {
      username: `new-${ctx.admin.username}`,
      currentPassword: 'Wrong123!',
      newPassword: 'Different123!'
    })).toThrow(/current password/i);
    expect(() => authService.changeOwnCredentials(ctx.admin.id, '', {
      username: ctx.admin.username,
      currentPassword: 'AdminEdge123!',
      newPassword: 'Different123!'
    })).toThrow(/different from the current username/i);
    expect(() => authService.changeOwnCredentials(ctx.admin.id, '', {
      username: `new-${ctx.admin.username}`,
      currentPassword: 'AdminEdge123!',
      newPassword: 'AdminEdge123!'
    })).toThrow(/different from the current password/i);
    expect(() => authService.changeOwnCredentials(ctx.admin.id, '', {
      username: ctx.teacher.username,
      currentPassword: 'AdminEdge123!',
      newPassword: 'Different123!'
    })).toThrow(/already exists/i);

    expect(authService.getAllUsers({ limit: 1 }).items.length).toBe(1);
    expect(authService.getUserById(ctx.admin.id).id).toBe(ctx.admin.id);
    expect(authService.validateUserPayload({
      name: 'Wrapper User',
      username: 'wrapper-user',
      email: 'wrapper-user@example.com',
      role: 'admin',
      password: 'Wrapper123!'
    }, true).username).toBe('wrapper-user');
    expect(authService.validateUsername('Wrapper.Name')).toBe('wrapper.name');
    expect(() => authService.validatePassword('short')).toThrow(/between/i);
    expect(authService.isAllowedLoginMatchType('unknown', 'email')).toBe(true);
    expect(authService.findAuditSubjectForIdentifier(ctx.teacher.email).id).toBe(ctx.teacher.id);
  });
});

describe('user service update and cleanup edges', () => {
  test('rejects duplicate updates, changes roles with password reset, and deletes users', () => {
    const firstStudent = createRoleUser('student');
    const secondStudent = createRoleUser('student');
    const duplicateStaff = createRoleUser('teacher');

    expect(() => userService.updateUser(999999, { name: 'Missing' })).toThrow(/not found/i);
    expect(() => userService.updateUser(firstStudent.id, { email: secondStudent.email })).toThrow(/email already exists/i);
    expect(() => userService.updateUser(firstStudent.id, { username: secondStudent.username })).toThrow(/username already exists/i);
    expect(() => userService.updateUser(firstStudent.id, { studentNumber: secondStudent.studentNumber })).toThrow(/student number already exists/i);
    expect(() => userService.updateUser(duplicateStaff.id, { staffNumber: ctx.teacher.staffNumber })).toThrow(/employee number already exists/i);

    const studentSession = authService.login(firstStudent.studentNumber, 'AdminEdge123!');
    expect(authService.getUserByToken(studentSession.token).id).toBe(firstStudent.id);

    const promoted = userService.updateUser(firstStudent.id, {
      role: 'teacher',
      staffNumber: `PROM-${stamp('teacher')}`,
      password: 'Promoted123!'
    }, ctx.admin.id);
    expect(promoted.role).toBe('teacher');
    expect(authService.getUserByToken(studentSession.token)).toBeNull();
    expect(authService.login(promoted.email, 'Promoted123!').user.id).toBe(firstStudent.id);

    expect(() => userService.setUserPassword(999999, 'Reset123!')).toThrow(/not found/i);

    const deleteMe = createRoleUser('student');
    expect(userService.deleteUser(deleteMe.id)).toBe(true);
    expect(userService.getUserById(deleteMe.id)).toBeNull();
    expect(() => userService.deleteUser(deleteMe.id)).toThrow(/not found/i);

    const initialAdmin = getDatabase().prepare("SELECT id FROM users WHERE username = 'admin'").get();
    expect(initialAdmin).toBeDefined();
    expect(() => userService.deleteUser(initialAdmin.id)).toThrow(/initial admin/i);
  });

  test('auth service delegates user mutations through wrapper methods', () => {
    const created = authService.createUser({
      name: 'Delegated User',
      username: `delegated-${stamp('admin')}`,
      email: `delegated-${stamp('admin')}@example.com`,
      role: 'admin',
      password: 'Delegated123!'
    });
    const updated = authService.updateUser(created.id, { adminTitle: 'Platform Owner' });
    expect(updated.adminTitle).toBe('Platform Owner');
    expect(authService.setUserPassword(created.id, 'DelegatedNew123!').id).toBe(created.id);
    expect(authService.deleteUser(created.id)).toBe(true);
  });
});

describe('grade scheme and validation issue edges', () => {
  test('validates grade thresholds and manager permissions', () => {
    expect(() => gradeSchemeService.list(999999, ctx.admin)).toThrow(/course not found/i);
    expect(() => gradeSchemeService.list(ctx.course.id, ctx.otherTeacher)).toThrow(/course access/i);

    const schemes = gradeSchemeService.list(ctx.course.id, ctx.teacher);
    expect(schemes[0].thresholds).toHaveLength(gradeSchemeService.LETTER_GRADES.length);
    expect(gradeSchemeService.getForUser(schemes[0].id, ctx.teacher).id).toBe(schemes[0].id);

    const valid = gradeSchemeService.DEFAULT_THRESHOLDS.map(item => ({ ...item }));
    expect(() => gradeSchemeService.validateThresholds('bad')).toThrow(/array/i);
    expect(() => gradeSchemeService.validateThresholds(valid.slice(0, 8))).toThrow(/exactly/i);
    expect(() => gradeSchemeService.validateThresholds([{ letterGrade: 'ZZ', minScore: 90 }, ...valid.slice(1)])).toThrow(/letterGrade/i);
    expect(() => gradeSchemeService.validateThresholds([{ letterGrade: 'AA', minScore: 90 }, { letterGrade: 'AA', minScore: 80 }, ...valid.slice(2)])).toThrow(/Duplicate/i);
    expect(() => gradeSchemeService.validateThresholds(valid.map(item => item.letterGrade === 'AA' ? { ...item, minScore: '' } : item))).toThrow(/required/i);
    expect(() => gradeSchemeService.validateThresholds(valid.map(item => item.letterGrade === 'AA' ? { ...item, minScore: 101 } : item))).toThrow(/between 0 and 100/i);
    expect(() => gradeSchemeService.validateThresholds(valid.map(item => item.letterGrade === 'BA' ? { ...item, minScore: 95 } : item))).toThrow(/AA must be greater/i);
    expect(() => gradeSchemeService.validateThresholds(valid.map(item => item.letterGrade === 'FF' ? { ...item, minScore: 1 } : item))).toThrow(/FF threshold/i);

    expect(() => gradeSchemeService.updateThresholds(999999, valid, ctx.admin)).toThrow(/not found/i);
    const updated = gradeSchemeService.updateThresholds(schemes[0].id, valid, ctx.teacher);
    expect(updated.status).toBe('active');
    expect(gradeSchemeService.resolveLetterGrade(ctx.course.id, 92).letterGrade).toBe('AA');
    expect(gradeSchemeService.resolveLetterGrade(ctx.course.id, -1).status).toBe('pending_review');
    expect(gradeSchemeService.markSchemeInvalid(schemes[0].id).status).toBe('invalid');
    expect(gradeSchemeService.resolveLetterGrade(ctx.course.id, 92).status).toBe('pending_review');
    expect(gradeSchemeService.markSchemeInvalid(999999)).toBeNull();

    const created = gradeSchemeRepository.createScheme({
      name: 'Global Manual Scheme',
      status: 'active',
      isDefault: false,
      createdBy: ctx.admin.id
    });
    const globalSchemeId = Number(created.lastInsertRowid);
    expect(gradeSchemeService.getForUser(globalSchemeId, ctx.admin).id).toBe(globalSchemeId);
    expect(() => gradeSchemeService.getForUser(globalSchemeId, ctx.teacher)).toThrow(/course access/i);
  });

  test('manages validation issues and restrictions through service branches', () => {
    expect(() => validationIssueService.getById(999999)).toThrow(/not found/i);
    expect(() => validationIssueService.create()).toThrow(/entity_type/i);
    expect(() => validationIssueService.create({ entityType: 'quiz' })).toThrow(/message/i);
    expect(() => validationIssueService.create({
      entityType: 'quiz',
      message: 'Invalid severity',
      severity: 'bad'
    })).toThrow(/severity/i);

    const issue = validationIssueService.create({
      entityType: 'quiz',
      entityId: 123,
      field: 'questions',
      severity: 'critical',
      message: 'Manual validation issue',
      visibleToUser: true,
      relatedCourseId: ctx.course.id,
      relatedUserId: ctx.student.id
    });
    expect(issue.status).toBe('open');
    expect(validationIssueService.list({
      entityType: 'quiz',
      entityId: 123,
      status: 'open',
      severity: 'critical',
      relatedCourseId: ctx.course.id,
      relatedUserId: ctx.student.id
    }).items.map(item => item.id)).toContain(issue.id);
    expect(validationIssueService.countOpen()).toBeGreaterThan(0);
    expect(() => validationIssueService.updateStatus(issue.id, 'bad', ctx.admin.id)).toThrow(/status/i);
    expect(() => validationIssueService.updateStatus(999999, 'resolved', ctx.admin.id)).toThrow(/not found/i);
    expect(validationIssueService.updateStatus(issue.id, 'resolved', ctx.admin.id).status).toBe('resolved');
    expect(validationIssueService.updateStatus(issue.id, 'open', ctx.admin.id).resolvedAt).toBe('');
    expect(validationIssueService.updateStatus(issue.id, 'ignored', ctx.admin.id).status).toBe('ignored');

    expect(restrictionService.hasActiveRestriction({
      user: null,
      restrictionType: 'chat_muted'
    })).toBe(false);
    expect(() => restrictionService.list({ userId: 'bad' })).toThrow(/positive integer/i);
    expect(() => restrictionService.create({
      userId: 999999,
      restrictionType: 'chat_muted',
      scopeType: 'global'
    }, ctx.admin.id)).toThrow(/User not found/i);
    expect(() => restrictionService.create({
      userId: ctx.student.id,
      restrictionType: 'bad',
      scopeType: 'global'
    }, ctx.admin.id)).toThrow(/restriction_type/i);
    expect(() => restrictionService.create({
      userId: ctx.student.id,
      restrictionType: 'chat_muted',
      scopeType: 'course'
    }, ctx.admin.id)).toThrow(/scope_id/i);

    const restriction = restrictionService.create({
      userId: ctx.student.id,
      restrictionType: 'manual_review_required',
      scopeType: 'course',
      scopeId: ctx.course.id,
      reason: 'Needs manual review'
    }, ctx.admin.id);
    expect(restrictionService.countActive()).toBeGreaterThan(0);
    expect(restrictionService.hasActiveRestriction({
      user: ctx.student,
      restrictionType: 'manual_review_required',
      scopeType: 'course',
      scopeId: ctx.course.id
    })).toBe(true);
    expect(() => restrictionService.assertAccessAllowed({
      user: ctx.student,
      restrictionType: 'manual_review_required',
      scopeType: 'course',
      scopeId: ctx.course.id,
      safeMessage: 'Manual review block.'
    })).toThrow(/Manual review block/i);
    expect(restrictionService.deactivate(restriction.id).isActive).toBe(0);
    expect(() => restrictionService.deactivate(999999)).toThrow(/not found/i);

    const fakeToken = 'legacy-token-value';
    sessionRepository.deleteByTokenHash(hashSessionToken(fakeToken));
  });
});
