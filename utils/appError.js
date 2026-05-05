class AppError extends Error {
  constructor({ status = 500, error = 'Internal server error', message = '', field = '', code = '', details = null } = {}) {
    super(message || error);
    this.name = 'AppError';
    this.status = status;
    this.error = error;
    this.field = field;
    this.code = code;
    this.details = details;
  }
}

function validationError(field, message, details = null) {
  return new AppError({
    status: 400,
    error: 'Validation failed',
    field,
    message,
    details
  });
}

function conflictError(field, message) {
  return new AppError({
    status: 409,
    error: 'Conflict',
    field,
    message
  });
}

function forbiddenError(message = 'You do not have permission to perform this action.', code = '') {
  return new AppError({
    status: 403,
    error: 'Access restricted',
    message,
    code
  });
}

function notFoundError(message = 'Resource not found.') {
  return new AppError({
    status: 404,
    error: 'Not found',
    message
  });
}

function unauthorizedError(message = 'Authentication required.') {
  return new AppError({
    status: 401,
    error: 'Unauthorized',
    message
  });
}

function toErrorResponse(err, fallbackStatus = 500) {
  if (err instanceof AppError) {
    const payload = { error: err.error || 'Error' };
    if (err.field) payload.field = err.field;
    if (err.message && err.message !== err.error) payload.message = err.message;
    if (err.code) payload.code = err.code;
    if (err.details) payload.details = err.details;
    return { status: err.status, payload };
  }

  if (String(err && err.code) === 'SQLITE_CONSTRAINT_UNIQUE' || /unique constraint/i.test(String(err && err.message))) {
    return {
      status: 409,
      payload: {
        error: 'Conflict',
        message: 'A record with the same unique value already exists.'
      }
    };
  }

  const safeStatus = fallbackStatus >= 400 && fallbackStatus < 500 ? fallbackStatus : 500;
  if (safeStatus >= 500) {
    return {
      status: 500,
      payload: { error: 'Internal server error.' }
    };
  }

  return {
    status: safeStatus,
    payload: { error: err && err.message ? err.message : 'Request failed.' }
  };
}

function sendError(res, err, fallbackStatus = 500) {
  const { status, payload } = toErrorResponse(err, fallbackStatus);
  return res.status(status).json(payload);
}

module.exports = {
  AppError,
  conflictError,
  forbiddenError,
  notFoundError,
  sendError,
  toErrorResponse,
  unauthorizedError,
  validationError
};
