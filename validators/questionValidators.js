const {
  questionDifficultyValues,
  questionTypeValues
} = require('../constants/enums');
const { LIMITS } = require('../constants/limits');
const { validationError } = require('../utils/appError');
const { numberInRange, optionalUrl, requiredId, requiredText } = require('../utils/validation');

const MULTI_PART_ANSWER_TYPES = ['text', 'numeric', 'select', 'sign'];
const TABLE_COLUMN_TYPES = ['label', 'input', 'prefill', 'sign'];
const QUESTION_GRADING_TYPES = ['standard', 'negative', 'manual'];

function validateQuestion(data) {
  const categoryId = requiredId(data.categoryId, 'categoryId');
  const text = requiredText(data.text, 'text', { min: 2, max: LIMITS.questions.textMax });
  const type = String(data.type || '').trim().toUpperCase();
  const difficulty = data.difficulty ? String(data.difficulty).trim().toUpperCase() : 'MEDIUM';
  const points = numberInRange(data.points, 'points', 0, LIMITS.questions.pointsMax, {
    required: false,
    defaultValue: 1
  });

  if (!questionTypeValues.includes(type)) {
    throw validationError('type', `Question type must be one of: ${questionTypeValues.join(', ')}.`);
  }
  if (!questionDifficultyValues.includes(difficulty)) {
    throw validationError('difficulty', `Difficulty must be one of: ${questionDifficultyValues.join(', ')}.`);
  }

  // Validate grading type
  const gradingType = QUESTION_GRADING_TYPES.includes(String(data.gradingType || '').trim())
    ? String(data.gradingType).trim()
    : 'standard';

  const options = Array.isArray(data.options)
    ? data.options.map(option => String(option || '').trim()).filter(Boolean)
    : [];
  let correctAnswer = String(data.correctAnswer ?? '').trim();
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
    correctAnswer = options.map((_, index) => String(index)).join(',');
  } else if (type === 'MT') {
    validateMathTable(data);
  } else if (type === 'MP') {
    validateMultiPart(data);
  }
  // ES (Essay) has no auto-grading validation

  const result = {
    categoryId, text, type, options, correctAnswer, difficulty, points,
    acceptedAnswers, caseSensitive, richText, explanationText, hintText, mediaUrl,
    gradingType
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
  const answer = String(data.correctAnswer || '').trim();
  if (!answer) {
    throw validationError('correct_answer', 'Correct answer is required for numeric questions.');
  }
  if (!Number.isFinite(Number(answer))) {
    throw validationError('correct_answer', 'Numeric correct answers must be plain numbers.');
  }
}

function validateMultipleResponse(options, correctAnswer) {
  if (options.length < 2 || options.length > LIMITS.questions.maxMultiResponse) {
    throw validationError('options', `Multiple response needs between 2 and ${LIMITS.questions.maxMultiResponse} options.`);
  }
  if (!correctAnswer) {
    throw validationError('correct_answer', 'At least one correct answer is required.');
  }
  const rawIndexes = correctAnswer.split(',').map(item => item.trim()).filter(Boolean);
  if (rawIndexes.length === 0) {
    throw validationError('correct_answer', 'At least one correct answer is required.');
  }
  const indexes = rawIndexes.map(item => {
    if (!/^[0-9]+$/.test(item)) {
      throw validationError('correct_answer', 'Correct answer indexes must be valid option indexes.');
    }
    const index = Number(item);
    if (!Number.isInteger(index) || index < 0 || index >= options.length) {
      throw validationError('correct_answer', 'Correct answer indexes must be valid option indexes.');
    }
    return index;
  });
  if (new Set(indexes).size !== indexes.length) {
    throw validationError('correct_answer', 'Correct answer indexes must not contain duplicates.');
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
  columns.forEach((column, index) => {
    const header = String(column.header || '').trim();
    const type = String(column.type || '').trim();
    if (!header || header.length > LIMITS.questions.optionTextMax) {
      throw validationError('tableConfig', `Column ${index + 1} must have a valid header.`);
    }
    if (!TABLE_COLUMN_TYPES.includes(type)) {
      throw validationError('tableConfig', `Column ${index + 1} type must be one of: ${TABLE_COLUMN_TYPES.join(', ')}.`);
    }
  });
  const rowCount = Number(config.rowCount);
  if (!Number.isInteger(rowCount) || rowCount < 1 || rowCount > LIMITS.questions.maxTableRows) {
    throw validationError('tableConfig', `Table must have 1-${LIMITS.questions.maxTableRows} rows.`);
  }
  const correctData = config.correctData || {};
  if (!correctData || typeof correctData !== 'object' || Array.isArray(correctData)) {
    throw validationError('tableConfig', 'correctData must be an object.');
  }
  if (Object.keys(correctData).length === 0) {
    throw validationError('tableConfig', 'Math table questions require at least one correct cell.');
  }
  Object.entries(correctData).forEach(([key, value]) => {
    const match = /^r([0-9]+)_c([0-9]+)$/.exec(key);
    if (!match) {
      throw validationError('tableConfig', 'correctData cell keys must match r{row}_c{column}.');
    }
    const row = Number(match[1]);
    const col = Number(match[2]);
    if (row < 0 || row >= rowCount || col < 0 || col >= columns.length) {
      throw validationError('tableConfig', 'correctData cell keys must fit the configured table shape.');
    }
    if (String(value ?? '').length > LIMITS.questions.optionTextMax) {
      throw validationError('tableConfig', `Correct cell values must be ${LIMITS.questions.optionTextMax} characters or less.`);
    }
  });
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
    const answerType = String(part.answerType || 'text').trim();
    if (!MULTI_PART_ANSWER_TYPES.includes(answerType)) {
      throw validationError('parts', `Part ${index + 1} answerType must be one of: ${MULTI_PART_ANSWER_TYPES.join(', ')}.`);
    }
    if (!String(part.correctAnswer || '').trim()) {
      throw validationError('parts', `Part ${index + 1} must have a correct answer.`);
    }
    const points = Number(part.points);
    if (!Number.isFinite(points) || points < 0 || points > LIMITS.questions.pointsMax) {
      throw validationError('parts', `Part ${index + 1} points cannot be negative.`);
    }
    ['partLabel', 'partText', 'placeholder', 'correctAnswer'].forEach(field => {
      if (String(part[field] || '').length > LIMITS.questions.optionTextMax) {
        throw validationError('parts', `Part ${index + 1} ${field} must be ${LIMITS.questions.optionTextMax} characters or less.`);
      }
    });
    if (part.acceptedAnswers !== undefined) {
      if (!Array.isArray(part.acceptedAnswers)) {
        throw validationError('parts', `Part ${index + 1} acceptedAnswers must be an array.`);
      }
      part.acceptedAnswers.forEach(answer => {
        if (String(answer || '').length > LIMITS.questions.optionTextMax) {
          throw validationError('parts', `Part ${index + 1} accepted answers must be ${LIMITS.questions.optionTextMax} characters or less.`);
        }
      });
    }
  });
}

module.exports = { validateQuestion };
