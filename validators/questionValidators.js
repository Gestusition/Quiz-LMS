const {
  questionDifficultyValues,
  questionTypeValues
} = require('../constants/enums');
const { LIMITS } = require('../constants/limits');
const { validationError } = require('../utils/appError');
const { numberInRange, optionalUrl, requiredId, requiredText } = require('../utils/validation');

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

  // Advanced fields
  const richText = String(data.richText || '').slice(0, LIMITS.questions.richTextMax);
  const explanationText = String(data.explanationText || '').slice(0, LIMITS.questions.explanationMax);
  const hintText = String(data.hintText || '').slice(0, LIMITS.questions.hintMax);
  const mediaUrl = optionalUrl(data.mediaUrl, 'mediaUrl', 2000, {
    allowRelative: true,
    allowedRelativePrefixes: ['/uploads/']
  });

  // Type-specific validation
  if (type === 'MC') {
    validateMultipleChoice(options, correctAnswer);
  } else if (type === 'TF') {
    validateTrueFalse(correctAnswer);
  } else if (type === 'FB') {
    validateFillBlank(correctAnswer);
  } else if (type === 'SA') {
    validateShortAnswerNumeric(data);
  } else if (type === 'MR') {
    validateMultipleResponse(options, correctAnswer);
  } else if (type === 'OR') {
    validateOrdering(options);
  } else if (type === 'MT') {
    validateMathTable(data);
  } else if (type === 'MP') {
    validateMultiPart(data);
  }
  // ES (Essay) has no auto-grading validation

  const result = {
    categoryId, text, type, options, correctAnswer, difficulty, points,
    acceptedAnswers, caseSensitive, richText, explanationText, hintText, mediaUrl
  };

  // Pass through advanced structures for service layer
  if (data.parts) result.parts = data.parts;
  if (data.tableConfig) result.tableConfig = data.tableConfig;

  return result;
}

function validateMultipleChoice(options, correctAnswer) {
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
}

function validateTrueFalse(correctAnswer) {
  if (!['true', 'false'].includes(correctAnswer.toLowerCase())) {
    throw validationError('correct_answer', 'True/false answer must be true or false.');
  }
}

function validateFillBlank(correctAnswer) {
  if (!correctAnswer) {
    throw validationError('correct_answer', 'Correct answer is required.');
  }
  if (correctAnswer.length > LIMITS.questions.optionTextMax) {
    throw validationError('correct_answer', `Correct answer must be ${LIMITS.questions.optionTextMax} characters or less.`);
  }
}

function validateShortAnswerNumeric(data) {
  // correctAnswer should be a number or expression
  const answer = String(data.correctAnswer || '').trim();
  if (!answer) {
    throw validationError('correct_answer', 'Correct answer is required for numeric questions.');
  }
}

function validateMultipleResponse(options, correctAnswer) {
  if (options.length < 2 || options.length > LIMITS.questions.maxMultiResponse) {
    throw validationError('options', `Multiple response needs between 2 and ${LIMITS.questions.maxMultiResponse} options.`);
  }
  // correctAnswer should be comma-separated indices like "0,2,3"
  if (!correctAnswer) {
    throw validationError('correct_answer', 'At least one correct answer is required.');
  }
}

function validateOrdering(options) {
  if (options.length < 2 || options.length > LIMITS.questions.maxOrderItems) {
    throw validationError('options', `Ordering questions need between 2 and ${LIMITS.questions.maxOrderItems} items.`);
  }
}

function validateMathTable(data) {
  const config = data.tableConfig;
  if (!config) {
    throw validationError('tableConfig', 'Table configuration is required for math table questions.');
  }
  const columns = Array.isArray(config.columns) ? config.columns : [];
  if (columns.length < 1 || columns.length > LIMITS.questions.maxTableCols) {
    throw validationError('tableConfig', `Table must have 1-${LIMITS.questions.maxTableCols} columns.`);
  }
  const rowCount = Number(config.rowCount || 0);
  if (rowCount < 1 || rowCount > LIMITS.questions.maxTableRows) {
    throw validationError('tableConfig', `Table must have 1-${LIMITS.questions.maxTableRows} rows.`);
  }
}

function validateMultiPart(data) {
  const parts = Array.isArray(data.parts) ? data.parts : [];
  if (parts.length < 1 || parts.length > LIMITS.questions.maxParts) {
    throw validationError('parts', `Multi-part questions need 1-${LIMITS.questions.maxParts} parts.`);
  }
  parts.forEach((part, index) => {
    if (!part.partLabel || !String(part.partLabel).trim()) {
      throw validationError('parts', `Part ${index + 1} must have a label.`);
    }
  });
}

module.exports = { validateQuestion };
