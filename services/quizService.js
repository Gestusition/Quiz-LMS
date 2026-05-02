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

class QuizService {
  getAll(user, filters = {}) {
    return quizRepository.list(user, filters, quizStatusValues).map(serializeQuiz);
  }

  getById(id, options = {}) {
    const quiz = serializeQuiz(quizRepository.getById(id));
    if (!quiz) return null;

    if (options.includeQuestions) {
      quiz.questions = this.getQuizQuestions(id, { includeCorrect: !!options.includeCorrect });
    }
    return quiz;
  }

  create(data, user) {
    const payload = validateQuiz(data);
    const course = courseRepository.findById(payload.courseId);
    if (!course) {
      throw new Error('Course not found.');
    }

    const result = quizRepository.insert(payload, user.id);
    return this.getById(result.lastInsertRowid, { includeQuestions: true, includeCorrect: true });
  }

  update(id, data) {
    const existing = quizRepository.findById(id);
    if (!existing) {
      throw new Error('Quiz not found.');
    }

    const payload = validateQuiz({
      courseId: data.courseId !== undefined ? data.courseId : existing.courseId,
      title: data.title !== undefined ? data.title : existing.title,
      description: data.description !== undefined ? data.description : existing.description,
      status: data.status !== undefined ? data.status : existing.status,
      openAt: data.openAt !== undefined ? data.openAt : existing.openAt,
      closeAt: data.closeAt !== undefined ? data.closeAt : existing.closeAt,
      timeLimitMinutes: data.timeLimitMinutes !== undefined ? data.timeLimitMinutes : existing.timeLimitMinutes,
      attemptsAllowed: data.attemptsAllowed !== undefined ? data.attemptsAllowed : existing.attemptsAllowed,
      shuffleQuestions: data.shuffleQuestions !== undefined ? data.shuffleQuestions : !!existing.shuffleQuestions,
      showCorrectAnswers: data.showCorrectAnswers !== undefined ? data.showCorrectAnswers : !!existing.showCorrectAnswers
    });

    quizRepository.update(id, payload, nowIso());
    return this.getById(id, { includeQuestions: true, includeCorrect: true });
  }

  delete(id) {
    const existing = quizRepository.findById(id);
    if (!existing) {
      throw new Error('Quiz not found.');
    }

    quizRepository.deleteById(id);
    return true;
  }

  setQuestions(quizId, questionIds) {
    if (!Array.isArray(questionIds)) {
      throw new Error('questionIds must be an array.');
    }

    const uniqueIds = [...new Set(questionIds.map(id => Number(id)).filter(Boolean))];
    if (uniqueIds.length === 0) {
      throw new Error('At least one question is required.');
    }

    const quiz = quizRepository.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found.');
    }

    const questions = questionRepository.findByIdsWithCourse(uniqueIds);
    if (questions.length !== uniqueIds.length) {
      throw new Error('One or more questions were not found.');
    }
    if (questions.some(question => question.courseId !== quiz.courseId)) {
      throw new Error('All quiz questions must belong to the same course as the quiz.');
    }

    quizRepository.withTransaction(() => {
      quizRepository.replaceQuestions(quizId, questions, uniqueIds);
    });

    return this.getById(quizId, { includeQuestions: true, includeCorrect: true });
  }

  getQuizQuestions(quizId, options = {}) {
    return quizRepository.getQuestions(quizId)
      .map(row => serializeQuizQuestion(row, options));
  }

  startAttempt(quizId, user) {
    if (user.role !== 'student') {
      throw new Error('Only student accounts can start quiz attempts.');
    }

    const quiz = this.getById(quizId, { includeQuestions: true, includeCorrect: false });
    if (!quiz) {
      throw new Error('Quiz not found.');
    }
    if (quiz.status !== 'published') {
      throw new Error('This quiz is not published.');
    }
    if (!quiz.isOpen) {
      throw new Error('This quiz is not open right now.');
    }
    if (quiz.questions.length === 0) {
      throw new Error('This quiz has no questions yet.');
    }

    const active = quizRepository.findActiveAttempt(quizId, user.id);
    if (active) {
      return this.getAttempt(active.id, user, { includeQuestions: true });
    }

    const submittedCount = quizRepository.countSubmittedAttempts(quizId, user.id);
    if (submittedCount >= quiz.attemptsAllowed) {
      throw new Error('No attempts remaining for this quiz.');
    }

    const attemptNumber = submittedCount + 1;
    const maxScore = quiz.questions.reduce((sum, question) => sum + Number(question.points || 1), 0);
    const result = quizRepository.createAttempt(quizId, user.id, attemptNumber, maxScore);

    return this.getAttempt(result.lastInsertRowid, user, { includeQuestions: true });
  }

  submitAttempt(attemptId, user, payload) {
    const attempt = quizRepository.findAttemptById(attemptId);
    if (!attempt) {
      throw new Error('Attempt not found.');
    }
    if (attempt.userId !== user.id && user.role !== 'admin') {
      throw new Error('You can only submit your own attempts.');
    }
    if (attempt.status === 'submitted') {
      throw new Error('This attempt has already been submitted.');
    }

    const quiz = this.getById(attempt.quizId, { includeQuestions: true, includeCorrect: true });
    if (!quiz) {
      throw new Error('Quiz not found.');
    }

    const answers = normalizeAnswers(payload.answers);
    let score = 0;
    const maxScore = quiz.questions.reduce((sum, question) => sum + Number(question.points || 1), 0);

    quizRepository.withTransaction(() => {
      quizRepository.deleteAttemptAnswers(attemptId);

      quiz.questions.forEach(question => {
        const answer = answers.get(Number(question.id)) || '';
        const isCorrect = this.isAnswerCorrect(question, answer);
        const pointsAwarded = isCorrect ? Number(question.points || 1) : 0;
        score += pointsAwarded;
        quizRepository.insertAttemptAnswer(attemptId, question.id, answer, isCorrect, pointsAwarded);
      });

      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 10000) / 100 : 0;
      const startedAt = new Date(attempt.startedAt).getTime();
      const timeSpentSeconds = Number(payload.timeSpentSeconds) ||
        Math.max(0, Math.round((Date.now() - startedAt) / 1000));

      quizRepository.submitAttempt(attemptId, nowIso(), score, maxScore, percentage, timeSpentSeconds);
    });

    return this.getAttempt(attemptId, user, { includeAnswers: true, includeQuestions: true });
  }

  getAttempt(attemptId, user, options = {}) {
    const attempt = quizRepository.getAttempt(attemptId);
    if (!attempt) return null;

    if (user.role === 'student' && attempt.userId !== user.id) {
      throw new Error('Attempt not found.');
    }

    const result = { ...attempt };
    if (options.includeQuestions) {
      const canSeeCorrect = user.role !== 'student' ||
        (attempt.status === 'submitted' && Number(attempt.showCorrectAnswers) === 1);
      result.questions = this.getQuizQuestions(attempt.quizId, { includeCorrect: canSeeCorrect });
    }
    if (options.includeAnswers) {
      result.answers = quizRepository.getAttemptAnswers(attemptId);
      if (user.role === 'student' && Number(attempt.showCorrectAnswers) !== 1) {
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

  withAvailability(quiz) {
    return serializeQuiz(quiz);
  }

  isAnswerCorrect(question, answer) {
    const userAnswer = String(answer || '').trim().toLowerCase();
    const correctAnswer = String(question.correctAnswer || '').trim().toLowerCase();

    if (question.type === 'FB') {
      return userAnswer === correctAnswer;
    }
    return userAnswer === correctAnswer;
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

module.exports = new QuizService();
