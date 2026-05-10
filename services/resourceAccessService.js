const resourceAccessRepository = require('../repositories/resourceAccessRepository');
const userRepository = require('../repositories/userRepository');
const auditService = require('./auditService');
const { notFoundError, validationError } = require('../utils/appError');

const PREFIX_BY_TYPE = {
  category: 'CATEGORY',
  question: 'QUESTION',
  quiz: 'QUIZ'
};

function normalizeAccessLevel(value) {
  const accessLevel = String(value || '').trim().toLowerCase();
  if (!['read', 'write'].includes(accessLevel)) {
    throw validationError('accessLevel', 'Access level must be read or write.');
  }
  return accessLevel;
}

function prefixFor(resourceType) {
  const prefix = PREFIX_BY_TYPE[resourceType];
  if (!prefix) throw validationError('resourceType', 'Invalid resource type.');
  return prefix;
}

class ResourceAccessService {
  summary(resourceType, resourceId) {
    return {
      grants: resourceAccessRepository.listForResource(resourceType, resourceId),
      history: this.history(resourceType, resourceId)
    };
  }

  share(resourceType, resourceId, data, actor) {
    const teacher = userRepository.findActiveTeacherByEmail(data.teacherEmail || data.email);
    if (!teacher) {
      throw validationError('teacherEmail', 'Active teacher email was not found.');
    }
    const accessLevel = normalizeAccessLevel(data.accessLevel || data.level);
    const existing = resourceAccessRepository.findGrant(resourceType, resourceId, teacher.id);

    resourceAccessRepository.upsert({
      resourceType,
      resourceId,
      teacherUserId: teacher.id,
      accessLevel,
      grantedBy: actor ? actor.id : null
    });

    const prefix = prefixFor(resourceType);
    auditService.log({
      actorUserId: actor ? actor.id : null,
      action: existing ? `${prefix}_ACCESS_UPDATED` : `${prefix}_SHARED`,
      entityType: resourceType,
      entityId: Number(resourceId),
      details: {
        teacherUserId: teacher.id,
        teacherEmail: teacher.email,
        previousAccessLevel: existing ? existing.accessLevel : null,
        accessLevel
      }
    });

    return { teacherId: teacher.id, teacherEmail: teacher.email, accessLevel };
  }

  remove(resourceType, resourceId, teacherUserId, actor) {
    const existing = resourceAccessRepository.findGrant(resourceType, resourceId, teacherUserId);
    if (!existing) {
      throw notFoundError('Access grant not found.');
    }
    resourceAccessRepository.deleteGrant(resourceType, resourceId, teacherUserId);

    const prefix = prefixFor(resourceType);
    auditService.log({
      actorUserId: actor ? actor.id : null,
      action: `${prefix}_ACCESS_REMOVED`,
      entityType: resourceType,
      entityId: Number(resourceId),
      details: {
        teacherUserId: Number(teacherUserId),
        teacherEmail: existing.teacherEmail,
        previousAccessLevel: existing.accessLevel
      }
    });

    return true;
  }

  history(resourceType, resourceId) {
    const prefix = prefixFor(resourceType);
    const allowedActions = new Set([
      `${prefix}_SHARED`,
      `${prefix}_ACCESS_UPDATED`,
      `${prefix}_ACCESS_REMOVED`
    ]);
    return auditService
      .forEntity(resourceType, resourceId, 50)
      .filter(log => allowedActions.has(log.action));
  }
}

module.exports = new ResourceAccessService();
