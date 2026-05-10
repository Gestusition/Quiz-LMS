const { getDatabase } = require('../database/db');

const RESOURCE_TYPES = ['question', 'category', 'quiz'];
const ACCESS_LEVELS = ['read', 'write'];

function normalizeResourceType(resourceType) {
  const value = String(resourceType || '').trim().toLowerCase();
  if (!RESOURCE_TYPES.includes(value)) {
    throw new Error('Invalid resource type.');
  }
  return value;
}

function normalizeAccessLevel(accessLevel) {
  const value = String(accessLevel || '').trim().toLowerCase();
  if (!ACCESS_LEVELS.includes(value)) {
    throw new Error('Access level must be read or write.');
  }
  return value;
}

function upsert({ resourceType, resourceId, teacherUserId, accessLevel, grantedBy }) {
  return getDatabase().prepare(`
    INSERT INTO users.resource_access_grants (resourceType, resourceId, teacherUserId, accessLevel, grantedBy)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(resourceType, resourceId, teacherUserId)
    DO UPDATE SET accessLevel = excluded.accessLevel, grantedBy = excluded.grantedBy, updatedAt = datetime('now')
  `).run(
    normalizeResourceType(resourceType),
    Number(resourceId),
    Number(teacherUserId),
    normalizeAccessLevel(accessLevel),
    grantedBy || null
  );
}

function findGrant(resourceType, resourceId, teacherUserId) {
  return getDatabase().prepare(`
    SELECT g.*, u.name as teacherName, u.email as teacherEmail
    FROM users.resource_access_grants g
    LEFT JOIN users.users u ON u.id = g.teacherUserId
    WHERE g.resourceType = ? AND g.resourceId = ? AND g.teacherUserId = ?
  `).get(normalizeResourceType(resourceType), Number(resourceId), Number(teacherUserId)) || null;
}

function listForResource(resourceType, resourceId) {
  return getDatabase().prepare(`
    SELECT g.*, u.name as teacherName, u.email as teacherEmail
    FROM users.resource_access_grants g
    JOIN users.users u ON u.id = g.teacherUserId
    WHERE g.resourceType = ? AND g.resourceId = ?
    ORDER BY u.name ASC
  `).all(normalizeResourceType(resourceType), Number(resourceId));
}

function deleteGrant(resourceType, resourceId, teacherUserId) {
  return getDatabase().prepare(`
    DELETE FROM users.resource_access_grants
    WHERE resourceType = ? AND resourceId = ? AND teacherUserId = ?
  `).run(normalizeResourceType(resourceType), Number(resourceId), Number(teacherUserId));
}

function deleteForResource(resourceType, resourceId) {
  return getDatabase().prepare(`
    DELETE FROM users.resource_access_grants
    WHERE resourceType = ? AND resourceId = ?
  `).run(normalizeResourceType(resourceType), Number(resourceId));
}

function clearUserReferences(userId) {
  const db = getDatabase();
  db.prepare('DELETE FROM users.resource_access_grants WHERE teacherUserId = ?').run(userId);
  db.prepare('UPDATE users.resource_access_grants SET grantedBy = NULL WHERE grantedBy = ?').run(userId);
}

module.exports = {
  deleteGrant,
  deleteForResource,
  findGrant,
  listForResource,
  clearUserReferences,
  upsert
};
