import { z } from 'zod';
import {
  AiMessage,
  AiMutationResult,
  AiSettingsStatus,
  ConversationDetail,
  ConversationSummary,
  Course,
  CourseMaterial,
  DEFAULT_PLAN,
  DraftQuestion,
  GenerationState,
  MaterialScope,
  QuizDraft,
  QuizPlan,
  RevisionPreview,
  SourceReference
} from './types';

const unknownRecord = z.record(z.string(), z.unknown());
const stringValue = z.union([z.string(), z.number(), z.boolean()]).transform(String);
const numericValue = z.union([z.number(), z.string()]).transform(value => Number(value));
const nullableNumber = z.union([z.number(), z.string(), z.null(), z.undefined()])
  .transform(value => value === null || value === undefined || value === '' ? null : Number(value));

const rawQuickReplySchema = z.union([
  z.string(),
  z.object({
    label: z.string().optional(),
    value: z.string().optional()
  }).passthrough()
]);

const rawMessageSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  sender: z.string().optional(),
  senderType: z.string().optional(),
  role: z.string().optional(),
  content: z.string().optional(),
  safeMessageContent: z.string().optional(),
  messageType: z.string().optional(),
  createdAt: z.string().optional(),
  status: z.string().optional(),
  quickReplies: z.array(rawQuickReplySchema).optional(),
  metadata: unknownRecord.optional()
}).passthrough();

const rawSourceSchema = z.union([
  z.string(),
  z.object({
    id: z.union([z.number(), z.string()]).optional(),
    materialId: numericValue.optional(),
    chunkId: numericValue.optional(),
    label: z.string().optional(),
    sourceLabel: z.string().optional(),
    excerpt: z.string().optional(),
    content: z.string().optional()
  }).passthrough()
]);

const rawQuestionSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  type: z.string().optional(),
  text: z.string().optional(),
  prompt: z.string().optional(),
  options: z.array(stringValue).optional(),
  correctAnswer: stringValue.optional(),
  explanation: z.string().optional(),
  difficulty: z.string().optional(),
  learningObjective: z.string().optional(),
  points: z.union([z.number(), z.string()]).optional(),
  sourceReferences: z.array(rawSourceSchema).optional(),
  sources: z.array(rawSourceSchema).optional(),
  sourceHint: z.string().optional(),
  validationStatus: z.string().optional()
}).passthrough();

const rawDraftSchema = z.object({
  id: nullableNumber.optional(),
  draftId: nullableNumber.optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  questions: z.array(rawQuestionSchema).optional(),
  updatedAt: z.string().optional(),
  draft: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
    questions: z.array(rawQuestionSchema).optional(),
    updatedAt: z.string().optional()
  }).passthrough().optional()
}).passthrough();

const rawDistributionSchema = z.object({
  multipleChoice: z.coerce.number().optional(),
  multiple_choice: z.coerce.number().optional(),
  trueFalse: z.coerce.number().optional(),
  true_false: z.coerce.number().optional(),
  shortAnswer: z.coerce.number().optional(),
  short_answer: z.coerce.number().optional(),
  essay: z.coerce.number().optional(),
  coding: z.coerce.number().optional()
}).passthrough();

const rawPlanSchema = z.object({
  courseId: nullableNumber.optional(),
  topic: z.string().optional(),
  learningObjectives: z.array(stringValue).optional(),
  difficulty: z.string().optional(),
  questionCount: nullableNumber.optional(),
  language: z.string().optional(),
  questionTypeDistribution: rawDistributionSchema.optional(),
  useIndexedMaterialOnly: z.boolean().optional(),
  includeExplanations: z.boolean().optional(),
  timeLimitMinutes: nullableNumber.optional(),
  tags: z.array(stringValue).optional(),
  specialInstructions: z.string().optional(),
  additionalInstructions: z.string().optional(),
  missingRequiredFields: z.array(stringValue).optional(),
  readinessStatus: z.string().optional(),
  materialScope: z.string().optional(),
  materialMode: z.string().optional(),
  materialIds: z.array(numericValue).optional(),
  scoringPreferences: z.union([z.string(), unknownRecord]).optional(),
  gradingPreferences: z.string().optional(),
  gradingOrScoringPreferences: z.string().optional()
}).passthrough();

