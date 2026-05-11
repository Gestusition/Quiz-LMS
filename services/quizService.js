const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const questionRepository = require('../repositories/questionRepository');
const quizRepository = require('../repositories/quizRepository');
const resourceAccessRepository = require('../repositories/resourceAccessRepository');
const { quizStatusValues } = require('../constants/enums');
const { validateQuiz } = require('../validators/quizValidators');
const {
  serializeQuiz,
  serializeQuizQuestion
} = require('../serializers/quizSerializer');
const { serializeGradebook } = require('../serializers/gradebookSerializer');
const { nowIso } = require('../utils/security');
const restrictionService = require('./restrictionService');
const validationIssueService = require('./validationIssueService');
const auditService = require('./auditService');
const resourceAccessService = require('./resourceAccessService');
const gradeSchemeService = require('./gradeSchemeService');
const questionService = require('./questionService');
const { forbiddenError, notFoundError, validationError } = require('../utils/appError');
const { LIMITS } = require('../constants/limits');
const { VALIDATION_ISSUE_MESSAGES } = require('../constants/validationIssues');
const { parseRequiredPositiveInt, parseOptionalPositiveInt } = require('../utils/validation');

class QuizService {
  getAll(user, filters = {}) {
    return quizRepository.list(user, filters, quizStatusValues)
      .map(serializeQuiz)
      .filter(quiz => user.role === 'admin' || !restrictionService.hasActiveRestriction({
        user,
        restrictionType: 'course_access_blocked',
        scopeType: 'course',
        scopeId: quiz.courseId
      }));
  }

  getById(id, options = {}) {
    const quiz = serializeQuiz(quizRepository.getById(id, options.user || null));
    if (!quiz) return null;

    if (options.includeQuestions) {
      quiz.questions = this.getQuizQuestions(id, { includeCorrect: !!options.includeCorrect })
        .filter(question => question.status !== 'invalid');
    }
    if (options.includeTemplates) {
      quiz.templates = quizRepository.listExamTemplates();
    }
    return quiz;
  }

  create(data, user) {
    const payload = this.applyTemplate(validateQuiz(data), data.templateName);
    const course = courseRepository.findById(payload.courseId);
    if (!course) {
      throw notFoundError('Course not found.');
    }
    if (payload.status === 'published') {
      throw validationError('questions', 'Create the quiz as a draft, assign at least one valid question, then publish it.');
    }

    const result = quizRepository.insert(payload, user.id);
    const quiz = this.getById(result.lastInsertRowid, { includeQuestions: true, includeCorrect: true, user });
    auditService.log({
      actorUserId: user.id,
      action: 'QUIZ_CREATED',
      entityType: 'quiz',
      entityId: quiz.id,
      details: { courseId: quiz.courseId, title: quiz.title }
    });
    return quiz;
  }

  update(id, data, user) {
    const existing = quizRepository.findById(id);
    if (!existing) {
      throw notFoundError('Quiz not found.');
    }

    const payload = this.applyTemplate(validateQuiz({
      courseId: data.courseId !== undefined ? data.courseId : existing.courseId,
      title: data.title !== undefined ? data.title : existing.title,
      description: data.description !== undefined ? data.description : existing.description,
      status: data.status !== undefined ? data.status : existing.status,
      startAt: data.startAt !== undefined ? data.startAt : (existing.startAt || existing.openAt),
      endAt: data.endAt !== undefined ? data.endAt : (existing.endAt || existing.closeAt),
      durationMinutes: data.durationMinutes !== undefined ? data.durationMinutes : (existing.durationMinutes || existing.timeLimitMinutes),
      maxAttempts: data.maxAttempts !== undefined ? data.maxAttempts : (existing.maxAttempts || existing.attemptsAllowed),
      shuffleQuestions: data.shuffleQuestions !== undefined ? data.shuffleQuestions : !!existing.shuffleQuestions,
      shuffleOptions: data.shuffleOptions !== undefined ? data.shuffleOptions : !!existing.shuffleOptions,
      showResultPolicy: data.showResultPolicy !== undefined ? data.showResultPolicy : existing.showResultPolicy,
      gradingMode: data.gradingMode !== undefined ? data.gradingMode : existing.gradingMode,
      penaltyEnabled: data.penaltyEnabled !== undefined ? data.penaltyEnabled : !!existing.penaltyEnabled,
      penaltyPerWrong: data.penaltyPerWrong !== undefined ? data.penaltyPerWrong : existing.penaltyPerWrong,
      penaltyRatio: data.penaltyRatio !== undefined ? data.penaltyRatio : existing.penaltyRatio,
      requiresSeb: data.requiresSeb !== undefined ? data.requiresSeb : !!existing.requiresSeb,
      sebConfigName: data.sebConfigName !== undefined ? data.sebConfigName : existing.sebConfigName,
      sebConfigUrl: data.sebConfigUrl !== undefined ? data.sebConfigUrl : existing.sebConfigUrl,
      showCorrectAnswers: data.showCorrectAnswers !== undefined ? data.showCorrectAnswers : !!existing.showCorrectAnswers,
      templateName: data.templateName !== undefined ? data.templateName : existing.templateName
    }), data.templateName);

    if (payload.status === 'published') {
      this.assertQuizPublishable(this.buildPublishableCandidate(id, payload));
    }

    quizRepository.update(id, payload, nowIso(), user ? user.id : null);
    const quiz = this.getById(id, { includeQuestions: true, includeCorrect: true, user });

    if (quiz.status === 'published') {
      auditService.log({
        actorUserId: user ? user.id : null,
        action: 'QUIZ_PUBLISHED',
        entityType: 'quiz',
        entityId: quiz.id,
        details: { questionCount: quiz.questions.length }
      });
    }

    return quiz;
  }

