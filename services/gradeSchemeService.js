const gradeSchemeRepository = require('../repositories/gradeSchemeRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const courseRepository = require('../repositories/courseRepository');
const { validationError, notFoundError, forbiddenError } = require('../utils/appError');
const { parseRequiredPositiveInt, parseOptionalPositiveInt } = require('../utils/validation');

const LETTER_GRADES = ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF'];
const DEFAULT_THRESHOLDS = [
  { letterGrade: 'AA', minScore: 90, maxScore: 100 },
  { letterGrade: 'BA', minScore: 85, maxScore: 89.99 },
  { letterGrade: 'BB', minScore: 80, maxScore: 84.99 },
  { letterGrade: 'CB', minScore: 75, maxScore: 79.99 },
  { letterGrade: 'CC', minScore: 70, maxScore: 74.99 },
  { letterGrade: 'DC', minScore: 60, maxScore: 69.99 },
  { letterGrade: 'DD', minScore: 50, maxScore: 59.99 },
  { letterGrade: 'FD', minScore: 40, maxScore: 49.99 },
  { letterGrade: 'FF', minScore: 0, maxScore: 39.99 }
];

class GradeSchemeService {
  list(courseId, user = null) {
    const parsedCourseId = parseOptionalPositiveInt(courseId, 'courseId');
    if (parsedCourseId) {
      this.assertCourseExists(parsedCourseId);
      if (user) this.assertCanManageCourse(user, parsedCourseId);
      this.ensureDefault(parsedCourseId, user ? user.id : null);
    }

    return gradeSchemeRepository.listSchemes({ courseId: parsedCourseId, user }).map(scheme => ({
      ...scheme,
      thresholds: gradeSchemeRepository.listThresholds(scheme.id)
    }));
  }

  getForUser(schemeId, user) {
    const id = parseRequiredPositiveInt(schemeId, 'schemeId');
    const scheme = gradeSchemeRepository.findSchemeById(id);
    if (!scheme) throw notFoundError('Grade scheme not found.');
    this.assertCanManageScheme(user, scheme);
    return {
      ...scheme,
      thresholds: gradeSchemeRepository.listThresholds(scheme.id)
    };
  }

  ensureDefault(courseId, createdBy = null) {
    let scheme = gradeSchemeRepository.findDefaultByCourse(courseId);
    if (scheme) return scheme;

    const created = gradeSchemeRepository.createScheme({
      courseId,
      name: 'Default UZEM Scale',
      status: 'active',
      isDefault: true,
      createdBy
    });
    const schemeId = Number(created.lastInsertRowid);
    gradeSchemeRepository.replaceThresholds(schemeId, DEFAULT_THRESHOLDS);
    return gradeSchemeRepository.findSchemeById(schemeId);
  }

  validateThresholds(thresholds) {
    if (!Array.isArray(thresholds)) {
      throw validationError('thresholds', 'thresholds must be an array.');
    }

    if (thresholds.length !== LETTER_GRADES.length) {
      throw validationError('thresholds', `Thresholds must include exactly: ${LETTER_GRADES.join(', ')}.`);
    }

    const byGrade = new Map();
    thresholds.forEach(item => {
      const letterGrade = String(item && item.letterGrade || '').trim().toUpperCase();
      if (!LETTER_GRADES.includes(letterGrade)) {
        throw validationError('thresholds', `Threshold letterGrade must be one of: ${LETTER_GRADES.join(', ')}.`);
      }
      if (byGrade.has(letterGrade)) {
        throw validationError('thresholds', `Duplicate threshold for ${letterGrade}.`);
      }
      if (item.minScore === undefined || item.minScore === null || String(item.minScore).trim() === '') {
        throw validationError('thresholds', `${letterGrade} threshold is required.`);
      }
      const minScore = Number(item.minScore);
      if (!Number.isFinite(minScore) || minScore < 0 || minScore > 100) {
        throw validationError('thresholds', `${letterGrade} threshold must be a number between 0 and 100.`);
      }
      byGrade.set(letterGrade, minScore);
    });

    const ordered = LETTER_GRADES.map((letterGrade, index) => ({
      letterGrade,
      minScore: byGrade.get(letterGrade),
      maxScore: index === 0 ? 100 : Math.max(0, Math.round((byGrade.get(LETTER_GRADES[index - 1]) - 0.01) * 100) / 100),
      position: index + 1
    }));

    let previousMin = Infinity;
    ordered.forEach(item => {
      if (item.minScore >= previousMin) {
        throw validationError('thresholds', `${LETTER_GRADES[item.position - 2]} must be greater than ${item.letterGrade}.`);
      }
      previousMin = item.minScore;
    });
    if (ordered[ordered.length - 1].minScore !== 0) {
      throw validationError('thresholds', 'FF threshold must be 0.');
    }

    return ordered;
  }

  updateThresholds(schemeId, thresholds, user = null) {
    const id = parseRequiredPositiveInt(schemeId, 'schemeId');
    const scheme = gradeSchemeRepository.findSchemeById(id);
    if (!scheme) throw notFoundError('Grade scheme not found.');
    if (user) this.assertCanManageScheme(user, scheme);

    const validThresholds = this.validateThresholds(thresholds);
    gradeSchemeRepository.replaceThresholds(id, validThresholds);
    gradeSchemeRepository.updateSchemeStatus(id, 'active');

    return {
      ...gradeSchemeRepository.findSchemeById(id),
      thresholds: gradeSchemeRepository.listThresholds(id)
    };
  }

  resolveLetterGrade(courseId, percentage) {
    const scheme = this.ensureDefault(courseId);
    if (!scheme || scheme.status !== 'active') {
      return {
        status: 'pending_review',
        letterGrade: null,
        message: 'Your numeric score has been saved, but letter grade is pending instructor/admin review.'
      };
    }

    const thresholds = gradeSchemeRepository.listThresholds(scheme.id);
    const match = thresholds.find(item => percentage >= item.minScore);
    if (!match) {
      return {
        status: 'pending_review',
        letterGrade: null,
        message: 'Your numeric score has been saved, but letter grade is pending instructor/admin review.'
      };
    }

    return {
      status: 'ready',
      letterGrade: match.letterGrade,
      message: ''
    };
  }

  markSchemeInvalid(schemeId) {
    const scheme = gradeSchemeRepository.findSchemeById(schemeId);
    if (!scheme) return null;
    gradeSchemeRepository.updateSchemeStatus(schemeId, 'invalid');
    return gradeSchemeRepository.findSchemeById(schemeId);
  }

  assertCanManageScheme(user, scheme) {
    if (!scheme || !scheme.courseId) {
      if (!user || user.role !== 'admin') {
        throw forbiddenError('Teacher or admin course access required.');
      }
      return;
    }
    this.assertCanManageCourse(user, scheme.courseId);
  }

  assertCanManageCourse(user, courseId) {
    if (!user || !enrollmentRepository.canManageCourse(user, courseId)) {
      throw forbiddenError('Teacher or admin course access required.');
    }
  }

  assertCourseExists(courseId) {
    if (!courseRepository.findById(courseId)) throw notFoundError('Course not found.');
  }
}

module.exports = new GradeSchemeService();
module.exports.DEFAULT_THRESHOLDS = DEFAULT_THRESHOLDS;
module.exports.LETTER_GRADES = LETTER_GRADES;
