const importRepository = require('../repositories/importRepository');
const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const userRepository = require('../repositories/userRepository');
const courseService = require('./courseService');
const userService = require('./userService');
const { LIMITS } = require('../constants/limits');
const { courseVisibilityValues, roleValues, roles } = require('../constants/enums');
const { nowIso } = require('../utils/security');
const { notFoundError, validationError } = require('../utils/appError');
const { optionalText, requiredEmail, requiredText } = require('../utils/validation');

const RUNNABLE_IMPORT_TYPES = ['users', 'courses', 'enrollments'];
const IMPORT_TYPES = ['users', 'students', 'teachers', 'questions', 'courses', 'enrollments'];
const BATCH_STATUS = ['pending', 'processing', 'completed', 'completed_with_errors', 'failed'];
const ERROR_STATUS = ['unresolved', 'fixed', 'ignored'];
const IMPORT_FILE_EXTENSIONS = ['.csv'];
const IMPORT_FILE_MIME_TYPES = ['text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel'];
const LEGACY_STATUS_MAP = Object.freeze({
  processed: 'completed',
  partially_failed: 'completed_with_errors'
});
const CSV_HEADERS = Object.freeze({
  users: ['email', 'password', 'firstName', 'lastName', 'role'],
  courses: ['code', 'title', 'description', 'visibility'],
  enrollments: ['userEmail', 'courseCode']
});

class ImportService {
  listBatches(filters = {}) {
    return importRepository.listBatches({
      ...filters,
      status: normalizeBatchStatus(filters.status || '')
    });
  }

  createBatch(data, actorUserId) {
    const type = String(data.type || '').trim();
    if (!IMPORT_TYPES.includes(type)) {
      throw validationError('type', `type must be one of: ${IMPORT_TYPES.join(', ')}.`);
    }
    const fileName = requiredText(data.fileName, 'file_name', { min: 1, max: LIMITS.imports.fileNameMax });
    const status = normalizeBatchStatus(data.status || 'pending');
    if (!BATCH_STATUS.includes(status)) {
      throw validationError('status', `status must be one of: ${BATCH_STATUS.join(', ')}.`);
    }
    const counts = normalizeImportCounts(data);
    const result = importRepository.createBatch({
      type,
      uploadedBy: actorUserId,
      fileName,
      fileType: normalizeFileType(data.fileType || fileName),
      mimeType: optionalText(data.mimeType, 'mime_type', 160),
      fileSizeBytes: nonNegativeInteger(data.fileSizeBytes, 'file_size_bytes'),
      status,
      totalRows: nonNegativeInteger(data.totalRows, 'total_rows'),
      ...counts
    });
    return importRepository.findBatchById(result.lastInsertRowid);
  }

