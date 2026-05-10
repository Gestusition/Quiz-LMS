const auditRepository = require('../repositories/auditRepository');

class AuditService {
  log(entry) {
    if (!entry || !entry.action || !entry.entityType) return null;
    return auditRepository.create(entry);
  }

  recent(limit = 20) {
    return auditRepository.listRecent(limit).map(row => ({
      id: row.id,
      actorUserId: row.actorUserId,
      actorName: row.actorName || 'System',
      actorRole: row.actorRole || '',
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      details: parseDetails(row.detailsJson),
      createdAt: row.createdAt
    }));
  }

  forEntity(entityType, entityId, limit = 20) {
    return auditRepository.listForEntity(entityType, entityId, limit).map(row => ({
      id: row.id,
      actorUserId: row.actorUserId,
      actorName: row.actorName || 'System',
      actorRole: row.actorRole || '',
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      details: parseDetails(row.detailsJson),
      createdAt: row.createdAt
    }));
  }
}

function parseDetails(value) {
  try {
    return JSON.parse(value || '{}');
  } catch (e) {
    return {};
  }
}

module.exports = new AuditService();
