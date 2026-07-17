const {
  AI_CONVERSATION_STATUS,
  AI_CONVERSATION_STATUSES,
  AI_DIFFICULTIES,
  AI_GENERATION_STATUSES,
  AI_LIMITS,
  AI_MATERIAL_MODE,
  AI_MATERIAL_MODES,
  AI_MESSAGE_TYPES,
  AI_QUESTION_DISTRIBUTION_KEYS,
  AI_REVISION_TYPES
} = require('../constants/ai');
const { validationError } = require('../utils/appError');
const {
  intInRange,
  parseOptionalPositiveInt,
  parseRequiredPositiveInt
} = require('../utils/validation');

const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const UNSAFE_MARKUP = /<\s*\/?\s*(?:script|iframe|object|embed|svg|math|style|link|meta)\b|&lt;\s*\/?\s*(?:script|iframe|object|embed|svg|math|style|link|meta)\b|javascript\s*:|data\s*:\s*text\/html|on[a-z]+\s*=/i;
const UNSAFE_CONTROLS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const PLAN_PATCH_FIELDS = new Set([
  'courseId',
  'topic',
  'learningObjectives',
  'difficulty',
  'questionCount',
  'language',
  'questionTypeDistribution',
  'materialMode',
  'useIndexedMaterialOnly',
  'includeExplanations',
  'timeLimitMinutes',
  'tags',
  'specialInstructions',
  'additionalTeacherInstructions',
  'gradingPreferences',
  'gradingOrScoringPreferences',
  'materialIds'
]);

function validateConversationCreate(input = {}) {
  assertPlainObject(input, 'conversation');
  assertSafeStructure(input, 'conversation');
  return {
    courseId: nullablePositiveInt(input.courseId, 'courseId'),
    title: cleanText(input.title || 'New quiz conversation', 'title', AI_LIMITS.conversationTitleMax, {
      required: true
    }),
    initialMessage: input.initialMessage === undefined
      ? ''
      : cleanText(input.initialMessage, 'initialMessage', AI_LIMITS.messageMax)
  };
}

function validateConversationListQuery(query = {}) {
  assertPlainObject(query, 'query');
  assertSafeStructure(query, 'query');
  const status = cleanText(query.status || '', 'status', 64, { allowEmpty: true });
  if (status && !AI_CONVERSATION_STATUSES.includes(status)) {
    throw validationError('status', 'Unsupported AI conversation status.');
  }
  const page = intInRange(query.page, 'page', 1, 100000, {
    required: false,
    defaultValue: 1
  });
  const limit = intInRange(query.limit, 'limit', 1, AI_LIMITS.conversationsPageSizeMax, {
    required: false,
    defaultValue: AI_LIMITS.conversationsPageSizeDefault
  });
  return {
    courseId: nullablePositiveInt(query.courseId, 'courseId'),
    status,
    search: cleanText(query.search || '', 'search', AI_LIMITS.conversationSearchMax, { allowEmpty: true }),
    page,
    limit,
    offset: (page - 1) * limit
  };
}

function validateMessageInput(input = {}) {
  assertPlainObject(input, 'message');
  assertSafeStructure(input, 'message');
  const messageType = cleanText(input.messageType || 'message', 'messageType', 64, { required: true });
  if (!AI_MESSAGE_TYPES.includes(messageType)) {
    throw validationError('messageType', 'Unsupported AI message type.');
  }
  return {
    content: cleanText(input.content, 'content', AI_LIMITS.messageMax, { required: true }),
    messageType,
    clientRequestId: validateOptionalIdempotencyKey(input.clientRequestId, 'clientRequestId'),
    metadata: validateMetadata(input.metadata, 'metadata', AI_LIMITS.messageMetadataMaxBytes)
  };
}

function createEmptyQuizPlan(overrides = {}) {
  const base = {
    courseId: null,
    topic: '',
    learningObjectives: [],
    difficulty: '',
    questionCount: null,
    language: 'English',
    questionTypeDistribution: emptyQuestionTypeDistribution(),
    materialMode: AI_MATERIAL_MODE.generalModelKnowledgeAllowed,
    useIndexedMaterialOnly: false,
    includeExplanations: true,
    timeLimitMinutes: null,
    tags: [],
    specialInstructions: '',
    gradingPreferences: '',
    materialIds: []
  };
  const normalized = normalizeQuizPlan({ ...base, ...overrides });
  return withReadiness(normalized);
}

