const crypto = require('crypto');
const { isDeepStrictEqual } = require('util');
const aiConversationRepository = require('../repositories/aiConversationRepository');
const aiQuizDraftRepository = require('../repositories/aiQuizDraftRepository');
const aiMaterialRepository = require('../repositories/aiMaterialRepository');
const aiGenerationRepository = require('../repositories/aiGenerationRepository');
const aiRevisionRepository = require('../repositories/aiRevisionRepository');
const courseService = require('./courseService');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const aiPlanningService = require('./aiPlanningService');
const aiQuizService = require('./aiQuizService');
const aiGenerationManager = require('./aiGenerationManager');
const ragService = require('./ragService');
const aiSuggestionService = require('./aiSuggestionService');
const {
  AI_CONVERSATION_STATUS,
  AI_GENERATION_STAGE,
  AI_GENERATION_STATUS,
  AI_LIMITS,
  AI_MATERIAL_MODE,
  AI_MESSAGE_SENDER,
  AI_MESSAGE_TYPE,
  AI_REVISION_TYPE
} = require('../constants/ai');
const {
  createEmptyQuizPlan,
  validateConversationCreate,
  validateConversationListQuery,
  validateGenerationRequest,
  validateMessageInput,
  validateQuizPlanPatch,
  validateRegenerationRequest,
  validateRevisionRequest
} = require('../validators/aiConversationValidator');
const { AppError, conflictError, notFoundError, validationError } = require('../utils/appError');

const INITIAL_GREETING = 'What kind of quiz would you like to create? You can describe the course, topic, learning objectives, difficulty, question types, and any special instructions.';

async function createConversation(input, user) {
  const validated = validateConversationCreate(input);
  if (validated.courseId) assertCourseManager(user, validated.courseId);
  const plan = createEmptyQuizPlan({ courseId: validated.courseId });
  const conversation = aiConversationRepository.createConversation({
    ownerUserId: user.id,
    ownerRole: user.role,
    courseId: validated.courseId,
    title: validated.title,
    status: plan.readinessStatus,
    quizPlan: plan
  });
  aiConversationRepository.addOwnedMessage(conversation.id, user.id, {
    senderType: AI_MESSAGE_SENDER.assistant,
    senderUserId: null,
    content: INITIAL_GREETING,
    messageType: AI_MESSAGE_TYPE.greeting,
    metadata: {
      quickReplies: ['10 questions', 'Medium', 'Mixed', 'Course material preferred']
    }
  });
  if (validated.initialMessage) {
    await addMessage(conversation.id, { content: validated.initialMessage }, user);
  }
  return getConversation(conversation.id, user);
}

function listConversations(query, user) {
  const filters = validateConversationListQuery(query);
  if (filters.courseId) assertCourseManager(user, filters.courseId);
  const items = aiConversationRepository.listOwnedConversations(user.id, filters)
    .filter(conversation => !conversation.courseId || canManageCourse(user, conversation.courseId))
    .map(serializeConversationSummary);
  const total = aiConversationRepository.countOwnedConversations(user.id, filters);
  return {
    items,
    page: filters.page,
    limit: filters.limit,
    total
  };
}

function getConversation(conversationId, user) {
  const conversation = requireOwnedConversation(conversationId, user);
  const messages = aiConversationRepository.listOwnedMessages(conversation.id, user.id, {
    limit: AI_LIMITS.messagesPerConversationMax
  }) || [];
  const draft = conversation.draftId
    ? getOwnedDraft(conversation.draftId, user)
    : null;
  const authorizedCourses = manageableCourses(user);
  const suggestedReplies = aiSuggestionService.buildSuggestedReplies({
    conversation,
    messages,
    draft,
    authorizedCourses
  });
  return serializeConversationDetail(conversation, {
    messages,
    draft,
    suggestedReplies
  });
}

