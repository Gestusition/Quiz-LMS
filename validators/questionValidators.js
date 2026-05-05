const {
  questionDifficultyValues,
  questionTypeValues
} = require('../constants/enums');
const { LIMITS } = require('../constants/limits');
const { validationError } = require('../utils/appError');
const { numberInRange, requiredId, requiredText } = require('../utils/validation');

function validateQuestion(data) {
  const categoryId = requiredId(data.categoryId, 'categoryId');
  const text = requiredText(data.text, 'text', { min: 2, max: LIMITS.questions.textMax });
  const type = String(data.type || '').trim().toUpperCase();
  const difficulty = data.difficulty ? String(data.difficulty).trim().toUpperCase() : 'MEDIUM';
  const points = numberInRange(data.points, 'points', 0.1, LIMITS.questions.pointsMax, {
    required: false,
    defaultValue: 1
  });

  if (!questionTypeValues.includes(type)) {
    throw validationError('type', `Question type must be one of: ${questionTypeValues.join(', ')}.`);
  }
  if (!questionDifficultyValues.includes(difficulty)) {
    throw validationError('difficulty', `Difficulty must be one of: ${questionDifficultyValues.join(', ')}.`);
  }

  const options = Array.isArray(data.options)
    ? data.options.map(option => String(option || '').trim()).filter(Boolean)
    : [];
  const correctAnswer = String(data.correctAnswer ?? '').trim();
  const acceptedAnswers = Array.isArray(data.acceptedAnswers)
    ? data.acceptedAnswers.map(answer => String(answer || '').trim()).filter(Boolean)
    : [];
  const caseSensitive = !!data.caseSensitive;

  if (type === 'MC') {
    if (options.length < LIMITS.questions.minOptions || options.length > LIMITS.questions.maxOptions) {
      throw validationError(
        'options',
        `Multiple choice questions need between ${LIMITS.questions.minOptions} and ${LIMITS.questions.maxOptions} options.`
      );
    }
    if (options.some(option => option.length > LIMITS.questions.optionTextMax)) {
      throw validationError('options', `Each option must be ${LIMITS.questions.optionTextMax} characters or less.`);
    }
    const answerIndex = Number(correctAnswer.trim());
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) {
      throw validationError('correct_answer', 'Correct answer must be a valid option index.');
    }
  } else if (type === 'TF') {
    if (!['true', 'false'].includes(correctAnswer.toLowerCase())) {
      throw validationError('correct_answer', 'True/false answer must be true or false.');
    }
  } else {
    if (!correctAnswer) {
      throw validationError('correct_answer', 'Correct answer is required.');
    }
    if (correctAnswer.length > LIMITS.questions.optionTextMax) {
      throw validationError('correct_answer', `Correct answer must be ${LIMITS.questions.optionTextMax} characters or less.`);
    }
  }

  return { categoryId, text, type, options, correctAnswer, difficulty, points, acceptedAnswers, caseSensitive };
}

module.exports = { validateQuestion };
