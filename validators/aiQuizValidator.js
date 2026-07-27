const { validationError } = require('../utils/appError');
const { parseRequiredPositiveInt } = require('../utils/validation');
const {
  AI_DIFFICULTIES,
  AI_LIMITS,
  AI_QUESTION_TYPES
} = require('../constants/ai');

const MAX_QUESTIONS = AI_LIMITS.questionCountMax;
const MAX_TOPIC_LENGTH = AI_LIMITS.topicMax;
const MAX_RESPONSE_LENGTH = AI_LIMITS.providerResponseCharsMax;

function validateGenerationInput(input = {}) {
  const topic = cleanText(input.topic, 'topic', MAX_TOPIC_LENGTH, true);
  const difficulty = String(input.difficulty || 'medium').trim().toLowerCase();
  const questionType = String(input.questionType || 'mixed').trim().toLowerCase();
  const language = cleanText(input.language || 'English', 'language', 60, true);
  const questionCount = Number(input.questionCount);

  if (!AI_DIFFICULTIES.includes(difficulty)) {
    throw validationError('difficulty', 'Difficulty must be easy, medium, or hard.');
  }
  if (![...AI_QUESTION_TYPES, 'mixed'].includes(questionType)) {
    throw validationError('questionType', 'Unsupported question type.');
  }
  if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > MAX_QUESTIONS) {
    throw validationError('questionCount', `Question count must be between 1 and ${MAX_QUESTIONS}.`);
  }

  return {
    topic,
    difficulty,
    questionCount,
    questionType,
    language,
    useCourseMaterial: input.useCourseMaterial === true || input.useCourseMaterial === 'true',
    includeExplanations: input.includeExplanations !== false && input.includeExplanations !== 'false'
  };
}

function validateSettings(input = {}, existing = null) {
  const endpoint = cleanText(input.endpoint ?? existing?.endpoint, 'endpoint', 500, true).replace(/\/$/, '');
  const apiKey = cleanText(input.apiKey || existing?.apiKey, 'apiKey', 500, true);
  const chatDeployment = cleanIdentifier(input.chatDeployment ?? existing?.chatDeployment, 'chatDeployment');
  const embeddingDeployment = cleanIdentifier(
    input.embeddingDeployment ?? existing?.embeddingDeployment ?? '',
    'embeddingDeployment',
    false
  );
  const apiVersion = cleanText(input.apiVersion ?? existing?.apiVersion, 'apiVersion', 50, true);

  let url;
  try {
    url = new URL(endpoint);
  } catch (error) {
    throw validationError('endpoint', 'Azure OpenAI endpoint must be a valid HTTPS URL.');
  }
  const isAzureHost = url.hostname.endsWith('.openai.azure.com') || url.hostname.endsWith('.services.ai.azure.com');
  if (url.protocol !== 'https:' || !isAzureHost || url.username || url.password || url.search || url.hash) {
    throw validationError('endpoint', 'Use an HTTPS Azure OpenAI endpoint ending in .openai.azure.com or .services.ai.azure.com.');
  }
  if (!/^20\d{2}-\d{2}-\d{2}(?:-preview)?$/.test(apiVersion)) {
    throw validationError('apiVersion', 'API version must look like 2024-10-21 or 2025-01-01-preview.');
  }

  return { endpoint, apiKey, chatDeployment, embeddingDeployment, apiVersion };
}