async function addMessage(conversationId, input, user) {
  const conversation = requireOwnedConversation(conversationId, user);
  const validated = validateMessageInput(input);
  const messageCount = aiConversationRepository.countMessages(conversation.id);
  if (messageCount >= AI_LIMITS.messagesPerConversationMax) {
    throw validationError(
      'messages',
      `A conversation can contain at most ${AI_LIMITS.messagesPerConversationMax} messages. Start a new conversation to continue.`
    );
  }
  const userMessageResult = aiConversationRepository.addOwnedMessage(conversation.id, user.id, {
    senderType: AI_MESSAGE_SENDER.user,
    senderUserId: user.id,
    content: validated.content,
    messageType: validated.messageType,
    metadata: validated.metadata,
    clientRequestId: validated.clientRequestId
  });
  if (!userMessageResult) throw notFoundError('AI conversation not found.');
  const userMessage = userMessageResult.message;
  if (!userMessageResult.inserted) {
    const currentConversation = getConversation(conversation.id, user);
    const assistantMessage = currentConversation.messages.find(message =>
      message.senderType === AI_MESSAGE_SENDER.assistant &&
      message.metadata?.replyToClientRequestId === validated.clientRequestId
    ) || null;
    return {
      userMessage,
      assistantMessage,
      plan: currentConversation.plan,
      conversation: currentConversation,
      repeated: true
    };
  }

  const courses = manageableCourses(user);
  const planning = await aiPlanningService.planConversation({
    content: validated.content,
    currentPlan: conversation.quizPlan,
    courses,
    userId: user.id
  });
  assertPlanCourseAccess(user, planning.plan);
  assertConversationCourseImmutable(conversation, planning.plan);
  assertSelectedMaterials(planning.plan);
  const savedPlan = aiConversationRepository.saveQuizPlan(conversation.id, planning.plan);
  if (!savedPlan) throw conflictError('quizPlan', 'The quiz plan changed in another request. Refresh and try again.');
  const title = buildConversationTitle(planning.plan, courses, conversation.title);
  aiConversationRepository.updateOwnedConversation(conversation.id, user.id, {
    courseId: planning.plan.courseId,
    title,
    status: planning.readinessStatus
  });
  const assistantMessageResult = aiConversationRepository.addOwnedMessage(conversation.id, user.id, {
    senderType: AI_MESSAGE_SENDER.assistant,
    senderUserId: null,
    content: planning.assistantResponse,
    messageType: planning.ready ? AI_MESSAGE_TYPE.planUpdate : AI_MESSAGE_TYPE.clarification,
    metadata: {
      quickReplies: planning.quickReplies,
      missingRequiredFields: planning.missingRequiredFields,
      readinessStatus: planning.readinessStatus,
      ...(validated.clientRequestId
        ? { replyToClientRequestId: validated.clientRequestId }
        : {})
    }
  });
  return {
    userMessage,
    assistantMessage: assistantMessageResult?.message || null,
    plan: serializePlan(savedPlan.plan),
    conversation: getConversation(conversation.id, user),
    repeated: false
  };
}

function updateQuizPlan(conversationId, input, user) {
  const conversation = requireOwnedConversation(conversationId, user);
  const rawPayload = input?.plan && typeof input.plan === 'object' ? input.plan : input;
  const payload = normalizePlanPatchAliases(rawPayload);
  const result = validateQuizPlanPatch(payload, conversation.quizPlan);
  assertPlanCourseAccess(user, result.plan);
  assertConversationCourseImmutable(conversation, result.plan);
  assertSelectedMaterials(result.plan);
  const expectedVersion = input?.expectedVersion;
  const saved = aiConversationRepository.saveQuizPlan(conversation.id, result.plan, {
    expectedVersion
  });
  if (!saved) {
    throw conflictError('quizPlan', 'The quiz plan changed in another tab. Refresh it before saving again.');
  }
  const courses = manageableCourses(user);
  aiConversationRepository.updateOwnedConversation(conversation.id, user.id, {
    courseId: result.plan.courseId,
    title: buildConversationTitle(result.plan, courses, conversation.title),
    status: result.readinessStatus
  });
  return getConversation(conversation.id, user);
}

async function generateDraft(conversationId, input, user) {
  const conversation = requireOwnedConversation(conversationId, user);
  const request = validateGenerationRequest({
    ...input,
    conversationId: conversation.id
  }, conversation.quizPlan);
  assertPlanCourseAccess(user, request.plan);
  assertSelectedMaterials(request.plan);
  const inputHash = hashPlan(request.plan);
  const active = recoverAbandonedGeneration(conversation, user);

  const existing = aiGenerationRepository.getGenerationRunByIdempotencyKey(
    conversation.id,
    request.idempotencyKey
  );
  if (existing) {
    assertMatchingGenerationReplay(existing, inputHash);
    return generationResult(conversation.id, existing, user, true);
  }
  if (active) {
    throw conflictError('generation', 'A quiz draft is already being generated for this conversation.');
  }

  const settings = aiQuizService.getSettingsStatus(user.id);
  const created = aiGenerationRepository.createGenerationRun({
    conversationId: conversation.id,
    requestedBy: user.id,
    idempotencyKey: request.idempotencyKey,
    inputHash,
    planSnapshot: request.plan,
    status: AI_GENERATION_STATUS.queued,
    progressStage: AI_GENERATION_STAGE.validatingPlan,
    deploymentName: settings.chatDeployment || '',
    metadata: { explicitTeacherAction: true }
  });
  if (!created.created) {
    if (created.conflict === 'active_generation') {
      throw conflictError('generation', 'A quiz draft is already being generated for this conversation.');
    }
    assertMatchingGenerationReplay(created.run, inputHash);
    return generationResult(conversation.id, created.run, user, true);
  }

  const state = aiGenerationManager.begin(conversation.id, user.id, created.run.id);
  let resultCommitted = false;
  try {
    aiGenerationRepository.markGenerationStarted(created.run.id, AI_GENERATION_STAGE.validatingPlan);
    const onStage = stage => {
      aiGenerationManager.updateStage(conversation.id, stage);
      aiGenerationRepository.updateGenerationProgress(created.run.id, stage);
    };
    const generated = await aiQuizService.generateQuizFromPlan(request.plan, {
      courseId: request.plan.courseId,
      conversationId: conversation.id,
      user,
      signal: state.controller.signal,
      onStage
    });
    aiGenerationManager.updateStage(conversation.id, AI_GENERATION_STAGE.validatingOutput);
    aiGenerationRepository.updateGenerationProgress(
      created.run.id,
      AI_GENERATION_STAGE.validatingOutput
    );
    const sources = buildGenerationSources(generated.draft, generated.contextChunks);
    aiGenerationManager.updateStage(conversation.id, AI_GENERATION_STAGE.savingDraft);
    aiGenerationRepository.updateGenerationProgress(
      created.run.id,
      AI_GENERATION_STAGE.savingDraft
    );
    const committed = aiGenerationRepository.commitGenerationResult(created.run.id, {
      courseId: request.plan.courseId,
      createdBy: user.id,
      draft: generated.draft,
      sources,
      conversationId: conversation.id,
      revisionType: AI_REVISION_TYPE.wholeQuizRevision,
      requestText: 'Initial AI quiz draft generation',
      metadata: {
        planVersion: conversation.planVersion,
        validationStatus: 'valid',
        draftOnly: true
      }
    });
    resultCommitted = true;
    safeAddAssistantMessage(conversation.id, user.id, {
      content: 'Your quiz draft is ready for review. Nothing has been published.',
      messageType: AI_MESSAGE_TYPE.status,
      metadata: {
        generationRunId: created.run.id,
        draftId: committed.draft.id,
        status: AI_CONVERSATION_STATUS.reviewRequired
      }
    });
    return {
      conversation: getConversation(conversation.id, user),
      draft: serializeDraft(committed.draft),
      generation: committed.run,
      repeated: false
    };
  } catch (error) {
    if (!resultCommitted) {
      if (state.controller.signal.aborted || error?.error === 'AI request cancelled') {
        aiGenerationRepository.markGenerationCancelled(created.run.id);
      } else {
        aiGenerationRepository.markGenerationFailed(created.run.id, safeGenerationError(error));
      }
    }
    throw error;
  } finally {
    aiGenerationManager.finish(conversation.id, created.run.id);
  }
}

