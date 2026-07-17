const { getDatabase } = require('../database/db');
const {
  AI_CONVERSATION_STATUS,
  AI_CONVERSATION_STATUSES,
  AI_MESSAGE_SENDERS,
  AI_MESSAGE_TYPES
} = require('../constants/ai');

const CONVERSATION_SELECT = `
  SELECT c.*,
    p.planJson,
    p.missingRequiredFieldsJson,
    p.readinessStatus,
    p.version AS planVersion,
    p.updatedAt AS planUpdatedAt
  FROM ai_conversations c
  LEFT JOIN ai_quiz_plans p ON p.conversationId = c.id
`;

function createConversation(data) {
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION');
  try {
    const result = db.prepare(`
      INSERT INTO ai_conversations (
        ownerUserId, ownerRole, courseId, title, status, draftId, lastMessageAt
      ) VALUES (?, ?, ?, ?, ?, ?, '')
    `).run(
      Number(data.ownerUserId),
      data.ownerRole,
      data.courseId || null,
      data.title || 'New quiz conversation',
      data.status || AI_CONVERSATION_STATUS.gatheringRequirements,
      data.draftId || null
    );
    const conversationId = Number(result.lastInsertRowid);
    const quizPlan = data.quizPlan || {};
    db.prepare(`
      INSERT INTO ai_quiz_plans (
        conversationId, planJson, missingRequiredFieldsJson, readinessStatus, version
      ) VALUES (?, ?, ?, ?, 1)
    `).run(
      conversationId,
      JSON.stringify(quizPlan),
      JSON.stringify(quizPlan.missingRequiredFields || data.missingRequiredFields || []),
      quizPlan.readinessStatus || data.readinessStatus || AI_CONVERSATION_STATUS.gatheringRequirements
    );
    db.exec('COMMIT');
    return getConversationById(conversationId);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function getConversationById(id) {
  const row = getDatabase().prepare(`${CONVERSATION_SELECT} WHERE c.id = ?`).get(id);
  return deserializeConversation(row);
}

function getOwnedConversationById(id, ownerUserId) {
  const row = getDatabase().prepare(`
    ${CONVERSATION_SELECT}
    WHERE c.id = ? AND c.ownerUserId = ?
  `).get(id, ownerUserId);
  return deserializeConversation(row);
}

function listOwnedConversations(ownerUserId, filters = {}) {
  const clauses = ['c.ownerUserId = ?'];
  const params = [ownerUserId];
  if (filters.courseId) {
    clauses.push('c.courseId = ?');
    params.push(filters.courseId);
  }
  if (filters.status) {
    clauses.push('c.status = ?');
    params.push(filters.status);
  }
  if (filters.search) {
    const search = `%${escapeLike(filters.search)}%`;
    clauses.push(`(
      c.title LIKE ? ESCAPE '\\'
      OR json_extract(p.planJson, '$.topic') LIKE ? ESCAPE '\\'
    )`);
    params.push(search, search);
  }
  const limit = safeLimit(filters.limit, 20, 100);
  const offset = safeOffset(filters.offset);
  params.push(limit, offset);
  return getDatabase().prepare(`
    ${CONVERSATION_SELECT}
    WHERE ${clauses.join(' AND ')}
    ORDER BY c.updatedAt DESC, c.id DESC
    LIMIT ? OFFSET ?
  `).all(...params).map(deserializeConversation);
}

function countOwnedConversations(ownerUserId, filters = {}) {
  const clauses = ['c.ownerUserId = ?'];
  const params = [ownerUserId];
  if (filters.courseId) {
    clauses.push('c.courseId = ?');
    params.push(filters.courseId);
  }
  if (filters.status) {
    clauses.push('c.status = ?');
    params.push(filters.status);
  }
  if (filters.search) {
    const search = `%${escapeLike(filters.search)}%`;
    clauses.push(`(
      c.title LIKE ? ESCAPE '\\'
      OR json_extract(p.planJson, '$.topic') LIKE ? ESCAPE '\\'
    )`);
    params.push(search, search);
  }
  return Number(getDatabase().prepare(`
    SELECT COUNT(*) AS count
    FROM ai_conversations c
    LEFT JOIN ai_quiz_plans p ON p.conversationId = c.id
    WHERE ${clauses.join(' AND ')}
  `).get(...params).count);
}

function updateConversation(id, patch = {}) {
  return updateConversationWhere(id, null, patch);
}

function updateOwnedConversation(id, ownerUserId, patch = {}) {
  return updateConversationWhere(id, ownerUserId, patch);
}

function setConversationStatus(id, status, patch = {}) {
  if (!AI_CONVERSATION_STATUSES.includes(status)) throw new Error('Invalid AI conversation status.');
  return updateConversation(id, { ...patch, status });
}

function setOwnedConversationStatus(id, ownerUserId, status, patch = {}) {
  if (!AI_CONVERSATION_STATUSES.includes(status)) throw new Error('Invalid AI conversation status.');
  return updateOwnedConversation(id, ownerUserId, { ...patch, status });
}

function setConversationStatusByDraftId(draftId, status) {
  if (!AI_CONVERSATION_STATUSES.includes(status)) throw new Error('Invalid AI conversation status.');
  return getDatabase().prepare(`
    UPDATE ai_conversations
    SET status = ?, updatedAt = datetime('now')
    WHERE draftId = ?
  `).run(status, draftId);
}

function updateConversationWhere(id, ownerUserId, patch) {
  const assignments = [];
  const params = [];
  if (Object.prototype.hasOwnProperty.call(patch, 'courseId')) {
    assignments.push('courseId = ?');
    params.push(patch.courseId || null);
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'title')) {
    assignments.push('title = ?');
    params.push(patch.title);
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'status')) {
    if (!AI_CONVERSATION_STATUSES.includes(patch.status)) throw new Error('Invalid AI conversation status.');
    assignments.push('status = ?');
    params.push(patch.status);
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'draftId')) {
    assignments.push('draftId = ?');
    params.push(patch.draftId || null);
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'lastMessageAt')) {
    assignments.push("lastMessageAt = COALESCE(NULLIF(?, ''), datetime('now'))");
    params.push(patch.lastMessageAt || '');
  }
  assignments.push("updatedAt = datetime('now')");
  let where = 'id = ?';
  params.push(id);
  if (ownerUserId !== null) {
    where += ' AND ownerUserId = ?';
    params.push(ownerUserId);
  }
  getDatabase().prepare(`
    UPDATE ai_conversations
    SET ${assignments.join(', ')}
    WHERE ${where}
  `).run(...params);
  return ownerUserId === null
    ? getConversationById(id)
    : getOwnedConversationById(id, ownerUserId);
}