  runCsvImport(data, actor) {
    const actorUser = normalizeActor(actor);
    const actorUserId = actorUser && actorUser.id ? actorUser.id : actor;
    const type = String(data.type || '').trim();
    if (!RUNNABLE_IMPORT_TYPES.includes(type)) {
      throw validationError('type', `type must be one of: ${RUNNABLE_IMPORT_TYPES.join(', ')}.`);
    }

    const fileName = requiredText(data.fileName, 'file_name', { min: 1, max: LIMITS.imports.fileNameMax });
    const fileBuffer = Buffer.isBuffer(data.buffer) ? data.buffer : Buffer.from(String(data.content || ''), 'utf8');
    validateImportFile(fileName, data.mimeType || '', fileBuffer);
    if (!fileBuffer.length) {
      throw validationError('file', 'Import CSV file is required.');
    }
    if (fileBuffer.length > LIMITS.imports.fileSizeMaxBytes) {
      throw validationError('file', 'Import CSV file is too large.');
    }
    if (fileBuffer.includes(0)) {
      throw validationError('file', 'Import CSV file must be plain text.');
    }

    const batch = this.createBatch({
      type,
      fileName,
      fileType: normalizeFileType(fileName),
      mimeType: data.mimeType || '',
      fileSizeBytes: fileBuffer.length,
      status: 'pending'
    }, actorUserId);
    this.updateBatchCounters(batch.id, {
      status: 'processing',
      totalRows: 0,
      createdCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      validationErrorCount: 0
    });

    try {
      const parsed = this.parseCsvImport(fileBuffer.toString('utf8'), type);
      const counts = {
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        failedCount: 0,
        validationErrorCount: 0
      };

      parsed.rows.forEach(row => {
        try {
          const imported = this.importRow(type, row.data, actorUser);
          if (imported && imported.importAction === 'updated') {
            counts.updatedCount += 1;
          } else {
            counts.createdCount += 1;
          }
        } catch (err) {
          counts.validationErrorCount += 1;
          if (isSkippedImportError(err)) {
            counts.skippedCount += 1;
          } else {
            counts.failedCount += 1;
          }
          this.recordRowError(batch.id, row.rowNumber, row.data, err);
        }
      });

      const status = counts.validationErrorCount > 0 ? 'completed_with_errors' : 'completed';
      this.updateBatchCounters(batch.id, {
        status,
        totalRows: parsed.rows.length,
        ...counts
      });
    } catch (err) {
      this.recordRowError(batch.id, 1, {}, err, 'file');
      this.updateBatchCounters(batch.id, {
        status: 'failed',
        totalRows: 0,
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        failedCount: 1,
        validationErrorCount: 1
      });
    }

    return importRepository.findBatchById(batch.id);
  }

  parseCsvImport(text, type) {
    const rows = parseCsv(text.replace(/^\uFEFF/, ''));
    if (rows.length === 0) {
      throw validationError('file', 'CSV file must include a header row.');
    }

    const expectedHeaders = CSV_HEADERS[type];
    const header = rows[0].values.map(value => String(value || '').trim());
    if (header.length !== expectedHeaders.length || header.some((field, index) => field !== expectedHeaders[index])) {
      throw validationError('header', `CSV header must be: ${expectedHeaders.join(',')}.`);
    }

    return {
      headers: expectedHeaders,
      rows: rows.slice(1).map(row => ({
        rowNumber: row.rowNumber,
        data: rowToObject(expectedHeaders, row.values)
      }))
    };
  }

  importRow(type, row, actor) {
    if (row.__rowError) throw validationError('row', row.__rowError);
    if (type === 'users') return this.importUserRow(row, actor);
    if (type === 'courses') return this.importCourseRow(row, actor);
    if (type === 'enrollments') return this.importEnrollmentRow(row);
    throw validationError('type', `type must be one of: ${RUNNABLE_IMPORT_TYPES.join(', ')}.`);
  }

  importUserRow(row, actor) {
    const email = requiredEmail(row.email);
    if (userRepository.findDuplicateEmail(email)) {
      throw validationError('email', 'A user with this email already exists.');
    }

    const role = requiredText(row.role, 'role', { min: 1, max: 30 });
    if (!roleValues.includes(role)) {
      throw validationError('role', `Role must be one of: ${roleValues.join(', ')}.`);
    }

    const firstName = requiredText(row.firstName, 'firstName', { min: 1, max: LIMITS.users.nameMax });
    const lastName = requiredText(row.lastName, 'lastName', { min: 1, max: LIMITS.users.nameMax });
    const payload = {
      email,
      username: usernameFromEmail(email),
      password: String(row.password || ''),
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      role,
      mustChangeCredentials: true
    };

    if (role === roles.student) {
      payload.studentNumber = academicIdentifierFromEmail(email, 'STU');
    }

    return userService.createUser(payload, actor && actor.id ? actor.id : actor);
  }

  importCourseRow(row, actor) {
    const code = requiredText(row.code, 'code', { min: 2, max: LIMITS.courses.codeMax }).toUpperCase();
    if (courseRepository.findDuplicateCode(code)) {
      throw validationError('code', 'A course with this code already exists.');
    }
    const visibility = requiredText(row.visibility, 'visibility', { min: 1, max: 30 });
    if (!courseVisibilityValues.includes(visibility)) {
      throw validationError('visibility', `visibility must be one of: ${courseVisibilityValues.join(', ')}.`);
    }
    return courseService.create({
      code,
      title: row.title,
      description: row.description,
      visibility
    }, actor);
  }

