const { LIMITS } = require('../constants/limits');
const { optionalText, requiredText } = require('../utils/validation');

function validateCategory(data) {
  const courseId = data.courseId;

  return {
    courseId,
    name: requiredText(data.name, 'name', { min: 2, max: 100 }),
    description: optionalText(data.description, 'description', LIMITS.courses.descriptionMax)
  };
}

module.exports = { validateCategory };