function getGenerationStatus(conversationId, user) {
  const conversation = requireOwnedConversation(conversationId, user);
  recoverAbandonedGeneration(conversation, user);
  const runs = aiGenerationRepository.listOwnedGenerationRuns(
    conversation.id,
    user.id,
    { limit: 1 }
  ) || [];
  const run = runs[0] || null;
  const live = aiGenerationManager.get(conversation.id, user.id);
  return {
    conversationId: conversation.id,
    status: live ? AI_GENERATION_STATUS.generating : (run?.status || ''),
    progressStage: live?.stage || run?.progressStage || '',
    generation: run,
    canCancel: !!live || ['queued', 'generating'].includes(run?.status)
  };
}

function cancelGeneration(conversationId, user) {
  const conversation = requireOwnedConversation(conversationId, user);
  const active = aiGenerationRepository.getActiveGenerationRun(conversation.id);
  if (!active) throw notFoundError('No active generation was found for this conversation.');
  const live = aiGenerationManager.get(conversation.id, user.id);
  if (live && Number(live.runId) === Number(active.id)) {
    aiGenerationRepository.requestOwnedGenerationCancellation(active.id, user.id);
    aiGenerationManager.cancel(conversation.id, user.id);
  } else {
    aiGenerationRepository.markGenerationCancelled(active.id);
  }
  return {
    conversationId: conversation.id,
    generation: aiGenerationRepository.getOwnedGenerationRunById(active.id, user.id),
    cancellationRequested: true
  };
}

async function previewDraftRevision(conversationId, input, user) {
  const conversation = requireOwnedConversation(conversationId, user);
  const draftRecord = requireConversationDraft(conversation, user);
  const request = validateRevisionRequest({
    ...input,
    mode: 'preview',
    revisionType: input?.revisionType || AI_REVISION_TYPE.chatRevision
  }, { questionCount: draftRecord.draft.questions.length });
  const replay = getMatchingRevisionReplay(draftRecord, conversation, {
    idempotencyKey: request.idempotencyKey,
    revisionType: request.revisionType,
    requestText: request.instruction
  });
  if (replay) {
    return {
      revision: serializeRevision(replay),
      preview: replay.afterData,
      repeated: true
    };
  }
  const explicitPlanPatch = deriveExplicitRevisionPlanPatch(request.instruction);
  const revisionRequestPlan = Object.keys(explicitPlanPatch).length
    ? validateQuizPlanPatch(explicitPlanPatch, conversation.quizPlan).plan
    : conversation.quizPlan;
  assertConversationCourseImmutable(conversation, revisionRequestPlan);
  assertSelectedMaterials(revisionRequestPlan);
  const config = aiQuizService.getConfigForUser(user.id);
  const contextChunks = await retrievePlanContext(revisionRequestPlan, config);
  const revised = await aiQuizService.reviseQuizDraft(
    draftRecord.draft,
    request.instruction,
    revisionRequestPlan,
    contextChunks,
    config
  );
  const proposedPlan = deriveRevisionQuizPlan(
    conversation.quizPlan,
    revised,
    request.instruction
  );
  assertConversationCourseImmutable(conversation, proposedPlan);
  assertSelectedMaterials(proposedPlan);
  const created = aiRevisionRepository.createDraftRevision({
    draftId: draftRecord.id,
    conversationId: conversation.id,
    requestedBy: user.id,
    revisionType: request.revisionType,
    requestText: request.instruction,
    beforeData: draftRecord.draft,
    afterData: {
      ...revised,
      generation: {
        ...(draftRecord.draft.generation || {}),
        revisedAt: new Date().toISOString()
      }
    },
    metadata: {
      previewOnly: true,
      requiresConfirmation: true,
      changedQuestionCount: revised.questions.length - draftRecord.draft.questions.length,
      beforePlanVersion: conversation.planVersion,
      beforePlanSnapshot: conversation.quizPlan,
      proposedPlan
    },
    idempotencyKey: request.idempotencyKey
  });
  assertRevisionReplayMatches(created.revision, {
    conversationId: conversation.id,
    revisionType: request.revisionType,
    requestText: request.instruction
  });
  if (created.created) {
    safeAddAssistantMessage(conversation.id, user.id, {
      content: 'I prepared a revision preview. Review the changes and confirm before replacing the current draft.',
      messageType: AI_MESSAGE_TYPE.revision,
      metadata: { revisionId: created.revision.id, requiresConfirmation: true }
    });
  }
  return {
    revision: serializeRevision(created.revision),
    preview: created.revision.afterData,
    repeated: !created.created
  };
}

