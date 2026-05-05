const { getDatabase } = require('../database/db');
const { parsePagination } = require('../utils/validation');

function listThreads(courseId, filters = {}) {
  const paging = parsePagination(filters);
  let query = `
    SELECT t.*, u.name as createdByName,
      COUNT(r.id) as replyCount,
      MAX(r.createdAt) as lastReplyAt
    FROM course_threads t
    LEFT JOIN users u ON u.id = t.createdBy
    LEFT JOIN course_thread_replies r ON r.threadId = t.id
    WHERE t.courseId = ?
  `;
  const params = [courseId];

  if (filters.status) {
    query += ' AND t.status = ?';
    params.push(filters.status);
  }

  const total = getDatabase().prepare(`
    SELECT COUNT(*) as count
    FROM course_threads
    WHERE courseId = ? ${filters.status ? 'AND status = ?' : ''}
  `).get(...params).count;

  query += ' GROUP BY t.id ORDER BY t.createdAt DESC LIMIT ? OFFSET ?';
  const items = getDatabase().prepare(query).all(...params, paging.limit, paging.offset);
  return {
    items,
    pagination: {
      page: paging.page,
      limit: paging.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / paging.limit))
    }
  };
}

function findThreadById(id) {
  return getDatabase().prepare(`
    SELECT t.*, u.name as createdByName
    FROM course_threads t
    LEFT JOIN users u ON u.id = t.createdBy
    WHERE t.id = ?
  `).get(id) || null;
}

function createThread(payload) {
  return getDatabase().prepare(`
    INSERT INTO course_threads (courseId, title, body, createdBy, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(payload.courseId, payload.title, payload.body, payload.createdBy || null, payload.status || 'open');
}

function updateThreadStatus(id, status, updatedAt) {
  return getDatabase().prepare(`
    UPDATE course_threads
    SET status = ?, updatedAt = ?
    WHERE id = ?
  `).run(status, updatedAt, id);
}

function listReplies(threadId, filters = {}) {
  const paging = parsePagination(filters);
  const total = getDatabase().prepare(`
    SELECT COUNT(*) as count FROM course_thread_replies WHERE threadId = ?
  `).get(threadId).count;

  const items = getDatabase().prepare(`
    SELECT r.*, u.name as createdByName, u.role as createdByRole
    FROM course_thread_replies r
    LEFT JOIN users u ON u.id = r.createdBy
    WHERE r.threadId = ?
    ORDER BY r.createdAt ASC, r.id ASC
    LIMIT ? OFFSET ?
  `).all(threadId, paging.limit, paging.offset);

  return {
    items,
    pagination: {
      page: paging.page,
      limit: paging.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / paging.limit))
    }
  };
}

function createReply(payload) {
  return getDatabase().prepare(`
    INSERT INTO course_thread_replies (threadId, body, createdBy)
    VALUES (?, ?, ?)
  `).run(payload.threadId, payload.body, payload.createdBy || null);
}

module.exports = {
  createReply,
  createThread,
  findThreadById,
  listReplies,
  listThreads,
  updateThreadStatus
};
