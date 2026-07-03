const { validationError } = require('../utils/appError');
const { parseRequiredPositiveInt } = require('../utils/validation');

const AI_QUESTION_TYPES = ['multiple_choice', 'true_false', 'short_answer'];
const AI_DIFFICULTIES = ['easy', 'medium', 'hard'];
const MAX_QUESTIONS = 20;
const MAX_TOPIC_LENGTH = 500;
const MAX_RESPONSE_LENGTH = 200000;

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

  const title = cleanText(parsed.title, 'title', 160, true);
  const description = cleanText(parsed.description || '', 'description', 2000, false);
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
  const normalizedTexts = questions.map(question => question.text.toLocaleLowerCase());
  if (new Set(normalizedTexts).size !== normalizedTexts.length) {
    throw validationError('questions', 'AI output contains duplicate questions.');
  }
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
  const text = cleanText(question.text, `questions[${index}].text`, 4000, true);
  const explanation = cleanText(question.explanation || '', `questions[${index}].explanation`, 4000, false);
  const sourceHint = cleanText(question.sourceHint || '', `questions[${index}].sourceHint`, 500, false);
  if (options.includeExplanations && !explanation) {
    throw validationError(`questions[${index}].explanation`, 'An explanation is required.');
  }

  if (type === 'multiple_choice') {
    if (!Array.isArray(question.options) || question.options.length < 3 || question.options.length > 5) {
      throw validationError(`questions[${index}].options`, 'Multiple-choice questions need 3 to 5 options.');
    }
    const optionsList = question.options.map((option, optionIndex) =>
      cleanText(option, `questions[${index}].options[${optionIndex}]`, 1000, true)
    );
    const optionKeys = optionsList.map(option => option.toLocaleLowerCase());
    if (new Set(optionKeys).size !== optionsList.length) {
      throw validationError(`questions[${index}].options`, 'Multiple-choice options must be unique.');
    }
    const answer = cleanText(question.correctAnswer, `questions[${index}].correctAnswer`, 1000, true);
    const answerIndex = optionKeys.indexOf(answer.toLocaleLowerCase());
    if (answerIndex < 0) {
      throw validationError(`questions[${index}].correctAnswer`, 'Correct answer must match one option.');
    }
    return { type, text, options: optionsList, correctAnswer: optionsList[answerIndex], explanation, sourceHint };
  }

  if (type === 'true_false') {
    const answer = typeof question.correctAnswer === 'boolean'
      ? String(question.correctAnswer)
      : String(question.correctAnswer || '').trim().toLowerCase();
    if (!['true', 'false'].includes(answer)) {
      throw validationError(`questions[${index}].correctAnswer`, 'True/false answer must be true or false.');
    }
    return { type, text, options: ['true', 'false'], correctAnswer: answer, explanation, sourceHint };
  }

  const correctAnswer = cleanText(question.correctAnswer, `questions[${index}].correctAnswer`, 1000, true);
  return { type, text, options: [], correctAnswer, explanation, sourceHint };
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

module.exports = {
  AI_DIFFICULTIES,
  AI_QUESTION_TYPES,
  MAX_QUESTIONS,
  parseAndValidateAIQuiz,
  validateCourseId,
  validateGenerationInput,
  validateSettings
};