function applyDraftRevision(conversationId, revisionId, user) {
  const outcome = aiRevisionRepository.withTransaction(() => {
    const conversation = requireOwnedConversation(conversationId, user);
    const draftRecord = requireConversationDraft(conversation, user);
    const revision = aiRevisionRepository.getOwnedDraftRevisionById(Number(revisionId), user.id);
    if (
      !revision ||
      Number(revision.conversationId) !== Number(conversation.id) ||
      Number(revision.draftId) !== Number(draftRecord.id)
    ) {
      throw notFoundError('Draft revision not found.');
    }
    if (revision.appliedAt) {
      return { conversation, draft: draftRecord, revision, repeated: true };
    }
    assertRevisionPlanIsCurrent(conversation, revision);
    if (!isSameDraftSnapshot(draftRecord.draft, revision.beforeData)) {
      throw conflictError(
        'revision',
        'This revision preview is stale because the draft changed. Create a new preview.'
      );
    }
    const proposedPlan = deriveRevisionQuizPlan(
      conversation.quizPlan,
      revision.afterData,
      revision.requestText
    );
    if (!isSameDraftSnapshot(proposedPlan, revision.metadata.proposedPlan)) {
      throw conflictError(
        'quizPlan',
        'This revision preview has an invalid quiz-plan snapshot. Create a new preview.'
      );
    }
    assertConversationCourseImmutable(conversation, proposedPlan);
    assertSelectedMaterials(proposedPlan);
    const updated = aiQuizService.updateQuizDraft(draftRecord.id, revision.afterData, user);
    const savedPlan = aiConversationRepository.saveQuizPlan(
      conversation.id,
      proposedPlan,
      { expectedVersion: revision.metadata.beforePlanVersion }
    );
    if (!savedPlan) {
      throw conflictError(
        'quizPlan',
        'This revision preview is stale because the quiz plan changed. Create a new preview.'
      );
    }
    const applied = aiRevisionRepository.markOwnedDraftRevisionApplied(revision.id, user.id);
    if (!applied.applied) {
      throw conflictError('revision', 'This revision was already applied.');
    }
    aiConversationRepository.setOwnedConversationStatus(
      conversation.id,
      user.id,
      AI_CONVERSATION_STATUS.reviewRequired
    );
    return {
      conversation,
      draft: updated,
      revision: applied.revision,
      repeated: false
    };
  });
  if (!outcome.repeated) {
    safeAddAssistantMessage(outcome.conversation.id, user.id, {
      content: `Revision ${outcome.revision.revisionNumber} was applied to the draft. Review and save it when ready.`,
      messageType: AI_MESSAGE_TYPE.revision,
      metadata: { revisionId: outcome.revision.id, applied: true }
    });
  }
  return {
    draft: serializeDraft(outcome.draft),
    revision: serializeRevision(outcome.revision),
    conversation: getConversation(outcome.conversation.id, user),
    repeated: outcome.repeated
  };
}

