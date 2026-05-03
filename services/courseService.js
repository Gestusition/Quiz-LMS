const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const categoryRepository = require('../repositories/categoryRepository');
const questionRepository = require('../repositories/questionRepository');
const quizRepository = require('../repositories/quizRepository');
const contentRepository = require('../repositories/contentRepository');
const userRepository = require('../repositories/userRepository');
const { courseVisibilityValues, enrollmentStatusValues } = require('../constants/enums');
const { validateCourse } = require('../validators/courseValidators');
const { nowIso } = require('../utils/security');
const { serializeCourse } = require('../serializers/courseSerializer');
const { serializeParticipant } = require('../serializers/participantSerializer');

class CourseService {
  getAll(user, filters = {}) {
    return courseRepository.list(user, filters, courseVisibilityValues).map(serializeCourse);
  }

  getById(id) {
    return serializeCourse(courseRepository.getById(id));
  }

  create(data, user) {
    const payload = validateCourse(data);
    const duplicate = courseRepository.findDuplicateCode(payload.code);
    if (duplicate) {
      throw new Error('A course with this code already exists.');
    }

    const courseId = courseRepository.withTransaction(() => {
      const result = courseRepository.insert(payload, user.id);
      const newCourseId = Number(result.lastInsertRowid);
      if (user.role === 'teacher') {
        enrollmentRepository.insertCourseTeacher(newCourseId, user.id);
      }
      return newCourseId;
    });

    return this.getById(courseId);
  }

  update(id, data) {
    const existing = courseRepository.findById(id);
    if (!existing) {
      throw new Error('Course not found.');
    }

    const payload = validateCourse({
      code: data.code !== undefined ? data.code : existing.code,
      title: data.title !== undefined ? data.title : existing.title,
      description: data.description !== undefined ? data.description : existing.description,
      departmentId: data.departmentId !== undefined ? data.departmentId : existing.departmentId,
      credits: data.credits !== undefined ? data.credits : existing.credits,
      visibility: data.visibility !== undefined ? data.visibility : existing.visibility,
      startDate: data.startDate !== undefined ? data.startDate : existing.startDate,
      endDate: data.endDate !== undefined ? data.endDate : existing.endDate
    });

    const duplicate = courseRepository.findDuplicateCode(payload.code, id);
    if (duplicate) {
      throw new Error('A course with this code already exists.');
    }

    courseRepository.update(id, payload, nowIso());
    return this.getById(id);
  }

  delete(id) {
    const existing = courseRepository.findById(id);
    if (!existing) {
      throw new Error('Course not found.');
    }

    const categoryIds = categoryRepository.findIdsByCourseId(id).map(category => category.id);
    courseRepository.withTransaction(() => {
      questionRepository.deleteByCategoryIds(categoryIds);
      quizRepository.deleteByCourseId(id);
      contentRepository.deleteAnnouncementsByCourseId(id);
      contentRepository.deleteResourcesByCourseId(id);
      courseRepository.deleteById(id);
    });

    return true;
  }

  getParticipants(courseId) {
    return enrollmentRepository.getParticipants(courseId).map(serializeParticipant);
  }

  enroll(courseId, userId, role) {
    if (!['teacher', 'student'].includes(role)) {
      throw new Error('Enrollment role must be teacher or student.');
    }

    const course = courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found.');
    }
    const user = userRepository.findById(userId);
    if (!user || user.status !== 'active') {
      throw new Error('Active user not found.');
    }
    if (role === 'teacher' && user.role !== 'teacher') {
      throw new Error('Only teacher accounts can be enrolled as course teachers.');
    }
    if (role === 'student' && user.role !== 'student') {
      throw new Error('Only student accounts can be enrolled as course students.');
    }

    const existing = enrollmentRepository.findByCourseUserRole(courseId, userId, role);
    if (existing) {
      enrollmentRepository.updateStatus(existing.id, 'active');
      return this.getParticipants(courseId).find(participant => participant.enrollmentId === existing.id);
    }

    const result = enrollmentRepository.insert(courseId, userId, role);
    return this.getParticipants(courseId).find(participant => participant.enrollmentId === result.lastInsertRowid);
  }

  updateEnrollment(enrollmentId, status) {
    if (!enrollmentStatusValues.includes(status)) {
      throw new Error('Enrollment status must be active or suspended.');
    }

    const existing = enrollmentRepository.findById(enrollmentId);
    if (!existing) {
      throw new Error('Enrollment not found.');
    }

    enrollmentRepository.updateStatus(enrollmentId, status);
    return this.getParticipants(existing.courseId).find(participant => participant.enrollmentId === enrollmentId);
  }

  deleteEnrollment(enrollmentId) {
    const existing = enrollmentRepository.findById(enrollmentId);
    if (!existing) {
      throw new Error('Enrollment not found.');
    }

    enrollmentRepository.deleteById(enrollmentId);
    return true;
  }
}

module.exports = new CourseService();
