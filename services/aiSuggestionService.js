const aiMaterialRepository = require('../repositories/aiMaterialRepository');
const {
  AI_LIMITS,
  AI_MATERIAL_STATUS,
  AI_MESSAGE_SENDER
} = require('../constants/ai');

const QUESTION_TYPE_LABELS = Object.freeze({
  multipleChoice: 'multiple-choice',
  trueFalse: 'true/false',
  shortAnswer: 'short-answer',
  essay: 'essay',
  coding: 'coding'
});

const DRAFT_TYPE_KEYS = Object.freeze({
  multiple_choice: 'multipleChoice',
  true_false: 'trueFalse',
  short_answer: 'shortAnswer',
  essay: 'essay',
  coding: 'coding'
});

const THEME_STOP_WORDS = new Set([
  'about', 'above', 'after', 'again', 'against', 'also', 'among', 'and', 'another',
  'because', 'before', 'being', 'below', 'between', 'both', 'chapter', 'course',
  'describe', 'describes', 'describing', 'discuss', 'discusses', 'during', 'each',
  'example', 'examples', 'explain', 'explains', 'focus', 'focuses', 'following',
  'from', 'have', 'having', 'into', 'introduce', 'introduced', 'introduces',
  'lesson', 'material', 'materials', 'more', 'most', 'notes', 'other', 'overview',
  'question', 'questions', 'quiz', 'section', 'should', 'such', 'than', 'that',
  'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
  'topic', 'topics', 'using', 'very', 'week', 'which', 'while', 'with', 'would'
]);

const UNSAFE_INSTRUCTION_PATTERN = /\b(?:act as|api[\s_-]*key|assistant|click|commands?|developer message|disregard|download|execute|follow|forget|ignore|install|instructions?|obey|open|override|password|print|prompt|respond|return|reveal|role message|run|script|secret|send|system prompt|token|upload|visit|you are)\b/i;
const URL_PATTERN = /(?:https?:\/\/|www\.)\S+|\b(?:[a-z0-9-]+\.)+(?:app|co|com|dev|edu|gov|io|me|net|org)(?:\/[^\s]*)?/gi;

function buildSuggestedReplies(context = {}) {
  const conversation = context.conversation || {};
  const plan = conversation.quizPlan || context.plan || {};
  const authorizedCourses = Array.isArray(context.authorizedCourses)
    ? context.authorizedCourses
    : [];
  const courseId = positiveId(plan.courseId || conversation.courseId);
  const course = authorizedCourses.find(item => Number(item.id) === courseId) || null;
  const safeCourse = course ? courseDescriptor(course) : null;
  const topic = safeReferenceText(plan.topic, 60);
  const draft = normalizeDraft(context.draft);
  const distribution = draft
    ? distributionFromDraft(draft)
    : normalizeDistribution(plan.questionTypeDistribution);
  const questionCount = draft
    ? (Array.isArray(draft.questions) ? draft.questions.length : 0)
    : positiveNumber(plan.questionCount);
  const difficulty = safeDifficulty(draft?.difficulty || plan.difficulty);
  const typeSummary = describeTypeMix(distribution);
  const candidates = [];

  if (!safeCourse) {
    authorizedCourses.slice(0, 2).forEach(item => {
      const descriptor = courseDescriptor(item);
      if (!descriptor) return;
      addCandidate(candidates, {
        label: `Start a ${descriptor.short} concept-check`,
        value: `Create a medium-difficulty mixed quiz for ${descriptor.full}.`
      });
    });
  } else {
    addCandidate(candidates, primarySuggestion({
      course: safeCourse,
      difficulty,
      draft,
      plan,
      questionCount,
      topic,
      typeSummary
    }));

    const materialContext = loadMaterialContext(courseId, plan.materialIds);
    addCandidate(candidates, materialSuggestion({
      course: safeCourse,
      materialContext,
      topic,
      typeSummary
    }));
  }

  const direction = detectRecentDirection(context.messages);
  addCandidate(candidates, directionSuggestion({
    direction,
    course: safeCourse,
    topic,
    typeSummary
  }));
  addCandidate(candidates, typeMixSuggestion({
    distribution,
    topic,
    typeSummary
  }));
  addCandidate(candidates, difficultySuggestion({
    difficulty,
    topic,
    typeSummary
  }));

  return finalizeCandidates(candidates);
}