async function regenerateQuestions(conversationId, input, user) {
  const conversation = requireOwnedConversation(conversationId, user);
  const draftRecord = requireConversationDraft(conversation, user);
  const request = validateRegenerationRequest({
    ...input,
    questionIndexes: input?.questionIndexes || input?.indexes
  }, { questionCount: draftRecord.draft.questions.length });
  const revisionType = request.questionIndexes.length === 1
    ? AI_REVISION_TYPE.regenerateQuestion
    : AI_REVISION_TYPE.regenerateSelected;
  const requestText = request.instruction || 'Regenerate selected questions';
  const replay = getMatchingRevisionReplay(draftRecord, conversation, {
    idempotencyKey: request.idempotencyKey,
    revisionType,
    requestText,
    questionIndexes: request.questionIndexes
  });
  if (replay) {
    return {
      draft: serializeDraft(draftRecord),
      revision: serializeRevision(replay, 'applied'),
      conversation: getConversation(conversation.id, user),
      repeated: true
    };
  }
  const config = aiQuizService.getConfigForUser(user.id);
  const contextChunks = await retrievePlanContext(conversation.quizPlan, config);
  const before = structuredClone(draftRecord.draft);
  const after = structuredClone(draftRecord.draft);
  for (const index of request.questionIndexes) {
    after.questions[index] = await aiQuizService.regenerateQuestion({
      question: after.questions[index],
      topic: conversation.quizPlan.topic,
      difficulty: conversation.quizPlan.difficulty,
      language: conversation.quizPlan.language,
      instruction: request.instruction,
      contextChunks
    }, config);
  }
  const outcome = aiRevisionRepository.withTransaction(() => {
    const concurrentReplay = getMatchingRevisionReplay(draftRecord, conversation, {
      idempotencyKey: request.idempotencyKey,
      revisionType,
      requestText,
      questionIndexes: request.questionIndexes
    });
    if (concurrentReplay) {
      return {
        updated: requireConversationDraft(requireOwnedConversation(conversation.id, user), user),
        revision: concurrentReplay,
        repeated: true
      };
    }
    const current = requireConversationDraft(requireOwnedConversation(conversation.id, user), user);
    if (!isSameDraftSnapshot(current.draft, before)) {
      throw conflictError(
        'draft',
        'The draft changed while questions were being regenerated. Retry against the latest draft.'
      );
    }
    const updated = aiQuizService.updateQuizDraft(current.id, after, user);
    const created = aiRevisionRepository.createDraftRevision({
      draftId: current.id,
      conversationId: conversation.id,
      requestedBy: user.id,
      revisionType,
      requestText,
      beforeData: before,
      afterData: updated.draft,
      metadata: { questionIndexes: request.questionIndexes },
      idempotencyKey: request.idempotencyKey,
      applied: true
    });
    assertRevisionReplayMatches(created.revision, {
      conversationId: conversation.id,
      revisionType,
      requestText,
      questionIndexes: request.questionIndexes
    });
    return { updated, revision: created.revision, repeated: !created.created };
  });
  if (!outcome.repeated) {
    safeAddAssistantMessage(conversation.id, user.id, {
      content: `${request.questionIndexes.length} selected question${request.questionIndexes.length === 1 ? '' : 's'} regenerated. Review the replacements before saving.`,
      messageType: AI_MESSAGE_TYPE.revision,
      metadata: { revisionId: outcome.revision.id, questionIndexes: request.questionIndexes }
    });
  }
  return {
    draft: serializeDraft(outcome.updated),
    revision: serializeRevision(outcome.revision, 'applied'),
    conversation: getConversation(conversation.id, user),
    repeated: outcome.repeated
  };
}

function saveReviewedDraft(conversationId, input, user) {
  return aiRevisionRepository.withTransaction(() => {
    const conversation = requireOwnedConversation(conversationId, user);
    if (!conversation.draftId) throw notFoundError('This conversation does not have a generated draft yet.');
    const existing = getOwnedDraft(conversation.draftId, user);
    if (!existing) throw notFoundError('AI quiz draft not found.');
    if (existing.status !== 'draft') throw conflictError('draft', 'Only draft AI quizzes can be edited.');
    const updated = aiQuizService.updateQuizDraft(existing.id, input, user);
    aiRevisionRepository.createDraftRevision({
      draftId: existing.id,
      conversationId: conversation.id,
      requestedBy: user.id,
      revisionType: AI_REVISION_TYPE.manualEdit,
      requestText: 'Manual review workspace save',
      beforeData: existing.draft,
      afterData: updated.draft,
      metadata: { savedAsDraft: true },
      applied: true
    });
    aiConversationRepository.setOwnedConversationStatus(
      conversation.id,
      user.id,
      AI_CONVERSATION_STATUS.draftSaved
    );
    return serializeDraft(updated);
  });
}

function requireOwnedConversation(conversationId, user) {
  const id = Number(conversationId);
  if (!Number.isSafeInteger(id) || id < 1) throw notFoundError('AI conversation not found.');
  const conversation = aiConversationRepository.getOwnedConversationById(id, user.id);
  if (!conversation) throw notFoundError('AI conversation not found.');
  if (conversation.courseId) assertCourseManager(user, conversation.courseId);
  return conversation;
}

function getOwnedDraft(draftId, user) {
  const draft = aiQuizDraftRepository.getById(draftId);
  if (!draft) return null;
  if (user.role !== 'admin' && Number(draft.createdBy) !== Number(user.id)) return null;
  return draft;
}

function requireConversationDraft(conversation, user) {
  if (!conversation.draftId) throw notFoundError('This conversation does not have a generated draft yet.');
  const draft = getOwnedDraft(conversation.draftId, user);
  if (!draft) throw notFoundError('AI quiz draft not found.');
  if (draft.status !== 'draft') throw conflictError('draft', 'Only draft AI quizzes can be revised.');
  return draft;
}

function manageableCourses(user) {
  return courseService.getAll(user).filter(course => canManageCourse(user, course.id));
}

function canManageCourse(user, courseId) {
  return enrollmentRepository.canManageCourse(user, Number(courseId));
}

function assertCourseManager(user, courseId) {
  if (!canManageCourse(user, courseId)) {
    const error = notFoundError('Course not found or unavailable for AI quiz generation.');
    error.status = 403;
    error.error = 'Access restricted';
    throw error;
  }
}

function assertPlanCourseAccess(user, plan) {
  if (plan.courseId) assertCourseManager(user, plan.courseId);
}

function assertConversationCourseImmutable(conversation, plan) {
  if (
    conversation.draftId &&
    Number(plan.courseId) !== Number(conversation.courseId)
  ) {
    throw conflictError(
      'courseId',
      'A conversation with a generated draft cannot move to another course. Start a new conversation instead.'
    );
  }
}