function validateQuizPlanPatch(input = {}, existingPlan = {}) {
  assertPlainObject(input, 'quizPlan');
  assertSafeStructure(input, 'quizPlan');
  const unsupported = Object.keys(input).filter(key => !PLAN_PATCH_FIELDS.has(key));
  if (unsupported.length) {
    throw validationError('quizPlan', `Unsupported quiz-plan field: ${unsupported[0]}.`);
  }

  const patch = {};
  if (hasOwn(input, 'courseId')) patch.courseId = nullablePositiveInt(input.courseId, 'courseId');
  if (hasOwn(input, 'topic')) {
    patch.topic = cleanText(input.topic, 'topic', AI_LIMITS.topicMax, { allowEmpty: true });
  }
  if (hasOwn(input, 'learningObjectives')) {
    patch.learningObjectives = cleanTextArray(input.learningObjectives, 'learningObjectives', {
      maxItems: AI_LIMITS.learningObjectivesMax,
      maxLength: AI_LIMITS.learningObjectiveMax
    });
  }
  if (hasOwn(input, 'difficulty')) {
    const difficulty = cleanText(input.difficulty, 'difficulty', 32, { allowEmpty: true }).toLowerCase();
    if (difficulty && !AI_DIFFICULTIES.includes(difficulty)) {
      throw validationError('difficulty', 'Difficulty must be easy, medium, or hard.');
    }
    patch.difficulty = difficulty;
  }
  if (hasOwn(input, 'questionCount')) {
    patch.questionCount = nullableIntInRange(
      input.questionCount,
      'questionCount',
      AI_LIMITS.questionCountMin,
      AI_LIMITS.questionCountMax
    );
  }
  if (hasOwn(input, 'language')) {
    patch.language = cleanText(input.language, 'language', AI_LIMITS.languageMax, { allowEmpty: true });
  }
  if (hasOwn(input, 'questionTypeDistribution')) {
    patch.questionTypeDistribution = validateQuestionTypeDistribution(input.questionTypeDistribution);
  }
  if (hasOwn(input, 'materialMode')) {
    const materialMode = cleanText(input.materialMode, 'materialMode', 64, { required: true });
    if (!AI_MATERIAL_MODES.includes(materialMode)) {
      throw validationError('materialMode', 'Unsupported course-material mode.');
    }
    patch.materialMode = materialMode;
    patch.useIndexedMaterialOnly = materialMode === AI_MATERIAL_MODE.courseMaterialOnly;
  } else if (hasOwn(input, 'useIndexedMaterialOnly')) {
    patch.useIndexedMaterialOnly = strictBoolean(input.useIndexedMaterialOnly, 'useIndexedMaterialOnly');
    patch.materialMode = patch.useIndexedMaterialOnly
      ? AI_MATERIAL_MODE.courseMaterialOnly
      : AI_MATERIAL_MODE.generalModelKnowledgeAllowed;
  }
  if (hasOwn(input, 'includeExplanations')) {
    patch.includeExplanations = strictBoolean(input.includeExplanations, 'includeExplanations');
  }
  if (hasOwn(input, 'timeLimitMinutes')) {
    patch.timeLimitMinutes = nullableIntInRange(
      input.timeLimitMinutes,
      'timeLimitMinutes',
      AI_LIMITS.timeLimitMinutesMin,
      AI_LIMITS.timeLimitMinutesMax
    );
  }
  if (hasOwn(input, 'tags')) {
    patch.tags = cleanTextArray(input.tags, 'tags', {
      maxItems: AI_LIMITS.tagsMax,
      maxLength: AI_LIMITS.tagMax
    });
  }
  if (hasOwn(input, 'specialInstructions') || hasOwn(input, 'additionalTeacherInstructions')) {
    const value = hasOwn(input, 'specialInstructions')
      ? input.specialInstructions
      : input.additionalTeacherInstructions;
    patch.specialInstructions = cleanText(value, 'specialInstructions', AI_LIMITS.specialInstructionsMax, {
      allowEmpty: true
    });
  }
  if (hasOwn(input, 'gradingPreferences') || hasOwn(input, 'gradingOrScoringPreferences')) {
    const value = hasOwn(input, 'gradingPreferences')
      ? input.gradingPreferences
      : input.gradingOrScoringPreferences;
    patch.gradingPreferences = cleanText(value, 'gradingPreferences', AI_LIMITS.gradingPreferencesMax, {
      allowEmpty: true
    });
  }
  if (hasOwn(input, 'materialIds')) {
    patch.materialIds = positiveIntArray(input.materialIds, 'materialIds', AI_LIMITS.selectedMaterialsMax);
  }

  const plan = withReadiness(normalizeQuizPlan({ ...normalizeQuizPlan(existingPlan), ...patch }));
  return {
    patch,
    plan,
    missingRequiredFields: plan.missingRequiredFields,
    readinessStatus: plan.readinessStatus
  };
}

