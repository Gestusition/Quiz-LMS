const importRepository = require('../repositories/importRepository');
const { LIMITS } = require('../constants/limits');
const { nowIso } = require('../utils/security');
const { notFoundError, validationError } = require('../utils/appError');
const { optionalText, requiredText } = require('../utils/validation');

const IMPORT_TYPES = ['users', 'students', 'teachers', 'questions', 'enrollments'];
const BATCH_STATUS = ['processed', 'partially_failed', 'failed', 'completed'];
const ERROR_STATUS = ['unresolved', 'fixed', 'ignored'];

class ImportService {
  listBatches(filters = {}) {
    return importRepository.listBatches(filters);
  }

  createBatch(data, actorUserId) {
    const type = String(data.type || '').trim();
    if (!IMPORT_TYPES.includes(type)) {
      throw validationError('type', `type must be one of: ${IMPORT_TYPES.join(', ')}.`);
    }
    const fileName = requiredText(data.fileName, 'file_name', { min: 1, max: LIMITS.imports.fileNameMax });
    const status = String(data.status || 'processed').trim();
    if (!BATCH_STATUS.includes(status)) {
      throw validationError('status', `status must be one of: ${BATCH_STATUS.join(', ')}.`);
    }
    const result = importRepository.createBatch({
      type,
      uploadedBy: actorUserId,
      fileName,
      status,
      totalRows: Number(data.totalRows) || 0,
      successCount: Number(data.successCount) || 0,
      failedCount: Number(data.failedCount) || 0
    });
    return importRepository.findBatchById(result.lastInsertRowid);
  }

  listErrors(batchId, filters = {}) {
    const batch = importRepository.findBatchById(batchId);
    if (!batch) throw notFoundError('Import batch not found.');
    return importRepository.listErrors(batchId, filters);
  }

  addError(batchId, data) {
    const batch = importRepository.findBatchById(batchId);
    if (!batch) throw notFoundError('Import batch not found.');
    const rowNumber = Number(data.rowNumber);
    if (!Number.isInteger(rowNumber) || rowNumber < 1) {
      throw validationError('row_number', 'row_number must be a positive integer.');
    }
    const errorMessage = requiredText(data.errorMessage, 'error_message', {
      min: 1,
      max: LIMITS.imports.errorMessageMax
    });

    const rawDataJson = optionalText(data.rawDataJson || JSON.stringify(data.rawData || {}), 'raw_data_json', LIMITS.imports.rowJsonMax);
    const errorField = optionalText(data.errorField, 'error_field', 120);

    const result = importRepository.createError({
      batchId,
      rowNumber,
      rawDataJson,
      errorField,
      errorMessage,
      status: 'unresolved'
    });
    return importRepository.findErrorById(result.lastInsertRowid);
  }

  resolveError(errorId, data, actorUserId) {
    const existing = importRepository.findErrorById(errorId);
    if (!existing) throw notFoundError('Import error not found.');

    const status = String(data.status || 'fixed').trim();
    if (!ERROR_STATUS.includes(status)) {
      throw validationError('status', `status must be one of: ${ERROR_STATUS.join(', ')}.`);
    }

    const fixedDataJson = optionalText(
      data.fixedDataJson || (data.fixedData ? JSON.stringify(data.fixedData) : ''),
      'fixed_data_json',
      LIMITS.imports.rowJsonMax
    );

    importRepository.updateError(errorId, {
      status,
      fixedDataJson,
      resolvedBy: actorUserId,
      resolvedAt: status === 'unresolved' ? '' : nowIso()
    });

    return importRepository.findErrorById(errorId);
  }

  countOpenErrors() {
    return importRepository.countOpenErrors();
  }
}

module.exports = new ImportService();
module.exports.IMPORT_TYPES = IMPORT_TYPES;
