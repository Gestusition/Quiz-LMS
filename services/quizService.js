const { getDatabase } = require('../database/db');
const { nowIso } = require('../utils/security');

class QuizService {
  getAll(user, filters = {}) {
    const db = getDatabase();
    let query = `
      SELECT q.*,
        c.title as courseTitle,
        c.code as courseCode,
        COUNT(DISTINCT qq.questionId) as questionCount,
        COALESCE(SUM(qq.points), 0) as maxScore
      FROM quizzes q
      JOIN courses c ON c.id = q.courseId
      LEFT JOIN quiz_questions qq ON qq.quizId = q.id
      WHERE 1=1
    `;
    const params = [];

    if (user.role !== 'admin') {
      query += ` AND q.courseId IN (
        SELECT courseId FROM enrollments WHERE userId = ? AND status = 'active'
      )`;
      params.push(user.id);
    }
    if (user.role === 'student') {
      query += " AND q.status IN ('published', 'closed')";
    }
    if (filters.courseId) {
      query += ' AND q.courseId = ?';
      params.push(filters.courseId);
    }
    if (filters.status && ['draft', 'published', 'closed'].includes(filters.status)) {
      query += ' AND q.status = ?';
      params.push(filters.status);
    }
    if (filters.search) {
      query += ' AND q.title LIKE ?';
      params.push(`%${filters.search}%`);
    }

    query += ' GROUP BY q.id ORDER BY q.createdAt DESC';
    const quizzes = db.prepare(query).all(...params);
    return quizzes.map(quiz => this.withAvailability(quiz));
  }

  getById(id, options = {}) {
    const db = getDatabase();
    const quiz = db.prepare(`
      SELECT q.*, c.title as courseTitle, c.code as courseCode
      FROM quizzes q
      JOIN courses c ON c.id = q.courseId
      WHERE q.id = ?
    `).get(id);

    if (!quiz) return null;

    const result = this.withAvailability(quiz);
    if (options.includeQuestions) {
      result.questions = this.getQuizQuestions(id, { includeCorrect: !!options.includeCorrect });
    }
    return result;
  }

  create(data, user) {
    const payload = this.validateQuiz(data);
    const db = getDatabase();
    const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(payload.courseId);
    if (!course) {
      throw new Error('Course not found.');
    }

    const result = db.prepare(`
      INSERT INTO quizzes (
        courseId, title, description, status, openAt, closeAt, timeLimitMinutes,
        attemptsAllowed, shuffleQuestions, showCorrectAnswers, createdBy
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      payload.courseId,
      payload.title,
      payload.description,
      payload.status,
      payload.openAt,
      payload.closeAt,
      payload.timeLimitMinutes,
      payload.attemptsAllowed,
      payload.shuffleQuestions ? 1 : 0,
      payload.showCorrectAnswers ? 1 : 0,
      user.id
    );

    return this.getById(result.lastInsertRowid, { includeQuestions: true, includeCorrect: true });
  }

  update(id, data) {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Quiz not found.');
    }

    const payload = this.validateQuiz({
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

    db.prepare(`
      UPDATE quizzes
      SET courseId = ?, title = ?, description = ?, status = ?, openAt = ?, closeAt = ?,
        timeLimitMinutes = ?, attemptsAllowed = ?, shuffleQuestions = ?, showCorrectAnswers = ?,
        updatedAt = ?
      WHERE id = ?
    `).run(
      payload.courseId,
      payload.title,
      payload.description,
      payload.status,
      payload.openAt,
      payload.closeAt,
      payload.timeLimitMinutes,
      payload.attemptsAllowed,
      payload.shuffleQuestions ? 1 : 0,
      payload.showCorrectAnswers ? 1 : 0,
      nowIso(),
      id
    );

    return this.getById(id, { includeQuestions: true, includeCorrect: true });
  }

  delete(id) {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM quizzes WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Quiz not found.');
    }

    db.prepare('DELETE FROM quizzes WHERE id = ?').run(id);
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

    const db = getDatabase();
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quizId);
    if (!quiz) {
      throw new Error('Quiz not found.');
    }

    const placeholders = uniqueIds.map(() => '?').join(',');
    const questions = db.prepare(`
      SELECT q.id, q.points, c.courseId
      FROM questions q
      JOIN categories c ON c.id = q.categoryId
      WHERE q.id IN (${placeholders})
    `).all(...uniqueIds);

    if (questions.length !== uniqueIds.length) {
      throw new Error('One or more questions were not found.');
    }
    if (questions.some(question => question.courseId !== quiz.courseId)) {
      throw new Error('All quiz questions must belong to the same course as the quiz.');
    }

    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare('DELETE FROM quiz_questions WHERE quizId = ?').run(quizId);
      const insert = db.prepare(`
        INSERT INTO quiz_questions (quizId, questionId, points, position)
        VALUES (?, ?, ?, ?)
      `);
      uniqueIds.forEach((questionId, index) => {
        const question = questions.find(item => item.id === questionId);
        insert.run(quizId, questionId, question.points || 1, index + 1);
      });
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    return this.getById(quizId, { includeQuestions: true, includeCorrect: true });
  }

  getQuizQuestions(quizId, options = {}) {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT q.*, c.name as categoryName, qq.points as quizPoints, qq.position
      FROM quiz_questions qq
      JOIN questions q ON q.id = qq.questionId
      LEFT JOIN categories c ON c.id = q.categoryId
      WHERE qq.quizId = ?
      ORDER BY qq.position ASC, qq.id ASC
    `).all(quizId);

    return rows.map(row => {
      const question = {
        ...row,
        points: row.quizPoints,
        options: JSON.parse(row.options || '[]')
      };
      delete question.quizPoints;
      if (!options.includeCorrect) {
        delete question.correctAnswer;
      }
      return question;
    });
  }

