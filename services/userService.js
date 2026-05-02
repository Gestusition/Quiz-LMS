const userRepository = require('../repositories/userRepository');
const profileRepository = require('../repositories/profileRepository');
const sessionRepository = require('../repositories/sessionRepository');
const passwordResetRepository = require('../repositories/passwordResetRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const courseRepository = require('../repositories/courseRepository');
const questionRepository = require('../repositories/questionRepository');
const quizRepository = require('../repositories/quizRepository');
const contentRepository = require('../repositories/contentRepository');
const { roleValues } = require('../constants/enums');
const {
  validatePassword,
  validateUserPayload
} = require('../validators/userValidators');
const { hashPassword, nowIso } = require('../utils/security');
const { serializeUser } = require('../serializers/userSerializer');

class UserService {
  createUser(data) {
    const payload = validateUserPayload(data, true);

    const duplicateEmail = userRepository.findDuplicateEmail(payload.email);
    if (duplicateEmail) {
      throw new Error('A user with this email already exists.');
    }

    const duplicateUsername = userRepository.findDuplicateUsername(payload.username);
    if (duplicateUsername) {
      throw new Error('A user with this username already exists.');
    }
    this.ensureUniqueStudentNumber(payload);

    const hashed = hashPassword(payload.password);
    const userId = userRepository.withTransaction(() => {
      const result = userRepository.insert(payload, hashed);
      profileRepository.replaceForUser(result.lastInsertRowid, payload);
      return result.lastInsertRowid;
    });

    return this.getUserById(userId);
  }

  getAllUsers(filters = {}) {
    return userRepository.list(filters, roleValues).map(serializeUser);
  }

  getUserById(id) {
    return serializeUser(userRepository.findPublicById(id));
  }

  updateUser(id, data) {
    const existing = userRepository.findById(id);
    if (!existing) {
      throw new Error('User not found.');
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
      department: data.department !== undefined ? data.department : existingProfile.department,
      officeHours: data.officeHours !== undefined ? data.officeHours : existingProfile.officeHours,
      studentNumber: data.studentNumber !== undefined ? data.studentNumber : existingProfile.studentNumber,
      cohort: data.cohort !== undefined ? data.cohort : existingProfile.cohort
    }, false);

    const duplicateEmail = userRepository.findDuplicateEmail(payload.email, id);
    if (duplicateEmail) {
      throw new Error('A user with this email already exists.');
    }

    const duplicateUsername = userRepository.findDuplicateUsername(payload.username, id);
    if (duplicateUsername) {
      throw new Error('A user with this username already exists.');
    }
    this.ensureUniqueStudentNumber(payload, id);

    userRepository.withTransaction(() => {
      userRepository.update(id, payload, nowIso());

      if (payload.password) {
        const hashed = hashPassword(payload.password);
        userRepository.updatePassword(id, hashed, nowIso());
        sessionRepository.deleteByUserId(id);
      }

      profileRepository.replaceForUser(id, payload);
    });

    return this.getUserById(id);
  }

  setUserPassword(id, password) {
    const existing = userRepository.findById(id);
    if (!existing) {
      throw new Error('User not found.');
    }

    const newPassword = String(password || '');
    validatePassword(newPassword);
    const hashed = hashPassword(newPassword);

    userRepository.withTransaction(() => {
      userRepository.updatePassword(id, hashed, nowIso());
      sessionRepository.deleteByUserId(id);
      passwordResetRepository.expireActiveForUser(id);
    });

    return this.getUserById(id);
  }

  deleteUser(id) {
    const existing = userRepository.findById(id);
    if (!existing) {
      throw new Error('User not found.');
    }

    userRepository.withTransaction(() => {
      enrollmentRepository.deleteByUserId(id);
      quizRepository.deleteAttemptsByUserId(id);
      courseRepository.clearCreatedBy(id);
      questionRepository.clearCreatedBy(id);
      quizRepository.clearCreatedBy(id);
      contentRepository.clearCreatedBy(id);
      passwordResetRepository.deleteByUserId(id);
      sessionRepository.deleteByUserId(id);
      profileRepository.deleteForUser(id);
      userRepository.deleteById(id);
    });

    return true;
  }

  ensureUniqueStudentNumber(payload, excludeUserId) {
    if (payload.role !== 'student') return;
    const duplicate = profileRepository.findDuplicateStudentNumber(payload.studentNumber, excludeUserId);
    if (duplicate) {
      throw new Error('A student with this student number already exists.');
    }
  }
}

module.exports = new UserService();