function parseAndValidateAIQuiz(aiResponse, options = {}) {
  const parsed = parseJsonObject(aiResponse);
  if (containsUnsafeKeys(parsed)) throw validationError('aiResponse', 'AI output contains unsupported object keys.');

  const title = cleanSafeContent(parsed.title, 'title', AI_LIMITS.quizTitleMax, true);
  const description = cleanSafeContent(parsed.description || '', 'description', 4000, false);
  const difficulty = String(parsed.difficulty || options.difficulty || '').trim().toLowerCase();
  if (!AI_DIFFICULTIES.includes(difficulty)) throw validationError('difficulty', 'AI output has an invalid difficulty.');
  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw validationError('questions', 'AI output must contain a non-empty questions array.');
  }
  if (parsed.questions.length > MAX_QUESTIONS) {
    throw validationError('questions', `AI output cannot contain more than ${MAX_QUESTIONS} questions.`);
  }
  if (options.questionCount && parsed.questions.length !== Number(options.questionCount)) {
    throw validationError('questions', `AI returned ${parsed.questions.length} questions; ${options.questionCount} were requested.`);
  }

  const questions = parsed.questions.map((question, index) => validateQuestion(question, index, options));
  const normalizedTexts = questions.map(question => normalizeComparableText(question.text));
  if (new Set(normalizedTexts).size !== normalizedTexts.length) {
    throw validationError('questions', 'AI output contains duplicate questions.');
  }
  for (let left = 0; left < questions.length; left += 1) {
    for (let right = left + 1; right < questions.length; right += 1) {
      if (textSimilarity(normalizedTexts[left], normalizedTexts[right]) >= 0.92) {
        throw validationError('questions', 'AI output contains nearly duplicate questions.');
      }
    }
  }
  validateQuestionTypeDistribution(questions, options.questionTypeDistribution);
  return { title, description, difficulty, questions };
}

function validateQuestion(question, index, options) {
  if (!question || typeof question !== 'object' || Array.isArray(question)) {
    throw validationError(`questions[${index}]`, 'Each question must be an object.');
  }
  const type = String(question.type || '').trim().toLowerCase();
  if (!AI_QUESTION_TYPES.includes(type)) {
    throw validationError(`questions[${index}].type`, 'Unsupported AI question type.');
  }
  if (options.questionType && options.questionType !== 'mixed' && type !== options.questionType) {
    throw validationError(`questions[${index}].type`, `Expected ${options.questionType} questions.`);
  }
  const text = cleanSafeContent(question.text, `questions[${index}].text`, 2000, true);
  const explanation = cleanSafeContent(question.explanation || '', `questions[${index}].explanation`, 5000, false);
  const sourceHint = cleanText(question.sourceHint || '', `questions[${index}].sourceHint`, 500, false);
  const questionDifficulty = String(question.difficulty || options.difficulty || 'medium').trim().toLowerCase();
  if (!AI_DIFFICULTIES.includes(questionDifficulty)) {
    throw validationError(`questions[${index}].difficulty`, 'Question difficulty must be easy, medium, or hard.');
  }
  const learningObjective = cleanSafeContent(
    question.learningObjective || '',
    `questions[${index}].learningObjective`,
    500,
    false
  );
  const points = question.points === undefined || question.points === null ? 1 : Number(question.points);
  if (!Number.isFinite(points) || points <= 0 || points > 100) {
    throw validationError(`questions[${index}].points`, 'Question points must be greater than 0 and no more than 100.');
  }
  const sourceReferences = validateSourceReferences(question, index, options);
  if (options.includeExplanations && !explanation) {
    throw validationError(`questions[${index}].explanation`, 'An explanation is required.');
  }

  if (type === 'multiple_choice') {
    if (!Array.isArray(question.options) || question.options.length < 3 || question.options.length > 5) {
      throw validationError(`questions[${index}].options`, 'Multiple-choice questions need 3 to 5 options.');
    }
    const optionsList = question.options.map((option, optionIndex) =>
      cleanSafeContent(option, `questions[${index}].options[${optionIndex}]`, 500, true)
    );
    const optionKeys = optionsList.map(option => option.toLocaleLowerCase());
    if (new Set(optionKeys).size !== optionsList.length) {
      throw validationError(`questions[${index}].options`, 'Multiple-choice options must be unique.');
    }
    const answer = cleanSafeContent(question.correctAnswer, `questions[${index}].correctAnswer`, 500, true);
    const answerIndex = optionKeys.indexOf(answer.toLocaleLowerCase());
    if (answerIndex < 0) {
      throw validationError(`questions[${index}].correctAnswer`, 'Correct answer must match one option.');
    }
    return {
      type,
      text,
      options: optionsList,
      correctAnswer: optionsList[answerIndex],
      explanation,
      sourceHint,
      difficulty: questionDifficulty,
      learningObjective,
      points,
      sourceReferences,
      validationStatus: 'valid'
    };
  }

  if (type === 'true_false') {
    const answer = typeof question.correctAnswer === 'boolean'
      ? String(question.correctAnswer)
      : String(question.correctAnswer || '').trim().toLowerCase();
    if (!['true', 'false'].includes(answer)) {
      throw validationError(`questions[${index}].correctAnswer`, 'True/false answer must be true or false.');
    }
    return {
      type,
      text,
      options: ['true', 'false'],
      correctAnswer: answer,
      explanation,
      sourceHint,
      difficulty: questionDifficulty,
      learningObjective,
      points,
      sourceReferences,
      validationStatus: 'valid'
    };
  }

  const correctAnswer = cleanSafeContent(question.correctAnswer, `questions[${index}].correctAnswer`, 1000, true);
  return {
    type,
    text,
    options: [],
    correctAnswer,
    explanation,
    sourceHint,
    difficulty: questionDifficulty,
    learningObjective,
    points,
    sourceReferences,
    validationStatus: 'valid'
  };
}