const rawGenerationSchema = z.object({
  status: z.string().optional(),
  stage: z.string().optional(),
  currentStage: z.string().optional(),
  progressStage: z.string().optional(),
  message: z.string().optional(),
  canCancel: z.boolean().optional(),
  startedAt: z.string().optional(),
  updatedAt: z.string().optional()
}).passthrough();

const rawRevisionSnapshotSchema = z.object({
  title: z.string().optional(),
  questions: z.array(z.unknown()).optional(),
  draft: z.object({
    title: z.string().optional(),
    questions: z.array(z.unknown()).optional()
  }).passthrough().optional()
}).passthrough();

const rawRevisionSchema = z.object({
  id: numericValue.optional(),
  revisionId: numericValue.optional(),
  revisionNumber: numericValue.optional(),
  revisionType: z.string().optional(),
  requestText: z.string().optional(),
  status: z.string().optional(),
  summary: z.string().optional(),
  changes: z.array(stringValue).optional(),
  destructive: z.boolean().optional(),
  metadata: unknownRecord.optional(),
  beforeSnapshot: z.unknown().optional(),
  proposedSnapshot: z.unknown().optional(),
  beforeData: z.unknown().optional(),
  afterData: z.unknown().optional(),
  preview: z.unknown().optional(),
  appliedAt: z.string().optional(),
  createdAt: z.string().optional()
}).passthrough();

const rawConversationSchema = z.object({
  id: numericValue.optional(),
  conversationId: numericValue.optional(),
  title: z.string().optional(),
  status: z.string().optional(),
  courseId: nullableNumber.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  messageCount: z.coerce.number().optional(),
  draftId: nullableNumber.optional(),
  plan: rawPlanSchema.optional(),
  messages: z.array(rawMessageSchema).optional(),
  suggestedReplies: z.array(rawQuickReplySchema).optional(),
  draft: rawDraftSchema.nullable().optional(),
  generation: rawGenerationSchema.nullable().optional(),
  pendingRevision: rawRevisionSchema.nullable().optional(),
  revision: rawRevisionSchema.nullable().optional(),
  revisions: z.array(rawRevisionSchema).optional()
}).passthrough();

function unwrapRecord(input: unknown, keys: string[]): unknown {
  const parsed = unknownRecord.safeParse(input);
  if (!parsed.success) return input;
  for (const key of keys) {
    if (parsed.data[key] !== undefined) return parsed.data[key];
  }
  return input;
}

function normalizeSender(raw: z.infer<typeof rawMessageSchema>): AiMessage['sender'] {
  const sender = String(raw.senderType || raw.sender || raw.role || 'assistant').toLowerCase();
  if (['user', 'teacher', 'admin', 'human'].includes(sender)) return 'user';
  if (sender === 'system') return 'system';
  return 'assistant';
}

function normalizeQuickReplies(raw: z.infer<typeof rawMessageSchema>) {
  const metadataReplies = Array.isArray(raw.metadata?.quickReplies) ? raw.metadata.quickReplies : [];
  const values = raw.quickReplies || metadataReplies;
  return normalizeQuickReplyValues(values);
}

function normalizeQuickReplyValues(values: unknown[]) {
  return values.flatMap((entry, index) => {
    const result = rawQuickReplySchema.safeParse(entry);
    if (!result.success) return [];
    if (typeof result.data === 'string') return [{ label: result.data, value: result.data }];
    const value = result.data.value || result.data.label || '';
    return value ? [{ label: result.data.label || value, value }] : [];
  }).map((entry, index) => ({ ...entry, key: `${index}-${entry.value}` }))
    .map(({ label, value }) => ({ label, value }));
}

