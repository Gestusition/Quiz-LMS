const {
  AppError,
  conflictError,
  forbiddenError,
  notFoundError,
  toErrorResponse,
  unauthorizedError,
  validationError
} = require('../utils/appError');
const validation = require('../utils/validation');
const { hashPassword, signJwt } = require('../utils/security');
const { requireFields } = require('../middleware/validation');
const authValidators = require('../validators/authValidators');
const academicValidators = require('../validators/academicValidators');
const { validateCourse } = require('../validators/courseValidators');
const { validateQuestion } = require('../validators/questionValidators');
const { validateQuiz } = require('../validators/quizValidators');
const { serializeQuiz, serializeQuizQuestion } = require('../serializers/quizSerializer');
const { serializeCurrentUser, serializeUser } = require('../serializers/userSerializer');

function expectFieldError(fn, field) {
  expect(fn).toThrow(AppError);
  try {
    fn();
  } catch (err) {
    expect(err.field).toBe(field);
  }
}

describe('app error helpers', () => {
  test('formats AppError, unique constraint, client fallback, and server fallback responses', () => {
    const app = validationError('email', 'Email is invalid.', { hint: 'use email' });
    const appResponse = toErrorResponse(app);
    expect(appResponse).toEqual({
      status: 400,
      payload: {
        error: 'Validation failed',
        field: 'email',
        message: 'Email is invalid.',
        details: { hint: 'use email' }
      }
    });

    expect(toErrorResponse(conflictError('code', 'Duplicate')).status).toBe(409);
    expect(toErrorResponse(forbiddenError('Blocked', 'BLOCKED')).payload.code).toBe('BLOCKED');
    expect(toErrorResponse(notFoundError()).status).toBe(404);
    expect(toErrorResponse(unauthorizedError()).status).toBe(401);
    expect(toErrorResponse({ code: 'SQLITE_CONSTRAINT_UNIQUE' }).status).toBe(409);
    expect(toErrorResponse(new Error('Bad request'), 400)).toEqual({
      status: 400,
      payload: { error: 'Bad request' }
    });
    expect(toErrorResponse(new Error('boom'), 503)).toEqual({
      status: 500,
      payload: { error: 'Internal server error.' }
    });
    expect(toErrorResponse(null, 418)).toEqual({
      status: 418,
      payload: { error: 'Request failed.' }
    });
  });
});

