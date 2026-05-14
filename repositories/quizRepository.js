const { getDatabase } = require('../database/db');

function list(user, filters = {}, validStatuses = []) {
  const db = getDatabase();
  let query = `
    SELECT q.*,
      c.title as courseTitle,
      c.code as courseCode,
      creator.name as createdByName,
      updater.name as updatedByName,
      ${user.role === 'teacher' ? `(SELECT qg.accessLevel FROM users.resource_access_grants qg
        WHERE qg.resourceType = 'quiz' AND qg.resourceId = q.id AND qg.teacherUserId = ?
        LIMIT 1)` : 'NULL'} as accessLevel,
      COUNT(DISTINCT qq.questionId) as questionCount,
      ROUND(COALESCE(SUM(qq.points), 0), 2) as maxScore
    FROM quizzes q
    JOIN courses c ON c.id = q.courseId
    LEFT JOIN quiz_questions qq ON qq.quizId = q.id
    LEFT JOIN users creator ON creator.id = q.createdBy
    LEFT JOIN users updater ON updater.id = q.updatedBy
    WHERE 1=1
  `;
  const params = [];
  if (user.role === 'teacher') params.push(user.id);

  if (user.role === 'teacher') {
    query += ` AND (
      q.createdBy = ?
      OR EXISTS (
        SELECT 1 FROM users.resource_access_grants qg
        WHERE qg.resourceType = 'quiz'
          AND qg.resourceId = q.id
          AND qg.teacherUserId = ?
      )
    )`;
    params.push(user.id, user.id);
  } else if (user.role !== 'admin') {
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

function getById(id, user = null) {
  const isTeacher = user && user.role === 'teacher';
  const params = isTeacher ? [user.id, id] : [id];
  return getDatabase().prepare(`
    SELECT q.*, c.title as courseTitle, c.code as courseCode,
      creator.name as createdByName,
      updater.name as updatedByName,
      ${isTeacher ? `(SELECT qg.accessLevel FROM users.resource_access_grants qg
        WHERE qg.resourceType = 'quiz' AND qg.resourceId = q.id AND qg.teacherUserId = ?
        LIMIT 1)` : 'NULL'} as accessLevel
    FROM quizzes q
    JOIN courses c ON c.id = q.courseId
    LEFT JOIN users creator ON creator.id = q.createdBy
    LEFT JOIN users updater ON updater.id = q.updatedBy
    WHERE q.id = ?
  `).get(...params) || null;
}

function insert(payload, userId) {
  return getDatabase().prepare(`
    INSERT INTO quizzes (
      courseId, title, description, status, openAt, closeAt, timeLimitMinutes,
      attemptsAllowed, shuffleQuestions, showCorrectAnswers,
      startAt, endAt, durationMinutes, maxAttempts, shuffleOptions, showResultPolicy,
      gradingMode, penaltyEnabled, penaltyPerWrong, penaltyRatio, requiresSeb, sebConfigName, sebConfigUrl,
      templateName, createdBy
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.courseId,
    payload.title,
    payload.description,
    payload.status,
    payload.startAt || payload.openAt || '',
    payload.endAt || payload.closeAt || '',
    payload.durationMinutes || payload.timeLimitMinutes || 0,
    payload.maxAttempts || payload.attemptsAllowed || 1,
    payload.shuffleQuestions ? 1 : 0,
    payload.showCorrectAnswers ? 1 : 0,
    payload.startAt || payload.openAt || '',
    payload.endAt || payload.closeAt || '',
    payload.durationMinutes || payload.timeLimitMinutes || 0,
    payload.maxAttempts || payload.attemptsAllowed || 1,
    payload.shuffleOptions ? 1 : 0,
    payload.showResultPolicy || 'immediately',
    payload.gradingMode || 'standard',
    payload.penaltyEnabled ? 1 : 0,
    Number(payload.penaltyPerWrong || 0),
    Number(payload.penaltyRatio || 0),
    payload.requiresSeb ? 1 : 0,
    payload.sebConfigName || '',
    payload.sebConfigUrl || '',
    payload.templateName || '',
    userId
  );
}

function update(id, payload, updatedAt, actorUserId = null) {
  return getDatabase().prepare(`
    UPDATE quizzes
    SET courseId = ?, title = ?, description = ?, status = ?, openAt = ?, closeAt = ?,
      timeLimitMinutes = ?, attemptsAllowed = ?, shuffleQuestions = ?, showCorrectAnswers = ?,
      startAt = ?, endAt = ?, durationMinutes = ?, maxAttempts = ?, shuffleOptions = ?, showResultPolicy = ?,
      gradingMode = ?, penaltyEnabled = ?, penaltyPerWrong = ?, penaltyRatio = ?, requiresSeb = ?,
      sebConfigName = ?, sebConfigUrl = ?, templateName = ?, updatedBy = ?,
      updatedAt = ?
    WHERE id = ?
  `).run(
    payload.courseId,
    payload.title,
    payload.description,
    payload.status,
    payload.startAt || payload.openAt || '',
    payload.endAt || payload.closeAt || '',
    payload.durationMinutes || payload.timeLimitMinutes || 0,
    payload.maxAttempts || payload.attemptsAllowed || 1,
    payload.shuffleQuestions ? 1 : 0,
    payload.showCorrectAnswers ? 1 : 0,
    payload.startAt || payload.openAt || '',
    payload.endAt || payload.closeAt || '',
    payload.durationMinutes || payload.timeLimitMinutes || 0,
    payload.maxAttempts || payload.attemptsAllowed || 1,
    payload.shuffleOptions ? 1 : 0,
    payload.showResultPolicy || 'immediately',
    payload.gradingMode || 'standard',
    payload.penaltyEnabled ? 1 : 0,
    Number(payload.penaltyPerWrong || 0),
    Number(payload.penaltyRatio || 0),
    payload.requiresSeb ? 1 : 0,
    payload.sebConfigName || '',
    payload.sebConfigUrl || '',
    payload.templateName || '',
    actorUserId,
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
    SELECT q.*, c.name as categoryName, c.courseId, qq.points as quizPoints, qq.position
    FROM quiz_questions qq
    JOIN questions q ON q.id = qq.questionId
    LEFT JOIN categories c ON c.id = q.categoryId
    WHERE qq.quizId = ?
    ORDER BY qq.position ASC, qq.id ASC
  `).all(quizId);
}

function replaceQuestions(quizId, questions, parsedQuestions) {
  const db = getDatabase();
  db.prepare('DELETE FROM quiz_questions WHERE quizId = ?').run(quizId);
  const insert = db.prepare(`
    INSERT INTO quiz_questions (quizId, questionId, points, position)
    VALUES (?, ?, ?, ?)
  `);
  parsedQuestions.forEach((parsedQ, index) => {
    // Determine the ID from parsedQ (could be just the ID for backward compatibility, or the object)
    const questionId = typeof parsedQ === 'object' ? parsedQ.id : parsedQ;
    const customPoints = typeof parsedQ === 'object' ? parsedQ.points : null;
    const question = questions.find(item => item.id === questionId);
    
    insert.run(quizId, questionId, customPoints !== null ? customPoints : (question.points || 1), index + 1);
  });
}

function findActiveAttempt(quizId, userId) {
  return getDatabase().prepare(`
    SELECT id, quizId, userId, startedAt, expiresAt, maxScore
    FROM quiz_attempts
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

function createAttempt(quizId, userId, attemptNumber, maxScore, expiresAt) {
  return getDatabase().prepare(`
    INSERT INTO quiz_attempts (quizId, userId, attemptNumber, maxScore, expiresAt, lifecycleStatus)
    VALUES (?, ?, ?, ?, ?, 'in_progress')
  `).run(quizId, userId, attemptNumber, maxScore, expiresAt || '');
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
    SET status = 'submitted', lifecycleStatus = 'submitted', submittedAt = ?, score = ?, maxScore = ?, percentage = ?, timeSpentSeconds = ?
    WHERE id = ?
  `).run(submittedAt, score, maxScore, percentage, timeSpentSeconds, attemptId);
}

function markAttemptExpired(attemptId, submittedAt, score, maxScore, percentage, timeSpentSeconds) {
  return getDatabase().prepare(`
    UPDATE quiz_attempts
    SET status = 'submitted', lifecycleStatus = 'expired', submittedAt = ?, score = ?, maxScore = ?, percentage = ?, timeSpentSeconds = ?
    WHERE id = ?
  `).run(submittedAt, score, maxScore, percentage, timeSpentSeconds, attemptId);
}

function setAttemptGradeStatus(attemptId, payload) {
  return getDatabase().prepare(`
    UPDATE quiz_attempts
    SET letterGrade = ?, gradeStatus = ?, gradeMessage = ?, lifecycleStatus = ?
    WHERE id = ?
  `).run(payload.letterGrade || '', payload.gradeStatus || 'ready', payload.gradeMessage || '', payload.lifecycleStatus || 'graded', attemptId);
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
    SELECT percentage, score, maxScore
    FROM quiz_attempts
    WHERE quizId = ? AND userId = ? AND status = 'submitted'
    ORDER BY percentage DESC, score DESC, submittedAt ASC, id ASC
    LIMIT 1
  `).get(quizId, userId);
}

function setManualResultReleasedAt(quizId, releasedAt) {
  return getDatabase().prepare(`
    UPDATE quizzes
    SET manualResultReleasedAt = ?, updatedAt = ?
    WHERE id = ?
  `).run(releasedAt, releasedAt, quizId);
}

function listExamTemplates(filters = {}, user = null) {
  const db = getDatabase();
  let query = 'SELECT * FROM exam_templates WHERE 1=1';
  const params = [];
  if (filters.courseId) {
    query += ' AND (courseId = ? OR courseId IS NULL)';
    params.push(filters.courseId);
  }
  if (user && user.role !== 'admin') {
    query += ` AND (
      isSystem = 1
      OR (courseId IS NULL AND createdBy = ?)
      OR courseId IN (
        SELECT courseId
        FROM enrollments
        WHERE userId = ? AND role = 'teacher' AND status = 'active'
      )
    )`;
    params.push(user.id, user.id);
  }
  query += ' ORDER BY isSystem DESC, name ASC';
  return db.prepare(query).all(...params);
}

function findExamTemplateByName(name) {
  return getDatabase().prepare(`
    SELECT *
    FROM exam_templates
    WHERE LOWER(name) = LOWER(?)
  `).get(name) || null;
}

function findExamTemplateById(id) {
  return getDatabase().prepare('SELECT * FROM exam_templates WHERE id = ?').get(id) || null;
}

function insertExamTemplate(payload) {
  return getDatabase().prepare(`
    INSERT INTO exam_templates (name, description, defaultsJson, isSystem, courseId, createdBy)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    payload.name,
    payload.description || '',
    typeof payload.defaultsJson === 'string' ? payload.defaultsJson : JSON.stringify(payload.defaults || {}),
    payload.isSystem ? 1 : 0,
    payload.courseId || null,
    payload.createdBy || null
  );
}

function updateExamTemplate(id, payload) {
  return getDatabase().prepare(`
    UPDATE exam_templates
    SET name = ?, description = ?, defaultsJson = ?, courseId = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    payload.name,
    payload.description || '',
    payload.defaultsJson || '{}',
    payload.courseId || null,
    payload.updatedAt || '',
    id
  );
}

function deleteExamTemplate(id) {
  return getDatabase().prepare('DELETE FROM exam_templates WHERE id = ?').run(id);
}

function deleteExamTemplatesByCourseId(courseId) {
  return getDatabase().prepare('DELETE FROM exam_templates WHERE courseId = ?').run(courseId);
}

function insertAttemptAnswerWithJson(attemptId, questionId, answer, isCorrect, pointsAwarded, answerJson) {
  return getDatabase().prepare(`
    INSERT INTO attempt_answers (attemptId, questionId, answer, isCorrect, pointsAwarded, answerJson)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(attemptId, questionId, String(answer), isCorrect ? 1 : 0, pointsAwarded, answerJson || '{}');
}

function deleteAttemptsByUserId(userId) {
  return getDatabase().prepare('DELETE FROM quiz_attempts WHERE userId = ?').run(userId);
}

function clearCreatedBy(userId) {
  const db = getDatabase();
  db.prepare('UPDATE quizzes SET createdBy = NULL WHERE createdBy = ?').run(userId);
  db.prepare('UPDATE exam_templates SET createdBy = NULL WHERE createdBy = ?').run(userId);
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
  deleteExamTemplate,
  deleteExamTemplatesByCourseId,
  findActiveAttempt,
  findAttemptById,
  findExamTemplateById,
  findExamTemplateByName,
  findById,
  getAttempt,
  getAttemptAnswers,
  getAttemptsForQuiz,
  getBestGrade,
  getById,
  getGradebookQuizzes,
  getGradebookStudents,
  getQuestions,
  insertAttemptAnswerWithJson,
  insertExamTemplate,
  updateExamTemplate,
  listExamTemplates,
  markAttemptExpired,
  insert,
  insertAttemptAnswer,
  list,
  replaceQuestions,
  submitAttempt,
  setAttemptGradeStatus,
  setManualResultReleasedAt,
  update,
  withTransaction
};
