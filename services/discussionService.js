const discussionRepository = require('../repositories/discussionRepository');
const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const restrictionService = require('./restrictionService');
const { LIMITS } = require('../constants/limits');
const { validationError, notFoundError, forbiddenError } = require('../utils/appError');
const { enumValue, requiredText } = require('../utils/validation');
const { nowIso } = require('../utils/security');

const THREAD_STATUS = ['open', 'locked', 'archived'];

class DiscussionService {
  listThreads(courseId, user, filters = {}) {
    this.ensureCourseAccess(courseId, user);
    return discussionRepository.listThreads(courseId, filters);
  }

  createThread(courseId, user, data) {
    this.ensureCourseAccess(courseId, user);
    restrictionService.assertAccessAllowed({
      user,
      restrictionType: 'chat_muted',
      scopeType: 'course',
      scopeId: courseId,
      safeMessage: 'Your discussion posting access is restricted. Please contact your instructor or administrator.'
    });

    const result = discussionRepository.createThread({
      courseId,
      title: requiredText(data.title, 'title', { min: 2, max: LIMITS.discussions.titleMax }),
      body: requiredText(data.body, 'body', { min: 2, max: LIMITS.discussions.bodyMax }),
      createdBy: user.id,
      status: 'open'
    });

    return discussionRepository.findThreadById(result.lastInsertRowid);
  }

  updateThreadStatus(threadId, user, status) {
    const thread = this.getThreadForAction(threadId, user);
    if (!this.canManageCourse(user, thread.courseId)) {
      throw forbiddenError('Only instructors or administrators can manage thread state.');
    }

    const target = enumValue(status, 'status', THREAD_STATUS);
    discussionRepository.updateThreadStatus(threadId, target, nowIso());
    return discussionRepository.findThreadById(threadId);
  }

  listReplies(threadId, user, filters = {}) {
    const thread = this.getThreadForAction(threadId, user);
    return discussionRepository.listReplies(thread.id, filters);
  }

  createReply(threadId, user, data) {
    const thread = this.getThreadForAction(threadId, user);
    if (thread.status !== 'open') {
      throw forbiddenError('This discussion thread is locked.');
    }

    restrictionService.assertAccessAllowed({
      user,
      restrictionType: 'chat_muted',
      scopeType: 'course',
      scopeId: thread.courseId,
      safeMessage: 'Your discussion posting access is restricted. Please contact your instructor or administrator.'
    });

    const result = discussionRepository.createReply({
      threadId: thread.id,
      body: requiredText(data.body, 'body', { min: 1, max: LIMITS.discussions.bodyMax }),
      createdBy: user.id
    });

    const replies = discussionRepository.listReplies(thread.id, { page: 1, limit: 1 });
    return replies.items.find(item => item.id === result.lastInsertRowid) || null;
  }

  getThreadForAction(threadId, user) {
    const thread = discussionRepository.findThreadById(threadId);
    if (!thread) throw notFoundError('Discussion thread not found.');
    this.ensureCourseAccess(thread.courseId, user);
    return thread;
  }

  ensureCourseAccess(courseId, user) {
    const course = courseRepository.findById(courseId);
    if (!course) throw notFoundError('Course not found.');
    if (!enrollmentRepository.canAccessCourse(user, courseId)) {
      throw forbiddenError('Course access required.');
    }
  }

  canManageCourse(user, courseId) {
    return enrollmentRepository.canManageCourse(user, courseId);
  }
}

module.exports = new DiscussionService();