describe('shared validation helpers', () => {
  test('normalizes text, URLs, identifiers, booleans, dates, and pagination', () => {
    expect(validation.asTrimmedString(null)).toBe('');
    expect(validation.requiredText('  hello ', 'title')).toBe('hello');
    expect(validation.optionalText('', 'summary')).toBe('');
    expect(validation.optionalUrl('https://example.com/a', 'url')).toBe('https://example.com/a');
    expect(validation.optionalUrl('/uploads/resources/file.pdf', 'url', 2000, {
      allowRelative: true,
      allowedRelativePrefixes: ['/uploads/resources/']
    })).toBe('/uploads/resources/file.pdf');
    expect(validation.requiredEmail(' USER@Example.COM ')).toBe('user@example.com');
    expect(validation.optionalId('', 'courseId')).toBeNull();
    expect(validation.requiredId('4', 'courseId')).toBe(4);
    expect(validation.parsePositiveInt(5n)).toBe(5);
    expect(validation.parsePositiveInt(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).toBeNull();
    expect(validation.parseOptionalPositiveInt('', 'id')).toBeNull();
    expect(validation.parseRequiredPositiveInt('7', 'id')).toBe(7);
    expect(validation.intInRange('', 'limit', 1, 10, { required: false, defaultValue: 3 })).toBe(3);
    expect(validation.numberInRange('', 'score', 0, 100, { required: false, defaultValue: 0 })).toBe(0);
    expect(validation.booleanValue(undefined, true)).toBe(true);
    expect(validation.booleanValue('1')).toBe(true);
    expect(validation.booleanValue('false')).toBe(false);
    expect(validation.booleanValue('anything')).toBe(true);
    expect(validation.enumValue('', 'status', ['draft', 'published'], 'draft')).toBe('draft');
    expect(validation.dateValue('2026-05-11', 'date')).toBe('2026-05-11T00:00:00.000Z');
    expect(validation.dateOnlyValue('2026-05-11', 'date')).toBe('2026-05-11');
    expect(validation.parsePagination({ page: '2', limit: '5' })).toEqual({ page: 2, limit: 5, offset: 5 });
    expect(validation.stripInvisible(' a   b \n c ')).toBe('a b c');
    expect(() => validation.ensureDateOrder('2026-01-01', '2026-01-01', 'start', 'end')).not.toThrow();
  });

  test('rejects invalid shared validation values', () => {
    expectFieldError(() => validation.requiredText('', 'title'), 'title');
    expectFieldError(() => validation.requiredText('x', 'title', { min: 2 }), 'title');
    expectFieldError(() => validation.optionalText('abcd', 'summary', 3), 'summary');
    expectFieldError(() => validation.optionalUrl('not-url', 'url'), 'url');
    expectFieldError(() => validation.optionalUrl('ftp://example.com', 'url'), 'url');
    expectFieldError(() => validation.optionalUrl('/private/file.pdf', 'url', 2000, {
      allowRelative: true,
      allowedRelativePrefixes: ['/uploads/']
    }), 'url');
    expectFieldError(() => validation.requiredEmail('bad'), 'email');
    expectFieldError(() => validation.requiredEmail(`${'a'.repeat(260)}@x.com`), 'email');
    expectFieldError(() => validation.optionalId('abc', 'courseId'), 'courseId');
    expectFieldError(() => validation.requiredId('', 'courseId'), 'courseId');
    expectFieldError(() => validation.parseOptionalPositiveInt('-1', 'id'), 'id');
    expectFieldError(() => validation.parseRequiredPositiveInt('', 'id'), 'id');
    expectFieldError(() => validation.intInRange('1.5', 'limit', 1, 10), 'limit');
    expectFieldError(() => validation.numberInRange('bad', 'score', 0, 100), 'score');
    expectFieldError(() => validation.enumValue('bad', 'status', ['draft']), 'status');
    expectFieldError(() => validation.dateValue('', 'date', { required: true }), 'date');
    expectFieldError(() => validation.dateValue('not-date', 'date'), 'date');
    expectFieldError(() => validation.dateOnlyValue('', 'date', { required: true }), 'date');
    expectFieldError(() => validation.dateOnlyValue('2026-2-1', 'date'), 'date');
    expectFieldError(() => validation.dateOnlyValue('2026-02-31', 'date'), 'date');
    expectFieldError(() => validation.ensureDateOrder('2026-02-01', '2026-01-01', 'start', 'end'), 'end');
    expectFieldError(() => validation.parsePagination({ page: '0' }), 'page');
  });

  test('middleware and security helpers reject missing required inputs', () => {
    const response = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      }
    };
    const next = jest.fn();
    requireFields(['name', 'email'])({ body: { name: '  ' } }, response, next);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('name, email');
    expect(next).not.toHaveBeenCalled();

    expect(() => hashPassword('')).toThrow('Password is required');

    const originalNodeEnv = process.env.NODE_ENV;
    const originalJwtSecret = process.env.JWT_SECRET;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;
      expect(() => signJwt({ userId: 1, role: 'admin' }, 1)).toThrow('JWT_SECRET is required');
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;
      if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = originalJwtSecret;
    }
  });
});