  delete(id, user = null) {
    const existing = quizRepository.findById(id);
    if (!existing) {
      throw notFoundError('Quiz not found.');
    }
    if (user && user.role !== 'admin' && Number(existing.createdBy) !== Number(user.id)) {
      throw forbiddenError('Only the quiz owner or an admin can delete this quiz.');
    }

    resourceAccessRepository.deleteForResource('quiz', id);
    quizRepository.deleteById(id);
    return true;
  }

  setQuestions(quizId, questionIds, actor = null) {
    const actorUser = actor && typeof actor === 'object' ? actor : null;
    const actorUserId = actorUser ? actorUser.id : actor;
    if (!Array.isArray(questionIds)) {
      throw validationError('question_ids', 'questionIds must be an array.');
    }

    const parsedQuestions = [];
    const uniqueIds = [];
    
    questionIds.forEach((item, index) => {
      let id;
      let points = null;
      try {
        if (typeof item === 'object' && item !== null) {
          id = parseRequiredPositiveInt(item.id, `questionIds[${index}].id`);
          if (item.points !== undefined && item.points !== null) {
            points = Number(item.points);
            if (!Number.isFinite(points) || points <= 0 || points > LIMITS.questions.pointsMax) {
              throw new Error('Invalid points value.');
            }
          }
        } else {
          id = parseRequiredPositiveInt(item, `questionIds[${index}]`);
        }
      } catch (err) {
        throw validationError('question_ids', 'questionIds must contain positive integer IDs or objects with id and valid points.');
      }
      
      if (!uniqueIds.includes(id)) {
        uniqueIds.push(id);
        parsedQuestions.push({ id, points });
      }
    });

    if (uniqueIds.length === 0) {
      throw validationError('question_ids', 'At least one question is required.');
    }
    if (uniqueIds.length > LIMITS.quizzes.totalQuestionsMax) {
      throw validationError('question_ids', `A quiz can include at most ${LIMITS.quizzes.totalQuestionsMax} questions.`);
    }

    const quiz = quizRepository.findById(quizId);
    if (!quiz) {
      throw notFoundError('Quiz not found.');
    }

    const questions = questionRepository.findByIdsWithCourse(uniqueIds, actorUser);
    if (questions.length !== uniqueIds.length) {
      throw validationError('question_ids', 'One or more questions were not found.');
    }
    if (questions.some(question => question.courseId !== quiz.courseId)) {
      throw validationError('question_ids', 'All quiz questions must belong to the same course as the quiz.');
    }
    if (quiz.status === 'published') {
      const validIncoming = uniqueIds
        .map(questionId => questionService.getById(questionId))
        .filter(question => this.validateQuestionIntegrity(question).valid);
      if (validIncoming.length === 0) {
        throw validationError('questions', 'A published quiz must keep at least one valid question.');
      }
    }

    quizRepository.withTransaction(() => {
      quizRepository.replaceQuestions(quizId, questions, parsedQuestions);
    });

    const updated = this.getById(quizId, { includeQuestions: true, includeCorrect: true });
    this.validateQuestionsForQuiz(updated, actorUserId);
    if (updated.status === 'published') {
      this.assertQuizPublishable(updated);
    }
    return updated;
  }

  getQuizQuestions(quizId, options = {}) {
    const rows = quizRepository.getQuestions(quizId);

    return rows.map(row => {
      const complete = questionService.enrichQuestion(serializeQuizQuestion(row, { includeCorrect: true }));
      const normalized = this.validateQuestionIntegrity(complete);
      const question = questionService.enrichQuestion(serializeQuizQuestion(row, options));
      if (!options.includeCorrect) {
        this.stripQuestionCorrectData(question);
      }
      return {
        ...question,
        status: normalized.valid ? (question.status || 'valid') : 'invalid',
        validationMessage: normalized.error || question.validationMessage || ''
      };
    });
  }