function evaluateQuizPlanReadiness(input = {}) {
  const plan = normalizeQuizPlan(input);
  const missingRequiredFields = [];
  if (!plan.courseId) missingRequiredFields.push('courseId');
  if (!plan.topic) missingRequiredFields.push('topic');
  if (!plan.difficulty) missingRequiredFields.push('difficulty');
  if (!plan.questionCount) missingRequiredFields.push('questionCount');
  if (!plan.language) missingRequiredFields.push('language');

  const distributionTotal = distributionCount(plan.questionTypeDistribution);
  if (!distributionTotal || (plan.questionCount && distributionTotal !== plan.questionCount)) {
    missingRequiredFields.push('questionTypeDistribution');
  }

  return {
    missingRequiredFields,
    readinessStatus: missingRequiredFields.length
      ? AI_CONVERSATION_STATUS.gatheringRequirements
      : AI_CONVERSATION_STATUS.readyToGenerate,
    ready: missingRequiredFields.length === 0
  };
}

function validateCompleteQuizPlan(input = {}) {
  const plan = withReadiness(normalizeQuizPlan(input));
  if (plan.missingRequiredFields.length) {
    throw validationError(
      'quizPlan',
      `Quiz plan is incomplete: ${plan.missingRequiredFields.join(', ')}.`,
      { missingRequiredFields: plan.missingRequiredFields }
    );
  }
  return plan;
}

function validateGenerationRequest(input = {}, quizPlan = null) {
  assertPlainObject(input, 'generation');
  assertSafeStructure(input, 'generation');
  const plan = validateCompleteQuizPlan(quizPlan || input.quizPlan || {});
  return {
    conversationId: nullablePositiveInt(input.conversationId, 'conversationId'),
    idempotencyKey: validateIdempotencyKey(input.idempotencyKey),
    expectedPlanVersion: nullablePositiveInt(input.expectedPlanVersion, 'expectedPlanVersion'),
    plan
  };
}

function validateGenerationRunStatus(value) {
  const status = cleanText(value, 'status', 64, { required: true });
  if (!AI_GENERATION_STATUSES.includes(status)) {
    throw validationError('status', 'Unsupported AI generation status.');
  }
  return status;
}

function validatePastedMaterial(input = {}) {
  assertPlainObject(input, 'material');
  assertSafeStructure(input, 'material');
  const title = cleanText(
    input.title || input.originalName || input.name,
    'title',
    AI_LIMITS.pastedMaterialTitleMax,
    { required: true }
  );
  const content = cleanText(input.content, 'content', AI_LIMITS.pastedMaterialCharsMax, {
    required: true,
    preserveWhitespace: true
  });
  return {
    courseId: nullablePositiveInt(input.courseId, 'courseId'),
    title,
    content
  };
}

function validateRevisionRequest(input = {}, options = {}) {
  assertPlainObject(input, 'revision');
  assertSafeStructure(input, 'revision');
  const revisionType = cleanText(input.revisionType || 'chat_revision', 'revisionType', 64, {
    required: true
  });
  if (!AI_REVISION_TYPES.includes(revisionType)) {
    throw validationError('revisionType', 'Unsupported AI draft revision type.');
  }
  const mode = cleanText(input.mode || 'preview', 'mode', 16, { required: true }).toLowerCase();
  if (!['preview', 'apply'].includes(mode)) {
    throw validationError('mode', 'Revision mode must be preview or apply.');
  }
  const questionIndexes = input.questionIndexes === undefined
    ? []
    : validateQuestionIndexes(input.questionIndexes, options.questionCount);
  return {
    instruction: cleanText(input.instruction, 'instruction', AI_LIMITS.revisionInstructionMax, {
      required: true
    }),
    revisionType,
    mode,
    questionIndexes,
    idempotencyKey: validateOptionalIdempotencyKey(input.idempotencyKey),
    metadata: validateMetadata(input.metadata, 'metadata', AI_LIMITS.revisionMetadataMaxBytes)
  };
}