export function normalizeMessage(input: unknown, index = 0): AiMessage {
  const raw = rawMessageSchema.parse(input);
  const status = raw.status === 'failed' ? 'failed' : raw.status === 'pending' ? 'pending' : 'sent';
  return {
    id: raw.id ?? `message-${index}`,
    sender: normalizeSender(raw),
    content: raw.content || raw.safeMessageContent || '',
    messageType: raw.messageType || 'text',
    createdAt: raw.createdAt || '',
    status,
    quickReplies: normalizeQuickReplies(raw)
  };
}

function normalizeSource(input: unknown, index: number): SourceReference {
  const raw = rawSourceSchema.parse(input);
  if (typeof raw === 'string') return { id: `source-${index}`, label: raw };
  return {
    id: raw.id ?? `source-${index}`,
    materialId: raw.materialId,
    chunkId: raw.chunkId,
    label: raw.label || raw.sourceLabel || `Source ${index + 1}`,
    excerpt: raw.excerpt || raw.content
  };
}

export function normalizeQuestion(input: unknown): DraftQuestion {
  const raw = rawQuestionSchema.parse(input);
  const sources = raw.sourceReferences || raw.sources || (raw.sourceHint ? [raw.sourceHint] : []);
  const points = Number(raw.points ?? 1);
  return {
    id: raw.id,
    type: raw.type || 'multiple_choice',
    text: raw.text || raw.prompt || '',
    options: raw.options || [],
    correctAnswer: raw.correctAnswer || '',
    explanation: raw.explanation || '',
    difficulty: raw.difficulty || 'medium',
    learningObjective: raw.learningObjective || '',
    points: Number.isFinite(points) && points > 0 ? points : 1,
    sourceReferences: sources.map(normalizeSource),
    validationStatus: raw.validationStatus || 'valid'
  };
}

export function normalizeDraft(input: unknown): QuizDraft | null {
  if (input === null || input === undefined) return null;
  const raw = rawDraftSchema.parse(unwrapRecord(input, ['draft']));
  const nested = raw.draft || {};
  return {
    id: raw.id ?? raw.draftId ?? null,
    title: raw.title || nested.title || 'Untitled quiz draft',
    description: raw.description || nested.description || '',
    status: raw.status || nested.status || 'draft',
    questions: (raw.questions || nested.questions || []).map(normalizeQuestion),
    updatedAt: raw.updatedAt || nested.updatedAt || ''
  };
}

export function normalizePlan(input: unknown): QuizPlan {
  const raw = rawPlanSchema.parse(input || {});
  const distribution = raw.questionTypeDistribution || {};
  const materialAlias = raw.materialScope ||
    (raw.materialMode === 'general_model_knowledge_allowed' ? 'general_knowledge_allowed' : raw.materialMode);
  const materialScope = ['course_material_only', 'course_material_preferred', 'general_knowledge_allowed']
    .includes(String(materialAlias))
    ? materialAlias as MaterialScope
    : raw.useIndexedMaterialOnly
      ? 'course_material_only'
      : DEFAULT_PLAN.materialScope;
  const scoringSource = raw.scoringPreferences ?? raw.gradingPreferences ?? raw.gradingOrScoringPreferences;
  const scoringPreferences = typeof scoringSource === 'string'
    ? scoringSource
    : scoringSource
      ? JSON.stringify(scoringSource)
      : '';
  return {
    ...DEFAULT_PLAN,
    courseId: raw.courseId ?? DEFAULT_PLAN.courseId,
    topic: raw.topic ?? DEFAULT_PLAN.topic,
    learningObjectives: raw.learningObjectives ?? [],
    difficulty: ['easy', 'medium', 'hard'].includes(String(raw.difficulty))
      ? raw.difficulty as QuizPlan['difficulty']
      : DEFAULT_PLAN.difficulty,
    questionCount: raw.questionCount ?? DEFAULT_PLAN.questionCount,
    language: raw.language ?? DEFAULT_PLAN.language,
    questionTypeDistribution: {
      multipleChoice: Math.max(0, Number(distribution.multipleChoice ?? distribution.multiple_choice ?? 0)),
      trueFalse: Math.max(0, Number(distribution.trueFalse ?? distribution.true_false ?? 0)),
      shortAnswer: Math.max(0, Number(distribution.shortAnswer ?? distribution.short_answer ?? 0)),
      essay: Math.max(0, Number(distribution.essay ?? 0)),
      coding: Math.max(0, Number(distribution.coding ?? 0))
    },
    useIndexedMaterialOnly: raw.useIndexedMaterialOnly ?? materialScope === 'course_material_only',
    includeExplanations: raw.includeExplanations ?? true,
    timeLimitMinutes: raw.timeLimitMinutes ?? null,
    tags: raw.tags ?? [],
    specialInstructions: raw.specialInstructions ?? raw.additionalInstructions ?? '',
    missingRequiredFields: raw.missingRequiredFields ?? [],
    readinessStatus: raw.readinessStatus || 'gathering_requirements',
    materialScope,
    materialIds: raw.materialIds ?? [],
    scoringPreferences
  };
}

