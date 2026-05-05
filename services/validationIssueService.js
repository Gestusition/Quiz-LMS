const validationIssueRepository = require('../repositories/validationIssueRepository');
const { notFoundError, validationError } = require('../utils/appError');
const { nowIso } = require('../utils/security');

const VALID_STATUSES = ['open', 'resolved', 'ignored'];
const VALID_SEVERITIES = ['info', 'warning', 'error', 'critical'];

class ValidationIssueService {
  list(filters = {}) {
    return validationIssueRepository.list(filters);
  }

  create(issue) {
    if (!issue || !issue.entityType) {
      throw validationError('entity_type', 'entity_type is required.');
    }
    if (!issue.message) {
      throw validationError('message', 'message is required.');
    }
    if (issue.severity && !VALID_SEVERITIES.includes(issue.severity)) {
      throw validationError('severity', `severity must be one of: ${VALID_SEVERITIES.join(', ')}.`);
    }
    const result = validationIssueRepository.create(issue);
    return validationIssueRepository.findById(result.lastInsertRowid);
  }

  updateStatus(id, status, actorUserId) {
    if (!VALID_STATUSES.includes(status)) {
      throw validationError('status', `status must be one of: ${VALID_STATUSES.join(', ')}.`);
    }
    const existing = validationIssueRepository.findById(id);
    if (!existing) throw notFoundError('Validation issue not found.');
    const resolvedAt = status === 'open' ? '' : nowIso();
    validationIssueRepository.updateStatus(id, status, actorUserId, resolvedAt);
    return validationIssueRepository.findById(id);
  }

  countOpen() {
    return validationIssueRepository.countOpen();
  }
}

module.exports = new ValidationIssueService();
