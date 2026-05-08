const { parseRequiredPositiveInt } = require('../utils/validation');

/**
 * Middleware for input validation on request bodies.
 * Ensures all inputs are validated on the backend before processing.
 */

/**
 * Validate that required fields are present in req.body.
 * @param {string[]} fields - List of required field names.
 * @returns {Function} Express middleware function.
 */
function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
    });

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }
    next();
  };
}

/**
 * Validate that the ID parameter is a valid positive integer.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 */
function validateId(req, res, next) {
  try {
    req.params.id = parseRequiredPositiveInt(req.params.id, 'id');
  } catch (err) {
    return res.status(400).json({ error: 'Invalid ID. Must be a positive integer.' });
  }
  next();
}

/**
 * Sanitize string fields in req.body by trimming whitespace.
 * @param {string[]} fields - List of field names to sanitize.
 * @returns {Function} Express middleware function.
 */
function sanitizeStrings(fields) {
  return (req, res, next) => {
    for (const field of fields) {
      if (typeof req.body[field] === 'string') {
        req.body[field] = req.body[field].trim();
      }
    }
    next();
  };
}

module.exports = { requireFields, validateId, sanitizeStrings };
