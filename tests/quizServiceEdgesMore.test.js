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
const settingsService = require('../services/settingsService');
const courseService = require('../services/courseService');
const categoryService = require('../services/categoryService');
const questionService = require('../services/questionService');
const quizService = require('../services/quizService');
const { LIMITS } = require('../constants/limits');

const TEST_DB = path.join(__dirname, 'test_quiz_service_edges_more.db');
let counter = 0;

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

function stamp(prefix) {
  counter += 1;
  return `${prefix}${String(Date.now()).slice(-5)}${counter}`;
}

function createUser(role) {
  const id = stamp(role[0]);
  const payload = {
    name: `Quiz Edge ${role} ${id}`,
    username: `qe-${role}-${id}`,
    email: `qe-${role}-${id}@example.com`,
    role,
    password: 'QuizEdge123!'
  };
  if (role === 'teacher') payload.staffNumber = `QET-${id}`;
  if (role === 'student') payload.studentNumber = `QES-${id}`;
  return authService.createUser(payload);
}

function quizPayload(courseId, title, overrides = {}) {
  return {
    courseId,
    title,
    description: 'Quiz service edge coverage',
    status: 'draft',
    startAt: new Date(Date.now() - 60_000).toISOString(),
    endAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    durationMinutes: 10,
    maxAttempts: 1,
    ...overrides
  };
}

function makeQuestion(course, teacher, overrides = {}) {
  const category = categoryService.create({
    name: `QE Category ${stamp('cat')}`,
    courseId: course.id
  }, teacher);
  return questionService.create({
    categoryId: category.id,
    text: `Question ${stamp('q')}?`,
    type: 'TF',
    correctAnswer: 'true',
    points: 1,
    ...overrides
  }, teacher);
}