describe('auth validators', () => {
  test('validates role-specific user payloads and identifiers', () => {
    expect(authValidators.validateUsername(' User.Name-1 ')).toBe('user.name-1');
    expect(() => authValidators.validatePassword('Strong123')).not.toThrow();
    expect(authValidators.validateStudentNumber(' STU-42 ')).toBe('STU-42');
    expect(authValidators.validateEmployeeNumber('', false)).toBe('');
    expect(authValidators.validateEmployeeNumber('EMP-42', true)).toBe('EMP-42');
    expect(authValidators.usernameFromEmail('Nice.User+tag@example.com')).toBe('nice.usertag');

    const student = authValidators.validateUserPayload({
      name: 'Student User',
      email: 'student@example.com',
      role: 'student',
      password: 'Student123!',
      studentNumber: 'STU-42',
      classYearId: '1',
      sectionId: '2',
      mustChangeCredentials: true
    }, true);
    expect(student.username).toBe('student');
    expect(student.studentNumber).toBe('STU-42');
    expect(student.classYearId).toBe(1);
    expect(student.sectionId).toBe(2);
    expect(student.mustChangeCredentials).toBe(true);

    const teacher = authValidators.validateUserPayload({
      name: 'Teacher User',
      username: 'teacher-user',
      email: 'teacher@example.com',
      role: 'teacher',
      status: 'disabled',
      department: 'Math',
      staffNumber: 'EMP-42'
    }, false);
    expect(teacher.classYearId).toBeNull();
    expect(teacher.staffNumber).toBe('EMP-42');
    expect(teacher.password).toBeUndefined();
  });

  test('rejects invalid auth payload values', () => {
    expectFieldError(() => authValidators.validateUsername('bad space'), 'username');
    expectFieldError(() => authValidators.validatePassword('short'), 'password');
    expectFieldError(() => authValidators.validatePassword('lowercase123'), 'password');
    expectFieldError(() => authValidators.validateStudentNumber(''), 'student_number');
    expectFieldError(() => authValidators.validateStudentNumber('bad space'), 'student_number');
    expectFieldError(() => authValidators.validateEmployeeNumber('', true), 'employee_number');
    expectFieldError(() => authValidators.validateEmployeeNumber('bad space'), 'employee_number');
    expectFieldError(() => authValidators.validateUserPayload({
      name: 'Bad Role',
      username: 'bad-role',
      email: 'bad@example.com',
      role: 'guest',
      password: 'BadRole123!'
    }, true), 'role');
    expectFieldError(() => authValidators.validateUserPayload({
      name: 'Bad Status',
      username: 'bad-status',
      email: 'bad-status@example.com',
      role: 'admin',
      status: 'paused',
      password: 'BadStatus123!'
    }, true), 'status');
  });
});