function loadMaterialContext(courseId, selectedMaterialIds) {
  if (!courseId) return { materials: [], chunks: [], themes: [] };
  const selected = normalizeIds(selectedMaterialIds);
  const materials = selected.length
    ? selected
        .map(materialId => aiMaterialRepository.getMaterialForCourse(materialId, courseId))
        .filter(material => material?.status === AI_MATERIAL_STATUS.ready)
    : aiMaterialRepository.listByCourse(courseId, {
        status: AI_MATERIAL_STATUS.ready,
        limit: AI_LIMITS.suggestionMaterialsMax
      });
  const materialIds = materials
    .map(material => Number(material.id))
    .filter(Number.isSafeInteger)
    .slice(0, AI_LIMITS.suggestionMaterialsMax);
  const chunks = materialIds.length
    ? aiMaterialRepository.listSuggestionChunksByCourse(courseId, {
        materialIds,
        limit: AI_LIMITS.suggestionChunksMax,
        contentChars: AI_LIMITS.suggestionChunkCharsMax
      })
    : [];
  return {
    materials,
    chunks,
    themes: extractMaterialThemes(chunks)
  };
}

function primarySuggestion({ course, difficulty, draft, plan, questionCount, topic, typeSummary }) {
  const countText = questionCount ? `${questionCount}-question ` : '';
  const difficultyText = difficulty ? `${difficulty} ` : '';
  const topicText = topic || 'a recent course topic';
  if (draft) {
    return {
      label: clip(`Revise ${course.short}: ${topicText}`, AI_LIMITS.suggestedReplyLabelMax),
      value: `Revise the current ${countText}${typeSummary} draft for ${course.full} on ${topicText} while preserving its strongest questions.`
    };
  }
  const missing = Array.isArray(plan.missingRequiredFields) ? plan.missingRequiredFields[0] : '';
  if (missing === 'topic') {
    return {
      label: clip(`Choose a ${course.short} quiz topic`, AI_LIMITS.suggestedReplyLabelMax),
      value: `Create a ${difficultyText}${countText}${typeSummary} quiz for ${course.full} using a recent course topic.`
    };
  }
  if (missing === 'difficulty') {
    return {
      label: clip(`Set ${topicText} to medium`, AI_LIMITS.suggestedReplyLabelMax),
      value: `Use medium difficulty for the ${course.short} quiz about ${topicText}.`
    };
  }
  if (missing === 'questionCount') {
    return {
      label: clip(`Make ${topicText} a 10-question quiz`, AI_LIMITS.suggestedReplyLabelMax),
      value: `Create 10 ${typeSummary} questions for ${course.full} about ${topicText}.`
    };
  }
  return {
    label: clip(`Refine ${course.short}: ${topicText}`, AI_LIMITS.suggestedReplyLabelMax),
    value: `Refine the ${countText}${difficultyText}${typeSummary} quiz for ${course.full} about ${topicText}.`
  };
}

function materialSuggestion({ course, materialContext, topic, typeSummary }) {
  const material = materialContext.materials[0];
  if (!material) return null;
  const chunk = materialContext.chunks.find(item => Number(item.materialId) === Number(material.id)) ||
    materialContext.chunks[0];
  const materialName = safeMaterialName(chunk?.originalName || material.originalName);
  if (!materialName) return null;
  const theme = extractTheme(chunk?.content) || materialContext.themes[0];
  if (theme) {
    return {
      label: clip(`Use ${materialName}: ${theme}`, AI_LIMITS.suggestedReplyLabelMax),
      value: `Use ${materialName} as course reference and add ${typeSummary} questions about ${theme} for ${course.short}.`
    };
  }
  return {
    label: clip(`Build from ${materialName}`, AI_LIMITS.suggestedReplyLabelMax),
    value: `Use ${materialName} as the main course reference for the ${topic || course.short} quiz.`
  };
}