  startAttempt(quizId, user, context = {}) {
    if (user.role !== 'student') {
      throw forbiddenError('Only student accounts can start quiz attempts.');
    }

    restrictionService.assertAccessAllowed({
      user,
      restrictionType: 'quiz_blocked',
      scopeType: 'quiz',
      scopeId: quizId,
      safeMessage: 'Your access to this quiz is restricted. Please contact your instructor or administrator.'
    });

    const quiz = this.getById(quizId, { includeQuestions: true, includeCorrect: false });
    if (!quiz) {
      throw notFoundError('Quiz not found.');
    }
    restrictionService.assertAccessAllowed({
      user,
      restrictionType: 'course_access_blocked',
      scopeType: 'course',
      scopeId: quiz.courseId,
      safeMessage: 'Your access to this course is restricted. Please contact your instructor or administrator.'
    });
    if (quiz.status !== 'published') {
      throw validationError('status', 'This quiz is not published.');
    }
    if (!quiz.isOpen) {
      throw validationError('availability', 'This quiz is not open right now.');
    }

    if (quiz.requiresSeb) {
      this.assertSebCompatible(context);
    }

    const validQuestions = quiz.questions.filter(question => question.status !== 'invalid');
    if (validQuestions.length === 0) {
      validationIssueService.create({
        entityType: 'quiz',
        entityId: quiz.id,
        severity: 'critical',
        field: 'questions',
        message: VALIDATION_ISSUE_MESSAGES.quizNoValidQuestions,
        status: 'open',
        relatedCourseId: quiz.courseId,
        relatedUserId: user.id,
        visibleToUser: false
      });
      throw validationError('questions', 'This exam is temporarily unavailable. Please contact instructor/admin.');
    }

    const active = quizRepository.findActiveAttempt(quizId, user.id);
    if (active) {
      if (this.isAttemptExpired(active)) {
        this.expireAttempt(active, quiz, user);
      } else {
        return this.getAttempt(active.id, user, { includeQuestions: true });
      }
    }

    const submittedCount = quizRepository.countSubmittedAttempts(quizId, user.id);
    const maxAttempts = Number(quiz.maxAttempts || quiz.attemptsAllowed || 1);
    if (submittedCount >= maxAttempts) {
      throw forbiddenError('No attempts remaining for this quiz.');
    }

    const attemptNumber = submittedCount + 1;
    const maxScore = validQuestions.reduce((sum, question) => sum + Number(question.points || 1), 0);
    const startedAtMs = Date.now();
    const durationMinutes = Number(quiz.durationMinutes || quiz.timeLimitMinutes || 0);
    const expiresAt = durationMinutes > 0
      ? new Date(startedAtMs + durationMinutes * 60 * 1000).toISOString()
      : '';

    const result = quizRepository.createAttempt(quizId, user.id, attemptNumber, maxScore, expiresAt);
    auditService.log({
      actorUserId: user.id,
      action: 'ATTEMPT_STARTED',
      entityType: 'quiz_attempt',
      entityId: result.lastInsertRowid,
      details: { quizId, attemptNumber }
    });

    return this.getAttempt(result.lastInsertRowid, user, { includeQuestions: true });
  }

  submitAttempt(attemptId, user, payload = {}) {
    const attempt = quizRepository.findAttemptById(attemptId);
    if (!attempt) {
      throw notFoundError('Attempt not found.');
    }
    if (attempt.userId !== user.id && user.role !== 'admin') {
      throw forbiddenError('You can only submit your own attempts.');
    }
    if (attempt.status === 'submitted') {
      throw validationError('attempt', 'This attempt has already been submitted.');
    }

    const quiz = this.getById(attempt.quizId, { includeQuestions: true, includeCorrect: true });
    if (!quiz) {
      throw notFoundError('Quiz not found.');
    }

    const validQuestions = quiz.questions.filter(question => question.status !== 'invalid');
    if (validQuestions.length === 0) {
      throw validationError('questions', 'This exam is temporarily unavailable. Please contact instructor/admin.');
    }

    const answers = normalizeAnswers(payload.answers);
    let score = 0;
    const maxScore = validQuestions.reduce((sum, question) => sum + Number(question.points || 1), 0);
    const now = Date.now();
    const startedAt = new Date(attempt.startedAt).getTime();
    const expiresAtTs = attempt.expiresAt ? new Date(attempt.expiresAt).getTime() : null;
    const isExpired = expiresAtTs !== null && !Number.isNaN(expiresAtTs) && now > expiresAtTs;

    quizRepository.withTransaction(() => {
      quizRepository.deleteAttemptAnswers(attemptId);

      validQuestions.forEach(question => {
        const answer = answers.get(Number(question.id)) || '';
        const outcome = this.evaluateAnswer(question, answer, quiz);
        score += outcome.pointsAwarded;
        quizRepository.insertAttemptAnswer(attemptId, question.id, answer, outcome.isCorrect, outcome.pointsAwarded);
      });

      score = Math.max(0, Math.min(maxScore, Math.round(score * 100) / 100));
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 10000) / 100 : 0;
      const timeSpentSeconds = Number(payload.timeSpentSeconds) || Math.max(0, Math.round((now - startedAt) / 1000));

      if (isExpired) {
        quizRepository.markAttemptExpired(attemptId, nowIso(), score, maxScore, percentage, timeSpentSeconds);
      } else {
        quizRepository.submitAttempt(attemptId, nowIso(), score, maxScore, percentage, timeSpentSeconds);
      }

      const gradeResolution = gradeSchemeService.resolveLetterGrade(quiz.courseId, percentage);
      quizRepository.setAttemptGradeStatus(attemptId, {
        letterGrade: gradeResolution.letterGrade,
        gradeStatus: gradeResolution.status,
        gradeMessage: gradeResolution.message,
        lifecycleStatus: gradeResolution.status === 'ready' ? (isExpired ? 'expired' : 'graded') : 'pending_review'
      });

      if (gradeResolution.status !== 'ready') {
        validationIssueService.create({
          entityType: 'quiz_attempt',
          entityId: attemptId,
          severity: 'warning',
          field: 'grade_scheme',
          message: 'Grade scheme is invalid or incomplete. Letter grade marked as pending review.',
          status: 'open',
          relatedCourseId: quiz.courseId,
          relatedUserId: user.id,
          visibleToUser: true
        });
        auditService.log({
          actorUserId: user.id,
          action: 'LETTER_GRADE_PENDING_REVIEW',
          entityType: 'quiz_attempt',
          entityId: attemptId,
          details: { quizId: quiz.id, percentage }
        });
      }

      auditService.log({
        actorUserId: user.id,
        action: isExpired ? 'ATTEMPT_EXPIRED' : 'ATTEMPT_SUBMITTED',
        entityType: 'quiz_attempt',
        entityId: attemptId,
        details: { quizId: quiz.id, score, maxScore, percentage }
      });
    });