describe('academic validators', () => {
  test('validates academic hierarchy, assignments, submissions, and attendance', () => {
    expect(academicValidators.validateFaculty({ name: 'Engineering', code: 'eng' })).toEqual({
      name: 'Engineering',
      code: 'ENG'
    });
    expect(academicValidators.validateDepartment({ facultyId: '1', name: 'Software', code: 'sw' }).facultyId).toBe(1);
    expect(academicValidators.validateClassYear({ departmentId: 1, yearNumber: 2 }).name).toBe('Year 2');
    expect(academicValidators.validateSection({ classYearId: 1, name: 'A' }).name).toBe('A');
    expect(academicValidators.validateTerm({
      name: 'Spring 2026',
      academicYear: '2025-2026',
      semesterType: 'SPRING',
      startDate: '2026-02-01',
      endDate: '2026-06-01',
      isActive: true
    }).semesterType).toBe('spring');
    expect(academicValidators.validateCourseOffering({
      courseId: 1,
      termId: 1,
      capacity: '',
      status: 'active'
    }).capacity).toBe(0);
    expect(academicValidators.validateOfferingEnrollment({
      courseOfferingId: 1,
      studentId: 2,
      finalGrade: 'AA'
    }).status).toBe('active');
    expect(academicValidators.validateAssignment({
      courseOfferingId: 1,
      title: 'Homework',
      dueDate: '2026-05-12',
      status: 'published'
    }).status).toBe('published');
    expect(academicValidators.validateSubmission({ submissionText: 'Answer' }).submissionText).toBe('Answer');
    expect(academicValidators.validateSubmission({
      submissionUrl: '/uploads/submissions/file.pdf',
      fileName: 'file.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 10
    }).fileName).toBe('file.pdf');
    expect(academicValidators.validateSubmissionGrade({ grade: '90', feedback: 'Good' }).status).toBe('graded');
    expect(academicValidators.validateAttendanceSession({
      courseOfferingId: 1,
      sessionDate: '2026-05-11T10:00:00Z',
      title: 'Lecture'
    }).topic).toBe('Lecture');
    expect(academicValidators.validateAttendanceRecord({
      studentId: 2,
      status: 'present',
      note: 'On time'
    }).status).toBe('present');
  });

  test('rejects invalid academic values', () => {
    expectFieldError(() => academicValidators.validateFaculty({ name: 'Engineering', code: 'bad code' }), 'Faculty code');
    expectFieldError(() => academicValidators.validateTerm({
      name: 'Bad Term',
      academicYear: '2026',
      startDate: '2026-06-01',
      endDate: '2026-02-01'
    }), 'endDate');
    expectFieldError(() => academicValidators.validateSubmission({}), 'submission');
    expectFieldError(() => academicValidators.validateSubmission({
      submissionUrl: '/uploads/submissions/file.pdf',
      fileSizeBytes: 101 * 1024 * 1024
    }), 'file');
    expectFieldError(() => academicValidators.validateAttendanceRecord({ studentId: 1, status: 'maybe' }), 'status');
  });
});