  startAttempt(quizId, user) {
    if (user.role !== 'student') {
      throw new Error('Only student accounts can start quiz attempts.');
    }

    const db = getDatabase();
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

    const active = db.prepare(`
      SELECT id FROM quiz_attempts
      WHERE quizId = ? AND userId = ? AND status = 'in_progress'
      ORDER BY attemptNumber DESC LIMIT 1
    `).get(quizId, user.id);
    if (active) {
      return this.getAttempt(active.id, user, { includeQuestions: true });
    }

    const submittedCount = db.prepare(`
      SELECT COUNT(*) as count FROM quiz_attempts
      WHERE quizId = ? AND userId = ? AND status = 'submitted'
    `).get(quizId, user.id).count;

    if (submittedCount >= quiz.attemptsAllowed) {
      throw new Error('No attempts remaining for this quiz.');
    }

    const attemptNumber = submittedCount + 1;
    const maxScore = quiz.questions.reduce((sum, question) => sum + Number(question.points || 1), 0);
    const result = db.prepare(`
      INSERT INTO quiz_attempts (quizId, userId, attemptNumber, maxScore)
      VALUES (?, ?, ?, ?)
    `).run(quizId, user.id, attemptNumber, maxScore);

    return this.getAttempt(result.lastInsertRowid, user, { includeQuestions: true });
  }

  submitAttempt(attemptId, user, payload) {
    const db = getDatabase();
    const attempt = db.prepare('SELECT * FROM quiz_attempts WHERE id = ?').get(attemptId);
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

    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare('DELETE FROM attempt_answers WHERE attemptId = ?').run(attemptId);
      const insertAnswer = db.prepare(`
        INSERT INTO attempt_answers (attemptId, questionId, answer, isCorrect, pointsAwarded)
        VALUES (?, ?, ?, ?, ?)
      `);

      quiz.questions.forEach(question => {
        const answer = answers.get(Number(question.id)) || '';
        const isCorrect = this.isAnswerCorrect(question, answer);
        const pointsAwarded = isCorrect ? Number(question.points || 1) : 0;
        score += pointsAwarded;
        insertAnswer.run(attemptId, question.id, String(answer), isCorrect ? 1 : 0, pointsAwarded);
      });

      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 10000) / 100 : 0;
      const startedAt = new Date(attempt.startedAt).getTime();
      const timeSpentSeconds = Number(payload.timeSpentSeconds) ||
        Math.max(0, Math.round((Date.now() - startedAt) / 1000));

