const courseRepository = require('../repositories/courseRepository');
const contentRepository = require('../repositories/contentRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const { removeUploadedResourceByUrl } = require('../middleware/upload');
const { forbiddenError, notFoundError } = require('../utils/appError');
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
    return contentRepository.getResources(courseId).map(resource => this.withDownloadUrl(resource));
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
    removeUploadedResourceByUrl(existing.url);
    return true;
  }

  getResourceDownload(id, user) {
    const resource = contentRepository.findResourceById(id);
    if (!resource || resource.type !== 'file') {
      throw notFoundError('Resource not found.');
    }
    if (!enrollmentRepository.canAccessCourse(user, resource.courseId)) {
      throw forbiddenError('Course access required.');
    }
    return {
      id: resource.id,
      fileName: resource.fileName,
      storageUrl: resource.url,
      mimeType: resource.mimeType
    };
  }

  withDownloadUrl(resource) {
    if (!resource || resource.type !== 'file') return resource;
    return {
      ...resource,
      downloadUrl: `/api/courses/resources/${resource.id}/download`
    };
  }
}

module.exports = new ContentService();