let ctx;

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();
  settingsService.setMaintenanceMode(false);

  const admin = createUser('admin');
  const teacher = createUser('teacher');
  const otherTeacher = createUser('teacher');
  const student = createUser('student');
  const otherStudent = createUser('student');
  const course = courseService.create({
    code: `QE-${stamp('c')}`.toUpperCase(),
    title: 'Quiz Service Edge Course',
    visibility: 'published'
  }, teacher);
  courseService.enroll(course.id, student.id, 'student');
  courseService.enroll(course.id, otherStudent.id, 'student');
  const otherCourse = courseService.create({
    code: `QE2-${stamp('c')}`.toUpperCase(),
    title: 'Other Quiz Service Edge Course',
    visibility: 'published'
  }, otherTeacher);

  ctx = { admin, teacher, otherTeacher, student, otherStudent, course, otherCourse };
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('quiz service CRUD and setQuestions edges', () => {
  test('adds Windows-style numeric suffixes to duplicate quiz titles within a course', () => {
    const title = `QE Duplicate ${stamp('quiz')}`;
    const first = quizService.create(quizPayload(ctx.course.id, title), ctx.teacher);
    const second = quizService.create(quizPayload(ctx.course.id, title), ctx.teacher);
    const third = quizService.create(quizPayload(ctx.course.id, title), ctx.teacher);
    const otherCourse = quizService.create(quizPayload(ctx.otherCourse.id, title), ctx.otherTeacher);
    const renameTarget = quizService.create(
      quizPayload(ctx.course.id, `QE Rename ${stamp('quiz')}`),
      ctx.teacher
    );

    expect(first.title).toBe(title);
    expect(second.title).toBe(`${title} (1)`);
    expect(third.title).toBe(`${title} (2)`);
    expect(otherCourse.title).toBe(title);
    expect(quizService.update(renameTarget.id, { title }, ctx.teacher).title).toBe(`${title} (3)`);
    expect(quizService.update(renameTarget.id, { description: 'Only the description changed' }, ctx.teacher).title)
      .toBe(`${title} (3)`);

    const maximumLengthTitle = 'L'.repeat(LIMITS.quizzes.titleMax);
    quizService.create(quizPayload(ctx.course.id, maximumLengthTitle), ctx.teacher);
    const suffixedMaximum = quizService.create(
      quizPayload(ctx.course.id, maximumLengthTitle),
      ctx.teacher
    );
    expect(suffixedMaximum.title).toBe(`${'L'.repeat(LIMITS.quizzes.titleMax - 4)} (1)`);
    expect(suffixedMaximum.title).toHaveLength(LIMITS.quizzes.titleMax);
  });

  test('covers missing records, delete permissions, includeTemplates, and question assignment validation', () => {
    const question = makeQuestion(ctx.course, ctx.teacher);
    const otherQuestion = makeQuestion(ctx.otherCourse, ctx.otherTeacher);
    const quiz = quizService.create(quizPayload(ctx.course.id, `QE Draft ${stamp('quiz')}`), ctx.teacher);
    const deleteQuiz = quizService.create(quizPayload(ctx.course.id, `QE Delete ${stamp('quiz')}`), ctx.teacher);

    expect(quizService.getById(999999)).toBeNull();
    expect(quizService.getById(quiz.id, { includeTemplates: true }).templates).toBeDefined();
    expect(() => quizService.create(quizPayload(999999, 'Missing Course'), ctx.teacher)).toThrow(/course not found/i);
    expect(() => quizService.update(999999, quizPayload(ctx.course.id, 'Missing Quiz'), ctx.teacher)).toThrow(/quiz not found/i);
    expect(() => quizService.delete(999999, ctx.teacher)).toThrow(/quiz not found/i);
    expect(() => quizService.delete(deleteQuiz.id, ctx.otherTeacher)).toThrow(/only the quiz owner/i);
    expect(quizService.delete(deleteQuiz.id, ctx.teacher)).toBe(true);

    expect(() => quizService.setQuestions(quiz.id, 'bad', ctx.teacher)).toThrow(/array/i);
    expect(() => quizService.setQuestions(quiz.id, [], ctx.teacher)).toThrow(/at least one/i);
    expect(() => quizService.setQuestions(999999, [question.id], ctx.teacher)).toThrow(/quiz not found/i);
    expect(() => quizService.setQuestions(quiz.id, [{ id: question.id, points: 0 }], ctx.teacher)).toThrow(/positive integer IDs/i);
    expect(() => quizService.setQuestions(
      quiz.id,
      Array.from({ length: LIMITS.quizzes.totalQuestionsMax + 1 }, (_, index) => index + 1),
      ctx.teacher
    )).toThrow(/at most/i);
    expect(() => quizService.setQuestions(quiz.id, [999999], ctx.teacher)).toThrow(/not found/i);
    expect(() => quizService.setQuestions(quiz.id, [otherQuestion.id], ctx.teacher)).toThrow(/not found/i);
    expect(() => quizService.setQuestions(quiz.id, [otherQuestion.id])).toThrow(/same course/i);

    const updated = quizService.setQuestions(quiz.id, [{ id: question.id, points: 3 }], ctx.teacher);
    expect(updated.questions[0].points).toBe(3);
    quizService.update(quiz.id, { status: 'published' }, ctx.teacher);
    const replacement = makeQuestion(ctx.course, ctx.teacher);
    expect(quizService.setQuestions(quiz.id, [replacement.id], ctx.teacher).status).toBe('published');

    const invalidReplacement = makeQuestion(ctx.course, ctx.teacher);
    getDatabase().prepare("UPDATE questions SET correctAnswer = 'maybe' WHERE id = ?")
      .run(invalidReplacement.id);
    expect(() => quizService.setQuestions(quiz.id, [invalidReplacement.id], ctx.teacher))
      .toThrow(/must keep at least one valid question/i);

    quizService.validateQuestionsForQuiz({
      id: quiz.id,
      courseId: ctx.course.id,
      questions: [{ ...replacement, status: 'invalid', validationMessage: 'Broken route question' }]
    }, ctx.teacher.id);
    const invalidated = getDatabase().prepare('SELECT status, validationMessage FROM questions WHERE id = ?').get(replacement.id);
    expect(invalidated).toEqual({ status: 'invalid', validationMessage: 'Broken route question' });
  });

  test('covers direct share/access/template and grade-scheme service branches', () => {
    const question = makeQuestion(ctx.course, ctx.teacher);
    const quiz = quizService.create(quizPayload(ctx.course.id, `QE Share ${stamp('quiz')}`), ctx.teacher);
    quizService.setQuestions(quiz.id, [question.id], ctx.teacher);

    expect(() => quizService.share(999999, { teacherEmail: ctx.otherTeacher.email }, ctx.teacher)).toThrow(/quiz not found/i);
    expect(() => quizService.accessSummary(999999, ctx.teacher)).toThrow(/quiz not found/i);
    expect(() => quizService.removeAccess(999999, ctx.otherTeacher.id, ctx.teacher)).toThrow(/quiz not found/i);
    expect(() => quizService.assertCanReadQuiz(quiz, { id: 0, role: 'student' })).not.toThrow();
    expect(() => quizService.assertCanReadQuiz(quiz, { id: 0, role: 'observer' })).toThrow(/teacher or admin/i);
    expect(() => quizService.assertCanReadQuiz(quiz, ctx.otherTeacher)).toThrow(/quiz access/i);
    expect(() => quizService.assertCanWriteQuiz(quiz, { id: 0, role: 'student' })).toThrow(/teacher or admin/i);

    expect(() => quizService.getExamTemplates({}, ctx.student)).toThrow(/teacher or admin/i);
    expect(() => quizService.getExamTemplates({ courseId: ctx.course.id }, ctx.otherTeacher)).toThrow(/course access/i);
    expect(() => quizService.createExamTemplate({}, ctx.teacher)).toThrow(/name/i);
    expect(() => quizService.createExamTemplate({
      name: 'Forbidden Template',
      courseId: ctx.course.id
    }, ctx.otherTeacher)).toThrow(/course access/i);
    expect(() => quizService.getExamTemplate(999999, ctx.teacher)).toThrow(/template not found/i);
    expect(() => quizService.updateExamTemplate(999999, { name: 'Missing' }, ctx.teacher)).toThrow(/template not found/i);
    expect(() => quizService.deleteExamTemplate(999999, ctx.teacher)).toThrow(/template not found/i);
    const systemTemplate = quizService.getExamTemplates({}, ctx.teacher).find(template => template.isSystem);
    expect(systemTemplate).toBeDefined();
    expect(() => quizService.getExamTemplate(systemTemplate.id, ctx.student)).toThrow(/teacher or admin/i);
    expect(() => quizService.updateExamTemplate(systemTemplate.id, { description: 'Teacher update' }, ctx.teacher))
      .toThrow(/system templates/i);
    const ownTemplate = quizService.createExamTemplate({
      name: `Own Template ${stamp('tpl')}`,
      defaults: { durationMinutes: 14 }
    }, ctx.teacher);
    expect(quizService.getExamTemplate(ownTemplate.id, ctx.teacher).name).toBe(ownTemplate.name);
    expect(() => quizService.getExamTemplate(ownTemplate.id, ctx.otherTeacher)).toThrow(/own/i);
    expect(() => quizService.updateExamTemplate(ownTemplate.id, { courseId: ctx.otherCourse.id }, ctx.teacher))
      .toThrow(/course access/i);
    expect(quizService.applyTemplate({ title: 'Templated' }, ownTemplate.name).durationMinutes).toBe(14);
    expect(() => quizService.saveQuizAsTemplate(999999, { name: 'Missing Quiz Template' }, ctx.teacher))
      .toThrow(/quiz not found/i);
    expect(quizService.getGradeSchemes(ctx.course.id).length).toBeGreaterThan(0);
    expect(quizService.getGradeSchemeForUser(quizService.getGradeSchemes(ctx.course.id)[0].id, ctx.teacher).thresholds.length)
      .toBeGreaterThan(0);
  });

  test('blocks attempts when published quizzes lose all valid questions', () => {
    const question = makeQuestion(ctx.course, ctx.teacher);
    const quiz = quizService.create(quizPayload(ctx.course.id, `QE Invalid Attempt ${stamp('quiz')}`), ctx.teacher);
    quizService.setQuestions(quiz.id, [question.id], ctx.teacher);
    quizService.update(quiz.id, { status: 'published' }, ctx.teacher);
    getDatabase().prepare("UPDATE questions SET status = 'invalid', validationMessage = 'Invalidated' WHERE id = ?")
      .run(question.id);

    expect(() => quizService.startAttempt(quiz.id, ctx.student, { headers: {}, userAgent: '' }))
      .toThrow(/temporarily unavailable/i);

    const submitQuestion = makeQuestion(ctx.course, ctx.teacher);
    const submitQuiz = quizService.create(quizPayload(ctx.course.id, `QE Submit Invalid ${stamp('quiz')}`), ctx.teacher);
    quizService.setQuestions(submitQuiz.id, [submitQuestion.id], ctx.teacher);
    quizService.update(submitQuiz.id, { status: 'published' }, ctx.teacher);
    const attempt = quizService.startAttempt(submitQuiz.id, ctx.student, { headers: {}, userAgent: '' });
    getDatabase().prepare("UPDATE questions SET status = 'invalid', validationMessage = 'Invalidated' WHERE id = ?")
      .run(submitQuestion.id);

    expect(() => quizService.submitAttempt(attempt.id, ctx.student, { answers: [] }))
      .toThrow(/temporarily unavailable/i);
    expect(() => quizService.getAttempt(attempt.id, ctx.otherStudent)).toThrow(/Attempt not found/i);
  });
});