function getQuizPlan(conversationId) {
  return deserializePlan(getDatabase().prepare(`
    SELECT * FROM ai_quiz_plans WHERE conversationId = ?
  `).get(conversationId));
}

function getOwnedQuizPlan(conversationId, ownerUserId) {
  return deserializePlan(getDatabase().prepare(`
    SELECT p.*
    FROM ai_quiz_plans p
    JOIN ai_conversations c ON c.id = p.conversationId
    WHERE p.conversationId = ? AND c.ownerUserId = ?
  `).get(conversationId, ownerUserId));
}

function saveQuizPlan(conversationId, quizPlan, options = {}) {
  const db = getDatabase();
  const missingRequiredFields = quizPlan.missingRequiredFields || options.missingRequiredFields || [];
  const readinessStatus = quizPlan.readinessStatus ||
    options.readinessStatus ||
    AI_CONVERSATION_STATUS.gatheringRequirements;
  let result;
  if (options.expectedVersion !== undefined && options.expectedVersion !== null) {
    result = db.prepare(`
      UPDATE ai_quiz_plans
      SET planJson = ?,
        missingRequiredFieldsJson = ?,
        readinessStatus = ?,
        version = version + 1,
        updatedAt = datetime('now')
      WHERE conversationId = ? AND version = ?
    `).run(
      JSON.stringify(quizPlan),
      JSON.stringify(missingRequiredFields),
      readinessStatus,
      conversationId,
      options.expectedVersion
    );
    if (!result.changes) return null;
  } else {
    result = db.prepare(`
      INSERT INTO ai_quiz_plans (
        conversationId, planJson, missingRequiredFieldsJson, readinessStatus, version
      ) VALUES (?, ?, ?, ?, 1)
      ON CONFLICT(conversationId) DO UPDATE SET
        planJson = excluded.planJson,
        missingRequiredFieldsJson = excluded.missingRequiredFieldsJson,
        readinessStatus = excluded.readinessStatus,
        version = ai_quiz_plans.version + 1,
        updatedAt = datetime('now')
    `).run(
      conversationId,
      JSON.stringify(quizPlan),
      JSON.stringify(missingRequiredFields),
      readinessStatus
    );
  }
  db.prepare(`
    UPDATE ai_conversations
    SET courseId = COALESCE(?, courseId),
      status = CASE
        WHEN status IN ('gathering_requirements', 'ready_to_generate', 'generation_failed')
        THEN ?
        ELSE status
      END,
      updatedAt = datetime('now')
    WHERE id = ?
  `).run(quizPlan.courseId || null, readinessStatus, conversationId);
  return getQuizPlan(conversationId);
}