describe('course, quiz, question validators and serializers', () => {
  test('validates course and quiz aliases/defaults', () => {
    const course = validateCourse({
      code: ' web-101 ',
      title: 'Web Development',
      visibility: 'published',
      credits: '',
      startDate: '2026-01-01',
      endDate: '2026-05-01'
    });
    expect(course.code).toBe('WEB-101');
    expect(course.credits).toBe(3);

    const quiz = validateQuiz({
      courseId: 1,
      title: 'Midterm',
      openAt: '2026-01-01',
      closeAt: '2026-01-02',
      timeLimitMinutes: 30,
      attemptsAllowed: 2,
      shuffleQuestions: 'true',
      showCorrectAnswers: false,
      penaltyRatio: '0.5'
    });
    expect(quiz.startAt).toBe('2026-01-01T00:00:00.000Z');
    expect(quiz.durationMinutes).toBe(30);
    expect(quiz.maxAttempts).toBe(2);
    expect(quiz.showCorrectAnswers).toBe(false);
    expect(quiz.penaltyRatio).toBe(0.5);
    expectFieldError(() => validateCourse({ code: 'bad code', title: 'Bad Code' }), 'code');
  });

  test('covers advanced question validation branches', () => {
    expect(validateQuestion({
      categoryId: 1,
      text: 'Numeric answer?',
      type: 'SA',
      correctAnswer: '3.14',
      gradingType: 'manual',
      mediaUrl: '/uploads/image.png',
      acceptedAnswers: [' 3.140 ', 'pi-ish']
    }).gradingType).toBe('manual');
    expect(validateQuestion({
      categoryId: 1,
      text: 'Select all?',
      type: 'MR',
      options: ['A', 'B', 'C'],
      correctAnswer: '0,2'
    }).correctAnswer).toBe('0,2');
    expect(validateQuestion({
      categoryId: 1,
      text: 'Order these',
      type: 'OR',
      options: ['First', 'Second']
    }).correctAnswer).toBe('0,1');
    expect(validateQuestion({
      categoryId: 1,
      text: 'Essay answer',
      type: 'ES'
    }).correctAnswer).toBe('');
    expect(validateQuestion({
      categoryId: 1,
      text: 'Multi part',
      type: 'MP',
      parts: [{
        partLabel: 'a',
        answerType: 'select',
        correctAnswer: 'x',
        points: 1,
        acceptedAnswers: ['x', 'X']
      }]
    }).parts).toHaveLength(1);
  });

  test('rejects advanced question validation failures', () => {
    expectFieldError(() => validateQuestion({ categoryId: 1, text: 'Bad difficulty', type: 'TF', correctAnswer: 'true', difficulty: 'wild' }), 'difficulty');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Long option?',
      type: 'MC',
      options: ['A'.repeat(1000), 'B'],
      correctAnswer: '1'
    }), 'options');
    expectFieldError(() => validateQuestion({ categoryId: 1, text: 'No blank', type: 'FB', correctAnswer: '' }), 'correct_answer');
    expectFieldError(() => validateQuestion({ categoryId: 1, text: 'Long blank', type: 'FB', correctAnswer: 'A'.repeat(1000) }), 'correct_answer');
    expectFieldError(() => validateQuestion({ categoryId: 1, text: 'No numeric answer', type: 'SA', correctAnswer: '' }), 'correct_answer');
    expectFieldError(() => validateQuestion({ categoryId: 1, text: 'No num', type: 'SA', correctAnswer: 'abc' }), 'correct_answer');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Too few MR',
      type: 'MR',
      options: ['A'],
      correctAnswer: '0'
    }), 'options');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'No MR answer',
      type: 'MR',
      options: ['A', 'B'],
      correctAnswer: ''
    }), 'correct_answer');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Blank MR answer',
      type: 'MR',
      options: ['A', 'B'],
      correctAnswer: ','
    }), 'correct_answer');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Duplicate MR',
      type: 'MR',
      options: ['A', 'B'],
      correctAnswer: '0,0'
    }), 'correct_answer');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Bad MR',
      type: 'MR',
      options: ['A', 'B'],
      correctAnswer: 'x'
    }), 'correct_answer');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Bad OR',
      type: 'OR',
      options: ['Only one']
    }), 'options');
    expectFieldError(() => validateQuestion({ categoryId: 1, text: 'No table', type: 'MT' }), 'tableConfig');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'No table columns',
      type: 'MT',
      tableConfig: { columns: [], rowCount: 1, correctData: { r0_c0: 'x' } }
    }), 'tableConfig');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Bad table',
      type: 'MT',
      tableConfig: { columns: [{ header: '', type: 'label' }], rowCount: 1, correctData: { r0_c0: 'x' } }
    }), 'tableConfig');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Bad table type',
      type: 'MT',
      tableConfig: { columns: [{ header: 'A', type: 'bad' }], rowCount: 1, correctData: { r0_c0: 'x' } }
    }), 'tableConfig');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Bad table rows',
      type: 'MT',
      tableConfig: { columns: [{ header: 'A', type: 'input' }], rowCount: 0, correctData: { r0_c0: 'x' } }
    }), 'tableConfig');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Bad correct data',
      type: 'MT',
      tableConfig: { columns: [{ header: 'A', type: 'input' }], rowCount: 1, correctData: [] }
    }), 'tableConfig');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Empty correct data',
      type: 'MT',
      tableConfig: { columns: [{ header: 'A', type: 'input' }], rowCount: 1, correctData: {} }
    }), 'tableConfig');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Bad cell key',
      type: 'MT',
      tableConfig: { columns: [{ header: 'A', type: 'input' }], rowCount: 1, correctData: { bad: 'x' } }
    }), 'tableConfig');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Bad cell shape',
      type: 'MT',
      tableConfig: { columns: [{ header: 'A', type: 'input' }], rowCount: 1, correctData: { r2_c0: 'x' } }
    }), 'tableConfig');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Long table cell',
      type: 'MT',
      tableConfig: { columns: [{ header: 'A', type: 'input' }], rowCount: 1, correctData: { r0_c0: 'x'.repeat(1000) } }
    }), 'tableConfig');
    expectFieldError(() => validateQuestion({ categoryId: 1, text: 'No parts', type: 'MP', parts: [] }), 'parts');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Bad part',
      type: 'MP',
      parts: [{ partLabel: '', answerType: 'text', correctAnswer: 'x', points: 1 }]
    }), 'parts');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Bad answer type',
      type: 'MP',
      parts: [{ partLabel: 'a', answerType: 'bad', correctAnswer: 'x', points: 1 }]
    }), 'parts');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'No part answer',
      type: 'MP',
      parts: [{ partLabel: 'a', answerType: 'text', points: 1 }]
    }), 'parts');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Bad part points',
      type: 'MP',
      parts: [{ partLabel: 'a', answerType: 'text', correctAnswer: 'x', points: 0 }]
    }), 'parts');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Bad accepted answers',
      type: 'MP',
      parts: [{ partLabel: 'a', answerType: 'text', correctAnswer: 'x', points: 1, acceptedAnswers: 'x' }]
    }), 'parts');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Long part field',
      type: 'MP',
      parts: [{ partLabel: 'a'.repeat(1000), answerType: 'text', correctAnswer: 'x', points: 1 }]
    }), 'parts');
    expectFieldError(() => validateQuestion({
      categoryId: 1,
      text: 'Long accepted answer',
      type: 'MP',
      parts: [{ partLabel: 'a', answerType: 'text', correctAnswer: 'x', points: 1, acceptedAnswers: ['x'.repeat(1000)] }]
    }), 'parts');
  });

  test('serializes quizzes, quiz questions, and users safely', () => {
    expect(serializeQuiz(null)).toBeNull();
    const openQuiz = serializeQuiz({
      id: 1,
      status: 'published',
      openAt: new Date(Date.now() - 1000).toISOString(),
      closeAt: new Date(Date.now() + 1000).toISOString(),
      timeLimitMinutes: 20,
      attemptsAllowed: 2,
      requiresSeb: 1,
      penaltyEnabled: 1,
      penaltyPerWrong: '0.5',
      penaltyRatio: '0.25',
      shuffleQuestions: 1,
      shuffleOptions: 0,
      showCorrectAnswers: 1
    });
    expect(openQuiz.isOpen).toBe(true);
    expect(openQuiz.durationMinutes).toBe(20);
    expect(openQuiz.maxAttempts).toBe(2);
    expect(openQuiz.requiresSeb).toBe(true);

    const questionWithoutCorrect = serializeQuizQuestion({
      id: 1,
      quizPoints: 3,
      options: '["A"]',
      acceptedAnswers: '["a"]',
      caseSensitive: 1,
      correctAnswer: '0'
    });
    expect(questionWithoutCorrect.points).toBe(3);
    expect(questionWithoutCorrect.correctAnswer).toBeUndefined();

    const questionWithCorrect = serializeQuizQuestion({
      id: 2,
      quizPoints: 4,
      options: '[]',
      acceptedAnswers: '[]',
      status: '',
      validationMessage: '',
      correctAnswer: 'x'
    }, { includeCorrect: true });
    expect(questionWithCorrect.correctAnswer).toBe('x');
    expect(questionWithCorrect.status).toBe('valid');

    expect(serializeUser(null)).toBeNull();
    expect(serializeCurrentUser(null)).toBeNull();
    expect(serializeUser({
      id: 1,
      name: 'Student',
      username: 'student',
      email: 's@example.com',
      role: 'student',
      status: 'active',
      studentNumber: 'S1',
      mustChangeCredentials: 1
    }).studentNumber).toBe('S1');
    expect(serializeUser({
      id: 2,
      name: 'Teacher',
      username: 'teacher',
      email: 't@example.com',
      role: 'teacher',
      status: 'active',
      staffNumber: 'T1'
    }).staffNumber).toBe('T1');
    expect(serializeCurrentUser({
      id: 3,
      name: 'Admin',
      username: 'admin',
      email: 'a@example.com',
      role: 'admin',
      status: 'active',
      displayName: 'Root',
      adminTitle: 'Owner'
    }).displayName).toBe('Root');
  });
});
