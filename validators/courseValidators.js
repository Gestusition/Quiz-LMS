const { courseVisibilityValues } = require('../constants/enums');
const { LIMITS } = require('../constants/limits');
const { validationError } = require('../utils/appError');
const {
  ensureDateOrder,
  enumValue,
  intInRange,
  optionalId,
  optionalText,
  requiredText
} = require('../utils/validation');

function validateCourse(data) {
  const code = requiredText(data.code, 'code', { min: 2, max: LIMITS.courses.codeMax }).toUpperCase();
  const title = requiredText(data.title, 'title', { min: 2, max: LIMITS.courses.titleMax });
  const description = optionalText(data.description, 'description', LIMITS.courses.descriptionMax);
  const visibility = enumValue(data.visibility, 'visibility', courseVisibilityValues, 'private');
  const startDate = data.startDate ? String(data.startDate).trim() : '';
  const endDate = data.endDate ? String(data.endDate).trim() : '';
  const departmentId = optionalId(data.departmentId, 'departmentId');
  const credits = intInRange(data.credits, 'credits', 0, LIMITS.courses.creditsMax, {
    required: false,
    defaultValue: 3
  });

  if (!/^[A-Z0-9_-]+$/.test(code)) {
    throw validationError('code', 'Course code may only contain letters, numbers, underscores, or hyphens.');
  }
  ensureDateOrder(startDate, endDate, 'startDate', 'endDate');

  return { code, title, description, visibility, startDate, endDate, departmentId, credits };
}

module.exports = { validateCourse };
