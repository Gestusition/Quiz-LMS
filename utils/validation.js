const { LIMITS } = require('../constants/limits');
const { validationError } = require('./appError');

function asTrimmedString(value) {
  return String(value === undefined || value === null ? '' : value).trim();
}

function requiredText(value, field, { min = 1, max = 255 } = {}) {
  const text = asTrimmedString(value);
  if (!text) throw validationError(field, `${field} is required.`);
  if (text.length < min || text.length > max) {
    throw validationError(field, `${field} must be between ${min} and ${max} characters.`);
  }
  return text;
}

function optionalText(value, field, max = 255) {
  const text = asTrimmedString(value);
  if (!text) return '';
  if (text.length > max) throw validationError(field, `${field} must be ${max} characters or less.`);
  return text;
}

function optionalUrl(value, field, max = 2000, options = {}) {
  const text = optionalText(value, field, max);
  if (!text) return '';

  const {
    allowRelative = false,
    allowedProtocols = ['http:', 'https:'],
    allowedRelativePrefixes = ['/uploads/']
  } = options;

  if (allowRelative && text.startsWith('/')) {
    const allowed = allowedRelativePrefixes.some(prefix => text.startsWith(prefix));
    if (!allowed || text.includes('\\')) {
      throw validationError(field, `${field} must be a safe relative URL.`);
    }
    return text;
  }

  let parsed;
  try {
    parsed = new URL(text);
  } catch (err) {
    throw validationError(field, `${field} must be a valid URL.`);
  }

  if (!allowedProtocols.includes(parsed.protocol)) {
    throw validationError(field, `${field} must use one of: ${allowedProtocols.join(', ')}.`);
  }

  return parsed.toString();
}

function requiredEmail(value) {
  const email = asTrimmedString(value).toLowerCase();
  if (!email) throw validationError('email', 'Email is required.');
  if (email.length > LIMITS.users.emailMax) {
    throw validationError('email', `Email must be ${LIMITS.users.emailMax} characters or less.`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw validationError('email', 'Email format is invalid.');
  }
  return email;
}

function optionalId(value, field) {
  if (value === undefined || value === null || value === '') return null;
  const id = parsePositiveInt(value);
  if (id === null) {
    throw validationError(field, `${field} must be a positive integer.`);
  }
  return id;
}

function requiredId(value, field) {
  const id = optionalId(value, field);
  if (!id) throw validationError(field, `${field} is required.`);
  return id;
}

function parsePositiveInt(value) {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : null;
  }
  if (typeof value === 'bigint') {
    if (value < 1n || value > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    return Number(value);
  }
  const text = asTrimmedString(value);
  if (!/^[0-9]+$/.test(text)) return null;
  const numeric = Number(text);
  return Number.isSafeInteger(numeric) && numeric > 0 ? numeric : null;
}

function parseRequiredPositiveInt(value, fieldName = 'id') {
  const id = parseOptionalPositiveInt(value, fieldName);
  if (!id) throw validationError(fieldName, `${fieldName} is required.`);
  return id;
}

function parseOptionalPositiveInt(value, fieldName = 'id') {
  if (value === undefined || value === null || value === '') return null;
  const id = parsePositiveInt(value);
  if (!id) throw validationError(fieldName, `${fieldName} must be a positive integer.`);
  return id;
}

function intInRange(value, field, min, max, { required = true, defaultValue = null } = {}) {
  if ((value === undefined || value === null || value === '') && !required) {
    return defaultValue;
  }
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < min || numeric > max) {
    throw validationError(field, `${field} must be an integer between ${min} and ${max}.`);
  }
  return numeric;
}

function numberInRange(value, field, min, max, { required = true, defaultValue = null } = {}) {
  if ((value === undefined || value === null || value === '') && !required) {
    return defaultValue;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < min || numeric > max) {
    throw validationError(field, `${field} must be between ${min} and ${max}.`);
  }
  return numeric;
}

function booleanValue(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  return Boolean(value);
}

function enumValue(value, field, allowed, defaultValue) {
  const normalized = asTrimmedString(value || defaultValue);
  if (!allowed.includes(normalized)) {
    throw validationError(field, `${field} must be one of: ${allowed.join(', ')}.`);
  }
  return normalized;
}

function dateValue(value, field, { required = false } = {}) {
  const text = asTrimmedString(value);
  if (!text) {
    if (required) throw validationError(field, `${field} is required.`);
    return '';
  }
  const ts = Date.parse(text);
  if (Number.isNaN(ts)) throw validationError(field, `${field} must be a valid date/time.`);
  return new Date(ts).toISOString();
}

function dateOnlyValue(value, field, { required = false } = {}) {
  const text = asTrimmedString(value);
  if (!text) {
    if (required) throw validationError(field, `${field} is required.`);
    return '';
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw validationError(field, `${field} must be a date in YYYY-MM-DD format.`);
  }

  const parsed = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
    throw validationError(field, `${field} must be a valid calendar date.`);
  }
  return text;
}

function ensureDateOrder(start, end, startField, endField) {
  if (!start || !end) return;
  if (new Date(start).getTime() > new Date(end).getTime()) {
    throw validationError(endField, `${endField} must be later than or equal to ${startField}.`);
  }
}

function parsePagination(query = {}) {
  const page = intInRange(query.page, 'page', 1, 100000, {
    required: false,
    defaultValue: LIMITS.pagination.defaultPage
  });
  const limit = intInRange(query.limit, 'limit', 1, LIMITS.pagination.maxPageSize, {
    required: false,
    defaultValue: LIMITS.pagination.defaultPageSize
  });

  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
}

function stripInvisible(value) {
  return asTrimmedString(value).replace(/\s+/g, ' ');
}

module.exports = {
  asTrimmedString,
  booleanValue,
  dateOnlyValue,
  dateValue,
  ensureDateOrder,
  enumValue,
  intInRange,
  numberInRange,
  optionalId,
  optionalText,
  optionalUrl,
  parseOptionalPositiveInt,
  parsePagination,
  parsePositiveInt,
  parseRequiredPositiveInt,
  requiredEmail,
  requiredId,
  requiredText,
  stripInvisible
};