function validateRegenerationRequest(input = {}, options = {}) {
  assertPlainObject(input, 'regeneration');
  assertSafeStructure(input, 'regeneration');
  let rawIndexes = input.questionIndexes;
  if (rawIndexes === undefined && input.questionIndex !== undefined) rawIndexes = [input.questionIndex];
  const questionIndexes = validateQuestionIndexes(rawIndexes, options.questionCount);
  if (!questionIndexes.length) {
    throw validationError('questionIndexes', 'Select at least one question to regenerate.');
  }
  return {
    questionIndexes,
    instruction: cleanText(input.instruction || '', 'instruction', AI_LIMITS.revisionInstructionMax, {
      allowEmpty: true
    }),
    idempotencyKey: validateOptionalIdempotencyKey(input.idempotencyKey)
  };
}

function validateQuestionIndexes(value, questionCount = null) {
  if (!Array.isArray(value)) {
    throw validationError('questionIndexes', 'questionIndexes must be an array of zero-based indexes.');
  }
  if (value.length > AI_LIMITS.questionCountMax) {
    throw validationError('questionIndexes', `Select at most ${AI_LIMITS.questionCountMax} questions.`);
  }
  const indexes = value.map((item, index) => {
    const number = Number(item);
    if (!Number.isSafeInteger(number) || number < 0) {
      throw validationError(`questionIndexes[${index}]`, 'Question indexes must be zero-based non-negative integers.');
    }
    if (questionCount !== null && questionCount !== undefined && number >= Number(questionCount)) {
      throw validationError(`questionIndexes[${index}]`, 'Question index is outside the draft question range.');
    }
    return number;
  });
  if (new Set(indexes).size !== indexes.length) {
    throw validationError('questionIndexes', 'Question indexes must not contain duplicates.');
  }
  return indexes;
}

function validateIdempotencyKey(value, field = 'idempotencyKey') {
  const key = cleanText(value, field, AI_LIMITS.idempotencyKeyMax, { required: true });
  if (key.length < AI_LIMITS.idempotencyKeyMin || !IDEMPOTENCY_KEY_PATTERN.test(key)) {
    throw validationError(
      field,
      `${field} must be ${AI_LIMITS.idempotencyKeyMin}-${AI_LIMITS.idempotencyKeyMax} URL-safe characters.`
    );
  }
  return key;
}

function validateOptionalIdempotencyKey(value, field = 'idempotencyKey') {
  if (value === undefined || value === null || value === '') return '';
  return validateIdempotencyKey(value, field);
}

function validateMetadata(value, field, maxBytes) {
  if (value === undefined || value === null || value === '') return {};
  assertPlainObject(value, field);
  assertSafeStructure(value, field);
  let json;
  try {
    json = JSON.stringify(value);
  } catch (error) {
    throw validationError(field, `${field} must be valid JSON data.`);
  }
  if (Buffer.byteLength(json, 'utf8') > maxBytes) {
    throw validationError(field, `${field} is too large.`);
  }
  return JSON.parse(json);
}

