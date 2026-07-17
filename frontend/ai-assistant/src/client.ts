import {
  AiMutationResult,
  AiSettingsInput,
  AiSettingsStatus,
  ConversationDetail,
  ConversationSummary,
  Course,
  CourseMaterial,
  GenerationState,
  LegacyAiApi,
  QuizDraft,
  QuizPlan
} from './types';
import {
  assertObjectResponse,
  parseConversationDetail,
  parseConversationList,
  parseCourses,
  parseGeneration,
  parseMaterialChunk,
  parseMaterials,
  parseMutationResult,
  parseSettings
} from './schemas';

export interface AiClient {
  listConversations(): Promise<ConversationSummary[]>;
  createConversation(data?: Record<string, unknown>): Promise<ConversationDetail>;
  getConversation(id: number): Promise<ConversationDetail>;
  sendMessage(id: number, content: string): Promise<AiMutationResult>;
  updatePlan(id: number, patch: Partial<QuizPlan>): Promise<AiMutationResult>;
  generateDraft(id: number, idempotencyKey: string): Promise<AiMutationResult>;
  getGenerationStatus(id: number): Promise<GenerationState>;
  cancelGeneration(id: number): Promise<AiMutationResult>;
  reviseDraft(id: number, instruction: string): Promise<AiMutationResult>;
  applyRevision(id: number, revisionId: number): Promise<AiMutationResult>;
  regenerateQuestions(id: number, indexes: number[], instruction?: string): Promise<AiMutationResult>;
  saveDraft(id: number, draft: QuizDraft): Promise<AiMutationResult>;
  listCourses(): Promise<Course[]>;
  getSettings(): Promise<AiSettingsStatus>;
  saveSettings(data: AiSettingsInput): Promise<AiSettingsStatus>;
  testSettings(data: AiSettingsInput): Promise<Record<string, unknown>>;
  listMaterials(courseId: number): Promise<CourseMaterial[]>;
  uploadMaterial(courseId: number, file: File): Promise<Record<string, unknown>>;
  pasteMaterial(courseId: number, data: { name: string; content: string }): Promise<Record<string, unknown>>;
  deleteMaterial(courseId: number, materialId: number): Promise<Record<string, unknown>>;
  getMaterialChunk(courseId: number, materialId: number, chunkId: number): Promise<{ label: string; content: string }>;
}

export function createAiClient(api: LegacyAiApi): AiClient {
  return {
    async listConversations() {
      return parseConversationList(await api.getAiConversations());
    },
    async createConversation(data = {}) {
      return parseConversationDetail(await api.createAiConversation(data));
    },
    async getConversation(id) {
      return parseConversationDetail(await api.getAiConversation(id));
    },
    async sendMessage(id, content) {
      return parseMutationResult(await api.sendAiConversationMessage(id, content));
    },
    async updatePlan(id, patch) {
      const payload: Record<string, unknown> = { ...patch };
      if (patch.scoringPreferences !== undefined) {
        payload.gradingPreferences = patch.scoringPreferences;
        delete payload.scoringPreferences;
      }
      return parseMutationResult(await api.updateAiConversationPlan(id, payload as Partial<QuizPlan>));
    },
    async generateDraft(id, idempotencyKey) {
      return parseMutationResult(await api.generateAiConversationDraft(id, idempotencyKey));
    },
    async getGenerationStatus(id) {
      return parseGeneration(await api.getAiConversationGenerationStatus(id));
    },
    async cancelGeneration(id) {
      return parseMutationResult(await api.cancelAiConversationGeneration(id));
    },
    async reviseDraft(id, instruction) {
      return parseMutationResult(await api.reviseAiConversationDraft(id, instruction));
    },
    async applyRevision(id, revisionId) {
      return parseMutationResult(await api.applyAiConversationRevision(id, revisionId));
    },
    async regenerateQuestions(id, indexes, instruction) {
      return parseMutationResult(await api.regenerateAiConversationQuestions(id, indexes, instruction));
    },
    async saveDraft(id, draft) {
      return parseMutationResult(await api.saveAiConversationDraft(id, draft));
    },
    async listCourses() {
      return parseCourses(await api.getCourses());
    },
    async getSettings() {
      return parseSettings(await api.getAiSettingsStatus());
    },
    async saveSettings(data) {
      return parseSettings(await api.saveAiSettings(data));
    },
    async testSettings(data) {
      return assertObjectResponse(await api.testAiSettings(data));
    },
    async listMaterials(courseId) {
      return parseMaterials(await api.getAiMaterials(courseId));
    },
    async uploadMaterial(courseId, file) {
      return assertObjectResponse(await api.uploadAiMaterial(courseId, file));
    },
    async pasteMaterial(courseId, data) {
      return assertObjectResponse(await api.pasteAiMaterial(courseId, data));
    },
    async deleteMaterial(courseId, materialId) {
      return assertObjectResponse(await api.deleteAiMaterial(courseId, materialId));
    },
    async getMaterialChunk(courseId, materialId, chunkId) {
      return parseMaterialChunk(await api.getAiMaterialChunk(courseId, materialId, chunkId));
    }
  };
}
