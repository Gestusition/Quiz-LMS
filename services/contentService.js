const courseRepository = require('../repositories/courseRepository');
const contentRepository = require('../repositories/contentRepository');
const {
  validateAnnouncement,
  validateResource
} = require('../validators/contentValidators');

class ContentService {
  getAnnouncements(courseId) {
    return contentRepository.getAnnouncements(courseId);
  }

  createAnnouncement(courseId, data, user) {
    const payload = validateAnnouncement(data);
    const course = courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found.');
    }

    const result = contentRepository.insertAnnouncement(courseId, payload, user.id);
    return this.getAnnouncements(courseId).find(item => item.id === result.lastInsertRowid);
  }

  deleteAnnouncement(id) {
    const existing = contentRepository.findAnnouncementById(id);
    if (!existing) {
      throw new Error('Announcement not found.');
    }
    contentRepository.deleteAnnouncement(id);
    return true;
  }

  getResources(courseId) {
    return contentRepository.getResources(courseId);
  }

  createResource(courseId, data, user) {
    const payload = validateResource(data);
    const course = courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found.');
    }

    const result = contentRepository.insertResource(courseId, payload, user.id);
    return this.getResources(courseId).find(item => item.id === result.lastInsertRowid);
  }

  deleteResource(id) {
    const existing = contentRepository.findResourceById(id);
    if (!existing) {
      throw new Error('Resource not found.');
    }
    contentRepository.deleteResource(id);
    return true;
  }
}

module.exports = new ContentService();
