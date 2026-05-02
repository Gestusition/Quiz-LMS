const roles = Object.freeze({
  admin: 'admin',
  teacher: 'teacher',
  student: 'student'
});

const userStatus = Object.freeze({
  active: 'active',
  disabled: 'disabled'
});

const courseVisibility = Object.freeze({
  private: 'private',
  published: 'published',
  archived: 'archived'
});

const enrollmentStatus = Object.freeze({
  active: 'active',
  suspended: 'suspended'
});

const quizStatus = Object.freeze({
  draft: 'draft',
  published: 'published',
  closed: 'closed'
});

const resourceType = Object.freeze({
  link: 'link',
  file: 'file',
  page: 'page'
});

const questionType = Object.freeze({
  multipleChoice: 'MC',
  trueFalse: 'TF',
  fillBlank: 'FB'
});

const questionDifficulty = Object.freeze({
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD'
});

module.exports = {
  roles,
  userStatus,
  courseVisibility,
  enrollmentStatus,
  quizStatus,
  resourceType,
  questionType,
  questionDifficulty,
  roleValues: Object.values(roles),
  userStatusValues: Object.values(userStatus),
  courseVisibilityValues: Object.values(courseVisibility),
  enrollmentStatusValues: Object.values(enrollmentStatus),
  quizStatusValues: Object.values(quizStatus),
  resourceTypeValues: Object.values(resourceType),
  questionTypeValues: Object.values(questionType),
  questionDifficultyValues: Object.values(questionDifficulty)
};