function directionSuggestion({ direction, course, topic, typeSummary }) {
  if (!direction) return null;
  const subject = topic || course?.short || 'this quiz';
  if (direction.coding && direction.harder) {
    return {
      label: 'Balance advanced coding with concepts',
      value: `Keep the recent harder coding direction for ${subject}, and balance it with concise concept checks.`
    };
  }
  if (direction.coding) {
    return {
      label: 'Balance code with concept checks',
      value: `Keep the recent coding focus for ${subject}, but balance it with concept-check questions.`
    };
  }
  if (direction.multipleChoice) {
    return {
      label: 'Add an applied response type',
      value: `Keep the recent multiple-choice direction for ${subject} and add one applied ${typeSummary} variation.`
    };
  }
  if (direction.harder) {
    return {
      label: 'Add one scaffolded challenge',
      value: `Keep the recent harder direction for ${subject}, with one scaffolded question before the toughest item.`
    };
  }
  if (direction.easier) {
    return {
      label: 'Add one stretch question',
      value: `Keep the recent easier direction for ${subject}, then finish with one well-scoped stretch question.`
    };
  }
  if (direction.applied) {
    return {
      label: 'Pair scenarios with concept checks',
      value: `Keep the recent applied direction for ${subject} and pair each scenario with a concise concept check.`
    };
  }
  if (direction.conceptual) {
    return {
      label: 'Add a practical scenario',
      value: `Keep the recent conceptual direction for ${subject} and add a practical application scenario.`
    };
  }
  if (direction.explanations === false) {
    return {
      label: 'Restore concise answer rationales',
      value: `Add short answer rationales to ${subject} without making the questions easier.`
    };
  }
  if (direction.explanations === true) {
    return {
      label: 'Tighten the explanations',
      value: `Keep explanations for ${subject}, but make each rationale concise and evidence-focused.`
    };
  }
  return null;
}

function typeMixSuggestion({ distribution, topic, typeSummary }) {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  if (!total) {
    return {
      label: 'Try a mixed question set',
      value: `Use a balanced mix of multiple-choice, short-answer, and applied questions${topic ? ` about ${topic}` : ''}.`
    };
  }
  const coding = distribution.coding || 0;
  const multipleChoice = distribution.multipleChoice || 0;
  if (coding > 0) {
    return {
      label: 'Add a code-tracing variation',
      value: `Keep the ${typeSummary} mix${topic ? ` for ${topic}` : ''} and include one code-tracing variation.`
    };
  }
  if (multipleChoice / total >= 0.6) {
    return {
      label: 'Add an applied short response',
      value: `Keep the current multiple-choice emphasis${topic ? ` on ${topic}` : ''}, but add an applied short-response item.`
    };
  }
  return {
    label: 'Tighten the mixed-question balance',
    value: `Keep the ${typeSummary} mix${topic ? ` for ${topic}` : ''} and balance recall with application.`
  };
}

function difficultySuggestion({ difficulty, topic, typeSummary }) {
  const subject = topic || 'the current topic';
  if (difficulty === 'hard') {
    return {
      label: 'Add a scaffold before the hardest item',
      value: `Keep ${subject} hard, but add one scaffolded ${typeSummary} question before the most demanding item.`
    };
  }
  if (difficulty === 'easy') {
    return {
      label: 'Finish with a gentle stretch item',
      value: `Keep ${subject} accessible and finish with one slightly more demanding ${typeSummary} question.`
    };
  }
  return {
    label: 'Create easy and hard variants',
    value: `Keep the medium ${typeSummary} version for ${subject}, then propose one easier and one harder variation.`
  };
}

