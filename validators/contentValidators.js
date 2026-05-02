const { resourceTypeValues } = require('../constants/enums');

function validateAnnouncement(data) {
  const title = String(data.title || '').trim();
  const body = String(data.body || '').trim();

  if (!title || title.length > 160) {
    throw new Error('Announcement title is required and must be 160 characters or less.');
  }
  if (!body || body.length > 2000) {
    throw new Error('Announcement body is required and must be 2000 characters or less.');
  }

  return { title, body };
}

function validateResource(data) {
  const title = String(data.title || '').trim();
  const type = data.type ? String(data.type).trim() : 'link';
  const url = data.url ? String(data.url).trim() : '';
  const description = data.description ? String(data.description).trim() : '';

  if (!title || title.length > 160) {
    throw new Error('Resource title is required and must be 160 characters or less.');
  }
  if (!resourceTypeValues.includes(type)) {
    throw new Error('Resource type must be link, file, or page.');
  }
  if (url.length > 500 || description.length > 1000) {
    throw new Error('Resource URL or description is too long.');
  }

  return { title, type, url, description };
}

module.exports = {
  validateAnnouncement,
  validateResource
};