function addMessage(conversationId, message) {
  assertMessageEnums(message);
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION');
  try {
    let result;
    if (message.clientRequestId) {
      result = db.prepare(`
        INSERT OR IGNORE INTO ai_messages (
          conversationId, senderType, senderUserId, content, messageType, metadataJson, clientRequestId
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        conversationId,
        message.senderType,
        message.senderUserId || null,
        message.content,
        message.messageType || 'message',
        JSON.stringify(message.metadata || {}),
        message.clientRequestId
      );
    } else {
      result = db.prepare(`
        INSERT INTO ai_messages (
          conversationId, senderType, senderUserId, content, messageType, metadataJson, clientRequestId
        ) VALUES (?, ?, ?, ?, ?, ?, '')
      `).run(
        conversationId,
        message.senderType,
        message.senderUserId || null,
        message.content,
        message.messageType || 'message',
        JSON.stringify(message.metadata || {})
      );
    }
    const row = result.changes
      ? db.prepare('SELECT * FROM ai_messages WHERE id = ?').get(Number(result.lastInsertRowid))
      : db.prepare(`
          SELECT * FROM ai_messages
          WHERE conversationId = ? AND clientRequestId = ?
        `).get(conversationId, message.clientRequestId);
    db.prepare(`
      UPDATE ai_conversations
      SET lastMessageAt = COALESCE(?, datetime('now')), updatedAt = datetime('now')
      WHERE id = ?
    `).run(row ? row.createdAt : null, conversationId);
    db.exec('COMMIT');
    return {
      message: deserializeMessage(row),
      inserted: result.changes > 0
    };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function addOwnedMessage(conversationId, ownerUserId, message) {
  if (!getOwnedConversationById(conversationId, ownerUserId)) return null;
  return addMessage(conversationId, message);
}

function getMessageById(id) {
  return deserializeMessage(getDatabase().prepare('SELECT * FROM ai_messages WHERE id = ?').get(id));
}

function listMessages(conversationId, options = {}) {
  const limit = safeLimit(options.limit, 100, 500);
  const beforeId = options.beforeId ? Number(options.beforeId) : null;
  const rows = beforeId
    ? getDatabase().prepare(`
        SELECT * FROM ai_messages
        WHERE conversationId = ? AND id < ?
        ORDER BY id DESC LIMIT ?
      `).all(conversationId, beforeId, limit)
    : getDatabase().prepare(`
        SELECT * FROM ai_messages
        WHERE conversationId = ?
        ORDER BY id DESC LIMIT ?
      `).all(conversationId, limit);
  return rows.reverse().map(deserializeMessage);
}

function listOwnedMessages(conversationId, ownerUserId, options = {}) {
  if (!getOwnedConversationById(conversationId, ownerUserId)) return null;
  return listMessages(conversationId, options);
}

function countMessages(conversationId) {
  return Number(getDatabase().prepare(`
    SELECT COUNT(*) AS count FROM ai_messages WHERE conversationId = ?
  `).get(conversationId).count);
}

function deleteOwnedConversation(id, ownerUserId) {
  return getDatabase().prepare(`
    DELETE FROM ai_conversations WHERE id = ? AND ownerUserId = ?
  `).run(id, ownerUserId);
}

function deleteByOwnerUserId(ownerUserId) {
  return getDatabase().prepare('DELETE FROM ai_conversations WHERE ownerUserId = ?').run(ownerUserId);
}

function deleteByCourseId(courseId) {
  return getDatabase().prepare('DELETE FROM ai_conversations WHERE courseId = ?').run(courseId);
}

function deserializeConversation(row) {
  if (!row) return null;
  const conversation = {
    id: row.id,
    ownerUserId: row.ownerUserId,
    ownerRole: row.ownerRole,
    courseId: row.courseId,
    title: row.title,
    status: row.status,
    draftId: row.draftId,
    lastMessageAt: row.lastMessageAt || '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
  if (row.planJson !== undefined) {
    conversation.quizPlan = parseJson(row.planJson, {});
    conversation.missingRequiredFields = parseJson(row.missingRequiredFieldsJson, []);
    conversation.readinessStatus = row.readinessStatus || AI_CONVERSATION_STATUS.gatheringRequirements;
    conversation.planVersion = Number(row.planVersion || 1);
    conversation.planUpdatedAt = row.planUpdatedAt || '';
  }
  return conversation;
}

function deserializePlan(row) {
  if (!row) return null;
  return {
    conversationId: row.conversationId,
    plan: parseJson(row.planJson, {}),
    missingRequiredFields: parseJson(row.missingRequiredFieldsJson, []),
    readinessStatus: row.readinessStatus,
    version: Number(row.version || 1),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function deserializeMessage(row) {
  if (!row) return null;
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderType: row.senderType,
    senderUserId: row.senderUserId,
    content: row.content,
    messageType: row.messageType,
    metadata: parseJson(row.metadataJson, {}),
    clientRequestId: row.clientRequestId || '',
    createdAt: row.createdAt
  };
}

function assertMessageEnums(message) {
  if (!AI_MESSAGE_SENDERS.includes(message.senderType)) throw new Error('Invalid AI message sender.');
  if (!AI_MESSAGE_TYPES.includes(message.messageType || 'message')) throw new Error('Invalid AI message type.');
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

function safeOffset(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

function escapeLike(value) {
  return String(value || '').replace(/[\\%_]/g, match => `\\${match}`);
}

module.exports = {
  addMessage,
  addOwnedMessage,
  countMessages,
  countOwnedConversations,
  createConversation,
  deleteByCourseId,
  deleteByOwnerUserId,
  deleteOwnedConversation,
  getConversationById,
  getMessageById,
  getOwnedConversationById,
  getOwnedQuizPlan,
  getQuizPlan,
  listMessages,
  listOwnedConversations,
  listOwnedMessages,
  saveQuizPlan,
  setConversationStatusByDraftId,
  setConversationStatus,
  setOwnedConversationStatus,
  updateConversation,
  updateOwnedConversation
};
