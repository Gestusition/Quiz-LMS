const settingsRepository = require('../repositories/settingsRepository');
const sessionRepository = require('../repositories/sessionRepository');
const auditService = require('./auditService');
const { getDatabase } = require('../database/db');
const { roles } = require('../constants/enums');
const { forbiddenError, validationError } = require('../utils/appError');

const MAINTENANCE_MODE_KEY = 'maintenance_mode';
const MAINTENANCE_MODE_CODE = 'MAINTENANCE_MODE';
const MAINTENANCE_MESSAGE = 'Maintenance mode is active. Teachers and students cannot sign in right now.';
const BLOCKED_ROLES = [roles.teacher, roles.student];

class SettingsService {
  getMaintenanceMode() {
    const setting = settingsRepository.findByKey(MAINTENANCE_MODE_KEY);
    const enabled = setting ? parseStoredBoolean(setting.value) : true;

    return {
      enabled,
      message: MAINTENANCE_MESSAGE,
      updatedBy: setting ? setting.updatedBy : null,
      updatedAt: setting ? setting.updatedAt : ''
    };
  }

  isMaintenanceModeEnabled() {
    return this.getMaintenanceMode().enabled;
  }

  setMaintenanceMode(enabledValue, actor = null) {
    const enabled = parseInputBoolean(enabledValue);
    const actorUserId = actor && typeof actor === 'object' ? actor.id : actor;
    let revokedSessions = 0;

    const database = getDatabase();
    database.exec('BEGIN TRANSACTION');
    try {
      settingsRepository.upsert(MAINTENANCE_MODE_KEY, enabled ? 'true' : 'false', actorUserId || null);
      if (enabled) {
        revokedSessions = sessionRepository.deleteByUserRoles(BLOCKED_ROLES).changes || 0;
      }
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }

    auditService.log({
      actorUserId: actorUserId || null,
      action: enabled ? 'MAINTENANCE_MODE_ENABLED' : 'MAINTENANCE_MODE_DISABLED',
      entityType: 'system_setting',
      entityId: null,
      details: { key: MAINTENANCE_MODE_KEY, revokedSessions }
    });

    return {
      ...this.getMaintenanceMode(),
      revokedSessions
    };
  }

  isRoleBlocked(role) {
    return this.isMaintenanceModeEnabled() && BLOCKED_ROLES.includes(role);
  }

  assertLoginAllowed(user) {
    if (user && this.isRoleBlocked(user.role)) {
      throw forbiddenError(MAINTENANCE_MESSAGE, MAINTENANCE_MODE_CODE);
    }
  }
}

function parseStoredBoolean(value) {
  return ['true', '1', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

function parseInputBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }
  throw validationError('enabled', 'Maintenance mode enabled must be true or false.');
}

module.exports = new SettingsService();
module.exports.MAINTENANCE_MODE_CODE = MAINTENANCE_MODE_CODE;
module.exports.MAINTENANCE_MESSAGE = MAINTENANCE_MESSAGE;