function validateSourceReferences(question, index, options) {
  const raw = Array.isArray(question.sourceReferences)
    ? question.sourceReferences
    : Array.isArray(question.sourceChunkIds)
      ? question.sourceChunkIds.map(chunkId => ({ chunkId }))
      : [];
  if (raw.length > 10) {
    throw validationError(`questions[${index}].sourceReferences`, 'A question cannot reference more than 10 source chunks.');
  }
  const restrictToAllowedChunks = Array.isArray(options.allowedSourceChunkIds);
  const allowed = new Set((options.allowedSourceChunkIds || []).map(Number));
  const chunksById = new Map(
    (Array.isArray(options.sourceChunks) ? options.sourceChunks : [])
      .map(chunk => [Number(chunk.id), chunk])
  );
  const references = raw.map((reference, referenceIndex) => {
    const value = typeof reference === 'object' && reference !== null ? reference : { chunkId: reference };
    const chunkId = Number(value.chunkId ?? value.id);
    if (!Number.isInteger(chunkId) || chunkId < 1) {
      throw validationError(
        `questions[${index}].sourceReferences[${referenceIndex}]`,
        'Source references must contain valid chunk IDs.'
      );
    }
    if (restrictToAllowedChunks && !allowed.has(chunkId)) {
      throw validationError(
        `questions[${index}].sourceReferences[${referenceIndex}]`,
        'AI output referenced a course-material chunk that was not supplied.'
      );
    }
    const sourceChunk = chunksById.get(chunkId);
    const suppliedMaterialId = Number(value.materialId);
    if (
      sourceChunk &&
      Number.isInteger(suppliedMaterialId) &&
      suppliedMaterialId !== Number(sourceChunk.materialId)
    ) {
      throw validationError(
        `questions[${index}].sourceReferences[${referenceIndex}].materialId`,
        'AI output referenced a material that does not contain the supplied source chunk.'
      );
    }
    return {
      chunkId,
      materialId: sourceChunk
        ? Number(sourceChunk.materialId)
        : (Number.isInteger(suppliedMaterialId) ? suppliedMaterialId : null),
      label: cleanText(
        sourceChunk
          ? (sourceChunk.sourceLabel || `Course material chunk ${chunkId}`)
          : (value.label || value.sourceLabel || ''),
        'sourceReference.label',
        180,
        false
      )
    };
  });
  const unique = [...new Map(references.map(reference => [reference.chunkId, reference])).values()];
  if (options.requireSourceReferences && unique.length === 0) {
    throw validationError(
      `questions[${index}].sourceReferences`,
      'Every question must cite course material when course-material-only mode is enabled.'
    );
  }
  if (options.requireSourceReferences && Array.isArray(options.sourceChunks)) {
    const chunkTextById = new Map(
      options.sourceChunks.map(chunk => [Number(chunk.id), String(chunk.content || '')])
    );
    const citedText = unique.map(reference => chunkTextById.get(reference.chunkId) || '').join(' ');
    const claimText = [
      question.text,
      question.correctAnswer,
      ...(Array.isArray(question.options) ? question.options : [])
    ].join(' ');
    if (!hasGroundingOverlap(claimText, citedText)) {
      throw validationError(
        `questions[${index}].sourceReferences`,
        'The cited course-material chunks do not appear to support this question.'
      );
    }
  }
  return unique;
}