  importEnrollmentRow(row) {
    const email = requiredEmail(row.userEmail);
    const courseCode = requiredText(row.courseCode, 'courseCode', { min: 2, max: LIMITS.courses.codeMax }).toUpperCase();
    const user = userRepository.findByEmail(email);
    if (!user) {
      throw validationError('userEmail', 'User not found.');
    }
    const course = courseRepository.findDuplicateCode(courseCode);
    if (!course) {
      throw validationError('courseCode', 'Course not found.');
    }
    if (![roles.student, roles.teacher].includes(user.role)) {
      throw validationError('userEmail', 'Only teacher and student users can be enrolled in courses.');
    }
    if (enrollmentRepository.findByCourseUserRole(course.id, user.id, user.role)) {
      throw validationError('userEmail', 'User is already enrolled in this course.');
    }
    return courseService.enroll(course.id, user.id, user.role);
  }

  updateBatchCounters(batchId, payload) {
    const counts = normalizeImportCounts(payload);
    importRepository.updateBatch(batchId, {
      status: payload.status,
      totalRows: nonNegativeInteger(payload.totalRows, 'total_rows'),
      ...counts
    });
  }

  recordRowError(batchId, rowNumber, row, err, fallbackField = '') {
    const message = (err && err.message) ? err.message : 'Row could not be imported.';
    const field = (err && err.field) ? err.field : fallbackField;
    this.addError(batchId, {
      rowNumber,
      rawData: row,
      errorField: field,
      errorMessage: message
    });
  }

  listErrors(batchId, filters = {}) {
    const batch = importRepository.findBatchById(batchId);
    if (!batch) throw notFoundError('Import batch not found.');
    return importRepository.listErrors(batchId, filters);
  }

  getBatchDetail(batchId) {
    const batch = importRepository.findBatchById(batchId);
    if (!batch) throw notFoundError('Import batch not found.');
    const errors = importRepository.listErrors(batchId, { limit: 100 });
    return {
      ...batch,
      errors: errors.items,
      errorPagination: errors.pagination
    };
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

    const rawDataJson = optionalText(safeRowJson(data.rawDataJson, data.rawData), 'raw_data_json', LIMITS.imports.rowJsonMax);
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

function normalizeBatchStatus(status) {
  const value = String(status || '').trim();
  return LEGACY_STATUS_MAP[value] || value;
}

function firstDefined(data, fields) {
  for (const field of fields) {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      return data[field];
    }
  }
  return undefined;
}

function nonNegativeInteger(value, field) {
  if (value === undefined || value === null || value === '') return 0;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw validationError(field, `${field} must be a non-negative integer.`);
  }
  return number;
}

function normalizeImportCounts(data = {}) {
  const successRows = firstDefined(data, ['successRows', 'successCount']);
  const failedRows = firstDefined(data, ['failedRows', 'failedCount']);
  const createdRows = firstDefined(data, ['createdRows', 'createdCount']);
  const updatedRows = firstDefined(data, ['updatedRows', 'updatedCount']);
  const skippedRows = firstDefined(data, ['skippedRows', 'skippedCount']);
  const validationErrors = firstDefined(data, ['validationErrors', 'validationErrorCount']);

  const createdCount = createdRows === undefined
    ? nonNegativeInteger(successRows, 'created_count')
    : nonNegativeInteger(createdRows, 'created_count');
  const updatedCount = nonNegativeInteger(updatedRows, 'updated_count');
  const skippedCount = nonNegativeInteger(skippedRows, 'skipped_count');
  const failedCount = nonNegativeInteger(failedRows, 'failed_count');
  const successCount = successRows === undefined
    ? createdCount + updatedCount
    : nonNegativeInteger(successRows, 'success_count');
  const validationErrorCount = validationErrors === undefined
    ? failedCount + skippedCount
    : nonNegativeInteger(validationErrors, 'validation_error_count');

  return {
    successCount,
    failedCount,
    createdCount,
    updatedCount,
    skippedCount,
    validationErrorCount
  };
}

