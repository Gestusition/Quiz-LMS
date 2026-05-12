const userRepository = require('../repositories/userRepository');
const profileRepository = require('../repositories/profileRepository');
const sessionRepository = require('../repositories/sessionRepository');
const passwordResetRepository = require('../repositories/passwordResetRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const academicRepository = require('../repositories/academicRepository');
const courseRepository = require('../repositories/courseRepository');
const courseWeekRepository = require('../repositories/courseWeekRepository');
const discussionRepository = require('../repositories/discussionRepository');
const gradeSchemeRepository = require('../repositories/gradeSchemeRepository');
const importRepository = require('../repositories/importRepository');
const questionRepository = require('../repositories/questionRepository');
const quizRepository = require('../repositories/quizRepository');
const contentRepository = require('../repositories/contentRepository');
const restrictionRepository = require('../repositories/restrictionRepository');
const validationIssueRepository = require('../repositories/validationIssueRepository');
const resourceAccessRepository = require('../repositories/resourceAccessRepository');
const { roleValues } = require('../constants/enums');
const {
  validatePassword,
  validateUserPayload
} = require('../validators/userValidators');
const { hashPassword, nowIso } = require('../utils/security');
const { serializeUser } = require('../serializers/userSerializer');
const { conflictError, notFoundError } = require('../utils/appError');
const { removeUploadedSubmissionByUrl } = require('../middleware/upload');
const auditService = require('./auditService');

class UserService {
  createUser(data, actorUserId = null) {
    const payload = validateUserPayload(data, true);

    const duplicateEmail = userRepository.findDuplicateEmail(payload.email);
    if (duplicateEmail) {
      auditService.log({
        action: 'USER_DUPLICATE_REJECTED',
        entityType: 'user',
        details: { field: 'email', value: payload.email }
      });
      throw conflictError('email', 'A user with this email already exists.');
    }

    const duplicateUsername = userRepository.findDuplicateUsername(payload.username);
    if (duplicateUsername) {
      auditService.log({
        action: 'USER_DUPLICATE_REJECTED',
        entityType: 'user',
        details: { field: 'username', value: payload.username }
      });
      throw conflictError('username', 'A user with this username already exists.');
    }
    this.ensureUniqueStudentNumber(payload);
    this.ensureUniqueStaffNumber(payload);

    const hashed = hashPassword(payload.password);
    const userId = userRepository.withTransaction(() => {
      const result = userRepository.insert(payload, hashed);
      profileRepository.replaceForUser(result.lastInsertRowid, payload);
      return result.lastInsertRowid;
    });

    const created = this.getUserById(userId);
    auditService.log({
      actorUserId,
      action: 'USER_CREATED',
      entityType: 'user',
      entityId: userId,
      details: { role: created.role }
    });
    return created;
  }

  getAllUsers(filters = {}) {
    const result = userRepository.list(filters, roleValues);
    return {
      items: result.items.map(serializeUser),
      pagination: result.pagination
    };
  }

  getUserById(id) {
    return serializeUser(userRepository.findPublicById(id));
  }

  updateUser(id, data, actorUserId = null) {
    const existing = userRepository.findById(id);
    if (!existing) {
      throw notFoundError('User not found.');
    }
    const existingProfile = profileRepository.getForUser(id, existing.role);

    const payload = validateUserPayload({
      name: data.name !== undefined ? data.name : existing.name,
      username: data.username !== undefined ? data.username : existing.username,
      email: data.email !== undefined ? data.email : existing.email,
      role: data.role !== undefined ? data.role : existing.role,
      status: data.status !== undefined ? data.status : existing.status,
      mustChangeCredentials: data.mustChangeCredentials !== undefined
        ? data.mustChangeCredentials
        : !!existing.mustChangeCredentials,
      password: data.password,
      displayName: data.displayName !== undefined ? data.displayName : existingProfile.displayName,
      adminTitle: data.adminTitle !== undefined ? data.adminTitle : existingProfile.adminTitle,
      department: data.department !== undefined ? data.department : existingProfile.department,
      officeHours: data.officeHours !== undefined ? data.officeHours : existingProfile.officeHours,
      academicTitle: data.academicTitle !== undefined ? data.academicTitle : existingProfile.academicTitle,
      staffNumber: data.staffNumber !== undefined ? data.staffNumber : existingProfile.staffNumber,
      studentNumber: data.studentNumber !== undefined ? data.studentNumber : existingProfile.studentNumber,
      cohort: data.cohort !== undefined ? data.cohort : existingProfile.cohort,
      facultyId: data.facultyId !== undefined ? data.facultyId : existingProfile.facultyId,
      departmentId: data.departmentId !== undefined ? data.departmentId : existingProfile.departmentId,
      classYearId: data.classYearId !== undefined ? data.classYearId : existingProfile.classYearId,
      sectionId: data.sectionId !== undefined ? data.sectionId : existingProfile.sectionId
    }, false);

    const duplicateEmail = userRepository.findDuplicateEmail(payload.email, id);
    if (duplicateEmail) {
      auditService.log({
        action: 'USER_DUPLICATE_REJECTED',
        entityType: 'user',
        entityId: id,
        details: { field: 'email', value: payload.email }
      });
      throw conflictError('email', 'A user with this email already exists.');
    }

    const duplicateUsername = userRepository.findDuplicateUsername(payload.username, id);
    if (duplicateUsername) {
      auditService.log({
        action: 'USER_DUPLICATE_REJECTED',
        entityType: 'user',
        entityId: id,
        details: { field: 'username', value: payload.username }
      });
      throw conflictError('username', 'A user with this username already exists.');
    }
    this.ensureUniqueStudentNumber(payload, id);
    this.ensureUniqueStaffNumber(payload, id);

    const submissionFilesToRemove = existing.role === 'student' && payload.role !== 'student'
      ? academicRepository.listSubmissionsByStudent(id).map(submission => submission.submissionUrl)
      : [];

    userRepository.withTransaction(() => {
      userRepository.update(id, payload, nowIso());
      if (existing.role !== payload.role) {
        enrollmentRepository.deleteByUserId(id);
        if (payload.role !== 'student') {
          academicRepository.deleteOfferingEnrollmentsByStudent(id);
          academicRepository.deleteSubmissionsByStudent(id);
          academicRepository.deleteAttendanceRecordsByStudent(id);
          quizRepository.deleteAttemptsByUserId(id);
        }
      }

      if (payload.password) {
        const hashed = hashPassword(payload.password);
        userRepository.updatePassword(id, hashed, nowIso());
        sessionRepository.deleteByUserId(id);
      }

      profileRepository.replaceForUser(id, payload);
    });
    submissionFilesToRemove.forEach(removeUploadedSubmissionByUrl);

    const updated = this.getUserById(id);
    auditService.log({
      actorUserId,
      action: 'USER_UPDATED',
      entityType: 'user',
      entityId: id,
      details: { role: updated.role, status: updated.status }
    });
    return updated;
  }

  setUserPassword(id, password, actorUserId = null) {
    const existing = userRepository.findById(id);
    if (!existing) {
      throw notFoundError('User not found.');
    }

    const newPassword = String(password || '');
    validatePassword(newPassword);
    const hashed = hashPassword(newPassword);

    userRepository.withTransaction(() => {
      userRepository.updatePassword(id, hashed, nowIso());
      sessionRepository.deleteByUserId(id);
      passwordResetRepository.expireActiveForUser(id);
    });

    const updated = this.getUserById(id);
    auditService.log({
      actorUserId,
      action: 'USER_UPDATED',
      entityType: 'user',
      entityId: id,
      details: { passwordChanged: true }
    });
    return updated;
  }

  updateOwnProfile(id, data, actorUserId = null) {
    const existing = userRepository.findById(id);
    if (!existing) {
      throw notFoundError('User not found.');
    }
    if (existing.role !== 'teacher') {
      throw conflictError('role', 'Only teacher profile fields can be updated here.');
    }

    const existingProfile = profileRepository.getForUser(id, existing.role);
    const payload = validateUserPayload({
      name: existing.name,
      username: existing.username,
      email: existing.email,
      role: existing.role,
      status: existing.status,
      mustChangeCredentials: !!existing.mustChangeCredentials,
      department: data.department !== undefined ? data.department : existingProfile.department,
      officeHours: data.officeHours !== undefined ? data.officeHours : existingProfile.officeHours,
      academicTitle: data.academicTitle !== undefined ? data.academicTitle : existingProfile.academicTitle,
      staffNumber: existingProfile.staffNumber,
      facultyId: existingProfile.facultyId,
      departmentId: existingProfile.departmentId
    }, false);

    profileRepository.replaceForUser(id, payload);
    const updated = this.getUserById(id);
    auditService.log({
      actorUserId,
      action: 'USER_PROFILE_UPDATED',
      entityType: 'user',
      entityId: id,
      details: { role: updated.role, selfService: true }
    });
    return updated;
  }

  deleteUser(id) {
    const existing = userRepository.findById(id);
    if (!existing) {
      throw notFoundError('User not found.');
    }

    const submissionFilesToRemove = academicRepository.listSubmissionsByStudent(id)
      .map(submission => submission.submissionUrl);

    userRepository.withTransaction(() => {
      enrollmentRepository.deleteByUserId(id);
      academicRepository.deleteOfferingEnrollmentsByStudent(id);
      academicRepository.deleteSubmissionsByStudent(id);
      academicRepository.deleteAttendanceRecordsByStudent(id);
      quizRepository.deleteAttemptsByUserId(id);
      courseRepository.clearCreatedBy(id);
      courseWeekRepository.clearCreatedBy(id);
      discussionRepository.clearCreatedBy(id);
      questionRepository.clearCreatedBy(id);
      quizRepository.clearCreatedBy(id);
      contentRepository.clearCreatedBy(id);
      academicRepository.clearUserReferences(id);
      gradeSchemeRepository.clearCreatedBy(id);
      importRepository.clearUserReferences(id);
      restrictionRepository.deleteByUserId(id);
      restrictionRepository.clearCreatedBy(id);
      validationIssueRepository.clearUserReferences(id);
      resourceAccessRepository.clearUserReferences(id);
      passwordResetRepository.deleteByUserId(id);
      sessionRepository.deleteByUserId(id);
      profileRepository.deleteForUser(id);
      userRepository.deleteById(id);
    });
    submissionFilesToRemove.forEach(removeUploadedSubmissionByUrl);

    return true;
  }

  ensureUniqueStudentNumber(payload, excludeUserId) {
    if (payload.role !== 'student') return;
    const duplicate = profileRepository.findDuplicateStudentNumber(payload.studentNumber, excludeUserId);
    if (duplicate) {
      auditService.log({
        action: 'USER_DUPLICATE_REJECTED',
        entityType: 'student_profile',
        details: { field: 'student_number', value: payload.studentNumber }
      });
      throw conflictError('student_number', 'Student number already exists.');
    }
  }

  ensureUniqueStaffNumber(payload, excludeUserId) {
    if (payload.role !== 'teacher' || !payload.staffNumber) return;
    const duplicate = profileRepository.findDuplicateStaffNumber(payload.staffNumber, excludeUserId);
    if (duplicate) {
      auditService.log({
        action: 'USER_DUPLICATE_REJECTED',
        entityType: 'teacher_profile',
        details: { field: 'employee_number', value: payload.staffNumber }
      });
      throw conflictError('employee_number', 'Employee number already exists.');
    }
  }
}

module.exports = new UserService();
