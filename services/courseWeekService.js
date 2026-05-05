const courseWeekRepository = require('../repositories/courseWeekRepository');
const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const { LIMITS } = require('../constants/limits');
const { notFoundError, forbiddenError } = require('../utils/appError');
const {
  dateValue,
  ensureDateOrder,
  enumValue,
  intInRange,
  optionalText,
  requiredText
} = require('../utils/validation');
const { nowIso } = require('../utils/security');

const RESOURCE_TYPES = ['link', 'file', 'page'];

class CourseWeekService {
  listWeeks(courseId, user, filters = {}) {
    this.ensureCourseAccess(courseId, user);
    const visibleOnly = user.role === 'student';
    return courseWeekRepository.listWeeks(courseId, { ...filters, visibleOnly });
  }

  createWeek(courseId, user, data) {
    this.ensureCourseManager(courseId, user);
    const startsAt = dateValue(data.startsAt, 'starts_at', { required: false });
    const endsAt = dateValue(data.endsAt, 'ends_at', { required: false });
    ensureDateOrder(startsAt, endsAt, 'starts_at', 'ends_at');

    const result = courseWeekRepository.createWeek({
      courseId,
      weekNumber: intInRange(data.weekNumber, 'week_number', 1, 60),
      title: requiredText(data.title, 'title', { min: 2, max: LIMITS.courses.titleMax }),
      description: optionalText(data.description, 'description', LIMITS.courses.descriptionMax),
      startsAt,
      endsAt,
      visible: data.visible !== false,
      createdBy: user.id
    });
    return courseWeekRepository.findWeekById(result.lastInsertRowid);
  }

  updateWeek(weekId, user, data) {
    const existing = courseWeekRepository.findWeekById(weekId);
    if (!existing) throw notFoundError('Course week not found.');
    this.ensureCourseManager(existing.courseId, user);

    const startsAt = dateValue(data.startsAt !== undefined ? data.startsAt : existing.startsAt, 'starts_at', { required: false });
    const endsAt = dateValue(data.endsAt !== undefined ? data.endsAt : existing.endsAt, 'ends_at', { required: false });
    ensureDateOrder(startsAt, endsAt, 'starts_at', 'ends_at');

    courseWeekRepository.updateWeek(weekId, {
      weekNumber: intInRange(data.weekNumber !== undefined ? data.weekNumber : existing.weekNumber, 'week_number', 1, 60),
      title: requiredText(data.title !== undefined ? data.title : existing.title, 'title', { min: 2, max: LIMITS.courses.titleMax }),
      description: optionalText(data.description !== undefined ? data.description : existing.description, 'description', LIMITS.courses.descriptionMax),
      startsAt,
      endsAt,
      visible: data.visible !== undefined ? !!data.visible : !!existing.visible
    }, nowIso());

    return courseWeekRepository.findWeekById(weekId);
  }

  deleteWeek(weekId, user) {
    const existing = courseWeekRepository.findWeekById(weekId);
    if (!existing) throw notFoundError('Course week not found.');
    this.ensureCourseManager(existing.courseId, user);
    courseWeekRepository.deleteWeek(weekId);
    return true;
  }

  listWeekResources(weekId, user, filters = {}) {
    const week = courseWeekRepository.findWeekById(weekId);
    if (!week) throw notFoundError('Course week not found.');
    this.ensureCourseAccess(week.courseId, user);
    return courseWeekRepository.listWeekResources(weekId, filters);
  }

  createWeekResource(weekId, user, data) {
    const week = courseWeekRepository.findWeekById(weekId);
    if (!week) throw notFoundError('Course week not found.');
    this.ensureCourseManager(week.courseId, user);

    const visibleFrom = dateValue(data.visibleFrom, 'visible_from', { required: false });
    const visibleUntil = dateValue(data.visibleUntil, 'visible_until', { required: false });
    ensureDateOrder(visibleFrom, visibleUntil, 'visible_from', 'visible_until');

    const result = courseWeekRepository.createWeekResource({
      weekId,
      title: requiredText(data.title, 'title', { min: 2, max: LIMITS.resources.titleMax }),
      type: enumValue(data.type, 'type', RESOURCE_TYPES, 'link'),
      content: optionalText(data.content || data.url, 'content', LIMITS.resources.urlMax),
      visibleFrom,
      visibleUntil,
      createdBy: user.id
    });

    return courseWeekRepository.findWeekResourceById(result.lastInsertRowid);
  }

  deleteWeekResource(resourceId, user) {
    const resource = courseWeekRepository.findWeekResourceById(resourceId);
    if (!resource) throw notFoundError('Week resource not found.');
    const week = courseWeekRepository.findWeekById(resource.weekId);
    if (!week) throw notFoundError('Course week not found.');
    this.ensureCourseManager(week.courseId, user);
    courseWeekRepository.deleteWeekResource(resourceId);
    return true;
  }

  ensureCourseAccess(courseId, user) {
    const course = courseRepository.findById(courseId);
    if (!course) throw notFoundError('Course not found.');
    if (!enrollmentRepository.canAccessCourse(user, courseId)) {
      throw forbiddenError('Course access required.');
    }
  }

  ensureCourseManager(courseId, user) {
    const course = courseRepository.findById(courseId);
    if (!course) throw notFoundError('Course not found.');
    if (!enrollmentRepository.canManageCourse(user, courseId)) {
      throw forbiddenError('Teacher or admin course access required.');
    }
  }
}

module.exports = new CourseWeekService();
