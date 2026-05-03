const { courseVisibilityValues } = require('../constants/enums');

function validateCourse(data) {
  const code = String(data.code || '').trim().toUpperCase();
  const title = String(data.title || '').trim();
  const description = String(data.description || '').trim();
  const visibility = data.visibility ? String(data.visibility).trim() : 'private';
  const startDate = data.startDate ? String(data.startDate).trim() : '';
  const endDate = data.endDate ? String(data.endDate).trim() : '';
  const departmentId = data.departmentId ? Number(data.departmentId) : null;
  const credits = data.credits === undefined || data.credits === '' ? 3 : Number(data.credits);

  if (!code || code.length > 32 || !/^[A-Z0-9_-]+$/.test(code)) {
    throw new Error('Course code is required and may only contain letters, numbers, underscores, or hyphens.');
  }
  if (!title || title.length > 160) {
    throw new Error('Course title is required and must be 160 characters or less.');
  }
  if (description.length > 1000) {
    throw new Error('Course description must be 1000 characters or less.');
  }
  if (!courseVisibilityValues.includes(visibility)) {
    throw new Error('Course visibility must be private, published, or archived.');
  }
  if (departmentId !== null && (!Number.isInteger(departmentId) || departmentId < 1)) {
    throw new Error('Department must be a valid positive integer.');
  }
  if (!Number.isInteger(credits) || credits < 0 || credits > 30) {
    throw new Error('Course credits must be an integer between 0 and 30.');
  }

  return { code, title, description, visibility, startDate, endDate, departmentId, credits };
}

module.exports = { validateCourse };