function normalizeGeneration(input: unknown): GenerationState | null {
  if (!input) return null;
  const raw = rawGenerationSchema.parse(unwrapRecord(input, ['generation']));
  return {
    status: raw.status || 'generating',
    stage: raw.stage || raw.currentStage || raw.progressStage || '',
    message: raw.message || '',
    canCancel: raw.canCancel ?? raw.status === 'generating',
    startedAt: raw.startedAt || '',
    updatedAt: raw.updatedAt || ''
  };
}

interface RevisionSnapshotDetails {
  title: string;
  questionCount: number | null;
  questions: unknown[] | null;
}

function summarizeRevisionSnapshot(input: unknown): RevisionSnapshotDetails {
  if (!input) return { title: '', questionCount: null, questions: null };
  const parsed = rawRevisionSnapshotSchema.safeParse(input);
  if (!parsed.success) return { title: '', questionCount: null, questions: null };
  const nested = parsed.data.draft;
  const questions = parsed.data.questions || nested?.questions || null;
  return {
    title: parsed.data.title || nested?.title || '',
    questionCount: questions ? questions.length : null,
    questions
  };
}

function stableComparable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableComparable);
  const record = unknownRecord.safeParse(value);
  if (!record.success) return value;
  return Object.fromEntries(
    Object.keys(record.data)
      .sort()
      .map(key => [key, stableComparable(record.data[key])])
  );
}

function questionIdentity(question: unknown): string {
  const record = unknownRecord.safeParse(question);
  if (!record.success) return '';
  const id = record.data.id ?? record.data.questionId;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : '';
}

function questionsMatch(left: unknown, right: unknown): boolean {
  return JSON.stringify(stableComparable(left)) === JSON.stringify(stableComparable(right));
}

function compareRevisionQuestions(
  before: unknown[] | null,
  proposed: unknown[] | null
): { changed: number | null; removed: number | null; added: number | null } {
  if (!before || !proposed) return { changed: null, removed: null, added: null };
  const beforeIds = before.map(questionIdentity);
  const proposedIds = proposed.map(questionIdentity);
  const canCompareById = beforeIds.length > 0 &&
    proposedIds.length > 0 &&
    beforeIds.every(Boolean) &&
    proposedIds.every(Boolean) &&
    new Set(beforeIds).size === beforeIds.length &&
    new Set(proposedIds).size === proposedIds.length;

  if (canCompareById) {
    const beforeById = new Map(beforeIds.map((id, index) => [id, before[index]]));
    const proposedById = new Map(proposedIds.map((id, index) => [id, proposed[index]]));
    const removed = beforeIds.filter(id => !proposedById.has(id)).length;
    const added = proposedIds.filter(id => !beforeById.has(id)).length;
    const changed = beforeIds.filter(id => (
      proposedById.has(id) && !questionsMatch(beforeById.get(id), proposedById.get(id))
    )).length;
    return { changed, removed, added };
  }

  const comparableLength = Math.min(before.length, proposed.length);
  let changed = 0;
  for (let index = 0; index < comparableLength; index += 1) {
    if (!questionsMatch(before[index], proposed[index])) changed += 1;
  }
  return {
    changed,
    removed: Math.max(0, before.length - proposed.length),
    added: Math.max(0, proposed.length - before.length)
  };
}

