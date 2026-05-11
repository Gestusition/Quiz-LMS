const path = require('path');
const fs = require('fs');
const request = require('supertest');
const app = require('../server');
const {
  initDatabase,
  seedDatabase,
  closeDatabase,
  resolveDatabaseFiles
} = require('../database/db');
const authService = require('../services/authService');
const settingsService = require('../services/settingsService');
const courseService = require('../services/courseService');
const contentService = require('../services/contentService');
const categoryService = require('../services/categoryService');
const questionService = require('../services/questionService');
const quizService = require('../services/quizService');
const userService = require('../services/userService');
const academicService = require('../services/academicService');
const courseWeekService = require('../services/courseWeekService');
const discussionService = require('../services/discussionService');
const importService = require('../services/importService');
const validationIssueService = require('../services/validationIssueService');

const TEST_DB = path.join(__dirname, 'test_route_error_edges.db');
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

function stamp(prefix = 're') {
  counter += 1;
  return `${prefix}${String(Date.now()).slice(-6)}${counter}`;
}

function cookie(session) {
  return `auth_token=${session.token}`;
}

function createUser(role) {
  const id = stamp(role[0]);
  const payload = {
    name: `Route Error ${role} ${id}`,
    username: `route-error-${role}-${id}`,
    email: `route-error-${role}-${id}@example.com`,
    role,
    password: 'RouteError123!'
  };
  if (role === 'teacher') payload.staffNumber = `RET-${id}`;
  if (role === 'student') payload.studentNumber = `RES-${id}`;
  return authService.createUser(payload);
}

async function withMock(target, method, implementation, work) {
  const spy = jest.spyOn(target, method).mockImplementation(implementation);
  try {
    await work(spy);
  } finally {
    spy.mockRestore();
  }
}

function throwError(message = 'forced route error') {
  throw new Error(message);
}