function validateQuestionTypeDistribution(value) {
  if (value === undefined || value === null) return emptyQuestionTypeDistribution();
  assertPlainObject(value, 'questionTypeDistribution');
  assertSafeStructure(value, 'questionTypeDistribution');
  const aliases = {
    multipleChoice: 'multipleChoice',
    multiple_choice: 'multipleChoice',
    trueFalse: 'trueFalse',
    true_false: 'trueFalse',
    shortAnswer: 'shortAnswer',
    short_answer: 'shortAnswer',
    essay: 'essay',
    coding: 'coding'
  };
  const output = emptyQuestionTypeDistribution();
  const seen = new Set();
  Object.entries(value).forEach(([key, raw]) => {
    const normalizedKey = aliases[key];
    if (!normalizedKey) {
      throw validationError('questionTypeDistribution', `Unsupported question type: ${key}.`);
    }
    if (seen.has(normalizedKey)) {
      throw validationError('questionTypeDistribution', `Duplicate question type: ${normalizedKey}.`);
    }
    seen.add(normalizedKey);
    output[normalizedKey] = intInRange(
      raw,
      `questionTypeDistribution.${normalizedKey}`,
      0,
      AI_LIMITS.questionCountMax
    );
  });
  if (distributionCount(output) > AI_LIMITS.questionCountMax) {
    throw validationError(
      'questionTypeDistribution',
      `Question type counts cannot total more than ${AI_LIMITS.questionCountMax}.`
    );
  }
  return output;
}

function normalizeQuizPlan(source = {}) {
  assertPlainObject(source, 'quizPlan');
  assertSafeStructure(source, 'quizPlan');
  if (hasOwn(source, 'materialMode') && source.materialMode &&
      !AI_MATERIAL_MODES.includes(source.materialMode)) {
    throw validationError('materialMode', 'Unsupported course-material mode.');
  }
  const indexedOnly = hasOwn(source, 'useIndexedMaterialOnly')
    ? strictBoolean(source.useIndexedMaterialOnly, 'useIndexedMaterialOnly')
    : false;
  const materialMode = AI_MATERIAL_MODES.includes(source.materialMode)
    ? source.materialMode
    : (indexedOnly ? AI_MATERIAL_MODE.courseMaterialOnly : AI_MATERIAL_MODE.generalModelKnowledgeAllowed);
  const difficulty = String(source.difficulty || '').trim().toLowerCase();
  if (difficulty && !AI_DIFFICULTIES.includes(difficulty)) {
    throw validationError('difficulty', 'Difficulty must be easy, medium, or hard.');
  }
  return {
    courseId: nullablePositiveInt(source.courseId, 'courseId'),
    topic: cleanText(source.topic || '', 'topic', AI_LIMITS.topicMax, { allowEmpty: true }),
    learningObjectives: cleanTextArray(source.learningObjectives || [], 'learningObjectives', {
      maxItems: AI_LIMITS.learningObjectivesMax,
      maxLength: AI_LIMITS.learningObjectiveMax
    }),
    difficulty,
    questionCount: nullableIntInRange(
      source.questionCount,
      'questionCount',
      AI_LIMITS.questionCountMin,
      AI_LIMITS.questionCountMax
    ),
    language: cleanText(
      source.language === undefined ? 'English' : source.language,
      'language',
      AI_LIMITS.languageMax,
      { allowEmpty: true }
    ),
    questionTypeDistribution: validateQuestionTypeDistribution(source.questionTypeDistribution),
    materialMode,
    useIndexedMaterialOnly: materialMode === AI_MATERIAL_MODE.courseMaterialOnly,
    includeExplanations: source.includeExplanations === undefined
      ? true
      : strictBoolean(source.includeExplanations, 'includeExplanations'),
    timeLimitMinutes: nullableIntInRange(
      source.timeLimitMinutes,
      'timeLimitMinutes',
      AI_LIMITS.timeLimitMinutesMin,
      AI_LIMITS.timeLimitMinutesMax
    ),
    tags: cleanTextArray(source.tags || [], 'tags', {
      maxItems: AI_LIMITS.tagsMax,
      maxLength: AI_LIMITS.tagMax
    }),
    specialInstructions: cleanText(
      source.specialInstructions || '',
      'specialInstructions',
      AI_LIMITS.specialInstructionsMax,
      { allowEmpty: true }
    ),
    gradingPreferences: cleanText(
      source.gradingPreferences || '',
      'gradingPreferences',
      AI_LIMITS.gradingPreferencesMax,
      { allowEmpty: true }
    ),
    materialIds: positiveIntArray(source.materialIds || [], 'materialIds', AI_LIMITS.selectedMaterialsMax)
  };
}

function withReadiness(plan) {
  const readiness = evaluateQuizPlanReadiness(plan);
  return {
    ...plan,
    missingRequiredFields: readiness.missingRequiredFields,
    readinessStatus: readiness.readinessStatus
  };
}