function normalizeFileType(value) {
  const text = String(value || '').trim().toLowerCase();
  const ext = text.includes('.') ? text.slice(text.lastIndexOf('.')) : text;
  return ext.replace(/^\./, '');
}

function validateImportFile(fileName, mimeType, fileBuffer) {
  const lowerName = String(fileName || '').toLowerCase();
  if (!IMPORT_FILE_EXTENSIONS.some(ext => lowerName.endsWith(ext))) {
    throw validationError('file', 'Unsupported import file type. Upload a CSV file.');
  }
  const mime = String(mimeType || '').trim().toLowerCase();
  if (mime && !IMPORT_FILE_MIME_TYPES.includes(mime)) {
    throw validationError('file', 'Unsupported import file type. Upload a CSV file.');
  }
  if (!Buffer.isBuffer(fileBuffer)) return;
  if (fileBuffer.includes(0)) {
    throw validationError('file', 'Import CSV file must be plain text.');
  }
}

function isSkippedImportError(err) {
  const message = String((err && err.message) || '').toLowerCase();
  return err?.status === 409 ||
    message.includes('already exists') ||
    message.includes('already enrolled') ||
    message.includes('duplicate');
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let rowNumber = 1;

  const pushRow = () => {
    row.push(field);
    field = '';
    if (row.some(value => String(value || '').trim() !== '')) {
      rows.push({ rowNumber, values: row });
    }
    row = [];
    rowNumber += 1;
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      pushRow();
    } else if (char === '\r') {
      if (text[index + 1] === '\n') index += 1;
      pushRow();
    } else {
      field += char;
    }
  }

  if (inQuotes) {
    throw validationError('file', 'CSV has an unterminated quoted field.');
  }
  if (field || row.length) {
    pushRow();
  }
  return rows;
}

function rowToObject(headers, values) {
  const data = headers.reduce((acc, header, index) => {
    acc[header] = String(values[index] || '').trim();
    return acc;
  }, {});
  if (values.length !== headers.length) {
    data.__rowError = `Expected ${headers.length} columns but found ${values.length}.`;
  }
  return data;
}

function academicIdentifierFromEmail(email, prefix) {
  const local = String(email || '').split('@')[0].replace(/[^A-Za-z0-9._-]/g, '');
  if (local.length >= LIMITS.users.studentNumberMin) {
    return local.slice(0, LIMITS.users.studentNumberMax);
  }
  return `${prefix}-${local || 'USER'}`.slice(0, LIMITS.users.studentNumberMax);
}

function usernameFromEmail(email) {
  const local = String(email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
  const base = local.length >= LIMITS.users.usernameMin ? local : `usr-${local || 'user'}`;
  return base.slice(0, LIMITS.users.usernameMax);
}

function safeRowJson(rawDataJson, rawData) {
  if (rawDataJson) return rawDataJson;
  const sanitized = sanitizeRawRow(rawData || {});
  const json = JSON.stringify(sanitized);
  if (json.length <= LIMITS.imports.rowJsonMax) return json;
  return JSON.stringify({ truncated: true });
}

function sanitizeRawRow(row) {
  return Object.entries(row || {}).reduce((acc, [key, value]) => {
    acc[key] = String(key).toLowerCase() === 'password' ? '[redacted]' : value;
    return acc;
  }, {});
}

function normalizeActor(actor) {
  if (actor && typeof actor === 'object') return actor;
  if (!actor) return null;
  return userRepository.findPublicById(actor);
}

module.exports = new ImportService();
module.exports.IMPORT_TYPES = IMPORT_TYPES;
module.exports.RUNNABLE_IMPORT_TYPES = RUNNABLE_IMPORT_TYPES;
