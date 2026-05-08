const restrictionRepository = require('../repositories/restrictionRepository');
const userRepository = require('../repositories/userRepository');
const { LIMITS } = require('../constants/limits');
const { forbiddenError, notFoundError, validationError } = require('../utils/appError');
const { nowIso } = require('../utils/security');
const { dateValue, enumValue, optionalId, optionalText, parseOptionalPositiveInt, parseRequiredPositiveInt } = require('../utils/validation');

const RESTRICTION_TYPES = [
  'account_suspended',
  'quiz_blocked',
  'assignment_blocked',
  'chat_muted',
  'course_access_blocked',
  'manual_review_required'
];

const SCOPE_TYPES = ['global', 'course', 'quiz', 'assignment'];

class RestrictionService {
  list(filters = {}) {
    return restrictionRepository.list({
      ...filters,
      userId: parseOptionalPositiveInt(filters.userId, 'userId'),
      scopeId: parseOptionalPositiveInt(filters.scopeId, 'scopeId')
    });
  }

  create(data, actorUserId) {
    const userId = parseRequiredPositiveInt(data.userId, 'user_id');
    const user = userRepository.findById(userId);
    if (!user) throw notFoundError('User not found.');

    const restrictionType = enumValue(data.restrictionType, 'restriction_type', RESTRICTION_TYPES);
    const scopeType = enumValue(data.scopeType, 'scope_type', SCOPE_TYPES, 'global');
    const scopeId = optionalId(data.scopeId, 'scope_id');
    const startsAt = dateValue(data.startsAt || nowIso(), 'starts_at', { required: false }) || nowIso();
    const endsAt = dateValue(data.endsAt, 'ends_at', { required: false });
    const reason = optionalText(data.reason, 'reason', LIMITS.restrictions.reasonMax);
    if (scopeType !== 'global' && !scopeId) {
      throw validationError('scope_id', 'scope_id is required for non-global restrictions.');
    }

    const result = restrictionRepository.create({
      userId,
      restrictionType,
      scopeType,
      scopeId,
      reason,
      startsAt,
      endsAt,
      createdBy: actorUserId,
      isActive: data.isActive !== false
    });

    return restrictionRepository.findById(result.lastInsertRowid);
  }

  deactivate(id) {
    const existing = restrictionRepository.findById(id);
    if (!existing) throw notFoundError('Restriction not found.');
    restrictionRepository.deactivate(id);
    return restrictionRepository.findById(id);
  }

  activeRestrictionsForUser(userId) {
    return restrictionRepository.findActiveForUser(userId, nowIso());
  }

  assertAccessAllowed({ user, restrictionType, scopeType = 'global', scopeId = null, safeMessage }) {
    if (this.hasActiveRestriction({ user, restrictionType, scopeType, scopeId })) {
      throw forbiddenError(
        safeMessage || 'Your access is restricted. Please contact your instructor or administrator.',
        'USER_RESTRICTED'
      );
    }
  }

  hasActiveRestriction({ user, restrictionType, scopeType = 'global', scopeId = null }) {
    if (!user || !user.id) return false;
    return this.activeRestrictionsForUser(user.id).some(restriction => {
      if (restriction.restrictionType !== restrictionType) return false;
      if (restriction.scopeType === 'global') return true;
      if (restriction.scopeType !== scopeType) return false;
      return Number(restriction.scopeId) === Number(scopeId);
    });
  }

  countActive() {
    return restrictionRepository.countActive();
  }
}

module.exports = new RestrictionService();
module.exports.RESTRICTION_TYPES = RESTRICTION_TYPES;
module.exports.SCOPE_TYPES = SCOPE_TYPES;