function assertSelectedMaterials(plan) {
  if (!plan.materialIds?.length) return;
  if (!plan.courseId) {
    throw validationError('materialIds', 'Choose a course before selecting indexed material.');
  }
  const allowed = new Set(aiMaterialRepository.listByCourse(plan.courseId).map(material => Number(material.id)));
  if (plan.materialIds.some(materialId => !allowed.has(Number(materialId)))) {
    throw validationError('materialIds', 'One or more selected materials do not belong to the chosen course.');
  }
}

function buildConversationTitle(plan, courses, currentTitle) {
  if (!plan.topic && (!currentTitle || currentTitle !== 'New quiz conversation')) return currentTitle;
  if (!plan.topic) return 'New quiz conversation';
  const course = courses.find(item => Number(item.id) === Number(plan.courseId));
  const prefix = course?.code ? `${course.code} – ` : '';
  return `${prefix}${plan.topic} Quiz`.slice(0, AI_LIMITS.conversationTitleMax);
}

function serializeConversationSummary(conversation) {
  return {
    id: conversation.id,
    title: conversation.title,
    status: conversation.status,
    courseId: conversation.courseId,
    draftId: conversation.draftId,
    plan: serializePlan(conversation.quizPlan),
    planVersion: conversation.planVersion,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    lastMessageAt: conversation.lastMessageAt
  };
}

function serializeConversationDetail(conversation, related) {
  const generationRuns = aiGenerationRepository.listOwnedGenerationRuns(
    conversation.id,
    conversation.ownerUserId,
    { limit: 1 }
  ) || [];
  const generation = generationRuns[0] || null;
  const revisions = aiRevisionRepository.listOwnedConversationRevisions(
    conversation.id,
    conversation.ownerUserId,
    { limit: 20 }
  ) || [];
  return {
    ...serializeConversationSummary(conversation),
    messages: related.messages,
    suggestedReplies: related.suggestedReplies || [],
    draft: serializeDraft(related.draft),
    generation: generation
      ? {
          ...generation,
          sources: aiGenerationRepository.listOwnedGenerationSources(
            generation.id,
            conversation.ownerUserId
          ) || []
        }
      : null,
    revisions: revisions.map(revision => serializeRevision(revision))
  };
}

function serializePlan(plan = {}) {
  const materialMode = plan.materialMode || AI_MATERIAL_MODE.generalModelKnowledgeAllowed;
  const materialScope = materialMode === AI_MATERIAL_MODE.courseMaterialOnly
    ? 'course_material_only'
    : materialMode === AI_MATERIAL_MODE.courseMaterialPreferred
      ? 'course_material_preferred'
      : 'general_knowledge_allowed';
  return { ...plan, materialMode, materialScope };
}

function normalizePlanPatchAliases(input = {}) {
  const payload = { ...input };
  if (Object.prototype.hasOwnProperty.call(payload, 'materialScope')) {
    const aliases = {
      course_material_only: AI_MATERIAL_MODE.courseMaterialOnly,
      only: AI_MATERIAL_MODE.courseMaterialOnly,
      course_material_preferred: AI_MATERIAL_MODE.courseMaterialPreferred,
      preferred: AI_MATERIAL_MODE.courseMaterialPreferred,
      general_knowledge_allowed: AI_MATERIAL_MODE.generalModelKnowledgeAllowed,
      general: AI_MATERIAL_MODE.generalModelKnowledgeAllowed
    };
    payload.materialMode = aliases[payload.materialScope] || payload.materialScope;
    delete payload.materialScope;
  }
  return payload;
}

function deriveRevisionQuizPlan(currentPlan, revisedDraft, instruction) {
  const questionTypeDistribution = {
    multipleChoice: 0,
    trueFalse: 0,
    shortAnswer: 0,
    essay: 0,
    coding: 0
  };
  const typeKeys = {
    multiple_choice: 'multipleChoice',
    true_false: 'trueFalse',
    short_answer: 'shortAnswer',
    essay: 'essay',
    coding: 'coding'
  };
  for (const question of revisedDraft.questions || []) {
    const key = typeKeys[question.type];
    if (!key) {
      throw validationError('questions', 'The revised draft contains an unsupported question type.');
    }
    questionTypeDistribution[key] += 1;
  }

  const patch = {
    difficulty: revisedDraft.difficulty,
    questionCount: (revisedDraft.questions || []).length,
    questionTypeDistribution,
    ...deriveExplicitRevisionPlanPatch(instruction)
  };
  const proposedPlan = validateQuizPlanPatch(patch, currentPlan).plan;
  if (Number(proposedPlan.courseId) !== Number(currentPlan.courseId)) {
    throw conflictError(
      'courseId',
      'A revision cannot move an existing draft to another course.'
    );
  }
  return proposedPlan;
}