function metadataCount(metadata: Record<string, unknown> | undefined, key: string): number | null {
  const value = Number(metadata?.[key]);
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function isAppliedRevision(raw: z.infer<typeof rawRevisionSchema>): boolean {
  const status = String(raw.status || '').toLowerCase();
  const appliedMetadata = raw.metadata?.applied;
  return Boolean(raw.appliedAt?.trim()) ||
    appliedMetadata === true ||
    appliedMetadata === 'true' ||
    ['applied', 'accepted', 'completed'].includes(status);
}

function isUnappliedPreview(
  raw: z.infer<typeof rawRevisionSchema>,
  allowImplicitPending = false
): boolean {
  if (isAppliedRevision(raw)) return false;
  const status = String(raw.status || '').toLowerCase();
  const metadata = raw.metadata || {};
  if (metadata.requiresConfirmation === true || metadata.previewOnly === true) return true;
  if (metadata.draftOnly === true || raw.revisionType === 'initial_generation') return false;
  if (['preview', 'pending', 'pending_confirmation', 'awaiting_confirmation', 'unapplied'].includes(status)) {
    return raw.revisionType !== 'whole_quiz_revision' || metadata.requiresConfirmation === true;
  }
  return allowImplicitPending;
}

export function normalizeRevision(input: unknown): RevisionPreview | null {
  if (!input) return null;
  const wrapper = unknownRecord.safeParse(input);
  const wrapperPreview = wrapper.success ? wrapper.data.preview : undefined;
  const candidate = unwrapRecord(input, ['revision', 'pendingRevision']);
  const parsed = rawRevisionSchema.safeParse(candidate);
  if (!parsed.success) return null;
  const id = parsed.data.id ?? parsed.data.revisionId;
  if (!id) return null;

  const before = summarizeRevisionSnapshot(parsed.data.beforeSnapshot || parsed.data.beforeData);
  const proposed = summarizeRevisionSnapshot(
    parsed.data.proposedSnapshot ||
    parsed.data.afterData ||
    parsed.data.preview ||
    wrapperPreview
  );
  const comparison = compareRevisionQuestions(before.questions, proposed.questions);
  const questionIndexes = Array.isArray(parsed.data.metadata?.questionIndexes)
    ? new Set(
        parsed.data.metadata.questionIndexes
          .map(Number)
          .filter(value => Number.isSafeInteger(value) && value >= 0)
      ).size
    : null;
  const changedQuestionCount = comparison.changed ??
    questionIndexes ??
    metadataCount(parsed.data.metadata, 'changedQuestionCount');
  const removedQuestionCount = comparison.removed ??
    metadataCount(parsed.data.metadata, 'removedQuestionCount') ??
    (before.questionCount !== null && proposed.questionCount !== null
      ? Math.max(0, before.questionCount - proposed.questionCount)
      : null);
  const addedQuestionCount = comparison.added ??
    metadataCount(parsed.data.metadata, 'addedQuestionCount') ??
    (before.questionCount !== null && proposed.questionCount !== null
      ? Math.max(0, proposed.questionCount - before.questionCount)
      : null);
  const proposedTitle = proposed.title || before.title;

  return {
    id,
    revisionNumber: parsed.data.revisionNumber ?? null,
    revisionType: parsed.data.revisionType || '',
    requestText: parsed.data.requestText || '',
    status: parsed.data.status || 'preview',
    summary: parsed.data.summary ||
      (parsed.data.requestText ? `Requested change: ${parsed.data.requestText}` : 'Review the proposed quiz changes.'),
    changes: parsed.data.changes || [],
    destructive: parsed.data.destructive ?? Boolean(removedQuestionCount),
    beforeSnapshot: {
      title: before.title,
      questionCount: before.questionCount
    },
    proposedSnapshot: {
      title: proposedTitle,
      questionCount: proposed.questionCount
    },
    changedQuestionCount,
    removedQuestionCount,
    addedQuestionCount,
    createdAt: parsed.data.createdAt || ''
  };
}

function latestUnappliedRevision(revisions: z.infer<typeof rawRevisionSchema>[]): RevisionPreview | null {
  const latest = revisions
    .map((raw, index) => ({ raw, index }))
    .filter(({ raw }) => isUnappliedPreview(raw))
    .sort((left, right) => {
      const revisionOrder = Number(right.raw.revisionNumber || 0) - Number(left.raw.revisionNumber || 0);
      if (revisionOrder) return revisionOrder;
      const dateOrder = Date.parse(right.raw.createdAt || '') - Date.parse(left.raw.createdAt || '');
      return Number.isFinite(dateOrder) && dateOrder ? dateOrder : left.index - right.index;
    })[0]?.raw;
  return latest ? normalizeRevision(latest) : null;
}

function normalizeSummary(input: unknown): ConversationSummary {
  const raw = rawConversationSchema.parse(input);
  const id = raw.id ?? raw.conversationId;
  if (!id) throw new Error('AI conversation response is missing an id.');
  return {
    id,
    title: raw.title || 'New quiz conversation',
    status: raw.status || raw.plan?.readinessStatus || 'gathering_requirements',
    courseId: raw.courseId ?? raw.plan?.courseId ?? null,
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || '',
    messageCount: raw.messageCount ?? raw.messages?.length ?? 0,
    draftId: raw.draftId ?? raw.draft?.id ?? raw.draft?.draftId ?? null
  };
}

export function parseConversationDetail(input: unknown): ConversationDetail {
  const candidate = unwrapRecord(input, ['conversation']);
  const raw = rawConversationSchema.parse(candidate);
  const summary = normalizeSummary(raw);
  const explicitRevision = raw.pendingRevision || raw.revision;
  const pendingRevision = explicitRevision && isUnappliedPreview(
    explicitRevision,
    Boolean(raw.pendingRevision)
  )
    ? normalizeRevision(explicitRevision)
    : latestUnappliedRevision(raw.revisions || []);
  return {
    ...summary,
    plan: normalizePlan(raw.plan || {}),
    messages: (raw.messages || []).map(normalizeMessage),
    suggestedReplies: normalizeQuickReplyValues(raw.suggestedReplies || []),
    draft: normalizeDraft(raw.draft),
    generation: normalizeGeneration(raw.generation),
    pendingRevision
  };
}

export function parseConversationList(input: unknown): ConversationSummary[] {
  const candidate = unwrapRecord(input, ['conversations', 'items', 'data']);
  return z.array(rawConversationSchema).parse(candidate).map(normalizeSummary);
}

const rawCourseSchema = z.object({
  id: numericValue,
  code: z.string().optional(),
  title: z.string().optional(),
  name: z.string().optional()
}).passthrough();

export function parseCourses(input: unknown): Course[] {
  const candidate = unwrapRecord(input, ['courses', 'items', 'data']);
  return z.array(rawCourseSchema).parse(candidate).map(course => ({
    id: course.id,
    code: course.code || `COURSE-${course.id}`,
    title: course.title || course.name || 'Untitled course'
  }));
}

const rawMaterialSchema = z.object({
  id: numericValue,
  courseId: numericValue,
  originalName: z.string().optional(),
  name: z.string().optional(),
  byteSize: z.coerce.number().optional(),
  chunkCount: z.coerce.number().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  errorMessage: z.string().optional(),
  error: z.string().optional()
}).passthrough();

export function parseMaterials(input: unknown): CourseMaterial[] {
  const candidate = unwrapRecord(input, ['materials', 'items', 'data']);
  return z.array(rawMaterialSchema).parse(candidate).map(material => ({
    id: material.id,
    courseId: material.courseId,
    originalName: material.originalName || material.name || `Material ${material.id}`,
    byteSize: material.byteSize || 0,
    chunkCount: material.chunkCount || 0,
    status: material.status || 'ready',
    createdAt: material.createdAt || '',
    errorMessage: material.errorMessage || material.error || ''
  }));
}

const rawSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  configured: z.boolean().optional(),
  conversationApiVersion: numericValue.optional(),
  source: z.string().optional(),
  endpoint: z.string().optional(),
  maskedApiKey: z.string().optional(),
  chatDeployment: z.string().optional(),
  embeddingDeployment: z.string().optional(),
  apiVersion: z.string().optional(),
  message: z.string().optional()
}).passthrough();

