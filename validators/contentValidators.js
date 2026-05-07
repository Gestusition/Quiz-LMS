const { resourceTypeValues } = require('../constants/enums');
const { LIMITS } = require('../constants/limits');
const { enumValue, optionalText, optionalUrl, requiredText } = require('../utils/validation');

function validateAnnouncement(data) {
  const title = requiredText(data.title, 'title', { min: 2, max: LIMITS.announcements.titleMax });
  const body = requiredText(data.body, 'body', { min: 2, max: LIMITS.announcements.bodyMax });

  return { title, body };
}

function validateResource(data) {
  const title = requiredText(data.title, 'title', { min: 2, max: LIMITS.resources.titleMax });
  const type = enumValue(data.type, 'type', resourceTypeValues, 'link');
  const url = optionalUrl(data.url, 'url', LIMITS.resources.urlMax, {
    allowRelative: type === 'file',
    allowedRelativePrefixes: ['/uploads/']
  });
  const description = optionalText(data.description, 'description', LIMITS.resources.descriptionMax);

  return { title, type, url, description };
}

module.exports = {
  validateAnnouncement,
  validateResource
};