function validateQuestionTypeDistribution(questions, distribution) {
  if (!distribution || typeof distribution !== 'object') return;
  for (const type of AI_QUESTION_TYPES) {
    const expected = Number(distribution[type] || distribution[toCamelCase(type)] || 0);
    if (!Number.isInteger(expected) || expected < 0) {
      throw validationError('questionTypeDistribution', 'Question type counts must be non-negative integers.');
    }
    const actual = questions.filter(question => question.type === type).length;
    if (actual !== expected) {
      throw validationError(
        'questions',
        `AI returned ${actual} ${type.replaceAll('_', ' ')} questions; ${expected} were requested.`
      );
    }
  }
}

function validateCourseId(value) {
  return parseRequiredPositiveInt(value, 'courseId');
}

function parseJsonObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  const text = String(value || '').trim();
  if (!text || text.length > MAX_RESPONSE_LENGTH) throw validationError('aiResponse', 'AI response is empty or too large.');
  const withoutFence = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    const result = JSON.parse(withoutFence);
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('not an object');
    return result;
  } catch (error) {
    throw validationError('aiResponse', 'Azure OpenAI returned malformed JSON. Regenerate the draft.');
  }
}

function cleanText(value, field, max, required) {
  const text = String(value ?? '').replace(/\0/g, '').trim();
  if (required && !text) throw validationError(field, `${field} is required.`);
  if (text.length > max) throw validationError(field, `${field} must be ${max} characters or less.`);
  return text;
}

function cleanSafeContent(value, field, max, required) {
  const text = cleanText(value, field, max, required);
  if (/<\s*\/?\s*(?:script|iframe|object|embed|style)\b/i.test(text) ||
      /\bjavascript\s*:/i.test(text) ||
      /\bon(?:error|load|click|mouseover)\s*=/i.test(text)) {
    throw validationError(field, `${field} contains unsafe script or HTML content.`);
  }
  return text;
}

function cleanIdentifier(value, field, required = true) {
  const text = cleanText(value, field, 128, required);
  if (text && !/^[A-Za-z0-9._-]+$/.test(text)) {
    throw validationError(field, `${field} contains unsupported characters.`);
  }
  return text;
}

function containsUnsafeKeys(value) {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(containsUnsafeKeys);
  return Object.entries(value).some(([key, child]) =>
    ['__proto__', 'prototype', 'constructor'].includes(key) || containsUnsafeKeys(child)
  );
}

function normalizeComparableText(value) {
  return String(value || '')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function textSimilarity(left, right) {
  const leftTokens = new Set(left.split(' ').filter(Boolean));
  const rightTokens = new Set(right.split(' ').filter(Boolean));
  if (!leftTokens.size || !rightTokens.size) return 0;
  let intersection = 0;
  leftTokens.forEach(token => {
    if (rightTokens.has(token)) intersection += 1;
  });
  return intersection / Math.max(leftTokens.size, rightTokens.size);
}

function toCamelCase(value) {
  return value.replace(/_([a-z])/g, (_, character) => character.toUpperCase());
}

function hasGroundingOverlap(claim, source) {
  const ignored = new Set([
    'about', 'after', 'answer', 'before', 'correct', 'could', 'from', 'have',
    'into', 'question', 'should', 'that', 'their', 'there', 'these', 'this',
    'which', 'with', 'would', 'true', 'false'
  ]);
  const tokens = value => new Set(
    String(value || '')
      .toLocaleLowerCase()
      .match(/[\p{L}\p{N}_]{4,}/gu) || []
  );
  const claimTokens = tokens(claim);
  const sourceTokens = tokens(source);
  for (const token of claimTokens) {
    if (!ignored.has(token) && sourceTokens.has(token)) return true;
  }
  return false;
}

module.exports = {
  AI_DIFFICULTIES,
  AI_QUESTION_TYPES,
  MAX_QUESTIONS,
  cleanSafeContent,
  parseAndValidateAIQuiz,
  textSimilarity,
  validateCourseId,
  validateGenerationInput,
  validateQuestion,
  validateSettings
};