export function parseSettings(input: unknown): AiSettingsStatus {
  const raw = rawSettingsSchema.parse(unwrapRecord(input, ['settings']));
  return {
    enabled: raw.enabled ?? true,
    configured: raw.configured ?? false,
    conversationApiVersion: Number.isFinite(raw.conversationApiVersion)
      ? raw.conversationApiVersion as number
      : 0,
    source: raw.source || 'none',
    endpoint: raw.endpoint || '',
    maskedApiKey: raw.maskedApiKey || '',
    chatDeployment: raw.chatDeployment || '',
    embeddingDeployment: raw.embeddingDeployment || '',
    apiVersion: raw.apiVersion || '',
    message: raw.message || ''
  };
}

export function parseMutationResult(input: unknown): AiMutationResult {
  const record = unknownRecord.parse(input);
  const conversationCandidate = record.conversation ||
    (record.id || record.conversationId ? record : null);
  let conversation: ConversationDetail | null = null;
  if (conversationCandidate) {
    const parsed = rawConversationSchema.safeParse(conversationCandidate);
    if (parsed.success && (parsed.data.id || parsed.data.conversationId)) {
      conversation = parseConversationDetail(parsed.data);
    }
  }
  const rawMessage = record.message && typeof record.message === 'object'
    ? rawMessageSchema.safeParse(record.message)
    : null;
  return {
    conversation,
    revision: normalizeRevision(record.revision || record.pendingRevision
      ? {
          revision: record.revision || record.pendingRevision,
          preview: record.preview
        }
      : null),
    message: rawMessage?.success ? normalizeMessage(rawMessage.data) : null,
    notice: typeof record.message === 'string'
      ? record.message
      : typeof record.notice === 'string'
        ? record.notice
        : ''
  };
}

export function parseGeneration(input: unknown): GenerationState {
  return normalizeGeneration(input) || {
    status: 'generating',
    stage: '',
    message: '',
    canCancel: true,
    startedAt: '',
    updatedAt: ''
  };
}

export function parseMaterialChunk(input: unknown): { label: string; content: string } {
  const raw = z.object({
    label: z.string().optional(),
    sourceLabel: z.string().optional(),
    content: z.string().optional(),
    excerpt: z.string().optional(),
    chunkIndex: z.coerce.number().optional()
  }).passthrough().parse(unwrapRecord(input, ['chunk', 'source']));
  return {
    label: raw.label || raw.sourceLabel || `Source chunk ${(raw.chunkIndex ?? 0) + 1}`,
    content: raw.content || raw.excerpt || ''
  };
}

export function assertObjectResponse(input: unknown): Record<string, unknown> {
  return unknownRecord.parse(input);
}
