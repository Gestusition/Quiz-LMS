import { ConversationStatus, QuizPlan } from './types';

export const STATUS_LABELS: Record<string, string> = {
  gathering_requirements: 'Gathering requirements',
  ready_to_generate: 'Ready to generate',
  generating: 'Generating',
  generation_failed: 'Generation failed',
  review_required: 'Review required',
  draft_saved: 'Draft saved',
  published: 'Published'
};

export const STAGE_LABELS: Record<string, string> = {
  validating_quiz_plan: 'Validating quiz plan',
  retrieving_course_material: 'Retrieving course material',
  selecting_source_passages: 'Selecting source passages',
  generating_questions: 'Generating questions',
  validating_generated_output: 'Validating generated output',
  saving_draft: 'Saving draft',
  opening_review_workspace: 'Opening review workspace'
};

export function statusLabel(status: ConversationStatus | undefined): string {
  if (!status) return 'Gathering requirements';
  return STATUS_LABELS[status] || status.replaceAll('_', ' ');
}

export function stageLabel(stage: string | undefined): string {
  if (!stage) return 'Preparing generation';
  return STAGE_LABELS[stage] || stage.replaceAll('_', ' ');
}

export function formatTimestamp(value: string): string {
  if (!value) return '';
  const date = new Date(normalizeTimestamp(value));
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

export function normalizeTimestamp(value: string): string {
  const timestamp = value.trim();
  if (!timestamp) return '';
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(timestamp);
  const isDatabaseTimestamp =
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(timestamp);
  if (isDatabaseTimestamp && !hasTimezone) {
    return `${timestamp.replace(' ', 'T')}Z`;
  }
  return timestamp;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function getMissingPlanFields(plan: QuizPlan): string[] {
  const missing: string[] = [];
  if (!plan.courseId) missing.push('courseId');
  if (!plan.topic.trim()) missing.push('topic');
  if (!plan.difficulty) missing.push('difficulty');
  if (!plan.questionCount || plan.questionCount < 1) missing.push('questionCount');
  if (!plan.language.trim()) missing.push('language');
  const distributionTotal = Object.values(plan.questionTypeDistribution)
    .reduce((sum, count) => sum + Number(count || 0), 0);
  if (distributionTotal < 1 || (plan.questionCount && distributionTotal !== plan.questionCount)) {
    missing.push('questionTypeDistribution');
  }

  const backendMissing = plan.missingRequiredFields.filter(field => {
    if (field === 'courseId') return !plan.courseId;
    if (field === 'topic') return !plan.topic.trim();
    if (field === 'difficulty') return !plan.difficulty;
    if (field === 'questionCount') return !plan.questionCount;
    if (field === 'language') return !plan.language.trim();
    if (field === 'questionTypeDistribution' || field === 'questionTypes') {
      return distributionTotal < 1 || Boolean(plan.questionCount && distributionTotal !== plan.questionCount);
    }
    return true;
  });
  return [...new Set([...missing, ...backendMissing])];
}

export function isPlanReady(plan: QuizPlan): boolean {
  return getMissingPlanFields(plan).length === 0;
}

export function fieldLabel(field: string): string {
  const labels: Record<string, string> = {
    courseId: 'course',
    topic: 'topic',
    difficulty: 'difficulty',
    questionCount: 'question count',
    questionTypeDistribution: 'question types',
    questionTypes: 'question types',
    language: 'language',
    learningObjectives: 'learning objectives'
  };
  return labels[field] || field.replaceAll('_', ' ');
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
