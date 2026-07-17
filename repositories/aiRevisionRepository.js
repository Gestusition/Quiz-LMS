const { getDatabase } = require('../database/db');
const { AI_REVISION_TYPES } = require('../constants/ai');

function createDraftRevision(data) {
  assertRevisionType(data.revisionType);
  const db = getDatabase();
  assertRevisionOwnership(db, data);
  const create = () => {
    if (data.idempotencyKey) {
      const existing = getRevisionByIdempotencyKey(data.draftId, data.idempotencyKey);
      if (existing) return { revision: existing, created: false };
    }
    const revisionNumber = Number(db.prepare(`
      SELECT COALESCE(MAX(revisionNumber), 0) + 1 AS nextRevision
      FROM ai_draft_revisions WHERE draftId = ?
    `).get(data.draftId).nextRevision);
    const result = db.prepare(`
      INSERT INTO ai_draft_revisions (
        draftId, conversationId, generationRunId, revisionNumber, requestedBy,
        revisionType, requestText, beforeDataJson, afterDataJson, metadataJson,
        idempotencyKey, appliedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.draftId,
      data.conversationId || null,
      data.generationRunId || null,
      revisionNumber,
      data.requestedBy,
      data.revisionType,
      data.requestText || '',
      JSON.stringify(data.beforeData || {}),
      JSON.stringify(data.afterData || {}),
      JSON.stringify(data.metadata || {}),
      data.idempotencyKey || '',
      data.applied ? new Date().toISOString() : ''
    );
    return {
      revision: getDraftRevisionById(Number(result.lastInsertRowid)),
      created: true
    };
  };
  try {
    return withTransaction(create);
  } catch (error) {
    if (data.idempotencyKey && String(error && error.code).includes('CONSTRAINT')) {
      const existing = getRevisionByIdempotencyKey(data.draftId, data.idempotencyKey);
      if (existing) return { revision: existing, created: false };
    }
    throw error;
  }
}

function markOwnedDraftRevisionApplied(id, ownerUserId) {
  const result = getDatabase().prepare(`
    UPDATE ai_draft_revisions
    SET appliedAt = datetime('now')
    WHERE id = ?
      AND TRIM(COALESCE(appliedAt, '')) = ''
      AND (
        conversationId IN (
          SELECT id FROM ai_conversations WHERE ownerUserId = ?
        )
        OR (
          conversationId IS NULL
          AND draftId IN (
            SELECT id FROM ai_quiz_drafts WHERE createdBy = ?
          )
        )
      )
  `).run(id, ownerUserId, ownerUserId);
  return {
    applied: !!result.changes,
    revision: getOwnedDraftRevisionById(id, ownerUserId)
  };
}

let savepointSequence = 0;

function withTransaction(work) {
  const db = getDatabase();
  savepointSequence += 1;
  const savepoint = `ai_revision_${savepointSequence}`;
  db.exec(`SAVEPOINT ${savepoint}`);
  try {
    const result = work();
    db.exec(`RELEASE SAVEPOINT ${savepoint}`);
    return result;
  } catch (error) {
    try {
      db.exec(`ROLLBACK TO SAVEPOINT ${savepoint}`);
    } finally {
      db.exec(`RELEASE SAVEPOINT ${savepoint}`);
    }
    throw error;
  }
}

function getDraftRevisionById(id) {
  return deserializeRevision(getDatabase().prepare(`
    SELECT * FROM ai_draft_revisions WHERE id = ?
  `).get(id));
}

function getOwnedDraftRevisionById(id, ownerUserId) {
  return deserializeRevision(getDatabase().prepare(`
    SELECT r.*
    FROM ai_draft_revisions r
    LEFT JOIN ai_conversations c ON c.id = r.conversationId
    JOIN ai_quiz_drafts d ON d.id = r.draftId
    WHERE r.id = ?
      AND (c.ownerUserId = ? OR (r.conversationId IS NULL AND d.createdBy = ?))
  `).get(id, ownerUserId, ownerUserId));
}

function getRevisionByIdempotencyKey(draftId, idempotencyKey) {
  return deserializeRevision(getDatabase().prepare(`
    SELECT * FROM ai_draft_revisions
    WHERE draftId = ? AND idempotencyKey = ?
  `).get(draftId, idempotencyKey));
}

function getLatestDraftRevision(draftId) {
  return deserializeRevision(getDatabase().prepare(`
    SELECT * FROM ai_draft_revisions
    WHERE draftId = ?
    ORDER BY revisionNumber DESC LIMIT 1
  `).get(draftId));
}

function listDraftRevisions(draftId, options = {}) {
  const limit = safeLimit(options.limit, 50, 100);
  const beforeRevision = options.beforeRevision ? Number(options.beforeRevision) : null;
  const rows = beforeRevision
    ? getDatabase().prepare(`
        SELECT * FROM ai_draft_revisions
        WHERE draftId = ? AND revisionNumber < ?
        ORDER BY revisionNumber DESC LIMIT ?
      `).all(draftId, beforeRevision, limit)
    : getDatabase().prepare(`
        SELECT * FROM ai_draft_revisions
        WHERE draftId = ?
        ORDER BY revisionNumber DESC LIMIT ?
      `).all(draftId, limit);
  return rows.map(deserializeRevision);
}

function listOwnedDraftRevisions(draftId, ownerUserId, options = {}) {
  const ownedDraft = getDatabase().prepare(`
    SELECT d.id
    FROM ai_quiz_drafts d
    LEFT JOIN ai_conversations c ON c.draftId = d.id
    WHERE d.id = ? AND (d.createdBy = ? OR c.ownerUserId = ?)
    LIMIT 1
  `).get(draftId, ownerUserId, ownerUserId);
  return ownedDraft ? listDraftRevisions(draftId, options) : null;
}

function listConversationRevisions(conversationId, options = {}) {
  const limit = safeLimit(options.limit, 50, 100);
  return getDatabase().prepare(`
    SELECT * FROM ai_draft_revisions
    WHERE conversationId = ?
    ORDER BY id DESC LIMIT ?
  `).all(conversationId, limit).map(deserializeRevision);
}

function listOwnedConversationRevisions(conversationId, ownerUserId, options = {}) {
  const owner = getDatabase().prepare(`
    SELECT id FROM ai_conversations WHERE id = ? AND ownerUserId = ?
  `).get(conversationId, ownerUserId);
  return owner ? listConversationRevisions(conversationId, options) : null;
}

function deleteRevisionsByDraftId(draftId) {
  return getDatabase().prepare(`
    DELETE FROM ai_draft_revisions WHERE draftId = ?
  `).run(draftId);
}

function deserializeRevision(row) {
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

function assertRevisionType(revisionType) {
  if (!AI_REVISION_TYPES.includes(revisionType)) throw new Error('Invalid AI draft revision type.');
}

function assertRevisionOwnership(db, data) {
  const draft = db.prepare(`
    SELECT id, createdBy FROM ai_quiz_drafts WHERE id = ?
  `).get(data.draftId);
  if (!draft) throw new Error('AI quiz draft not found.');
  if (data.conversationId) {
    const conversation = db.prepare(`
      SELECT id, ownerUserId, draftId
      FROM ai_conversations WHERE id = ?
    `).get(data.conversationId);
    if (
      !conversation ||
      Number(conversation.ownerUserId) !== Number(data.requestedBy) ||
      Number(conversation.draftId) !== Number(data.draftId)
    ) {
      throw new Error('AI draft revision ownership mismatch.');
    }
  } else if (Number(draft.createdBy) !== Number(data.requestedBy)) {
    throw new Error('AI draft revision ownership mismatch.');
  }
  if (data.generationRunId) {
    const run = db.prepare(`
      SELECT conversationId FROM ai_generation_runs WHERE id = ?
    `).get(data.generationRunId);
    if (!run || !data.conversationId || Number(run.conversationId) !== Number(data.conversationId)) {
      throw new Error('AI draft revision generation run mismatch.');
    }
  }
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
  createDraftRevision,
  deleteRevisionsByDraftId,
  getDraftRevisionById,
  getLatestDraftRevision,
  getOwnedDraftRevisionById,
  getRevisionByIdempotencyKey,
  listConversationRevisions,
  listDraftRevisions,
  listOwnedConversationRevisions,
  listOwnedDraftRevisions,
  markOwnedDraftRevisionApplied,
  withTransaction
};