    return this.getAttempt(attemptId, user, { includeAnswers: true, includeQuestions: true });
  }

  getAttempt(attemptId, user, options = {}) {
    const attempt = quizRepository.getAttempt(attemptId);
    if (!attempt) return null;

    if (user.role === 'student' && attempt.userId !== user.id) {
      throw notFoundError('Attempt not found.');
    }

    const quiz = this.getById(attempt.quizId);
    const policy = quiz ? quiz.showResultPolicy : 'immediately';
    const canSeeResult = this.canStudentSeeResult(policy, quiz);

    const result = {
      ...attempt,
      lifecycleStatus: attempt.lifecycleStatus || attempt.status,
      letterGrade: attempt.letterGrade || null,
      gradeStatus: attempt.gradeStatus || 'ready',
      gradeMessage: attempt.gradeMessage || ''
    };

    if (user.role === 'student' && !canSeeResult && attempt.status === 'submitted') {
      this.hideAttemptResult(result, policy);
    }

    if (options.includeQuestions) {
      const canSeeCorrect = user.role !== 'student' ||
        (attempt.status === 'submitted' && Number(attempt.showCorrectAnswers) === 1 && canSeeResult);
      result.questions = this.getQuizQuestions(attempt.quizId, { includeCorrect: canSeeCorrect })
        .filter(question => question.status !== 'invalid');
    }
    if (options.includeAnswers) {
      result.answers = quizRepository.getAttemptAnswers(attemptId);
      if (user.role === 'student' && (!canSeeResult || Number(attempt.showCorrectAnswers) !== 1)) {
        result.answers = result.answers.map(answer => {
          const copy = { ...answer };
          delete copy.correctAnswer;
          delete copy.isCorrect;
          delete copy.pointsAwarded;
          return copy;
        });
      }
    }

    return result;
  }

  getAttemptsForQuiz(quizId, user) {
    const quiz = this.getById(quizId);
    const policy = quiz ? quiz.showResultPolicy : 'immediately';
    const canSeeResult = this.canStudentSeeResult(policy, quiz);
    return quizRepository.getAttemptsForQuiz(quizId, user).map(attempt => {
      const result = {
        ...attempt,
        lifecycleStatus: attempt.lifecycleStatus || attempt.status,
        letterGrade: attempt.letterGrade || null,
        gradeStatus: attempt.gradeStatus || 'ready',
        gradeMessage: attempt.gradeMessage || ''
      };
      if (user.role === 'student' && attempt.status === 'submitted' && !canSeeResult) {
        this.hideAttemptResult(result, policy);
      }
      return result;
    });
  }

  releaseResults(quizId, user) {
    const quiz = this.getById(quizId);
    if (!quiz) throw notFoundError('Quiz not found.');
    quizRepository.setManualResultReleasedAt(quizId, nowIso());
    auditService.log({
      actorUserId: user ? user.id : null,
      action: 'QUIZ_RESULTS_RELEASED',
      entityType: 'quiz',
      entityId: quizId,
      details: { showResultPolicy: quiz.showResultPolicy }
    });
    return this.getById(quizId, { includeQuestions: true, includeCorrect: true });
  }

  share(id, data, actor) {
    const quiz = quizRepository.findById(id);
    if (!quiz) throw notFoundError('Quiz not found.');
    this.assertCanWriteQuiz(quiz, actor);
    return resourceAccessService.share('quiz', id, data, actor);
  }

  accessSummary(id, actor) {
    const quiz = quizRepository.findById(id);
    if (!quiz) throw notFoundError('Quiz not found.');
    this.assertCanWriteQuiz(quiz, actor);
    return resourceAccessService.summary('quiz', id);
  }

  removeAccess(id, teacherUserId, actor) {
    const quiz = quizRepository.findById(id);
    if (!quiz) throw notFoundError('Quiz not found.');
    this.assertCanWriteQuiz(quiz, actor);
    resourceAccessService.remove('quiz', id, teacherUserId, actor);
    return this.accessSummary(id, actor);
  }

  assertCanReadQuiz(quiz, user) {
    if (!user || user.role === 'admin') return;
    if (user.role === 'student') return;
    if (user.role !== 'teacher') throw forbiddenError('Teacher or admin access required.');
    if (Number(quiz.createdBy) === Number(user.id)) return;
    if (resourceAccessRepository.findGrant('quiz', quiz.id, user.id)) return;
    throw forbiddenError('Quiz access required.');
  }

  assertCanWriteQuiz(quiz, user) {
    if (!user || user.role === 'admin') return;
    if (user.role !== 'teacher') throw forbiddenError('Teacher or admin access required.');
    if (Number(quiz.createdBy) === Number(user.id)) return;
    const grant = resourceAccessRepository.findGrant('quiz', quiz.id, user.id);
    if (grant && grant.accessLevel === 'write') return;
    throw forbiddenError('Full quiz access is required.');
  }

  getGradebook(courseId) {
    const quizzes = quizRepository.getGradebookQuizzes(courseId);
    const students = quizRepository.getGradebookStudents(courseId);

    const grades = students.map(student => {
      const quizGrades = quizzes.map(quiz => {
        const best = quizRepository.getBestGrade(quiz.id, student.id);

        return {
          quizId: quiz.id,
          quizTitle: quiz.title,
          percentage: best && best.percentage !== null ? best.percentage : null,
          score: best && best.score !== null ? best.score : null,
          maxScore: best && best.maxScore !== null ? best.maxScore : null
        };
      });

      const completed = quizGrades.filter(item => item.score !== null && item.maxScore !== null && Number(item.maxScore) > 0);
      const earned = completed.reduce((sum, item) => sum + Number(item.score || 0), 0);
      const possible = completed.reduce((sum, item) => sum + Number(item.maxScore || 0), 0);
      const weightedAverage = possible > 0 ? Math.round((earned / possible) * 10000) / 100 : null;
      const gradeResolution = weightedAverage === null
        ? { letterGrade: null, status: 'pending', message: 'No submitted quiz attempts yet.' }
        : gradeSchemeService.resolveLetterGrade(courseId, weightedAverage);

      return {
        ...student,
        average: weightedAverage,
        weightedAverage,
        finalLetterGrade: gradeResolution.letterGrade,
        gradeStatus: gradeResolution.status,
        gradeMessage: gradeResolution.message,
        completedQuizCount: completed.length,
        totalQuizCount: quizzes.length,
        quizzes: quizGrades
      };
    });

    return serializeGradebook({ quizzes, students: grades });
  }

  getExamTemplates(filters = {}, user = null) {
    const courseId = parseOptionalPositiveInt(filters.courseId, 'courseId');
    if (user && user.role === 'student') {
      throw forbiddenError('Teacher or admin access required.');
    }
    if (courseId && user && !enrollmentRepository.canManageCourse(user, courseId)) {
      throw forbiddenError('Teacher or admin course access required.');
    }
    return quizRepository.listExamTemplates({ ...filters, courseId }, user).map(template => ({
      ...template,
      defaults: parseJson(template.defaultsJson, {})
    }));
  }

  getExamTemplate(id, user) {
    const templateId = parseRequiredPositiveInt(id, 'templateId');
    const template = quizRepository.findExamTemplateById(templateId);
    if (!template) throw notFoundError('Template not found.');
    this.assertCanAccessTemplate(template, user);
    return {
      ...template,
      defaults: parseJson(template.defaultsJson, {})
    };
  }

  createExamTemplate(data, user) {
    if (!data.name || !String(data.name).trim()) {
      throw validationError('name', 'Template name is required.');
    }
    const courseId = parseOptionalPositiveInt(data.courseId, 'courseId');
    if (courseId && !enrollmentRepository.canManageCourse(user, courseId)) {
      throw forbiddenError('Teacher or admin course access required.');
    }
    const result = quizRepository.insertExamTemplate({
      name: String(data.name).trim(),
      description: String(data.description || '').trim(),
      defaults: data.defaults || {},
      defaultsJson: JSON.stringify(data.defaults || {}),
      isSystem: false,
      courseId,
      createdBy: user.id
    });
    return {
      id: Number(result.lastInsertRowid),
      name: data.name,
      description: data.description || '',
      defaults: data.defaults || {},
      courseId,
      createdBy: user.id,
      isSystem: 0
    };
  }

  updateExamTemplate(id, data, user) {
    const templateId = parseRequiredPositiveInt(id, 'templateId');
    const template = quizRepository.findExamTemplateById(templateId);
    if (!template) throw notFoundError('Template not found.');
    this.assertCanModifyTemplate(template, user);
    const courseId = data.courseId !== undefined
      ? parseOptionalPositiveInt(data.courseId, 'courseId')
      : (template.courseId || null);
    if (courseId && !enrollmentRepository.canManageCourse(user, courseId)) {
      throw forbiddenError('Teacher or admin course access required.');
    }

    quizRepository.updateExamTemplate(templateId, {
      name: data.name !== undefined ? String(data.name).trim() : template.name,
      description: data.description !== undefined ? String(data.description || '').trim() : template.description,
      defaultsJson: JSON.stringify(data.defaults !== undefined ? (data.defaults || {}) : parseJson(template.defaultsJson, {})),
      courseId,
      updatedAt: nowIso()
    });
    return this.getExamTemplate(templateId, user);
  }

  deleteExamTemplate(id, user) {
    const templateId = parseRequiredPositiveInt(id, 'templateId');
    const template = quizRepository.findExamTemplateById(templateId);
    if (!template) {
      throw notFoundError('Template not found.');
    }
    this.assertCanModifyTemplate(template, user);
    quizRepository.deleteExamTemplate(templateId);
    return true;
  }

  saveQuizAsTemplate(quizId, data, user) {
    const quiz = this.getById(quizId);
    if (!quiz) {
      throw notFoundError('Quiz not found.');
    }
    const defaults = {
      durationMinutes: quiz.durationMinutes,
      maxAttempts: quiz.maxAttempts,
      shuffleQuestions: quiz.shuffleQuestions,
      shuffleOptions: quiz.shuffleOptions,
      showResultPolicy: quiz.showResultPolicy,
      gradingMode: quiz.gradingMode,
      penaltyEnabled: quiz.penaltyEnabled,
      penaltyPerWrong: quiz.penaltyPerWrong,
      requiresSeb: quiz.requiresSeb,
      showCorrectAnswers: quiz.showCorrectAnswers
    };
    return this.createExamTemplate({
      name: data.name || `${quiz.title} Template`,
      description: data.description || `Template from quiz: ${quiz.title}`,
      defaults,
      courseId: quiz.courseId
    }, user);
  }

  getGradeSchemes(courseId) {
    return gradeSchemeService.list(courseId ? Number(courseId) : undefined);
  }

  getGradeSchemesForUser(user, courseId) {
    return gradeSchemeService.list(courseId, user);
  }

  getGradeSchemeForUser(schemeId, user) {
    return gradeSchemeService.getForUser(schemeId, user);
  }

  updateGradeSchemeThresholds(schemeId, thresholds, actor = null) {
    const updated = gradeSchemeService.updateThresholds(schemeId, thresholds, actor);
    auditService.log({
      actorUserId: actor ? actor.id : null,
      action: 'GRADE_SCHEME_UPDATED',
      entityType: 'grade_scheme',
      entityId: updated.id,
      details: { thresholdCount: updated.thresholds.length }
    });
    return updated;
  }

  assertCanAccessTemplate(template, user) {
    if (!user || user.role === 'student') {
      throw forbiddenError('Teacher or admin access required.');
    }
    if (user.role === 'admin') return;
    if (template.isSystem) return;
    if (template.courseId) {
      if (enrollmentRepository.canManageCourse(user, template.courseId)) return;
      throw forbiddenError('Teacher or admin course access required.');
    }
    if (Number(template.createdBy) === Number(user.id)) return;
    throw forbiddenError('You can only access your own, system, or managed-course templates.');
  }

  assertCanModifyTemplate(template, user) {
    this.assertCanAccessTemplate(template, user);
    if (template.isSystem && user.role !== 'admin') {
      throw forbiddenError('Only admins can manage system templates.');
    }
  }

  withAvailability(quiz) {
    return serializeQuiz(quiz);
  }

  isAnswerCorrect(question, answer) {
    return this.evaluateAnswer(question, answer, { gradingMode: 'standard', penaltyEnabled: false }).isCorrect;
  }

  evaluateAnswer(question, answer, quiz) {
    const points = Number(question.points || 1);
    const questionGradingType = question.gradingType || 'standard';

    // Manual grading type: always needs manual review (like Essay)
    if (questionGradingType === 'manual') {
      return { isCorrect: false, pointsAwarded: 0, needsReview: true };
    }

    // Essay questions are always manually graded regardless of gradingType
    if (question.type === 'ES') {
      return { isCorrect: false, pointsAwarded: 0, needsReview: true };
    }

    // Multi-part questions: grade each part independently
    if (question.type === 'MP' && question.parts && question.parts.length > 0) {
      return this.evaluateMultiPartAnswer(question, answer);
    }

    // Math table questions: grade each cell independently
    if (question.type === 'MT' && question.tableConfig) {
      return this.evaluateTableAnswer(question, answer);
    }

    const normalizedAnswer = String(answer === undefined || answer === null ? '' : answer).trim();
    const normalizedCorrect = String(question.correctAnswer || '').trim();

    if (!normalizedAnswer) {
      return { isCorrect: false, pointsAwarded: 0 };
    }

    const isCorrect = this.compareAnswer(question, normalizedAnswer, normalizedCorrect);
    if (isCorrect) {
      return { isCorrect: true, pointsAwarded: points };
    }

    const penalty = this.calculatePenalty(points, quiz, question);
    return { isCorrect: false, pointsAwarded: -penalty };
  }

  evaluateMultiPartAnswer(question, answer) {
    const parts = question.parts || [];
    const answerData = typeof answer === 'object' ? answer : parseJson(answer, {});
    let totalPoints = 0;
    let earnedPoints = 0;
    let allCorrect = true;

    parts.forEach((part, index) => {
      const partPoints = Number(part.points || 1);
      totalPoints += partPoints;
      const userAnswer = String(answerData[`part_${index}`] || answerData[part.partLabel] || '').trim();
      const correct = String(part.correctAnswer || '').trim();
      if (!userAnswer || !correct) {
        allCorrect = false;
        return;
      }

      const accepted = Array.isArray(part.acceptedAnswers) ? part.acceptedAnswers : [];
      const answers = [correct, ...accepted].map(a => String(a || '').trim()).filter(Boolean);
      const match = answers.some(a => a.toLowerCase() === userAnswer.toLowerCase());
      if (match) {
        earnedPoints += partPoints;
      } else {
        allCorrect = false;
      }
    });

    return {
      isCorrect: allCorrect,
      pointsAwarded: Math.round(earnedPoints * 100) / 100
    };
  }

  evaluateTableAnswer(question, answer) {
    const config = question.tableConfig;
    const correctData = config.correctData || {};
    const answerData = typeof answer === 'object' ? answer : parseJson(answer, {});
    const totalCells = Object.keys(correctData).length;
    if (totalCells === 0) return { isCorrect: false, pointsAwarded: 0, needsReview: true };

    const points = Number(question.points || 1);
    const pointsPerCell = points / totalCells;
    let earned = 0;
    let allCorrect = true;

    Object.entries(correctData).forEach(([key, correctVal]) => {
      const userVal = String(answerData[key] || '').trim();
      const correct = String(correctVal || '').trim();
      if (!userVal || !correct) {
        allCorrect = false;
        return;
      }
      // Allow asterisk for "unnecessary" fields
      if (correct === '*' && userVal === '*') {
        earned += pointsPerCell;
        return;
      }
      // Numeric comparison with tolerance
      const numUser = parseFloat(userVal);
      const numCorrect = parseFloat(correct);
      if (!isNaN(numUser) && !isNaN(numCorrect)) {
        const tolerance = Math.abs(numCorrect) * 0.001; // 0.1% tolerance
        if (Math.abs(numUser - numCorrect) <= tolerance) {
          earned += pointsPerCell;
          return;
        }
      }
      // Exact string match fallback
      if (userVal.toLowerCase() === correct.toLowerCase()) {
        earned += pointsPerCell;
      } else {
        allCorrect = false;
      }
    });

    return {
      isCorrect: allCorrect,
      pointsAwarded: Math.round(earned * 100) / 100
    };
  }

  compareAnswer(question, userAnswer, correctAnswer) {
    if (question.type === 'FB' || question.type === 'SA') {
      const accepted = Array.isArray(question.acceptedAnswers) ? question.acceptedAnswers : [];
      const answers = [correctAnswer, ...accepted]
        .map(item => String(item || '').trim())
        .filter(Boolean);

      // For SA (numeric), do numeric comparison with tolerance
      if (question.type === 'SA') {
        const numUser = parseFloat(userAnswer);
        const numCorrect = parseFloat(correctAnswer);
        if (!isNaN(numUser) && !isNaN(numCorrect)) {
          const tolerance = Math.abs(numCorrect) * 0.001;
          if (Math.abs(numUser - numCorrect) <= tolerance) return true;
        }
      }

      const normalize = value => question.caseSensitive ? value : value.toLowerCase();
      const target = normalize(userAnswer.trim());
      return answers.some(answer => normalize(answer) === target);
    }

    if (question.type === 'TF') {
      return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    }

    // MR (Multiple Response): compare sets of selected indices
    if (question.type === 'MR') {
      const userSet = new Set(String(userAnswer).split(',').map(s => s.trim()).filter(Boolean).sort());
      const correctSet = new Set(String(correctAnswer).split(',').map(s => s.trim()).filter(Boolean).sort());
      if (userSet.size !== correctSet.size) return false;
      for (const item of userSet) {
        if (!correctSet.has(item)) return false;
      }
      return true;
    }

    // OR (Ordering): compare ordered sequences
    if (question.type === 'OR') {
      return userAnswer.trim() === correctAnswer.trim();
    }

    return userAnswer.trim() === correctAnswer.trim();
  }

  calculatePenalty(points, quiz, question = {}) {
    // Per-question grading type takes priority
    const questionGradingType = question.gradingType || 'standard';
    if (questionGradingType !== 'negative') return 0;

    // Use quiz-level penalty amount
    const fixed = Number(quiz.penaltyPerWrong || 0);
    const ratioPenalty = Number(quiz.penaltyRatio || 0) * Number(points || 0);
    return Math.max(0, fixed || ratioPenalty || 0);
  }

  validateQuestionIntegrity(question) {
    if (!question) {
      return { valid: false, error: 'Question payload is missing.' };
    }

    if (!question.text || String(question.text).trim().length < 2) {
      return { valid: false, error: 'Question text is invalid.' };
    }

    if (question.type === 'MC') {
      if (!Array.isArray(question.options) || question.options.length < 2) {
        return { valid: false, error: 'Multiple choice question requires at least two options.' };
      }
      const answerIndex = Number(question.correctAnswer);
      if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= question.options.length) {
        return { valid: false, error: 'Multiple choice correct answer index is invalid.' };
      }
    }

    if (question.type === 'TF') {
      const value = String(question.correctAnswer || '').trim().toLowerCase();
      if (!['true', 'false'].includes(value)) {
        return { valid: false, error: 'True/False correct answer must be true or false.' };
      }
    }

    if (question.type === 'FB') {
      if (!String(question.correctAnswer || '').trim()) {
        return { valid: false, error: 'Fill-blank requires at least one accepted answer.' };
      }
    }

    if (question.type === 'MP') {
      if (!Array.isArray(question.parts) || question.parts.length === 0) {
        return { valid: false, error: 'Multi-part question requires at least one part.' };
      }
      if (question.parts.some(part => !String(part.correctAnswer || '').trim())) {
        return { valid: false, error: 'Every multi-part item needs a correct answer.' };
      }
    }

    if (question.type === 'MT') {
      const config = question.tableConfig;
      if (!config || !Array.isArray(config.columns) || config.columns.length === 0) {
        return { valid: false, error: 'Math table question requires table columns.' };
      }
      if (!config.correctData || Object.keys(config.correctData).length === 0) {
        return { valid: false, error: 'Math table question requires correct cell data.' };
      }
    }

    return { valid: true, error: '' };
  }

  stripQuestionCorrectData(question) {
    if (!question) return question;
    delete question.correctAnswer;
    question.explanationText = '';
    if (Array.isArray(question.acceptedAnswers)) question.acceptedAnswers = [];
    if (Array.isArray(question.parts)) {
      question.parts = question.parts.map(part => {
        const copy = { ...part };
        delete copy.correctAnswer;
        copy.acceptedAnswers = [];
        return copy;
      });
    }
    if (question.tableConfig && question.tableConfig.correctData) {
      question.tableConfig = {
        ...question.tableConfig,
        correctData: {}
      };
    }
    return question;
  }

  validateQuestionsForQuiz(quiz, actorUserId = null) {
    const invalid = (quiz.questions || []).filter(question => question.status === 'invalid');
    const valid = (quiz.questions || []).filter(question => question.status !== 'invalid');
    valid.forEach(question => {
      questionRepository.setValidationStatus(question.id, 'valid', '');
    });
    invalid.forEach(question => {
      questionRepository.setValidationStatus(question.id, 'invalid', question.validationMessage || 'Question is invalid.');
      validationIssueService.create({
        entityType: 'question',
        entityId: question.id,
        severity: 'error',
        field: 'question',
        message: question.validationMessage || 'Question is invalid for quiz usage.',
        status: 'open',
        relatedCourseId: quiz.courseId,
        relatedUserId: actorUserId,
        visibleToUser: false
      });
      auditService.log({
        actorUserId,
        action: 'QUESTION_INVALIDATED',
        entityType: 'question',
        entityId: question.id,
        details: { quizId: quiz.id, message: question.validationMessage || 'Invalid question' }
      });
    });
  }

  assertQuizPublishable(quiz) {
    const validCount = (quiz.questions || []).filter(question => question.status !== 'invalid').length;
    if (validCount === 0) {
      throw validationError('questions', 'Quiz cannot be published without at least one valid question.');
    }
  }

  buildPublishableCandidate(quizId, payload) {
    const questions = this.getQuizQuestions(quizId, { includeCorrect: true })
      .filter(question => Number(question.courseId) === Number(payload.courseId));
    return {
      ...payload,
      id: quizId,
      questions
    };
  }

  hideAttemptResult(attempt, policy) {
    attempt.hiddenByPolicy = true;
    attempt.policyMessage = this.resultPolicyMessage(policy);
    attempt.score = null;
    attempt.maxScore = null;
    attempt.percentage = null;
    attempt.letterGrade = null;
    attempt.gradeStatus = 'hidden';
    attempt.gradeMessage = '';
    return attempt;
  }

  isAttemptExpired(attempt) {
    if (!attempt || !attempt.expiresAt) return false;
    const expiresAt = new Date(attempt.expiresAt).getTime();
    return Number.isFinite(expiresAt) && Date.now() > expiresAt;
  }

  expireAttempt(attempt, quiz, user) {
    const now = Date.now();
    const startedAt = new Date(attempt.startedAt).getTime();
    const timeSpentSeconds = Number.isFinite(startedAt) ? Math.max(0, Math.round((now - startedAt) / 1000)) : 0;
    const maxScore = Number(attempt.maxScore || 0);
    quizRepository.markAttemptExpired(attempt.id, nowIso(), 0, maxScore, 0, timeSpentSeconds);
    const gradeResolution = gradeSchemeService.resolveLetterGrade(quiz.courseId, 0);
    quizRepository.setAttemptGradeStatus(attempt.id, {
      letterGrade: gradeResolution.letterGrade,
      gradeStatus: gradeResolution.status,
      gradeMessage: gradeResolution.message,
      lifecycleStatus: 'expired'
    });
    auditService.log({
      actorUserId: user.id,
      action: 'ATTEMPT_AUTO_EXPIRED',
      entityType: 'quiz_attempt',
      entityId: attempt.id,
      details: { quizId: quiz.id }
    });
  }

  applyTemplate(payload, templateName) {
    if (!templateName) return payload;
    const template = quizRepository.findExamTemplateByName(templateName);
    if (!template) return payload;
    const defaults = parseJson(template.defaultsJson, {});
    return {
      ...defaults,
      ...payload,
      templateName: template.name
    };
  }

  assertSebCompatible(context) {
    const headers = (context && context.headers) || {};
    const sebHeader = String(headers['x-safe-exam-browser'] || headers['x-seb-client'] || '').trim();
    const userAgent = String((context && context.userAgent) || headers['user-agent'] || '').toLowerCase();
    const looksCompatible = !!sebHeader || userAgent.includes('safeexambrowser') || userAgent.includes('seb');
    if (!looksCompatible) {
      throw forbiddenError('This exam requires Safe Exam Browser compatible mode.');
    }
  }

  canStudentSeeResult(policy, quiz) {
    const now = Date.now();
    if (policy === 'immediately') return true;
    if (policy === 'never') return false;
    if (policy === 'after_close') {
      if (!quiz || !quiz.endAt) return false;
      return new Date(quiz.endAt).getTime() <= now;
    }
    if (policy === 'after_manual_release') {
      return !!(quiz && quiz.manualResultReleasedAt);
    }
    return true;
  }

  resultPolicyMessage(policy) {
    if (policy === 'after_close') return 'Results will be visible after the exam closes.';
    if (policy === 'after_manual_release') return 'Results will be released manually by your instructor.';
    if (policy === 'never') return 'Results are not visible for this exam policy.';
    return 'Results are not available yet.';
  }
}

function normalizeAnswers(answers) {
  const map = new Map();

  if (Array.isArray(answers)) {
    answers.forEach(item => {
      if (item && item.questionId !== undefined) {
        map.set(Number(item.questionId), item.answer !== undefined ? item.answer : '');
      }
    });
    return map;
  }

  if (answers && typeof answers === 'object') {
    Object.entries(answers).forEach(([questionId, answer]) => {
      map.set(Number(questionId), answer !== undefined ? answer : '');
    });
  }

  return map;
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || 'null') || fallback;
  } catch (e) {
    return fallback;
  }
}

module.exports = new QuizService();
