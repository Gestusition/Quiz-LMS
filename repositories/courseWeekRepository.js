const { getDatabase } = require('../database/db');
const { parsePagination } = require('../utils/validation');

function listWeeks(courseId, filters = {}) {
  const paging = parsePagination(filters);
  const visibleOnly = !!filters.visibleOnly;

  const total = getDatabase().prepare(`
    SELECT COUNT(*) as count
    FROM course_weeks
    WHERE courseId = ? ${visibleOnly ? 'AND visible = 1' : ''}
  `).get(courseId).count;

  const items = getDatabase().prepare(`
    SELECT w.*, COUNT(r.id) as resourceCount
    FROM course_weeks w
    LEFT JOIN week_resources r ON r.weekId = w.id
    WHERE w.courseId = ? ${visibleOnly ? 'AND w.visible = 1' : ''}
    GROUP BY w.id
    ORDER BY w.weekNumber ASC
    LIMIT ? OFFSET ?
  `).all(courseId, paging.limit, paging.offset);

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

function findWeekById(id) {
  return getDatabase().prepare('SELECT * FROM course_weeks WHERE id = ?').get(id) || null;
}

function createWeek(payload) {
  return getDatabase().prepare(`
    INSERT INTO course_weeks (courseId, weekNumber, title, description, startsAt, endsAt, visible, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.courseId,
    payload.weekNumber,
    payload.title,
    payload.description || '',
    payload.startsAt || '',
    payload.endsAt || '',
    payload.visible ? 1 : 0,
    payload.createdBy || null
  );
}

function updateWeek(id, payload, updatedAt) {
  return getDatabase().prepare(`
    UPDATE course_weeks
    SET weekNumber = ?, title = ?, description = ?, startsAt = ?, endsAt = ?, visible = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    payload.weekNumber,
    payload.title,
    payload.description || '',
    payload.startsAt || '',
    payload.endsAt || '',
    payload.visible ? 1 : 0,
    updatedAt,
    id
  );
}

function deleteWeek(id) {
  return getDatabase().prepare('DELETE FROM course_weeks WHERE id = ?').run(id);
}

function listWeekResources(weekId, filters = {}) {
  const paging = parsePagination(filters);
  const total = getDatabase().prepare(`
    SELECT COUNT(*) as count
    FROM week_resources
    WHERE weekId = ?
  `).get(weekId).count;

  const items = getDatabase().prepare(`
    SELECT *
    FROM week_resources
    WHERE weekId = ?
    ORDER BY createdAt DESC, id DESC
    LIMIT ? OFFSET ?
  `).all(weekId, paging.limit, paging.offset);

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

function createWeekResource(payload) {
  return getDatabase().prepare(`
    INSERT INTO week_resources (weekId, title, type, content, visibleFrom, visibleUntil, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.weekId,
    payload.title,
    payload.type,
    payload.content || '',
    payload.visibleFrom || '',
    payload.visibleUntil || '',
    payload.createdBy || null
  );
}

function findWeekResourceById(id) {
  return getDatabase().prepare('SELECT * FROM week_resources WHERE id = ?').get(id) || null;
}

function deleteWeekResource(id) {
  return getDatabase().prepare('DELETE FROM week_resources WHERE id = ?').run(id);
}

module.exports = {
  createWeek,
  createWeekResource,
  deleteWeek,
  deleteWeekResource,
  findWeekById,
  findWeekResourceById,
  listWeekResources,
  listWeeks,
  updateWeek
};