function detectRecentDirection(messages) {
  const recentMessages = (Array.isArray(messages) ? messages : [])
    .filter(message => message?.senderType === AI_MESSAGE_SENDER.user)
    .slice(-AI_LIMITS.suggestionRecentMessagesMax)
    .map(message => String(message.content || ''));
  const latest = recentMessages[recentMessages.length - 1] || '';
  const recent = hasDirectionSignal(latest)
    ? latest
    : recentMessages.join(' ');
  if (!recent) return null;
  return {
    harder: /\b(?:advanced|challenge|challenging|hard|harder|tougher)\b/i.test(recent),
    easier: /\b(?:beginner|easy|easier|simpler)\b/i.test(recent),
    coding: /\b(?:code|coding|programming|implementation)\b/i.test(recent),
    multipleChoice: /\b(?:multiple[\s-]?choice|mcq)\b/i.test(recent),
    applied: /\b(?:applied|application|case study|practical|scenario)\b/i.test(recent),
    conceptual: /\b(?:concept|conceptual|theory|theoretical)\b/i.test(recent),
    explanations: /\b(?:without|no|remove|omit)\s+(?:answer\s+)?explanations?\b/i.test(recent)
      ? false
      : /\b(?:add|include|keep|with)\s+(?:answer\s+)?explanations?\b/i.test(recent)
        ? true
        : null
  };
}

function hasDirectionSignal(value) {
  return /\b(?:advanced|applied|application|beginner|case study|challenge|challenging|code|coding|concept|conceptual|easy|easier|explanations?|hard|harder|implementation|mcq|multiple[\s-]?choice|practical|programming|scenario|simpler|theory|theoretical|tougher)\b/i
    .test(String(value || ''));
}

function extractMaterialThemes(chunks) {
  const themes = [];
  const seen = new Set();
  for (const chunk of Array.isArray(chunks) ? chunks : []) {
    const theme = extractTheme(chunk.content);
    const key = theme.toLocaleLowerCase();
    if (!theme || seen.has(key)) continue;
    seen.add(key);
    themes.push(theme);
    if (themes.length >= 3) break;
  }
  return themes;
}

function extractTheme(value) {
  const safe = sanitizeMaterialContent(value);
  if (!safe) return '';
  const tokens = safe
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map(token => token.replace(/^-+|-+$/g, ''))
    .filter(token => {
      const lower = token.toLocaleLowerCase();
      return token.length >= 3 &&
        token.length <= 24 &&
        !/^\d+$/.test(token) &&
        !THEME_STOP_WORDS.has(lower) &&
        !UNSAFE_INSTRUCTION_PATTERN.test(lower);
    })
    .slice(0, 3);
  if (!tokens.length) return '';
  const phrase = tokens.join(' ');
  return phrase.charAt(0).toLocaleUpperCase() + phrase.slice(1);
}

function sanitizeMaterialContent(value) {
  const stripped = String(value || '')
    .replace(/<\s*(script|style|iframe|object|embed|svg|math)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, ' ')
    .replace(/\[[^\]]*]\(\s*(?:https?:\/\/|www\.)[^)]+\)/gi, ' ')
    .replace(URL_PATTERN, ' ')
    .replace(/\bjavascript\s*:[^\s]+/gi, ' ')
    .replace(/&(?:[a-z]+|#\d+|#x[a-f0-9]+);/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, ' ');
  return stripped
    .split(/[\r\n]+|(?<=[.!?])\s+/)
    .map(part => part.trim())
    .filter(part => part && !UNSAFE_INSTRUCTION_PATTERN.test(part))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, AI_LIMITS.suggestionChunkCharsMax);
}

