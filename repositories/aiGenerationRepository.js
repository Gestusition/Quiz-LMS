const { getDatabase } = require('../database/db');
const {
  AI_CONVERSATION_STATUS,
  AI_GENERATION_STAGES,
  AI_GENERATION_STATUS,
  AI_GENERATION_STATUSES
} = require('../constants/ai');

function createGenerationRun(data) {
  const status = data.status || AI_GENERATION_STATUS.queued;
  assertGenerationStatus(status);
  const db = getDatabase();
  const result = db.prepare(`
    INSERT OR IGNORE INTO ai_generation_runs (
      conversationId, requestedBy, idempotencyKey, inputHash, planSnapshotJson,
      status, progressStage, deploymentName, metadataJson
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.conversationId,
    data.requestedBy,
    data.idempotencyKey,
    data.inputHash || '',
    JSON.stringify(data.planSnapshot || {}),
    status,
    data.progressStage || '',
    data.deploymentName || '',
    JSON.stringify(data.metadata || {})
  );
  const run = result.changes
    ? getGenerationRunById(Number(result.lastInsertRowid))
    : getGenerationRunByIdempotencyKey(data.conversationId, data.idempotencyKey);
  if (run) return { run, created: !!result.changes, conflict: '' };
  return {
    run: getActiveGenerationRun(data.conversationId),
    created: false,
    conflict: 'active_generation'
  };
}

function getGenerationRunById(id) {
  return deserializeRun(getDatabase().prepare(`
    SELECT * FROM ai_generation_runs WHERE id = ?
  `).get(id));
}

function getOwnedGenerationRunById(id, ownerUserId) {
  return deserializeRun(getDatabase().prepare(`
    SELECT r.*
    FROM ai_generation_runs r
    JOIN ai_conversations c ON c.id = r.conversationId
    WHERE r.id = ? AND c.ownerUserId = ?
  `).get(id, ownerUserId));
}

function getGenerationRunByIdempotencyKey(conversationId, idempotencyKey) {
  return deserializeRun(getDatabase().prepare(`
    SELECT * FROM ai_generation_runs
    WHERE conversationId = ? AND idempotencyKey = ?
  `).get(conversationId, idempotencyKey));
}

function getActiveGenerationRun(conversationId) {
  return deserializeRun(getDatabase().prepare(`
    SELECT * FROM ai_generation_runs
    WHERE conversationId = ?
      AND status IN ('queued', 'generating', 'cancel_requested')
    ORDER BY id DESC LIMIT 1
  `).get(conversationId));
}

function listGenerationRuns(conversationId, options = {}) {
  const limit = safeLimit(options.limit, 20, 100);
  const beforeId = options.beforeId ? Number(options.beforeId) : null;
  const rows = beforeId
    ? getDatabase().prepare(`
        SELECT * FROM ai_generation_runs
        WHERE conversationId = ? AND id < ?
        ORDER BY id DESC LIMIT ?
      `).all(conversationId, beforeId, limit)
    : getDatabase().prepare(`
        SELECT * FROM ai_generation_runs
        WHERE conversationId = ?
        ORDER BY id DESC LIMIT ?
      `).all(conversationId, limit);
  return rows.map(deserializeRun);
}

function listOwnedGenerationRuns(conversationId, ownerUserId, options = {}) {
  const owner = getDatabase().prepare(`
    SELECT id FROM ai_conversations WHERE id = ? AND ownerUserId = ?
  `).get(conversationId, ownerUserId);
  return owner ? listGenerationRuns(conversationId, options) : null;
}

function markGenerationStarted(id, progressStage = '') {
  if (progressStage) assertGenerationStage(progressStage);
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION');
  try {
    const result = db.prepare(`
      UPDATE ai_generation_runs
      SET status = 'generating',
        progressStage = ?,
        startedAt = CASE WHEN TRIM(startedAt) = '' THEN datetime('now') ELSE startedAt END,
        updatedAt = datetime('now')
      WHERE id = ? AND status = 'queued'
    `).run(progressStage, id);
    if (result.changes) {
      db.prepare(`
        UPDATE ai_conversations
        SET status = 'generating', updatedAt = datetime('now')
        WHERE id = (SELECT conversationId FROM ai_generation_runs WHERE id = ?)
      `).run(id);
    }
    db.exec('COMMIT');
    return getGenerationRunById(id);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function updateGenerationProgress(id, progressStage, metadata = null) {
  assertGenerationStage(progressStage);
  if (metadata === null || metadata === undefined) {
    getDatabase().prepare(`
      UPDATE ai_generation_runs
      SET progressStage = ?, updatedAt = datetime('now')
      WHERE id = ? AND status IN ('queued', 'generating', 'cancel_requested')
    `).run(progressStage, id);
  } else {
    getDatabase().prepare(`
      UPDATE ai_generation_runs
      SET progressStage = ?, metadataJson = ?, updatedAt = datetime('now')
      WHERE id = ? AND status IN ('queued', 'generating', 'cancel_requested')
    `).run(progressStage, JSON.stringify(metadata), id);
  }
  return getGenerationRunById(id);
}

function markGenerationCompleted(id, draftId, metadata = null) {
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION');
  try {
    const result = db.prepare(`
      UPDATE ai_generation_runs
      SET status = 'completed',
        progressStage = 'opening_review_workspace',
        draftId = ?,
        metadataJson = CASE WHEN ? IS NULL THEN metadataJson ELSE ? END,
        errorCode = '',
        errorMessage = '',
        completedAt = datetime('now'),
        updatedAt = datetime('now')
      WHERE id = ? AND status IN ('queued', 'generating')
    `).run(
      draftId,
      metadata === null || metadata === undefined ? null : 1,
      metadata === null || metadata === undefined ? null : JSON.stringify(metadata),
      id
    );
    if (result.changes) {
      db.prepare(`
        UPDATE ai_conversations
        SET status = 'review_required', draftId = ?, updatedAt = datetime('now')
        WHERE id = (SELECT conversationId FROM ai_generation_runs WHERE id = ?)
      `).run(draftId, id);
    }
    db.exec('COMMIT');
    return getGenerationRunById(id);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function markGenerationFailed(id, errorData = {}) {
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION');
  try {
    const result = db.prepare(`
      UPDATE ai_generation_runs
      SET status = 'failed',
        errorCode = ?,
        errorMessage = ?,
        completedAt = datetime('now'),
        updatedAt = datetime('now')
      WHERE id = ? AND status IN ('queued', 'generating', 'cancel_requested')
    `).run(
      String(errorData.errorCode || '').slice(0, 120),
      String(errorData.errorMessage || '').slice(0, 1000),
      id
    );
    if (result.changes) {
      db.prepare(`
        UPDATE ai_conversations
        SET status = 'generation_failed', updatedAt = datetime('now')
        WHERE id = (SELECT conversationId FROM ai_generation_runs WHERE id = ?)
      `).run(id);
    }
    db.exec('COMMIT');
    return getGenerationRunById(id);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function requestGenerationCancellation(id, requestedBy) {
  getDatabase().prepare(`
    UPDATE ai_generation_runs
    SET status = 'cancel_requested',
      cancellationRequestedBy = ?,
      cancellationRequestedAt = datetime('now'),
      updatedAt = datetime('now')
    WHERE id = ? AND status IN ('queued', 'generating')
  `).run(requestedBy || null, id);
  return getGenerationRunById(id);
}

function requestOwnedGenerationCancellation(id, ownerUserId) {
  getDatabase().prepare(`
    UPDATE ai_generation_runs
    SET status = 'cancel_requested',
      cancellationRequestedBy = ?,
      cancellationRequestedAt = datetime('now'),
      updatedAt = datetime('now')
    WHERE id = ?
      AND status IN ('queued', 'generating')
      AND conversationId IN (
        SELECT id FROM ai_conversations WHERE ownerUserId = ?
      )
  `).run(ownerUserId, id, ownerUserId);
  return getOwnedGenerationRunById(id, ownerUserId);
}

function markGenerationCancelled(id) {
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION');
  try {
    const result = db.prepare(`
      UPDATE ai_generation_runs
      SET status = 'cancelled',
        completedAt = datetime('now'),
        updatedAt = datetime('now')
      WHERE id = ? AND status IN ('queued', 'generating', 'cancel_requested')
    `).run(id);
    if (result.changes) {
      db.prepare(`
        UPDATE ai_conversations
        SET status = COALESCE(
          (SELECT readinessStatus FROM ai_quiz_plans
           WHERE conversationId = ai_conversations.id),
          'gathering_requirements'
        ),
        updatedAt = datetime('now')
        WHERE id = (SELECT conversationId FROM ai_generation_runs WHERE id = ?)
      `).run(id);
    }
    db.exec('COMMIT');
    return getGenerationRunById(id);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function commitGenerationResult(runId, resultData) {
  const db = getDatabase();
  const existingRunRow = db.prepare(`
    SELECT * FROM ai_generation_runs WHERE id = ?
  `).get(runId);
  if (!existingRunRow) throw new Error('AI generation run not found.');
  if (existingRunRow.status === AI_GENERATION_STATUS.completed && existingRunRow.draftId) {
    return readCommittedGenerationResult(db, existingRunRow);
  }
  if (![AI_GENERATION_STATUS.queued, AI_GENERATION_STATUS.generating].includes(existingRunRow.status)) {
    throw new Error('AI generation run is not in a committable state.');
  }
  if (Number(existingRunRow.requestedBy) !== Number(resultData.createdBy)) {
    throw new Error('AI generation requester does not match the draft owner.');
  }

  const conversationId = Number(resultData.conversationId || existingRunRow.conversationId);
  if (conversationId !== Number(existingRunRow.conversationId)) {
    throw new Error('AI generation conversation does not match the run.');
  }
  const conversation = db.prepare(`
    SELECT id, ownerUserId, courseId FROM ai_conversations WHERE id = ?
  `).get(conversationId);
  if (!conversation || Number(conversation.ownerUserId) !== Number(resultData.createdBy)) {
    throw new Error('AI generation conversation ownership mismatch.');
  }
  if (conversation.courseId && Number(conversation.courseId) !== Number(resultData.courseId)) {
    throw new Error('AI generation course does not match the conversation.');
  }
  const revisionType = resultData.revisionType || 'initial_generation';
  const allowedInitialRevisionTypes = ['initial_generation', 'whole_quiz_revision'];
  if (!allowedInitialRevisionTypes.includes(revisionType)) {
    throw new Error('Invalid initial AI draft revision type.');
  }
  const sources = Array.isArray(resultData.sources) ? resultData.sources : [];
  const questionCount = Array.isArray(resultData.draft?.questions)
    ? resultData.draft.questions.length
    : null;
  assertGenerationSourcesBelongToCourse(db, sources, resultData.courseId, questionCount);

  db.exec('BEGIN TRANSACTION');
  try {
    const draftJson = JSON.stringify(resultData.draft);
    const draftInsert = db.prepare(`
      INSERT INTO ai_quiz_drafts (courseId, createdBy, dataJson, status)
      VALUES (?, ?, ?, 'draft')
    `).run(resultData.courseId, resultData.createdBy, draftJson);
    const draftId = Number(draftInsert.lastInsertRowid);

    db.prepare('DELETE FROM ai_generation_sources WHERE generationRunId = ?').run(runId);
    insertGenerationSources(db, runId, sources);

    const revisionInsert = db.prepare(`
      INSERT INTO ai_draft_revisions (
        draftId, conversationId, generationRunId, revisionNumber, requestedBy,
        revisionType, requestText, beforeDataJson, afterDataJson, metadataJson,
        idempotencyKey
      ) VALUES (?, ?, ?, 1, ?, ?, ?, '{}', ?, ?, ?)
    `).run(
      draftId,
      conversationId,
      runId,
      resultData.createdBy,
      revisionType,
      String(resultData.requestText || '').slice(0, 8000),
      draftJson,
      JSON.stringify(resultData.metadata || {}),
      `${existingRunRow.idempotencyKey}:initial`
    );
    const revisionId = Number(revisionInsert.lastInsertRowid);

    const runUpdate = db.prepare(`
      UPDATE ai_generation_runs
      SET status = 'completed',
        progressStage = 'opening_review_workspace',
        draftId = ?,
        metadataJson = ?,
        errorCode = '',
        errorMessage = '',
        startedAt = CASE WHEN TRIM(startedAt) = '' THEN datetime('now') ELSE startedAt END,
        completedAt = datetime('now'),
        updatedAt = datetime('now')
      WHERE id = ? AND status IN ('queued', 'generating')
    `).run(draftId, JSON.stringify(resultData.metadata || {}), runId);
    if (!runUpdate.changes) throw new Error('AI generation run changed before its result could be committed.');

    const conversationUpdate = db.prepare(`
      UPDATE ai_conversations
      SET courseId = COALESCE(courseId, ?),
        draftId = ?,
        status = 'review_required',
        updatedAt = datetime('now')
      WHERE id = ? AND ownerUserId = ?
    `).run(resultData.courseId, draftId, conversationId, resultData.createdBy);
    if (!conversationUpdate.changes) throw new Error('AI conversation changed before its draft could be committed.');

    db.exec('COMMIT');
    return {
      run: getGenerationRunById(runId),
      draft: deserializeCommittedDraft(db.prepare(`
        SELECT * FROM ai_quiz_drafts WHERE id = ?
      `).get(draftId)),
      revision: deserializeCommittedRevision(db.prepare(`
        SELECT * FROM ai_draft_revisions WHERE id = ?
      `).get(revisionId)),
      sources: listGenerationSources(runId)
    };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function updateGenerationRun(id, patch = {}) {
  const assignments = [];
  const params = [];
  if (Object.prototype.hasOwnProperty.call(patch, 'status')) {
    assertGenerationStatus(patch.status);
    assignments.push('status = ?');
    params.push(patch.status);
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'progressStage')) {
    if (patch.progressStage) assertGenerationStage(patch.progressStage);
    assignments.push('progressStage = ?');
    params.push(patch.progressStage || '');
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'draftId')) {
    assignments.push('draftId = ?');
    params.push(patch.draftId || null);
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'providerRequestId')) {
    assignments.push('providerRequestId = ?');
    params.push(String(patch.providerRequestId || '').slice(0, 255));
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'metadata')) {
    assignments.push('metadataJson = ?');
    params.push(JSON.stringify(patch.metadata || {}));
  }
  if (!assignments.length) return getGenerationRunById(id);
  assignments.push("updatedAt = datetime('now')");
  params.push(id);
  getDatabase().prepare(`
    UPDATE ai_generation_runs SET ${assignments.join(', ')} WHERE id = ?
  `).run(...params);
  return getGenerationRunById(id);
}

function replaceGenerationSources(generationRunId, sources = []) {
  const db = getDatabase();
  const courseId = generationCourseId(db, generationRunId);
  assertGenerationSourcesBelongToCourse(db, sources, courseId);
  db.exec('BEGIN TRANSACTION');
  try {
    db.prepare('DELETE FROM ai_generation_sources WHERE generationRunId = ?').run(generationRunId);
    insertGenerationSources(db, generationRunId, sources);
    db.exec('COMMIT');
    return listGenerationSources(generationRunId);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function addGenerationSources(generationRunId, sources = []) {
  const db = getDatabase();
  const courseId = generationCourseId(db, generationRunId);
  assertGenerationSourcesBelongToCourse(db, sources, courseId);
  db.exec('BEGIN TRANSACTION');
  try {
    insertGenerationSources(db, generationRunId, sources);
    db.exec('COMMIT');
    return listGenerationSources(generationRunId);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function listGenerationSources(generationRunId, options = {}) {
  const params = [generationRunId];
  let questionClause = '';
  if (options.questionIndex !== undefined && options.questionIndex !== null) {
    questionClause = 'AND questionIndex = ?';
    params.push(Number(options.questionIndex));
  }
  return getDatabase().prepare(`
    SELECT * FROM ai_generation_sources
    WHERE generationRunId = ? ${questionClause}
    ORDER BY CASE WHEN questionIndex IS NULL THEN -1 ELSE questionIndex END ASC, id ASC
  `).all(...params).map(deserializeSource);
}

function listOwnedGenerationSources(generationRunId, ownerUserId, options = {}) {
  if (!getOwnedGenerationRunById(generationRunId, ownerUserId)) return null;
  return listGenerationSources(generationRunId, options);
}

function deleteGenerationSources(generationRunId) {
  return getDatabase().prepare(`
    DELETE FROM ai_generation_sources WHERE generationRunId = ?
  `).run(generationRunId);
}

function insertGenerationSources(db, generationRunId, sources) {
  const statement = db.prepare(`
    INSERT OR IGNORE INTO ai_generation_sources (
      generationRunId, questionIndex, materialId, chunkId, sourceLabel,
      excerpt, relevanceScore, metadataJson
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  sources.forEach(source => {
    statement.run(
      generationRunId,
      source.questionIndex === undefined ? null : source.questionIndex,
      source.materialId || null,
      source.chunkId,
      String(source.sourceLabel || '').slice(0, 500),
      String(source.excerpt || '').slice(0, 8000),
      Number.isFinite(Number(source.relevanceScore)) ? Number(source.relevanceScore) : null,
      JSON.stringify(source.metadata || {})
    );
  });
}

function assertGenerationSourcesBelongToCourse(db, sources, courseId, questionCount = null) {
  if (!Number.isSafeInteger(Number(courseId)) || Number(courseId) < 1) {
    throw new Error('AI generation source course is invalid.');
  }
  const seen = new Set();
  sources.forEach((source, index) => {
    const chunkId = Number(source.chunkId);
    if (!Number.isSafeInteger(chunkId) || chunkId < 1) {
      throw new Error(`AI generation source ${index + 1} has an invalid chunk ID.`);
    }
    const questionIndex = source.questionIndex;
    if (questionIndex !== undefined && questionIndex !== null &&
        (!Number.isSafeInteger(Number(questionIndex)) || Number(questionIndex) < 0)) {
      throw new Error(`AI generation source ${index + 1} has an invalid question index.`);
    }
    if (questionIndex !== undefined && questionIndex !== null &&
        questionCount !== null && Number(questionIndex) >= questionCount) {
      throw new Error(`AI generation source ${index + 1} references a missing draft question.`);
    }
    const uniqueKey = `${questionIndex === undefined || questionIndex === null ? -1 : Number(questionIndex)}:${chunkId}`;
    if (seen.has(uniqueKey)) throw new Error('AI generation sources must not contain duplicates.');
    seen.add(uniqueKey);
    const chunk = db.prepare(`
      SELECT id, materialId, courseId
      FROM ai_material_chunks
      WHERE id = ? AND courseId = ?
    `).get(chunkId, courseId);
    if (!chunk) throw new Error('AI generation source does not belong to the selected course.');
    if (source.materialId && Number(source.materialId) !== Number(chunk.materialId)) {
      throw new Error('AI generation source material does not match its chunk.');
    }
    source.materialId = chunk.materialId;
  });
}

function generationCourseId(db, generationRunId) {
  const row = db.prepare(`
    SELECT c.courseId
    FROM ai_generation_runs r
    JOIN ai_conversations c ON c.id = r.conversationId
    WHERE r.id = ?
  `).get(generationRunId);
  if (!row || !row.courseId) throw new Error('AI generation run does not have a selected course.');
  return Number(row.courseId);
}

function readCommittedGenerationResult(db, runRow) {
  const draftRow = db.prepare('SELECT * FROM ai_quiz_drafts WHERE id = ?').get(runRow.draftId);
  const revisionRow = db.prepare(`
    SELECT * FROM ai_draft_revisions
    WHERE generationRunId = ? AND draftId = ?
    ORDER BY revisionNumber ASC LIMIT 1
  `).get(runRow.id, runRow.draftId);
  return {
    run: deserializeRun(runRow),
    draft: deserializeCommittedDraft(draftRow),
    revision: deserializeCommittedRevision(revisionRow),
    sources: listGenerationSources(runRow.id)
  };
}

function deserializeCommittedDraft(row) {
  if (!row) return null;
  return {
    ...row,
    draft: parseJson(row.dataJson, {})
  };
}

function deserializeCommittedRevision(row) {
  if (!row) return null;
  return {
    id: row.id,
    draftId: row.draftId,
    conversationId: row.conversationId,
    generationRunId: row.generationRunId,
    revisionNumber: Number(row.revisionNumber),
    requestedBy: row.requestedBy,
    revisionType: row.revisionType,
    requestText: row.requestText || '',
    beforeData: parseJson(row.beforeDataJson, {}),
    afterData: parseJson(row.afterDataJson, {}),
    metadata: parseJson(row.metadataJson, {}),
    idempotencyKey: row.idempotencyKey || '',
    appliedAt: row.appliedAt || '',
    createdAt: row.createdAt
  };
}

function deserializeRun(row) {
  if (!row) return null;
  return {
    id: row.id,
    conversationId: row.conversationId,
    requestedBy: row.requestedBy,
    idempotencyKey: row.idempotencyKey,
    inputHash: row.inputHash || '',
    planSnapshot: parseJson(row.planSnapshotJson, {}),
    status: row.status,
    progressStage: row.progressStage || '',
    draftId: row.draftId,
    deploymentName: row.deploymentName || '',
    providerRequestId: row.providerRequestId || '',
    errorCode: row.errorCode || '',
    errorMessage: row.errorMessage || '',
    cancellationRequestedBy: row.cancellationRequestedBy,
    cancellationRequestedAt: row.cancellationRequestedAt || '',
    metadata: parseJson(row.metadataJson, {}),
    createdAt: row.createdAt,
    startedAt: row.startedAt || '',
    completedAt: row.completedAt || '',
    updatedAt: row.updatedAt
  };
}

function deserializeSource(row) {
  return {
    id: row.id,
    generationRunId: row.generationRunId,
    questionIndex: row.questionIndex,
    materialId: row.materialId,
    chunkId: row.chunkId,
    sourceLabel: row.sourceLabel || '',
    excerpt: row.excerpt || '',
    relevanceScore: row.relevanceScore,
    metadata: parseJson(row.metadataJson, {}),
    createdAt: row.createdAt
  };
}

function assertGenerationStatus(status) {
  if (!AI_GENERATION_STATUSES.includes(status)) throw new Error('Invalid AI generation status.');
}

function assertGenerationStage(stage) {
  if (!AI_GENERATION_STAGES.includes(stage)) throw new Error('Invalid AI generation stage.');
}

function parseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value || 'null');
    return parsed === null ? fallback : parsed;
  } catch (error) {
    return fallback;
  }
}

function safeLimit(value, fallback, max) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? Math.min(number, max) : fallback;
}

module.exports = {
  addGenerationSources,
  commitGenerationResult,
  createGenerationRun,
  deleteGenerationSources,
  getActiveGenerationRun,
  getGenerationRunById,
  getGenerationRunByIdempotencyKey,
  getOwnedGenerationRunById,
  listGenerationRuns,
  listGenerationSources,
  listOwnedGenerationRuns,
  listOwnedGenerationSources,
  markGenerationCancelled,
  markGenerationCompleted,
  markGenerationFailed,
  markGenerationStarted,
  replaceGenerationSources,
  requestGenerationCancellation,
  requestOwnedGenerationCancellation,
  updateGenerationProgress,
  updateGenerationRun
};