      db.prepare(`
        UPDATE quiz_attempts
        SET status = 'submitted', submittedAt = ?, score = ?, maxScore = ?, percentage = ?, timeSpentSeconds = ?
        WHERE id = ?
      `).run(nowIso(), score, maxScore, percentage, timeSpentSeconds, attemptId);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    return this.getAttempt(attemptId, user, { includeAnswers: true, includeQuestions: true });
  }

  getAttempt(attemptId, user, options = {}) {
    const db = getDatabase();
    const attempt = db.prepare(`
      SELECT a.*, q.title as quizTitle, q.courseId, q.showCorrectAnswers, u.name as studentName, u.email as studentEmail
      FROM quiz_attempts a
      JOIN quizzes q ON q.id = a.quizId
      JOIN users u ON u.id = a.userId
      WHERE a.id = ?
    `).get(attemptId);

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
      result.answers = db.prepare(`
        SELECT aa.*, q.correctAnswer
        FROM attempt_answers aa
        JOIN questions q ON q.id = aa.questionId
        WHERE aa.attemptId = ?
        ORDER BY aa.id ASC
      `).all(attemptId);
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
    const db = getDatabase();
    let query = `
      SELECT a.*, u.name as studentName, u.email as studentEmail
      FROM quiz_attempts a
      JOIN users u ON u.id = a.userId
      WHERE a.quizId = ?
    `;
    const params = [quizId];

    if (user.role === 'student') {
      query += ' AND a.userId = ?';
      params.push(user.id);
    }

    query += ' ORDER BY a.startedAt DESC';
    return db.prepare(query).all(...params);
  }

  getGradebook(courseId) {
    const db = getDatabase();
    const quizzes = db.prepare(`
      SELECT id, title
      FROM quizzes
      WHERE courseId = ?
      ORDER BY createdAt ASC
    `).all(courseId);

    const students = db.prepare(`
      SELECT u.id, u.name, u.email
      FROM enrollments e
      JOIN users u ON u.id = e.userId
      WHERE e.courseId = ? AND e.role = 'student' AND e.status = 'active'
      ORDER BY u.name ASC
    `).all(courseId);

    const grades = students.map(student => {
      const quizGrades = quizzes.map(quiz => {
        const best = db.prepare(`
          SELECT MAX(percentage) as percentage, MAX(score) as score, MAX(maxScore) as maxScore
          FROM quiz_attempts
          WHERE quizId = ? AND userId = ? AND status = 'submitted'
        `).get(quiz.id, student.id);

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

    return { quizzes, students: grades };
  }

  validateQuiz(data) {
    const courseId = Number(data.courseId);
    const title = String(data.title || '').trim();
    const description = String(data.description || '').trim();
    const status = data.status ? String(data.status).trim() : 'draft';
    const openAt = data.openAt ? String(data.openAt).trim() : '';
    const closeAt = data.closeAt ? String(data.closeAt).trim() : '';
    const timeLimitMinutes = Number(data.timeLimitMinutes || 0);
    const attemptsAllowed = Number(data.attemptsAllowed || 1);

    if (!courseId) {
      throw new Error('Course is required.');
    }
    if (!title || title.length > 160) {
      throw new Error('Quiz title is required and must be 160 characters or less.');
    }
    if (description.length > 1000) {
      throw new Error('Quiz description must be 1000 characters or less.');
    }
    if (!['draft', 'published', 'closed'].includes(status)) {
      throw new Error('Quiz status must be draft, published, or closed.');
    }
    if (!Number.isInteger(timeLimitMinutes) || timeLimitMinutes < 0 || timeLimitMinutes > 600) {
      throw new Error('Time limit must be between 0 and 600 minutes.');
    }
    if (!Number.isInteger(attemptsAllowed) || attemptsAllowed < 1 || attemptsAllowed > 20) {
      throw new Error('Attempts allowed must be between 1 and 20.');
    }
    if (openAt && closeAt && new Date(openAt).getTime() > new Date(closeAt).getTime()) {
      throw new Error('Open date must be before close date.');
    }

    return {
      courseId,
      title,
      description,
      status,
      openAt,
      closeAt,
      timeLimitMinutes,
      attemptsAllowed,
      shuffleQuestions: !!data.shuffleQuestions,
      showCorrectAnswers: data.showCorrectAnswers !== false
    };
  }

  withAvailability(quiz) {
    const now = Date.now();
    const opensAt = quiz.openAt ? new Date(quiz.openAt).getTime() : null;
    const closesAt = quiz.closeAt ? new Date(quiz.closeAt).getTime() : null;
    const isOpen = quiz.status === 'published' &&
      (!opensAt || opensAt <= now) &&
      (!closesAt || closesAt >= now);

    return {
      ...quiz,
      shuffleQuestions: !!quiz.shuffleQuestions,
      showCorrectAnswers: !!quiz.showCorrectAnswers,
      isOpen
    };
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
