const { quizStatusValues } = require('../constants/enums');

function validateQuiz(data) {
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
  if (!quizStatusValues.includes(status)) {
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

module.exports = { validateQuiz };
