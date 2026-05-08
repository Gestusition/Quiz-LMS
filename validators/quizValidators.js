const { quizStatusValues } = require('../constants/enums');
const { LIMITS } = require('../constants/limits');
const {
  booleanValue,
  dateValue,
  ensureDateOrder,
  enumValue,
  intInRange,
  numberInRange,
  optionalText,
  requiredId,
  requiredText
} = require('../utils/validation');

const SHOW_RESULT_POLICIES = ['immediately', 'after_close', 'after_manual_release', 'never'];
const GRADING_MODES = ['standard', 'negative_marking', 'manual_review'];
const ATTEMPT_STATUSES = ['in_progress', 'submitted', 'expired', 'graded', 'pending_review'];

function validateQuiz(data) {
  const startAt = dateValue(data.startAt !== undefined ? data.startAt : data.openAt, 'startAt');
  const endAt = dateValue(data.endAt !== undefined ? data.endAt : data.closeAt, 'endAt');
  ensureDateOrder(startAt, endAt, 'startAt', 'endAt');

  const durationInput = data.durationMinutes !== undefined
    ? data.durationMinutes
    : (data.timeLimitMinutes !== undefined ? data.timeLimitMinutes : LIMITS.quizzes.durationMin);

  const payload = {
    courseId: requiredId(data.courseId, 'courseId'),
    title: requiredText(data.title, 'title', { min: 2, max: LIMITS.quizzes.titleMax }),
    description: optionalText(data.description, 'description', LIMITS.quizzes.descriptionMax),
    status: enumValue(data.status, 'status', quizStatusValues, 'draft'),
    startAt,
    endAt,
    durationMinutes: intInRange(
      durationInput,
      'duration_minutes',
      LIMITS.quizzes.durationMin,
      LIMITS.quizzes.durationMax
    ),
    maxAttempts: intInRange(
      data.maxAttempts !== undefined ? data.maxAttempts : data.attemptsAllowed,
      'max_attempts',
      LIMITS.quizzes.attemptsMin,
      LIMITS.quizzes.attemptsMax,
      { required: false, defaultValue: LIMITS.quizzes.attemptsMin }
    ),
    shuffleQuestions: booleanValue(data.shuffleQuestions, false),
    shuffleOptions: booleanValue(data.shuffleOptions, false),
    showResultPolicy: enumValue(data.showResultPolicy, 'show_result_policy', SHOW_RESULT_POLICIES, 'immediately'),
    gradingMode: enumValue(data.gradingMode, 'grading_mode', GRADING_MODES, 'standard'),
    penaltyEnabled: booleanValue(data.penaltyEnabled, false),
    penaltyPerWrong: numberInRange(data.penaltyPerWrong, 'penalty_per_wrong', 0, LIMITS.quizzes.penaltyMax, {
      required: false,
      defaultValue: 0
    }),
    penaltyRatio: numberInRange(data.penaltyRatio, 'penalty_ratio', 0, 1, {
      required: false,
      defaultValue: 0
    }),
    requiresSeb: booleanValue(data.requiresSeb, false),
    sebConfigName: optionalText(data.sebConfigName, 'seb_config_name', LIMITS.quizzes.sebConfigMax),
    sebConfigUrl: optionalText(data.sebConfigUrl, 'seb_config_url', LIMITS.quizzes.sebConfigMax),
    showCorrectAnswers: data.showCorrectAnswers !== false
  };

  return payload;
}

module.exports = {
  ATTEMPT_STATUSES,
  GRADING_MODES,
  SHOW_RESULT_POLICIES,
  validateQuiz
};
