const { getDatabase } = require('../database/db');

function list(user, filters = {}, validStatuses = []) {
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
  if (filters.status && validStatuses.includes(filters.status)) {
    query += ' AND q.status = ?';
    params.push(filters.status);
  }
  if (filters.search) {
    query += ' AND q.title LIKE ?';
    params.push(`%${filters.search}%`);
  }

  query += ' GROUP BY q.id ORDER BY q.createdAt DESC';
  return db.prepare(query).all(...params);
}

function findById(id) {
  return getDatabase().prepare('SELECT * FROM quizzes WHERE id = ?').get(id) || null;
}

function getById(id) {
  return getDatabase().prepare(`
    SELECT q.*, c.title as courseTitle, c.code as courseCode
    FROM quizzes q
    JOIN courses c ON c.id = q.courseId
    WHERE q.id = ?
  `).get(id) || null;
}

function insert(payload, userId) {
  return getDatabase().prepare(`
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
    userId
  );
}

function update(id, payload, updatedAt) {
  return getDatabase().prepare(`
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
    updatedAt,
    id
  );
}

function deleteById(id) {
  return getDatabase().prepare('DELETE FROM quizzes WHERE id = ?').run(id);
}

function deleteByCourseId(courseId) {
  return getDatabase().prepare('DELETE FROM quizzes WHERE courseId = ?').run(courseId);
}

function getQuestions(quizId) {
  return getDatabase().prepare(`
    SELECT q.*, c.name as categoryName, qq.points as quizPoints, qq.position
    FROM quiz_questions qq
    JOIN questions q ON q.id = qq.questionId
    LEFT JOIN categories c ON c.id = q.categoryId
    WHERE qq.quizId = ?
    ORDER BY qq.position ASC, qq.id ASC
  `).all(quizId);
}

function replaceQuestions(quizId, questions, questionIds) {
  const db = getDatabase();
  db.prepare('DELETE FROM quiz_questions WHERE quizId = ?').run(quizId);
  const insert = db.prepare(`
    INSERT INTO quiz_questions (quizId, questionId, points, position)
    VALUES (?, ?, ?, ?)
  `);
  questionIds.forEach((questionId, index) => {
    const question = questions.find(item => item.id === questionId);
    insert.run(quizId, questionId, question.points || 1, index + 1);
  });
}

function findActiveAttempt(quizId, userId) {
  return getDatabase().prepare(`
    SELECT id FROM quiz_attempts
    WHERE quizId = ? AND userId = ? AND status = 'in_progress'
    ORDER BY attemptNumber DESC LIMIT 1
  `).get(quizId, userId) || null;
}

function countSubmittedAttempts(quizId, userId) {
  return getDatabase().prepare(`
    SELECT COUNT(*) as count FROM quiz_attempts
    WHERE quizId = ? AND userId = ? AND status = 'submitted'
  `).get(quizId, userId).count;
}

function createAttempt(quizId, userId, attemptNumber, maxScore) {
  return getDatabase().prepare(`
    INSERT INTO quiz_attempts (quizId, userId, attemptNumber, maxScore)
    VALUES (?, ?, ?, ?)
  `).run(quizId, userId, attemptNumber, maxScore);
}

function findAttemptById(attemptId) {
  return getDatabase().prepare('SELECT * FROM quiz_attempts WHERE id = ?').get(attemptId) || null;
}

function getAttempt(attemptId) {
  return getDatabase().prepare(`
    SELECT a.*, q.title as quizTitle, q.courseId, q.showCorrectAnswers, u.name as studentName, u.email as studentEmail
    FROM quiz_attempts a
    JOIN quizzes q ON q.id = a.quizId
    JOIN users u ON u.id = a.userId
    WHERE a.id = ?
  `).get(attemptId) || null;
}

function deleteAttemptAnswers(attemptId) {
  return getDatabase().prepare('DELETE FROM attempt_answers WHERE attemptId = ?').run(attemptId);
}

function insertAttemptAnswer(attemptId, questionId, answer, isCorrect, pointsAwarded) {
  return getDatabase().prepare(`
    INSERT INTO attempt_answers (attemptId, questionId, answer, isCorrect, pointsAwarded)
    VALUES (?, ?, ?, ?, ?)
  `).run(attemptId, questionId, String(answer), isCorrect ? 1 : 0, pointsAwarded);
}

function submitAttempt(attemptId, submittedAt, score, maxScore, percentage, timeSpentSeconds) {
  return getDatabase().prepare(`
    UPDATE quiz_attempts
    SET status = 'submitted', submittedAt = ?, score = ?, maxScore = ?, percentage = ?, timeSpentSeconds = ?
    WHERE id = ?
  `).run(submittedAt, score, maxScore, percentage, timeSpentSeconds, attemptId);
}

function getAttemptAnswers(attemptId) {
  return getDatabase().prepare(`
    SELECT aa.*, q.correctAnswer
    FROM attempt_answers aa
    JOIN questions q ON q.id = aa.questionId
    WHERE aa.attemptId = ?
    ORDER BY aa.id ASC
  `).all(attemptId);
}

function getAttemptsForQuiz(quizId, user) {
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

function getGradebookQuizzes(courseId) {
  return getDatabase().prepare(`
    SELECT id, title
    FROM quizzes
    WHERE courseId = ?
    ORDER BY createdAt ASC
  `).all(courseId);
}

function getGradebookStudents(courseId) {
  return getDatabase().prepare(`
    SELECT u.id, u.name, u.email, sp.studentNumber, sp.cohort
    FROM enrollments e
    JOIN users u ON u.id = e.userId
    LEFT JOIN student_profiles sp ON sp.userId = u.id
    WHERE e.courseId = ? AND e.role = 'student' AND e.status = 'active'
    ORDER BY u.name ASC
  `).all(courseId);
}

function getBestGrade(quizId, userId) {
  return getDatabase().prepare(`
    SELECT MAX(percentage) as percentage, MAX(score) as score, MAX(maxScore) as maxScore
    FROM quiz_attempts
    WHERE quizId = ? AND userId = ? AND status = 'submitted'
  `).get(quizId, userId);
}

function deleteAttemptsByUserId(userId) {
  return getDatabase().prepare('DELETE FROM quiz_attempts WHERE userId = ?').run(userId);
}

function clearCreatedBy(userId) {
  return getDatabase().prepare('UPDATE quizzes SET createdBy = NULL WHERE createdBy = ?').run(userId);
}

function withTransaction(work) {
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION');
  try {
    const result = work();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

module.exports = {
  clearCreatedBy,
  countSubmittedAttempts,
  createAttempt,
  deleteAttemptAnswers,
  deleteAttemptsByUserId,
  deleteByCourseId,
  deleteById,
  findActiveAttempt,
  findAttemptById,
  findById,
  getAttempt,
  getAttemptAnswers,
  getAttemptsForQuiz,
  getBestGrade,
  getById,
  getGradebookQuizzes,
  getGradebookStudents,
  getQuestions,
  insert,
  insertAttemptAnswer,
  list,
  replaceQuestions,
  submitAttempt,
  update,
  withTransaction
};
