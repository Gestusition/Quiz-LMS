const { LIMITS } = require('../constants/limits');
const { validationError } = require('../utils/appError');
const { enumValue, optionalText, optionalUrl, requiredText } = require('../utils/validation');

const RESOURCE_TYPES = ['link', 'file'];

function validateAnnouncement(data) {
  const title = requiredText(data.title, 'title', { min: 2, max: LIMITS.announcements.titleMax });
  const body = requiredText(data.body, 'body', { min: 2, max: LIMITS.announcements.bodyMax });

  return { title, body };
}

function validateResource(data) {
  const title = requiredText(data.title, 'title', { min: 2, max: LIMITS.resources.titleMax });
  const type = enumValue(data.type, 'type', RESOURCE_TYPES, 'link');
  const url = optionalUrl(data.url, 'url', LIMITS.resources.urlMax, {
    allowRelative: type === 'file',
    allowedRelativePrefixes: ['/uploads/resources/']
  });
  if (!url) {
    throw validationError(type === 'file' ? 'file' : 'url', type === 'file' ? 'A resource file is required.' : 'URL is required.');
  }
  const description = optionalText(data.description, 'description', LIMITS.resources.descriptionMax);

  const fileSizeBytes = Number.isInteger(Number(data.fileSizeBytes)) ? Number(data.fileSizeBytes) : 0;
  if (fileSizeBytes > LIMITS.resources.fileSizeMaxBytes) {
    throw validationError('file', 'Resource file must be 100 MB or smaller.');
  }

  return {
    title,
    type,
    url,
    description,
    fileName: optionalText(data.fileName, 'fileName', 255),
    fileSizeBytes,
    mimeType: optionalText(data.mimeType, 'mimeType', 120)
  };
}

module.exports = {
  validateAnnouncement,
  validateResource
};