function quizPayload(courseId, title = 'Route Error Quiz') {
  return {
    courseId,
    title,
    description: 'Quiz for route error coverage.',
    status: 'draft',
    startAt: new Date(Date.now() - 60_000).toISOString(),
    endAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    durationMinutes: 15,
    maxAttempts: 2
  };
}

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();
  settingsService.setMaintenanceMode(false);

  const batch = stamp('batch');
  const admin = createUser('admin');
  const teacher = createUser('teacher');
  const otherTeacher = createUser('teacher');
  const student = createUser('student');
  const outsider = createUser('student');

  const course = courseService.create({
    code: `RERR-${batch}`.toUpperCase(),
    title: `Route Error Course ${batch}`,
    visibility: 'published'
  }, teacher);
  const participant = courseService.enroll(course.id, student.id, 'student');

  const category = categoryService.create({
    name: `Route Error Category ${batch}`,
    courseId: course.id
  }, teacher);
  const question = questionService.create({
    categoryId: category.id,
    text: `Route error question ${batch}`,
    type: 'TF',
    correctAnswer: 'true',
    difficulty: 'EASY',
    points: 1
  }, teacher);
  const quiz = quizService.create(quizPayload(course.id, `Route Error Quiz ${batch}`), teacher);
  const privateQuiz = quizService.create(quizPayload(course.id, `Route Error Private Quiz ${batch}`), teacher);
  const quizGrant = quizService.share(quiz.id, {
    teacherEmail: otherTeacher.email,
    accessLevel: 'read'
  }, teacher);
  const announcement = contentService.createAnnouncement(course.id, {
    title: `Route Error Announcement ${batch}`,
    body: 'Announcement body'
  }, teacher);
  const resource = contentService.createResource(course.id, {
    title: `Route Error Resource ${batch}`,
    type: 'link',
    url: 'https://example.com/resource',
    description: 'Resource body'
  }, teacher);
  const missingFileResource = contentService.createResource(course.id, {
    title: `Route Error Missing File ${batch}`,
    type: 'file',
    url: `/uploads/resources/missing-${batch}.pdf`,
    fileName: `missing-${batch}.pdf`,
    fileSizeBytes: 12,
    mimeType: 'application/pdf'
  }, teacher);
  const week = courseWeekService.createWeek(course.id, teacher, {
    weekNumber: 1,
    title: `Route Error Week ${batch}`,
    visible: true
  });
  const missingWeekResource = courseWeekService.createWeekResource(week.id, teacher, {
    title: `Missing Week File ${batch}`,
    type: 'file',
    content: `/uploads/resources/missing-week-${batch}.pdf`,
    fileName: `missing-week-${batch}.pdf`,
    fileSizeBytes: 10,
    mimeType: 'application/pdf'
  });
  const gradeScheme = quizService.getGradeSchemesForUser(teacher, course.id)[0];

  ctx = {
    admin,
    teacher,
    otherTeacher,
    student,
    outsider,
    course,
    participant,
    category,
    question,
    quiz,
    privateQuiz,
    quizGrant,
    announcement,
    resource,
    missingFileResource,
    week,
    missingWeekResource,
    gradeScheme,
    adminSession: authService.login(admin.username, 'RouteError123!'),
    teacherSession: authService.login(teacher.email, 'RouteError123!'),
    otherTeacherSession: authService.login(otherTeacher.email, 'RouteError123!'),
    studentSession: authService.login(student.studentNumber, 'RouteError123!'),
    outsiderSession: authService.login(outsider.studentNumber, 'RouteError123!')
  };
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('course route error responses', () => {
  test('covers service failures in course list, participants, content, and gradebook routes', async () => {
    await withMock(courseService, 'getAll', throwError, async () => {
      await request(app).get('/api/courses').set('Cookie', cookie(ctx.teacherSession)).expect(500);
    });

    await withMock(courseService, 'getParticipants', throwError, async () => {
      await request(app).get(`/api/courses/${ctx.course.id}/participants`).set('Cookie', cookie(ctx.teacherSession)).expect(500);
    });

    await withMock(contentService, 'getAnnouncements', throwError, async () => {
      await request(app).get(`/api/courses/${ctx.course.id}/announcements`).set('Cookie', cookie(ctx.teacherSession)).expect(500);
    });

    await withMock(contentService, 'getResources', throwError, async () => {
      await request(app).get(`/api/courses/${ctx.course.id}/resources`).set('Cookie', cookie(ctx.teacherSession)).expect(500);
    });

    await withMock(contentService, 'createAnnouncement', throwError, async () => {
      await request(app)
        .post(`/api/courses/${ctx.course.id}/announcements`)
        .set('Cookie', cookie(ctx.teacherSession))
        .send({ title: 'Valid title', body: 'Valid body' })
        .expect(400);
    });

    await withMock(contentService, 'createResource', throwError, async () => {
      await request(app)
        .post(`/api/courses/${ctx.course.id}/resources`)
        .set('Cookie', cookie(ctx.teacherSession))
        .send({ title: 'Valid resource', type: 'link', url: 'https://example.com' })
        .expect(400);
    });

    await withMock(quizService, 'getGradebook', throwError, async () => {
      await request(app).get(`/api/courses/${ctx.course.id}/gradebook`).set('Cookie', cookie(ctx.teacherSession)).expect(500);
    });

    await request(app)
      .get(`/api/courses/resources/${ctx.missingFileResource.id}/download`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(404);
  });

  test('covers service failures and guard branches in course mutation routes', async () => {
    await withMock(courseService, 'updateEnrollment', throwError, async () => {
      await request(app)
        .put(`/api/courses/enrollments/${ctx.participant.enrollmentId}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .send({ status: 'suspended' })
        .expect(400);
    });

    await withMock(courseService, 'deleteEnrollment', throwError, async () => {
      await request(app)
        .delete(`/api/courses/enrollments/${ctx.participant.enrollmentId}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(500);
    });

    await withMock(contentService, 'deleteAnnouncement', throwError, async () => {
      await request(app)
        .delete(`/api/courses/announcements/${ctx.announcement.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(500);
    });

    await withMock(contentService, 'deleteResource', throwError, async () => {
      await request(app)
        .delete(`/api/courses/resources/${ctx.resource.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(500);
    });

    await withMock(courseService, 'getById', throwError, async () => {
      await request(app).get(`/api/courses/${ctx.course.id}`).set('Cookie', cookie(ctx.teacherSession)).expect(500);
    });

    await withMock(courseService, 'update', () => throwError('Course not found.'), async () => {
      await request(app)
        .put(`/api/courses/${ctx.course.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .send({ title: 'Updated title' })
        .expect(404);
    });

    await withMock(courseService, 'update', throwError, async () => {
      await request(app)
        .put(`/api/courses/${ctx.course.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .send({ title: 'Updated title' })
        .expect(400);
    });

    await withMock(courseService, 'delete', () => throwError('Course not found.'), async () => {
      await request(app).delete(`/api/courses/${ctx.course.id}`).set('Cookie', cookie(ctx.teacherSession)).expect(404);
    });

    await withMock(courseService, 'delete', throwError, async () => {
      await request(app).delete(`/api/courses/${ctx.course.id}`).set('Cookie', cookie(ctx.teacherSession)).expect(500);
    });

    await request(app)
      .delete(`/api/courses/announcements/${ctx.announcement.id}`)
      .set('Cookie', cookie(ctx.outsiderSession))
      .expect(403);

    await request(app)
      .delete('/api/courses/resources/999999')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(404);
  });
});

describe('quiz route error responses', () => {
  test('covers create, template, sharing, grade-scheme, and quiz mutation failures', async () => {
    await request(app)
      .post('/api/quizzes')
      .set('Cookie', cookie(ctx.studentSession))
      .send(quizPayload(ctx.course.id))
      .expect(403);

    await withMock(quizService, 'create', throwError, async () => {
      await request(app)
        .post('/api/quizzes')
        .set('Cookie', cookie(ctx.teacherSession))
        .send(quizPayload(ctx.course.id))
        .expect(400);
    });

    await request(app)
      .delete('/api/quizzes/templates/not-a-number')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .get('/api/quizzes/templates?courseId=not-a-number')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await withMock(quizService, 'saveQuizAsTemplate', throwError, async () => {
      await request(app)
        .post(`/api/quizzes/${ctx.quiz.id}/save-as-template`)
        .set('Cookie', cookie(ctx.teacherSession))
        .send({ name: 'Template name' })
        .expect(400);
    });

    await withMock(quizService, 'releaseResults', throwError, async () => {
      await request(app)
        .post(`/api/quizzes/${ctx.quiz.id}/release-results`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(400);
    });

    await withMock(quizService, 'accessSummary', throwError, async () => {
      await request(app)
        .get(`/api/quizzes/${ctx.quiz.id}/access`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(400);
    });

    await request(app)
      .delete(`/api/quizzes/${ctx.quiz.id}/access/not-a-number`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .get('/api/quizzes/grade-schemes/not-a-number')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await withMock(quizService, 'update', throwError, async () => {
      await request(app)
        .put(`/api/quizzes/${ctx.quiz.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .send({ title: 'Updated quiz' })
        .expect(400);
    });

    await withMock(quizService, 'delete', throwError, async () => {
      await request(app)
        .delete(`/api/quizzes/${ctx.quiz.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(500);
    });
  });

  test('covers quiz access, detail, attempt, and list failure paths', async () => {
    await request(app)
      .get('/api/quizzes?courseId=not-a-number')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await request(app)
      .get(`/api/quizzes/${ctx.privateQuiz.id}`)
      .set('Cookie', cookie(ctx.otherTeacherSession))
      .expect(403);

    await withMock(quizService, 'getAttempt', () => ({ courseId: 999999 }), async () => {
      await request(app)
        .get('/api/quizzes/attempts/999999')
        .set('Cookie', cookie(ctx.studentSession))
        .expect(403);
    });

    await withMock(quizService, 'getAttempt', throwError, async () => {
      await request(app)
        .get('/api/quizzes/attempts/999999')
        .set('Cookie', cookie(ctx.studentSession))
        .expect(403);
    });

    await withMock(quizService, 'submitAttempt', throwError, async () => {
      await request(app)
        .post('/api/quizzes/attempts/999999/submit')
        .set('Cookie', cookie(ctx.studentSession))
        .send({ answers: [] })
        .expect(400);
    });

    const originalGetById = quizService.getById.bind(quizService);
    await withMock(quizService, 'getById', (...args) => {
      if (args[1] && args[1].includeQuestions) throw new Error('detail failed');
      return originalGetById(...args);
    }, async () => {
      await request(app)
        .get(`/api/quizzes/${ctx.quiz.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(500);
    });

    await request(app)
      .get(`/api/quizzes/${ctx.quiz.id}/attempts`)
      .set('Cookie', cookie(ctx.otherTeacherSession))
      .expect(403);

    await withMock(quizService, 'getAttemptsForQuiz', throwError, async () => {
      await request(app)
        .get(`/api/quizzes/${ctx.quiz.id}/attempts`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(500);
    });
  });
});

describe('question and category route error responses', () => {
  test('covers question read, write, duplicate, and access error handlers', async () => {
    await withMock(questionService, 'getById', throwError, async () => {
      await request(app)
        .get(`/api/questions/${ctx.question.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(500);
    });

    await request(app)
      .post('/api/questions')
      .set('Cookie', cookie(ctx.teacherSession))
      .send({ categoryId: 999999, text: 'Missing category', type: 'TF', correctAnswer: 'true' })
      .expect(400);

    await withMock(questionService, 'create', throwError, async () => {
      await request(app)
        .post('/api/questions')
        .set('Cookie', cookie(ctx.teacherSession))
        .send({ categoryId: ctx.category.id, text: 'Route question', type: 'TF', correctAnswer: 'true' })
        .expect(400);
    });

    await withMock(questionService, 'update', () => throwError('Question not found.'), async () => {
      await request(app)
        .put(`/api/questions/${ctx.question.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .send({ text: 'Updated question text' })
        .expect(404);
    });

    await withMock(questionService, 'update', throwError, async () => {
      await request(app)
        .put(`/api/questions/${ctx.question.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .send({ text: 'Updated question text' })
        .expect(400);
    });

    await withMock(questionService, 'delete', () => throwError('Question not found.'), async () => {
      await request(app)
        .delete(`/api/questions/${ctx.question.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(404);
    });

    await withMock(questionService, 'delete', throwError, async () => {
      await request(app)
        .delete(`/api/questions/${ctx.question.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(500);
    });

    await withMock(questionService, 'duplicate', throwError, async () => {
      await request(app)
        .post(`/api/questions/${ctx.question.id}/duplicate`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(400);
    });

    await withMock(questionService, 'accessSummary', throwError, async () => {
      await request(app)
        .get(`/api/questions/${ctx.question.id}/access`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(400);
    });

    await request(app)
      .delete(`/api/questions/${ctx.question.id}/access/not-a-number`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);
  });

  test('covers category read, update, and delete error handlers', async () => {
    await withMock(categoryService, 'getById', throwError, async () => {
      await request(app)
        .get(`/api/categories/${ctx.category.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(500);
    });

    await withMock(categoryService, 'update', () => throwError('Category not found.'), async () => {
      await request(app)
        .put(`/api/categories/${ctx.category.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .send({ name: 'Updated category' })
        .expect(404);
    });

    await withMock(categoryService, 'update', throwError, async () => {
      await request(app)
        .put(`/api/categories/${ctx.category.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .send({ name: 'Updated category' })
        .expect(400);
    });

    await withMock(categoryService, 'delete', () => throwError('Category not found.'), async () => {
      await request(app)
        .delete(`/api/categories/${ctx.category.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(404);
    });

    await withMock(categoryService, 'delete', throwError, async () => {
      await request(app)
        .delete(`/api/categories/${ctx.category.id}`)
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(500);
    });
  });
});

describe('user route error responses', () => {
  test('covers user list, reset, read, update, and password failure handlers', async () => {
    await withMock(userService, 'getAllUsers', throwError, async () => {
      await request(app).get('/api/users').set('Cookie', cookie(ctx.adminSession)).expect(400);
    });

    await withMock(authService, 'getPasswordResetRequests', throwError, async () => {
      await request(app)
        .get('/api/users/password-reset-requests')
        .set('Cookie', cookie(ctx.adminSession))
        .expect(500);
    });

    await withMock(userService, 'getUserById', throwError, async () => {
      await request(app).get(`/api/users/${ctx.student.id}`).set('Cookie', cookie(ctx.adminSession)).expect(500);
    });

    await withMock(userService, 'updateUser', throwError, async () => {
      await request(app)
        .put(`/api/users/${ctx.student.id}`)
        .set('Cookie', cookie(ctx.adminSession))
        .send({ name: 'Route Error Student Updated' })
        .expect(400);
    });

    await withMock(userService, 'setUserPassword', throwError, async () => {
      await request(app)
        .put(`/api/users/${ctx.student.id}/password`)
        .set('Cookie', cookie(ctx.adminSession))
        .send({ password: 'NewRouteError123!' })
        .expect(400);
    });
  });
});

describe('miscellaneous admin route error responses', () => {
  test('covers settings, analytics, weeks, and discussion catch handlers', async () => {
    await withMock(settingsService, 'getMaintenanceMode', throwError, async () => {
      await request(app)
        .get('/api/settings/maintenance')
        .set('Cookie', cookie(ctx.adminSession))
        .expect(500);
    });

    await withMock(academicService, 'adminAnalytics', throwError, async () => {
      await request(app)
        .get('/api/analytics/admin')
        .set('Cookie', cookie(ctx.adminSession))
        .expect(500);
    });

    await withMock(courseWeekService, 'listWeekResources', throwError, async () => {
      await request(app)
        .get('/api/weeks/weeks/999999/resources')
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(400);
    });

    await request(app)
      .get(`/api/weeks/week-resources/${ctx.missingWeekResource.id}/download`)
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(404);

    await request(app)
      .get('/api/discussion/threads/not-a-number')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(400);

    await withMock(discussionService, 'listReplies', throwError, async () => {
      await request(app)
        .get('/api/discussion/threads/999999/replies')
        .set('Cookie', cookie(ctx.teacherSession))
        .expect(400);
    });

    await request(app)
      .get('/api/issues')
      .set('Cookie', cookie(ctx.teacherSession))
      .expect(200);

    await withMock(validationIssueService, 'create', throwError, async () => {
      await request(app)
        .post('/api/issues')
        .set('Cookie', cookie(ctx.teacherSession))
        .send({
          entityType: 'quiz',
          entityId: ctx.quiz.id,
          severity: 'warning',
          message: 'forced issue failure'
        })
        .expect(400);
    });

    await withMock(importService, 'addError', throwError, async () => {
      await request(app)
        .post('/api/imports/batches/999999/errors')
        .set('Cookie', cookie(ctx.adminSession))
        .send({ rowNumber: 1, errorField: 'name', errorMessage: 'bad row' })
        .expect(400);
    });

    await withMock(importService, 'resolveError', throwError, async () => {
      await request(app)
        .put('/api/imports/errors/999999/resolve')
        .set('Cookie', cookie(ctx.adminSession))
        .send({ status: 'fixed' })
        .expect(400);
    });
  });
});