describe('quiz service attempt edges', () => {
  test('covers attempt start/submit ownership, SEB, active reuse, and exhausted attempts', () => {
    const question = makeQuestion(ctx.course, ctx.teacher);
    const futureQuiz = quizService.create(quizPayload(ctx.course.id, `QE Future ${stamp('quiz')}`, {
      startAt: new Date(Date.now() + 60 * 60_000).toISOString(),
      endAt: new Date(Date.now() + 120 * 60_000).toISOString()
    }), ctx.teacher);
    quizService.setQuestions(futureQuiz.id, [question.id], ctx.teacher);
    quizService.update(futureQuiz.id, { status: 'published' }, ctx.teacher);
    expect(() => quizService.startAttempt(futureQuiz.id, ctx.student)).toThrow(/not open/i);

    const sebQuiz = quizService.create(quizPayload(ctx.course.id, `QE SEB ${stamp('quiz')}`, {
      requiresSeb: true
    }), ctx.teacher);
    quizService.setQuestions(sebQuiz.id, [question.id], ctx.teacher);
    quizService.update(sebQuiz.id, { status: 'published' }, ctx.teacher);

    expect(() => quizService.startAttempt(sebQuiz.id, ctx.teacher)).toThrow(/student accounts/i);
    expect(() => quizService.startAttempt(999999, ctx.student)).toThrow(/quiz not found/i);
    expect(() => quizService.submitAttempt(999999, ctx.student, { answers: [] })).toThrow(/attempt not found/i);
    expect(() => quizService.startAttempt(sebQuiz.id, ctx.student)).toThrow(/Safe Exam Browser/i);

    const sebAttempt = quizService.startAttempt(sebQuiz.id, ctx.student, {
      headers: { 'x-safe-exam-browser': '1' }
    });
    const reused = quizService.startAttempt(sebQuiz.id, ctx.student, {
      headers: { 'x-safe-exam-browser': '1' }
    });
    expect(reused.id).toBe(sebAttempt.id);

    expect(() => quizService.submitAttempt(sebAttempt.id, ctx.otherStudent, {
      answers: []
    })).toThrow(/your own attempts/i);
    quizService.submitAttempt(sebAttempt.id, ctx.student, {
      answers: { [question.id]: 'true' }
    });
    expect(() => quizService.submitAttempt(sebAttempt.id, ctx.student, {
      answers: []
    })).toThrow(/already been submitted/i);
    expect(() => quizService.startAttempt(sebQuiz.id, ctx.student, {
      headers: { 'x-safe-exam-browser': '1' }
    })).toThrow(/No attempts remaining/i);

    const draft = quizService.create(quizPayload(ctx.course.id, `QE Draft Attempt ${stamp('quiz')}`), ctx.teacher);
    expect(() => quizService.startAttempt(draft.id, ctx.student)).toThrow(/not published/i);
    expect(quizService.getAttempt(999999, ctx.student)).toBeNull();
  });

  test('expires stale active attempts before starting a replacement attempt', () => {
    const question = makeQuestion(ctx.course, ctx.teacher);
    const expiringQuiz = quizService.create(quizPayload(ctx.course.id, `QE Expire ${stamp('quiz')}`, {
      durationMinutes: 5,
      maxAttempts: 2
    }), ctx.teacher);
    quizService.setQuestions(expiringQuiz.id, [question.id], ctx.teacher);
    quizService.update(expiringQuiz.id, { status: 'published' }, ctx.teacher);

    const stale = quizService.startAttempt(expiringQuiz.id, ctx.otherStudent);
    const past = new Date(Date.now() - 5 * 60_000).toISOString();
    getDatabase().prepare('UPDATE quiz_attempts SET startedAt = ?, expiresAt = ? WHERE id = ?')
      .run(past, past, stale.id);

    const replacement = quizService.startAttempt(expiringQuiz.id, ctx.otherStudent);
    const expired = getDatabase().prepare('SELECT status, lifecycleStatus FROM quiz_attempts WHERE id = ?').get(stale.id);

    expect(replacement.id).not.toBe(stale.id);
    expect(expired).toEqual({ status: 'submitted', lifecycleStatus: 'expired' });
  });
});