function deriveExplicitRevisionPlanPatch(instruction) {
  const text = String(instruction || '').replace(/\s+/g, ' ').trim();
  const patch = {};
  const language = explicitlyRequestedLanguage(text);
  if (language) patch.language = language;

  if (
    /\b(?:prefer|prioriti[sz]e|favor)\s+(?:the\s+)?(?:course|uploaded|selected|indexed)\s+materials?\b/i.test(text) ||
    /\b(?:course|uploaded|selected|indexed)\s+materials?\s+(?:are\s+)?preferred\b/i.test(text)
  ) {
    patch.materialMode = AI_MATERIAL_MODE.courseMaterialPreferred;
  } else if (
    /\b(?:use|rely on|draw from)\s+(?:only|solely|exclusively)\s+(?:the\s+)?(?:course|uploaded|selected|indexed)\s+materials?\b/i.test(text) ||
    /\b(?:course|uploaded|selected|indexed)\s+materials?\s+only\b/i.test(text) ||
    /\b(?:no|without)\s+(?:outside|external|general|model)\s+(?:model\s+)?knowledge\b/i.test(text)
  ) {
    patch.materialMode = AI_MATERIAL_MODE.courseMaterialOnly;
  } else if (
    /\b(?:allow|use|include)\s+(?:outside|external|general|model)\s+(?:model\s+)?knowledge\b/i.test(text) ||
    /\b(?:general|model)\s+(?:model\s+)?knowledge\s+(?:is\s+)?allowed\b/i.test(text) ||
    /\b(?:course|uploaded|selected|indexed)\s+materials?\s+(?:are\s+)?optional\b/i.test(text)
  ) {
    patch.materialMode = AI_MATERIAL_MODE.generalModelKnowledgeAllowed;
  }

  if (
    /\b(?:do not|don't)\s+(?:remove|omit|exclude|delete)\s+(?:the\s+|all\s+|any\s+)?(?:answer\s+)?(?:explanations?|rationales?)\b/i.test(text) ||
    /\b(?:keep|retain|include|add|provide)\s+(?:the\s+|all\s+|answer\s+)?(?:explanations?|rationales?)\b/i.test(text) ||
    /\bwith\s+(?:answer\s+)?(?:explanations?|rationales?)\b/i.test(text)
  ) {
    patch.includeExplanations = true;
  } else if (
    /\b(?:do not|don't)\s+(?:include|add|provide|keep)\s+(?:the\s+|any\s+|answer\s+)?(?:explanations?|rationales?)\b/i.test(text) ||
    /\b(?:remove|omit|exclude|delete)\s+(?:the\s+|all\s+|any\s+|answer\s+)?(?:explanations?|rationales?)\b/i.test(text) ||
    /\b(?:no|without)\s+(?:answer\s+)?(?:explanations?|rationales?)\b/i.test(text)
  ) {
    patch.includeExplanations = false;
  }

  return patch;
}

function explicitlyRequestedLanguage(instruction) {
  const languages = [
    'Arabic', 'Chinese', 'Czech', 'Danish', 'Dutch', 'English', 'Finnish',
    'French', 'German', 'Greek', 'Hebrew', 'Hindi', 'Indonesian', 'Italian',
    'Japanese', 'Korean', 'Norwegian', 'Persian', 'Polish', 'Portuguese',
    'Romanian', 'Russian', 'Spanish', 'Swedish', 'Thai', 'Turkish',
    'Ukrainian', 'Urdu', 'Vietnamese'
  ];
  const alternatives = languages.join('|');
  const patterns = [
    new RegExp(`\\btranslate(?:\\s+(?:the\\s+)?(?:quiz|draft|questions?))?\\s+(?:to|into)\\s+(${alternatives})\\b`, 'i'),
    new RegExp(`\\b(?:change|set|switch)\\s+(?:the\\s+)?language\\s+(?:to|into)\\s+(${alternatives})\\b`, 'i'),
    new RegExp(`\\b(?:write|rewrite|present|provide)\\s+(?:the\\s+)?(?:quiz|draft|questions?)\\s+in\\s+(${alternatives})\\b`, 'i')
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(instruction);
    if (match) {
      return languages.find(language => language.toLowerCase() === match[1].toLowerCase()) || '';
    }
  }
  return '';
}

function assertRevisionPlanIsCurrent(conversation, revision) {
  const metadata = revision.metadata || {};
  const beforePlanVersion = Number(metadata.beforePlanVersion);
  if (
    !Number.isSafeInteger(beforePlanVersion) ||
    !metadata.beforePlanSnapshot ||
    !metadata.proposedPlan
  ) {
    throw conflictError(
      'quizPlan',
      'This revision preview predates quiz-plan safeguards. Create a new preview.'
    );
  }
  if (
    Number(conversation.planVersion) !== beforePlanVersion ||
    !isSameDraftSnapshot(conversation.quizPlan, metadata.beforePlanSnapshot)
  ) {
    throw conflictError(
      'quizPlan',
      'This revision preview is stale because the quiz plan changed. Create a new preview.'
    );
  }
}

function generationResult(conversationId, run, user, repeated) {
  const draft = run.draftId ? getOwnedDraft(run.draftId, user) : null;
  return {
    conversation: getConversation(conversationId, user),
    draft: serializeDraft(draft),
    generation: run,
    repeated
  };
}

function serializeDraft(record) {
  if (!record) return null;
  return {
    id: record.id,
    courseId: record.courseId,
    createdBy: record.createdBy,
    status: record.status,
    quizId: record.quizId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    ...record.draft,
    draft: record.draft
  };
}

function serializeRevision(revision, status = '') {
  if (!revision) return null;
  return {
    ...revision,
    status: status || (revision.appliedAt || revision.metadata?.applied ? 'applied' : 'preview'),
    beforeSnapshot: revision.beforeData,
    proposedSnapshot: revision.afterData
  };
}

function buildGenerationSources(draft, chunks) {
  const chunksById = new Map(chunks.map(chunk => [Number(chunk.id), chunk]));
  const sources = [];
  (draft.questions || []).forEach((question, questionIndex) => {
    (question.sourceReferences || []).forEach(reference => {
      const chunk = chunksById.get(Number(reference.chunkId));
      if (!chunk) return;
      sources.push({
        questionIndex,
        materialId: chunk.materialId,
        chunkId: chunk.id,
        sourceLabel: reference.label || chunk.sourceLabel,
        excerpt: chunk.content,
        relevanceScore: chunk.score,
        metadata: { validationStatus: 'verified' }
      });
    });
  });
  return sources;
}

async function retrievePlanContext(plan, config) {
  if (plan.materialMode === AI_MATERIAL_MODE.generalModelKnowledgeAllowed) return [];
  const chunks = await ragService.retrieveRelevantChunks(
    plan.courseId,
    [plan.topic, ...(plan.learningObjectives || [])].filter(Boolean).join(' '),
    config,
    8,
    plan.materialIds
  );
  if (plan.materialMode === AI_MATERIAL_MODE.courseMaterialOnly && !chunks.length) {
    throw validationError('materialMode', 'No indexed course material is available for this revision.');
  }
  return chunks;
}

function hashPlan(plan) {
  return crypto.createHash('sha256').update(JSON.stringify(plan)).digest('hex');
}

function isSameDraftSnapshot(left, right) {
  return stableJson(left) === stableJson(right);
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key =>
      `${JSON.stringify(key)}:${stableJson(value[key])}`
    ).join(',')}}`;
  }
  return JSON.stringify(value);
}

function getMatchingRevisionReplay(draftRecord, conversation, expected) {
  if (!expected.idempotencyKey) return null;
  const existing = aiRevisionRepository.getRevisionByIdempotencyKey(
    draftRecord.id,
    expected.idempotencyKey
  );
  if (!existing) return null;
  assertRevisionReplayMatches(existing, {
    ...expected,
    conversationId: conversation.id
  });
  return existing;
}

function assertRevisionReplayMatches(revision, expected) {
  if (!revision) {
    throw conflictError(
      'idempotencyKey',
      'This idempotency key could not be matched to a revision request.'
    );
  }
  const sameIndexes = expected.questionIndexes === undefined ||
    isDeepStrictEqual(
      [...(revision.metadata?.questionIndexes || [])].map(Number).sort((a, b) => a - b),
      [...expected.questionIndexes].map(Number).sort((a, b) => a - b)
    );
  if (
    Number(revision.conversationId) !== Number(expected.conversationId) ||
    revision.revisionType !== expected.revisionType ||
    revision.requestText !== expected.requestText ||
    !sameIndexes
  ) {
    throw conflictError(
      'idempotencyKey',
      'This idempotency key was already used for a different revision request.'
    );
  }
}

function assertMatchingGenerationReplay(run, inputHash) {
  if (run?.inputHash && run.inputHash !== inputHash) {
    throw conflictError(
      'idempotencyKey',
      'This idempotency key was already used with a different quiz plan.'
    );
  }
}

function recoverAbandonedGeneration(conversation, user) {
  const active = aiGenerationRepository.getActiveGenerationRun(conversation.id);
  if (!active) return null;
  const live = aiGenerationManager.get(conversation.id, user.id);
  if (live && Number(live.runId) === Number(active.id)) return active;
  if (active.status === AI_GENERATION_STATUS.cancelRequested) {
    aiGenerationRepository.markGenerationCancelled(active.id);
  } else {
    aiGenerationRepository.markGenerationFailed(active.id, {
      errorCode: 'GENERATION_INTERRUPTED',
      errorMessage: 'The previous generation was interrupted before it completed. Generate the draft again.'
    });
  }
  return null;
}

function safeGenerationError(error) {
  const message = error instanceof AppError
    ? error.message
    : 'Quiz generation failed before a valid draft could be saved.';
  return {
    errorCode: String(error?.code || error?.error || 'GENERATION_FAILED')
      .replace(/[^A-Za-z0-9_-]/g, '_')
      .slice(0, 120),
    errorMessage: String(message || 'Quiz generation failed.')
      .replace(/https?:\/\/\S+/gi, '[redacted endpoint]')
      .replace(/\b[A-Za-z0-9_-]{24,}\b/g, '[redacted]')
      .slice(0, AI_LIMITS.providerErrorMessageMax)
  };
}

function safeAddAssistantMessage(conversationId, ownerUserId, message) {
  try {
    return aiConversationRepository.addOwnedMessage(conversationId, ownerUserId, {
      senderType: AI_MESSAGE_SENDER.assistant,
      senderUserId: null,
      content: message.content,
      messageType: message.messageType || AI_MESSAGE_TYPE.status,
      metadata: message.metadata || {}
    });
  } catch (error) {
    return null;
  }
}

module.exports = {
  INITIAL_GREETING,
  addMessage,
  applyDraftRevision,
  cancelGeneration,
  createConversation,
  generateDraft,
  getGenerationStatus,
  getConversation,
  listConversations,
  previewDraftRevision,
  regenerateQuestions,
  requireOwnedConversation,
  saveReviewedDraft,
  serializePlan,
  updateQuizPlan
};
