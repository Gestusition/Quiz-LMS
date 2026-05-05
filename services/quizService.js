const courseRepository = require('../repositories/courseRepository');
const questionRepository = require('../repositories/questionRepository');
const quizRepository = require('../repositories/quizRepository');
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
const gradeSchemeService = require('./gradeSchemeService');
const { forbiddenError, notFoundError, validationError } = require('../utils/appError');
const { LIMITS } = require('../constants/limits');

class QuizService {
  getAll(user, filters = {}) {
    return quizRepository.list(user, filters, quizStatusValues).map(serializeQuiz);
  }

  getById(id, options = {}) {
    const quiz = serializeQuiz(quizRepository.getById(id));
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

    const result = quizRepository.insert(payload, user.id);
    const quiz = this.getById(result.lastInsertRowid, { includeQuestions: true, includeCorrect: true });
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

    quizRepository.update(id, payload, nowIso());
    const quiz = this.getById(id, { includeQuestions: true, includeCorrect: true });

    if (quiz.status === 'published') {
      this.assertQuizPublishable(quiz);
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

  delete(id) {
    const existing = quizRepository.findById(id);
    if (!existing) {
      throw notFoundError('Quiz not found.');
    }

    quizRepository.deleteById(id);
    return true;
  }

  setQuestions(quizId, questionIds, actorUserId = null) {
    if (!Array.isArray(questionIds)) {
      throw validationError('question_ids', 'questionIds must be an array.');
    }

    const uniqueIds = [...new Set(questionIds.map(id => Number(id)).filter(Boolean))];
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

    const questions = questionRepository.findByIdsWithCourse(uniqueIds);
    if (questions.length !== uniqueIds.length) {
      throw validationError('question_ids', 'One or more questions were not found.');
    }
    if (questions.some(question => question.courseId !== quiz.courseId)) {
      throw validationError('question_ids', 'All quiz questions must belong to the same course as the quiz.');
    }

    quizRepository.withTransaction(() => {
      quizRepository.replaceQuestions(quizId, questions, uniqueIds);
    });

    const updated = this.getById(quizId, { includeQuestions: true, includeCorrect: true });
    this.validateQuestionsForQuiz(updated, actorUserId);
    return updated;
  }

  getQuizQuestions(quizId, options = {}) {
    const rows = quizRepository.getQuestions(quizId);

    return rows.map(row => {
      const complete = serializeQuizQuestion(row, { includeCorrect: true });
      const normalized = this.validateQuestionIntegrity(complete);
      const question = serializeQuizQuestion(row, options);
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
        message: 'Quiz has no valid questions and cannot be attempted.',
        status: 'open',
        relatedCourseId: quiz.courseId,
        relatedUserId: user.id,
        visibleToUser: false
      });
      throw validationError('questions', 'This exam is temporarily unavailable. Please contact instructor/admin.');
    }

    const active = quizRepository.findActiveAttempt(quizId, user.id);
    if (active) {
      return this.getAttempt(active.id, user, { includeQuestions: true });
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
      result.hiddenByPolicy = true;
      result.policyMessage = this.resultPolicyMessage(policy);
      result.score = null;
      result.maxScore = null;
      result.percentage = null;
      result.letterGrade = null;
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
          return copy;
        });
      }
    }

    return result;
  }

  getAttemptsForQuiz(quizId, user) {
    return quizRepository.getAttemptsForQuiz(quizId, user);
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

      const completed = quizGrades.filter(item => item.percentage !== null);
      const average = completed.length
        ? Math.round((completed.reduce((sum, item) => sum + item.percentage, 0) / completed.length) * 100) / 100
        : null;

      return { ...student, average, quizzes: quizGrades };
    });

    return serializeGradebook({ quizzes, students: grades });
  }

  getExamTemplates() {
    return quizRepository.listExamTemplates().map(template => ({
      ...template,
      defaults: parseJson(template.defaultsJson, {})
    }));
  }

  getGradeSchemes(courseId) {
    return gradeSchemeService.list(courseId ? Number(courseId) : undefined);
  }

  updateGradeSchemeThresholds(schemeId, thresholds, actorUserId = null) {
    const updated = gradeSchemeService.updateThresholds(Number(schemeId), thresholds);
    auditService.log({
      actorUserId,
      action: 'GRADE_SCHEME_UPDATED',
      entityType: 'grade_scheme',
      entityId: updated.id,
      details: { thresholdCount: updated.thresholds.length }
    });
    return updated;
  }

  withAvailability(quiz) {
    return serializeQuiz(quiz);
  }

  isAnswerCorrect(question, answer) {
    return this.evaluateAnswer(question, answer, { gradingMode: 'standard', penaltyEnabled: false }).isCorrect;
  }

  evaluateAnswer(question, answer, quiz) {
    const normalizedAnswer = String(answer === undefined || answer === null ? '' : answer).trim();
    const normalizedCorrect = String(question.correctAnswer || '').trim();
    const points = Number(question.points || 1);

    if (!normalizedAnswer) {
      return { isCorrect: false, pointsAwarded: 0 };
    }

    const isCorrect = this.compareAnswer(question, normalizedAnswer, normalizedCorrect);
    if (isCorrect) {
      return { isCorrect: true, pointsAwarded: points };
    }

    const penalty = this.calculatePenalty(points, quiz);
    return { isCorrect: false, pointsAwarded: -penalty };
  }

  compareAnswer(question, userAnswer, correctAnswer) {
    if (question.type === 'FB') {
      const accepted = Array.isArray(question.acceptedAnswers) ? question.acceptedAnswers : [];
      const answers = [correctAnswer, ...accepted]
        .map(item => String(item || '').trim())
        .filter(Boolean);
      const normalize = value => question.caseSensitive ? value : value.toLowerCase();
      const target = normalize(userAnswer.trim());
      return answers.some(answer => normalize(answer) === target);
    }

    if (question.type === 'TF') {
      return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    }

    return userAnswer.trim() === correctAnswer.trim();
  }

  calculatePenalty(points, quiz) {
    if (!quiz.penaltyEnabled || quiz.gradingMode !== 'negative_marking') return 0;
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

    return { valid: true, error: '' };
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
