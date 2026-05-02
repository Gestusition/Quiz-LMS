function validateCategory(data) {
  const name = data.name;
  const description = data.description;
  const courseId = data.courseId;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Category name is required and must be a non-empty string.');
  }
  if (name.trim().length > 100) {
    throw new Error('Category name must be 100 characters or less.');
  }

  return {
    courseId,
    name: name.trim(),
    description: (description || '').trim()
  };
}

module.exports = { validateCategory };
