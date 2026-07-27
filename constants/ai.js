const AI_CONVERSATION_API_VERSION = 1;

const AI_CONVERSATION_STATUS = Object.freeze({
  gatheringRequirements: 'gathering_requirements',
  readyToGenerate: 'ready_to_generate',
  generating: 'generating',
  generationFailed: 'generation_failed',
  reviewRequired: 'review_required',
  draftSaved: 'draft_saved',
  published: 'published'
});

const AI_GENERATION_STATUS = Object.freeze({
  queued: 'queued',
  generating: 'generating',
  completed: 'completed',
  failed: 'failed',
  cancelRequested: 'cancel_requested',
  cancelled: 'cancelled'
});

const AI_GENERATION_STAGE = Object.freeze({
  validatingPlan: 'validating_quiz_plan',
  retrievingMaterial: 'retrieving_course_material',
  selectingSources: 'selecting_source_passages',
  generatingQuestions: 'generating_questions',
  validatingOutput: 'validating_generated_output',
  savingDraft: 'saving_draft',
  openingReview: 'opening_review_workspace'
});

const AI_MATERIAL_STATUS = Object.freeze({
  pending: 'pending',
  indexing: 'indexing',
  ready: 'ready',
  failed: 'failed'
});

const AI_MATERIAL_SOURCE_TYPE = Object.freeze({
  file: 'file',
  pastedText: 'pasted_text'
});

const AI_MATERIAL_MODE = Object.freeze({
  courseMaterialOnly: 'course_material_only',
  courseMaterialPreferred: 'course_material_preferred',
  generalModelKnowledgeAllowed: 'general_model_knowledge_allowed'
});

const AI_MESSAGE_SENDER = Object.freeze({
  user: 'user',
  assistant: 'assistant',
  system: 'system'
});

const AI_MESSAGE_TYPE = Object.freeze({
  message: 'message',
  greeting: 'greeting',
  clarification: 'clarification',
  planUpdate: 'plan_update',
  status: 'status',
  revision: 'revision',
  error: 'error'
});

const AI_QUESTION_TYPE = Object.freeze({
  multipleChoice: 'multiple_choice',
  trueFalse: 'true_false',
  shortAnswer: 'short_answer',
  essay: 'essay',
  coding: 'coding'
});

const AI_DIFFICULTY = Object.freeze({
  easy: 'easy',
  medium: 'medium',
  hard: 'hard'
});

const AI_REVISION_TYPE = Object.freeze({
  initialGeneration: 'initial_generation',
  manualEdit: 'manual_edit',
  chatRevision: 'chat_revision',
  regenerateQuestion: 'regenerate_question',
  regenerateSelected: 'regenerate_selected',
  wholeQuizRevision: 'whole_quiz_revision',
  restoreRevision: 'restore_revision'
});

const AI_LIMITS = Object.freeze({
  conversationTitleMax: 160,
  conversationSearchMax: 160,
  quizTitleMax: 120,
  conversationsPageSizeDefault: 20,
  conversationsPageSizeMax: 100,
  messagesPerConversationMax: 500,
  messageMax: 12000,
  messageMetadataMaxBytes: 20000,
  topicMax: 500,
  learningObjectivesMax: 20,
  learningObjectiveMax: 500,
  languageMax: 60,
  questionCountMin: 1,
  questionCountMax: 20,
  tagsMax: 20,
  tagMax: 64,
  specialInstructionsMax: 8000,
  gradingPreferencesMax: 2000,
  timeLimitMinutesMin: 5,
  timeLimitMinutesMax: 240,
  selectedMaterialsMax: 50,
  idempotencyKeyMin: 8,
  idempotencyKeyMax: 128,
  pastedMaterialTitleMax: 180,
  pastedMaterialCharsMax: 200000,
  materialFileBytesMax: 10 * 1024 * 1024,
  materialExtractedCharsMax: 500000,
  docxArchiveEntriesMax: 2000,
  docxArchiveUncompressedBytesMax: 32 * 1024 * 1024,
  materialChunksMax: 250,
  materialChunkSize: 1400,
  materialChunkOverlap: 200,
  suggestedRepliesMax: 4,
  suggestedReplyLabelMax: 80,
  suggestedReplyValueMax: 240,
  suggestionMaterialsMax: 6,
  suggestionChunksMax: 8,
  suggestionChunkCharsMax: 600,
  suggestionRecentMessagesMax: 6,
  retrievedChunksDefault: 6,
  retrievedChunksMax: 10,
  providerResponseCharsMax: 200000,
  revisionInstructionMax: 8000,
  revisionMetadataMaxBytes: 20000,
  sourceLabelMax: 500,
  sourceExcerptMax: 8000,
  providerErrorMessageMax: 1000,
  generationRunsPageSizeMax: 100,
  revisionsPageSizeMax: 100
});

const AI_CONVERSATION_STATUSES = Object.freeze(Object.values(AI_CONVERSATION_STATUS));
const AI_GENERATION_STATUSES = Object.freeze(Object.values(AI_GENERATION_STATUS));
const AI_GENERATION_STAGES = Object.freeze(Object.values(AI_GENERATION_STAGE));
const AI_MATERIAL_STATUSES = Object.freeze(Object.values(AI_MATERIAL_STATUS));
const AI_MATERIAL_SOURCE_TYPES = Object.freeze(Object.values(AI_MATERIAL_SOURCE_TYPE));
const AI_MATERIAL_MODES = Object.freeze(Object.values(AI_MATERIAL_MODE));
const AI_MESSAGE_SENDERS = Object.freeze(Object.values(AI_MESSAGE_SENDER));
const AI_MESSAGE_TYPES = Object.freeze(Object.values(AI_MESSAGE_TYPE));
const AI_QUESTION_TYPES = Object.freeze(Object.values(AI_QUESTION_TYPE));
const AI_DIFFICULTIES = Object.freeze(Object.values(AI_DIFFICULTY));
const AI_REVISION_TYPES = Object.freeze(Object.values(AI_REVISION_TYPE));

const AI_QUESTION_DISTRIBUTION_KEYS = Object.freeze([
  'multipleChoice',
  'trueFalse',
  'shortAnswer',
  'essay',
  'coding'
]);

module.exports = {
  AI_CONVERSATION_API_VERSION,
  AI_CONVERSATION_STATUS,
  AI_CONVERSATION_STATUSES,
  AI_DIFFICULTIES,
  AI_DIFFICULTY,
  AI_GENERATION_STAGE,
  AI_GENERATION_STAGES,
  AI_GENERATION_STATUS,
  AI_GENERATION_STATUSES,
  AI_LIMITS,
  AI_MATERIAL_MODE,
  AI_MATERIAL_MODES,
  AI_MATERIAL_SOURCE_TYPE,
  AI_MATERIAL_SOURCE_TYPES,
  AI_MATERIAL_STATUS,
  AI_MATERIAL_STATUSES,
  AI_MESSAGE_SENDER,
  AI_MESSAGE_SENDERS,
  AI_MESSAGE_TYPE,
  AI_MESSAGE_TYPES,
  AI_QUESTION_DISTRIBUTION_KEYS,
  AI_QUESTION_TYPE,
  AI_QUESTION_TYPES,
  AI_REVISION_TYPE,
  AI_REVISION_TYPES
};