function emptyQuestionTypeDistribution() {
  return AI_QUESTION_DISTRIBUTION_KEYS.reduce((result, key) => {
    result[key] = 0;
    return result;
  }, {});
}

function distributionCount(distribution) {
  return AI_QUESTION_DISTRIBUTION_KEYS.reduce((sum, key) => sum + Number(distribution[key] || 0), 0);
}

function cleanText(value, field, maxLength, options = {}) {
  const {
    required = false,
    allowEmpty = false,
    preserveWhitespace = false
  } = options;
  let text = String(value === undefined || value === null ? '' : value).replace(/\r\n?/g, '\n');
  if (UNSAFE_CONTROLS.test(text)) {
    throw validationError(field, `${field} contains unsupported control characters.`);
  }
  if (UNSAFE_MARKUP.test(text)) {
    throw validationError(field, `${field} contains unsafe script or HTML content.`);
  }
  text = preserveWhitespace ? text.trim() : text.trim();
  if (required && !text) throw validationError(field, `${field} is required.`);
  if (!allowEmpty && !required && !text) return '';
  if (text.length > maxLength) {
    throw validationError(field, `${field} must be ${maxLength} characters or less.`);
  }
  return text;
}

function cleanTextArray(value, field, options) {
  if (!Array.isArray(value)) throw validationError(field, `${field} must be an array.`);
  if (value.length > options.maxItems) {
    throw validationError(field, `${field} can contain at most ${options.maxItems} items.`);
  }
  const seen = new Set();
  const output = [];
  value.forEach((item, index) => {
    const text = cleanText(item, `${field}[${index}]`, options.maxLength, { required: true });
    const key = text.toLocaleLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      output.push(text);
    }
  });
  return output;
}

function positiveIntArray(value, field, maxItems) {
  if (!Array.isArray(value)) throw validationError(field, `${field} must be an array.`);
  if (value.length > maxItems) throw validationError(field, `${field} can contain at most ${maxItems} items.`);
  const result = value.map((item, index) => parseRequiredPositiveInt(item, `${field}[${index}]`));
  if (new Set(result).size !== result.length) throw validationError(field, `${field} must not contain duplicates.`);
  return result;
}

function nullablePositiveInt(value, field) {
  return parseOptionalPositiveInt(value, field);
}

function nullableIntInRange(value, field, min, max) {
  if (value === undefined || value === null || value === '') return null;
  return intInRange(value, field, min, max);
}

function strictBoolean(value, field) {
  if (value === true || value === false) return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  throw validationError(field, `${field} must be true or false.`);
}

function assertPlainObject(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw validationError(field, `${field} must be an object.`);
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw validationError(field, `${field} contains an unsupported object type.`);
  }
}

function assertSafeStructure(value, field, state = null, depth = 0) {
  const tracker = state || { seen: new WeakSet(), nodes: 0 };
  if (typeof value === 'string') {
    if (UNSAFE_CONTROLS.test(value) || UNSAFE_MARKUP.test(value)) {
      throw validationError(field, `${field} contains unsafe script or HTML content.`);
    }
    return;
  }
  if (value === null || typeof value !== 'object') return;
  if (depth > 12) throw validationError(field, `${field} is nested too deeply.`);
  if (tracker.seen.has(value)) throw validationError(field, `${field} must not contain circular data.`);
  tracker.seen.add(value);
  tracker.nodes += 1;
  if (tracker.nodes > 1000) throw validationError(field, `${field} contains too many nested values.`);
  if (!Array.isArray(value)) {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw validationError(field, `${field} contains an unsupported object type.`);
    }
  }
  Object.entries(value).forEach(([key, child]) => {
    if (UNSAFE_KEYS.has(key)) throw validationError(field, `${field} contains an unsafe object key.`);
    assertSafeStructure(child, field, tracker, depth + 1);
  });
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

module.exports = {
  assertSafeStructure,
  createEmptyQuizPlan,
  evaluateQuizPlanReadiness,
  validateCompleteQuizPlan,
  validateConversationCreate,
  validateConversationListQuery,
  validateGenerationRequest,
  validateGenerationRunStatus,
  validateIdempotencyKey,
  validateMessageInput,
  validatePastedMaterial,
  validateQuestionIndexes,
  validateQuizPlanPatch,
  validateRegenerationRequest,
  validateRevisionRequest
};
