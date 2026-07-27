import {
  ConversationDetail,
  Course,
  CourseMaterial,
  QuickReply,
  QuestionTypeKey,
  QuizPlan
} from './types';
import { getMissingPlanFields } from './utils';

interface SuggestionContext {
  detail: ConversationDetail | null;
  plan: QuizPlan;
  courses: Course[];
  materials: CourseMaterial[];
}

const QUESTION_TYPE_LABELS: Record<QuestionTypeKey, { short: string; full: string }> = {
  multipleChoice: { short: 'MCQ', full: 'multiple-choice' },
  trueFalse: { short: 'true/false', full: 'true/false' },
  shortAnswer: { short: 'short answer', full: 'short-answer' },
  essay: { short: 'essay', full: 'essay' },
  coding: { short: 'coding', full: 'coding' }
};

const TECHNICAL_CONTEXT = /\b(?:algorithm|code|coding|computer|data structure|database|javascript|java|program|python|software|web)\b/i;
const MAX_REPLIES = 5;

function cleanText(value: unknown, maxLength: number): string {
  const cleaned = String(value || '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[<>\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  const shortened = cleaned.slice(0, maxLength + 1);
  const boundary = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, boundary > maxLength * 0.6 ? boundary : maxLength).trim()}…`;
}

function materialLabel(material: CourseMaterial): string {
  return cleanText(
    material.originalName.replace(/\.(?:docx|md|pdf|txt)$/i, '').replace(/[_-]+/g, ' '),
    54
  ) || `Material ${material.id}`;
}

function courseLabel(course?: Course): string {
  if (!course) return 'the selected course';
  return cleanText(`${course.code} — ${course.title}`, 72);
}

function topicLabel(plan: QuizPlan, course?: Course): string {
  return cleanText(plan.topic, 56) ||
    cleanText(course?.title, 56) ||
    'this course';
}

function distributionSummary(plan: QuizPlan): { label: string; value: string } | null {
  const active = (Object.entries(plan.questionTypeDistribution) as Array<[QuestionTypeKey, number]>)
    .filter(([, count]) => Number(count) > 0);
  if (!active.length) return null;
  return {
    label: active.map(([type, count]) => `${count} ${QUESTION_TYPE_LABELS[type].short}`).join(' + '),
    value: active
      .map(([type, count]) => `${count} ${QUESTION_TYPE_LABELS[type].full} question${count === 1 ? '' : 's'}`)
      .join(' and ')
  };
}

function primaryQuestionType(plan: QuizPlan): QuestionTypeKey {
  return (Object.entries(plan.questionTypeDistribution) as Array<[QuestionTypeKey, number]>)
    .sort((left, right) => Number(right[1]) - Number(left[1]))[0]?.[0] || 'multipleChoice';
}

function initialReplies(courses: Course[]): QuickReply[] {
  if (!courses.length) {
    return [
      {
        label: 'Create a concept-check quiz',
        value: 'Create a medium concept-check quiz and help me choose its course and topic.'
      },
      {
        label: 'Build a mixed assessment',
        value: 'Build a 10-question mixed assessment with explanations and help me complete the plan.'
      },
      {
        label: 'Design a source-grounded quiz',
        value: 'Design a quiz grounded in my selected course materials.'
      }
    ];
  }

  if (courses.length === 1) {
    const course = courseLabel(courses[0]);
    return [
      {
        label: `Concept check for ${cleanText(courses[0].code, 24)}`,
        value: `Create a medium concept-check quiz for ${course}.`
      },
      {
        label: `Mixed quiz for ${cleanText(courses[0].code, 24)}`,
        value: `Build a 10-question mixed quiz for ${course} with explanations.`
      },
      {
        label: `Use ${cleanText(courses[0].code, 24)} materials`,
        value: `Create a quiz for ${course} using its indexed course materials.`
      }
    ];
  }

  return courses.slice(0, 4).map((course, index) => ({
    label: `Quiz for ${cleanText(course.code, 24)}`,
    value: index % 2
      ? `Create a 10-question mixed quiz for ${courseLabel(course)}.`
      : `Create a medium concept-check quiz for ${courseLabel(course)}.`
  }));
}

export function buildContextualReplies({
  detail,
  plan,
  courses,
  materials
}: SuggestionContext): QuickReply[] {
  if (!detail) return initialReplies(courses);

  const replies: QuickReply[] = [];
  const seen = new Set<string>();
  const add = (candidate: QuickReply | null | undefined) => {
    if (!candidate || replies.length >= MAX_REPLIES) return;
    const label = cleanText(candidate.label, 80);
    const value = cleanText(candidate.value, 180);
    const key = value.toLocaleLowerCase();
    if (!label || !value || seen.has(key)) return;
    seen.add(key);
    replies.push({ label, value });
  };

  detail.suggestedReplies.forEach(add);

  const course = courses.find(item => Number(item.id) === Number(plan.courseId));
  const missing = getMissingPlanFields(plan);
  const topic = topicLabel(plan, course);
  const readyMaterials = materials.filter(material => material.status !== 'failed');
  const selectedMaterials = plan.materialIds.length
    ? readyMaterials.filter(material => plan.materialIds.includes(material.id))
    : readyMaterials;

  if (missing.includes('courseId')) {
    courses.slice(0, MAX_REPLIES).forEach(item => add({
      label: `Use ${cleanText(item.code, 24)}`,
      value: `Create this quiz for ${courseLabel(item)}.`
    }));
  } else if (missing.includes('topic')) {
    selectedMaterials.slice(0, 2).forEach(material => add({
      label: `Use ${materialLabel(material)}`,
      value: `Use the main concepts from “${materialLabel(material)}” as the quiz topic for ${courseLabel(course)}.`
    }));
    add({
      label: `Choose a ${cleanText(course?.code, 24)} topic`,
      value: `Help me choose a focused topic from ${courseLabel(course)}.`
    });
  } else if (missing.includes('difficulty')) {
    (['easy', 'medium', 'hard', 'mixed'] as const).forEach(difficulty => add({
      label: `${difficulty[0].toUpperCase()}${difficulty.slice(1)} ${topic}`,
      value: `Make the ${topic} quiz ${difficulty}.`
    }));
  } else if (missing.includes('questionCount')) {
    [5, 10, 15].forEach(count => add({
      label: `${count} ${topic} questions`,
      value: `Use ${count} questions for the ${topic} quiz.`
    }));
  } else if (missing.includes('language')) {
    ['English', 'Turkish', 'Spanish'].forEach(language => add({
      label: `${topic} in ${language}`,
      value: `Write the ${topic} quiz in ${language}.`
    }));
  } else if (missing.includes('questionTypeDistribution')) {
    const total = plan.questionCount || 10;
    const technical = TECHNICAL_CONTEXT.test(`${topic} ${course?.title || ''}`);
    const appliedCount = Math.min(2, Math.max(1, Math.floor(total / 4)));
    add({
      label: 'Mostly multiple choice',
      value: `Use ${total} mostly multiple-choice questions about ${topic}.`
    });
    add(technical
      ? {
          label: `MCQ + ${appliedCount} coding`,
          value: `Use ${total - appliedCount} multiple-choice and ${appliedCount} coding questions about ${topic}.`
        }
      : {
          label: `MCQ + ${appliedCount} short answer`,
          value: `Use ${total - appliedCount} multiple-choice and ${appliedCount} short-answer questions about ${topic}.`
        });
    add({
      label: 'Balanced mixed quiz',
      value: `Use a balanced mix of question types for the ${topic} quiz.`
    });
  } else {
    const distribution = distributionSummary(plan);
    if (distribution) {
      add({
        label: `Keep ${distribution.label}`,
        value: `Keep the ${topic} quiz at ${distribution.value}.`
      });
    }
    selectedMaterials.slice(0, 2).forEach(material => add({
      label: `${plan.materialScope === 'course_material_only' ? 'Use only' : 'Ground in'} ${materialLabel(material)}`,
      value: `${plan.materialScope === 'course_material_only' ? 'Use only' : 'Ground the quiz in'} “${materialLabel(material)}” for the ${topic} questions.`
    }));
    if (detail.draft) {
      const primary = QUESTION_TYPE_LABELS[primaryQuestionType(plan)].short;
      add({
        label: `Make ${primary} questions harder`,
        value: `Make the ${primary} questions more challenging while keeping the ${topic} learning objectives.`
      });
      add({
        label: plan.includeExplanations ? 'Tighten explanations' : 'Add answer explanations',
        value: plan.includeExplanations
          ? 'Make every answer explanation shorter and more precise.'
          : 'Add a concise explanation for every answer.'
      });
    } else {
      if (plan.questionTypeDistribution.coding > 0) {
        add({
          label: 'Make coding questions scenario-based',
          value: `Make the coding questions scenario-based and focused on ${topic}.`
        });
      }
      add({
        label: plan.includeExplanations ? 'Use concise explanations' : 'Include explanations',
        value: plan.includeExplanations
          ? 'Keep the answer explanations concise and instructional.'
          : 'Include a concise explanation for every answer.'
      });
    }
  }

  if (replies.length < 3) {
    const lastAssistant = [...detail.messages].reverse().find(message => message.sender === 'assistant');
    lastAssistant?.quickReplies.forEach(add);
  }

  return replies.slice(0, MAX_REPLIES);
}
