const gradeSchemeRepository = require('../repositories/gradeSchemeRepository');
const { validationError, notFoundError } = require('../utils/appError');

const DEFAULT_THRESHOLDS = [
  { letterGrade: 'AA', minScore: 90, maxScore: 100 },
  { letterGrade: 'BA', minScore: 85, maxScore: 89.99 },
  { letterGrade: 'BB', minScore: 80, maxScore: 84.99 },
  { letterGrade: 'CB', minScore: 75, maxScore: 79.99 },
  { letterGrade: 'CC', minScore: 70, maxScore: 74.99 },
  { letterGrade: 'DC', minScore: 65, maxScore: 69.99 },
  { letterGrade: 'DD', minScore: 60, maxScore: 64.99 },
  { letterGrade: 'FD', minScore: 50, maxScore: 59.99 },
  { letterGrade: 'FF', minScore: 0, maxScore: 49.99 }
];

class GradeSchemeService {
  list(courseId) {
    return gradeSchemeRepository.listSchemes({ courseId }).map(scheme => ({
      ...scheme,
      thresholds: gradeSchemeRepository.listThresholds(scheme.id)
    }));
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
    if (!Array.isArray(thresholds) || thresholds.length === 0) {
      throw validationError('thresholds', 'thresholds must be a non-empty array.');
    }

    const ordered = thresholds.map((item, index) => ({
      letterGrade: String(item.letterGrade || '').trim().toUpperCase(),
      minScore: Number(item.minScore),
      maxScore: Number(item.maxScore),
      position: index + 1
    }));

    let previousMin = Infinity;
    ordered.forEach(item => {
      if (!item.letterGrade) {
        throw validationError('thresholds', 'Each threshold must include letterGrade.');
      }
      if (!Number.isFinite(item.minScore) || !Number.isFinite(item.maxScore)) {
        throw validationError('thresholds', 'Each threshold must include numeric minScore and maxScore.');
      }
      if (item.minScore > item.maxScore) {
        throw validationError('thresholds', 'Threshold minScore must be less than or equal to maxScore.');
      }
      if (item.minScore >= previousMin) {
        throw validationError('thresholds', 'Thresholds must be in descending order by minScore.');
      }
      previousMin = item.minScore;
    });

    return ordered;
  }

  updateThresholds(schemeId, thresholds) {
    const scheme = gradeSchemeRepository.findSchemeById(schemeId);
    if (!scheme) throw notFoundError('Grade scheme not found.');

    const validThresholds = this.validateThresholds(thresholds);
    gradeSchemeRepository.replaceThresholds(schemeId, validThresholds);
    gradeSchemeRepository.updateSchemeStatus(schemeId, 'active');

    return {
      ...gradeSchemeRepository.findSchemeById(schemeId),
      thresholds: gradeSchemeRepository.listThresholds(schemeId)
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
    const match = thresholds.find(item => percentage >= item.minScore && percentage <= item.maxScore);
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
}

module.exports = new GradeSchemeService();