function safeReferenceText(value, maxLength) {
  const text = String(value || '')
    .replace(/<\s*(script|style|iframe|object|embed|svg|math)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, ' ')
    .replace(/\[[^\]]*]\(\s*(?:https?:\/\/|www\.)[^)]+\)/gi, ' ')
    .replace(URL_PATTERN, ' ')
    .replace(/&(?:[a-z]+|#\d+|#x[a-f0-9]+);/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text || UNSAFE_INSTRUCTION_PATTERN.test(text)) return '';
  return clip(text, maxLength);
}

function safeMaterialName(value) {
  const basename = String(value || '').split(/[\\/]/).pop() || '';
  return safeReferenceText(basename, 52);
}

function courseDescriptor(course) {
  const code = safeReferenceText(course?.code, 24);
  const title = safeReferenceText(course?.title, 54);
  if (!code && !title) return null;
  return {
    short: code || title,
    full: code && title ? `${code} — ${title}` : (code || title)
  };
}

function normalizeDraft(record) {
  if (!record || typeof record !== 'object') return null;
  if (record.draft && typeof record.draft === 'object') return record.draft;
  return Array.isArray(record.questions) ? record : null;
}

function distributionFromDraft(draft) {
  const distribution = normalizeDistribution({});
  (Array.isArray(draft?.questions) ? draft.questions : []).forEach(question => {
    const key = DRAFT_TYPE_KEYS[question?.type];
    if (key) distribution[key] += 1;
  });
  return distribution;
}

function normalizeDistribution(value) {
  return Object.fromEntries(Object.keys(QUESTION_TYPE_LABELS).map(key => [
    key,
    positiveNumber(value?.[key])
  ]));
}

function describeTypeMix(distribution) {
  const active = Object.entries(distribution)
    .filter(([, count]) => count > 0)
    .sort((left, right) => right[1] - left[1]);
  if (!active.length) return 'mixed-format';
  if (active.length === 1) return QUESTION_TYPE_LABELS[active[0][0]];
  if (active.length === 2) {
    return `${QUESTION_TYPE_LABELS[active[0][0]]} and ${QUESTION_TYPE_LABELS[active[1][0]]}`;
  }
  return 'mixed-format';
}

function addCandidate(candidates, candidate) {
  if (candidate?.label && candidate?.value) candidates.push(candidate);
}

function finalizeCandidates(candidates) {
  const seenLabels = new Set();
  const seenValues = new Set();
  const result = [];
  for (const candidate of candidates) {
    const label = safeSuggestionText(candidate.label, AI_LIMITS.suggestedReplyLabelMax);
    const value = safeSuggestionText(candidate.value, AI_LIMITS.suggestedReplyValueMax);
    const labelKey = label.toLocaleLowerCase();
    const valueKey = value.toLocaleLowerCase();
    if (
      !label ||
      !value ||
      labelKey === valueKey ||
      seenLabels.has(labelKey) ||
      seenValues.has(valueKey)
    ) {
      continue;
    }
    seenLabels.add(labelKey);
    seenValues.add(valueKey);
    result.push({ label, value });
    if (result.length >= AI_LIMITS.suggestedRepliesMax) break;
  }
  return result;
}

function safeSuggestionText(value, maxLength) {
  return clip(
    String(value || '')
      .replace(URL_PATTERN, '')
      .replace(/<[^>]*>/g, '')
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
    maxLength
  );
}

function clip(value, maxLength) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, Math.max(1, maxLength - 1)).trimEnd() + '…';
}

function normalizeIds(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values
    .map(Number)
    .filter(value => Number.isSafeInteger(value) && value > 0))]
    .slice(0, AI_LIMITS.suggestionMaterialsMax);
}

function positiveId(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

function safeDifficulty(value) {
  const normalized = String(value || '').toLocaleLowerCase();
  return ['easy', 'medium', 'hard'].includes(normalized) ? normalized : '';
}

module.exports = {
  buildSuggestedReplies,
  extractMaterialThemes,
  sanitizeMaterialContent
};
