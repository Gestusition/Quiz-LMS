const {
  questionDifficultyValues,
  questionTypeValues
} = require('../constants/enums');

function validateQuestion(data) {
  const categoryId = Number(data.categoryId);
  const text = String(data.text || '').trim();
  const type = String(data.type || '').trim().toUpperCase();
  const difficulty = data.difficulty ? String(data.difficulty).trim().toUpperCase() : 'MEDIUM';
  const points = Number(data.points || 1);

  if (!categoryId) {
    throw new Error('Category is required.');
  }
  if (!text || text.length > 500) {
    throw new Error('Question text is required and must be 500 characters or less.');
  }
  if (!questionTypeValues.includes(type)) {
    throw new Error(`Question type must be one of: ${questionTypeValues.join(', ')}.`);
  }
  if (!questionDifficultyValues.includes(difficulty)) {
    throw new Error(`Difficulty must be one of: ${questionDifficultyValues.join(', ')}.`);
  }
  if (!Number.isFinite(points) || points <= 0 || points > 100) {
    throw new Error('Question points must be between 0 and 100.');
  }

  const options = Array.isArray(data.options) ? data.options.map(option => String(option || '').trim()) : [];
  const correctAnswer = String(data.correctAnswer ?? '').trim();

  if (type === 'MC') {
    if (options.filter(Boolean).length < 2) {
      throw new Error('Multiple choice questions need at least 2 options.');
    }
    const answerIndex = Number(correctAnswer);
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) {
      throw new Error('Correct answer must be a valid option index.');
    }
  } else if (type === 'TF') {
    if (!['true', 'false'].includes(correctAnswer.toLowerCase())) {
      throw new Error('True/false answer must be true or false.');
    }
  } else if (!correctAnswer) {
    throw new Error('Correct answer is required.');
  }

  return { categoryId, text, type, options, correctAnswer, difficulty, points };
}

module.exports = { validateQuestion };
