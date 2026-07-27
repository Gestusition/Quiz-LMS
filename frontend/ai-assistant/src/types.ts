export type ConversationStatus =
  | 'gathering_requirements'
  | 'ready_to_generate'
  | 'generating'
  | 'generation_failed'
  | 'review_required'
  | 'draft_saved'
  | 'published'
  | string;

export type MaterialScope =
  | 'course_material_only'
  | 'course_material_preferred'
  | 'general_knowledge_allowed';

export type QuestionTypeKey =
  | 'multipleChoice'
  | 'trueFalse'
  | 'shortAnswer'
  | 'essay'
  | 'coding';

export interface QuizPlan {
  courseId: number | null;
  topic: string;
  learningObjectives: string[];
  difficulty: 'easy' | 'medium' | 'hard' | '';
  questionCount: number | null;
  language: string;
  questionTypeDistribution: Record<QuestionTypeKey, number>;
  useIndexedMaterialOnly: boolean;
  includeExplanations: boolean;
  timeLimitMinutes: number | null;
  tags: string[];
  specialInstructions: string;
  missingRequiredFields: string[];
  readinessStatus: ConversationStatus;
  materialScope: MaterialScope;
  materialIds: number[];
  scoringPreferences: string;
}

export interface ConversationSummary {
  id: number;
  title: string;
  status: ConversationStatus;
  courseId: number | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  draftId: number | null;
}

export interface QuickReply {
  label: string;
  value: string;
}

export interface AiMessage {
  id: number | string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  messageType: string;
  createdAt: string;
  status: 'sent' | 'pending' | 'failed';
  quickReplies: QuickReply[];
}

export interface SourceReference {
  id?: number | string;
  materialId?: number;
  chunkId?: number;
  label: string;
  excerpt?: string;
}

export interface DraftQuestion {
  id?: number | string;
  type: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  learningObjective: string;
  points: number;
  sourceReferences: SourceReference[];
  validationStatus: string;
}

export interface QuizDraft {
  id: number | null;
  quizId: number | null;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: string;
  questions: DraftQuestion[];
  updatedAt: string;
}

export interface GenerationState {
  status: ConversationStatus;
  stage: string;
  message: string;
  canCancel: boolean;
  startedAt: string;
  updatedAt: string;
}

export interface RevisionSnapshotSummary {
  title: string;
  questionCount: number | null;
}

export interface RevisionPreview {
  id: number;
  revisionNumber: number | null;
  revisionType: string;
  requestText: string;
  status: string;
  summary: string;
  changes: string[];
  destructive: boolean;
  beforeSnapshot: RevisionSnapshotSummary;
  proposedSnapshot: RevisionSnapshotSummary;
  changedQuestionCount: number | null;
  removedQuestionCount: number | null;
  addedQuestionCount: number | null;
  createdAt: string;
}

export interface ConversationDetail extends ConversationSummary {
  plan: QuizPlan;
  messages: AiMessage[];
  suggestedReplies: QuickReply[];
  draft: QuizDraft | null;
  generation: GenerationState | null;
  pendingRevision: RevisionPreview | null;
}

export interface Course {
  id: number;
  code: string;
  title: string;
}

export interface CourseMaterial {
  id: number;
  courseId: number;
  originalName: string;
  byteSize: number;
  chunkCount: number;
  status: string;
  createdAt: string;
  errorMessage: string;
}

export interface AiSettingsStatus {
  enabled: boolean;
  configured: boolean;
  conversationApiVersion: number;
  source: string;
  endpoint: string;
  maskedApiKey: string;
  chatDeployment: string;
  embeddingDeployment: string;
  apiVersion: string;
  message: string;
}

export interface AiSettingsInput {
  endpoint: string;
  apiKey: string;
  chatDeployment: string;
  embeddingDeployment: string;
  apiVersion: string;
}

export interface AiMutationResult {
  conversation: ConversationDetail | null;
  revision: RevisionPreview | null;
  message: AiMessage | null;
  notice: string;
}

export interface AiAssistantUser {
  id: number;
  name?: string;
  username?: string;
  role: string;
}

export interface LegacyAiApi {
  getCourses(filters?: Record<string, unknown>): Promise<unknown>;
  getAiConversations(): Promise<unknown>;
  createAiConversation(data?: Record<string, unknown>): Promise<unknown>;
  getAiConversation(id: number): Promise<unknown>;
  deleteAiConversation(id: number): Promise<unknown>;
  sendAiConversationMessage(id: number, content: string): Promise<unknown>;
  updateAiConversationPlan(id: number, patch: Partial<QuizPlan>): Promise<unknown>;
  generateAiConversationDraft(id: number, idempotencyKey: string, draftTitle?: string): Promise<unknown>;
  getAiConversationGenerationStatus(id: number): Promise<unknown>;
  cancelAiConversationGeneration(id: number): Promise<unknown>;
  reviseAiConversationDraft(id: number, instruction: string): Promise<unknown>;
  applyAiConversationRevision(id: number, revisionId: number): Promise<unknown>;
  regenerateAiConversationQuestions(id: number, indexes: number[], instruction?: string): Promise<unknown>;
  saveAiConversationDraft(id: number, draft: QuizDraft): Promise<unknown>;
  getAiSettingsStatus(): Promise<unknown>;
  saveAiSettings(data: AiSettingsInput): Promise<unknown>;
  testAiSettings(data: AiSettingsInput): Promise<unknown>;
  getAiMaterials(courseId: number): Promise<unknown>;
  uploadAiMaterial(courseId: number, file: File): Promise<unknown>;
  pasteAiMaterial(courseId: number, data: { name: string; content: string }): Promise<unknown>;
  deleteAiMaterial(courseId: number, materialId: number): Promise<unknown>;
  getAiMaterialChunk(courseId: number, materialId: number, chunkId: number): Promise<unknown>;
}

export interface AssistantCallbacks {
  onToast?: (message: string, type?: 'info' | 'success' | 'error') => void;
  onNavigate?: (hash: string) => void;
}

export const DEFAULT_PLAN: QuizPlan = {
  courseId: null,
  topic: '',
  learningObjectives: [],
  difficulty: '',
  questionCount: null,
  language: 'English',
  questionTypeDistribution: {
    multipleChoice: 0,
    trueFalse: 0,
    shortAnswer: 0,
    essay: 0,
    coding: 0
  },
  useIndexedMaterialOnly: false,
  includeExplanations: true,
  timeLimitMinutes: null,
  tags: [],
  specialInstructions: '',
  missingRequiredFields: ['courseId', 'topic', 'questionCount', 'questionTypeDistribution'],
  readinessStatus: 'gathering_requirements',
  materialScope: 'general_knowledge_allowed',
  materialIds: [],
  scoringPreferences: ''
};
