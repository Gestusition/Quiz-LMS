function serializeQuiz(quiz) {
  if (!quiz) return null;
  const now = Date.now();
  const startAt = quiz.startAt || quiz.openAt || '';
  const endAt = quiz.endAt || quiz.closeAt || '';
  const opensAt = startAt ? new Date(startAt).getTime() : null;
  const closesAt = endAt ? new Date(endAt).getTime() : null;
  const isOpen = quiz.status === 'published' &&
    (!opensAt || opensAt <= now) &&
    (!closesAt || closesAt >= now);

  return {
    ...quiz,
    startAt,
    endAt,
    ...(quiz.maxScore !== undefined ? { maxScore: roundScore(quiz.maxScore) } : {}),
    durationMinutes: Number(quiz.durationMinutes || quiz.timeLimitMinutes || 0),
    maxAttempts: Number(quiz.maxAttempts || quiz.attemptsAllowed || 1),
    gradingMode: quiz.gradingMode || 'standard',
    showResultPolicy: quiz.showResultPolicy || 'immediately',
    requiresSeb: !!quiz.requiresSeb,
    penaltyEnabled: !!quiz.penaltyEnabled,
    penaltyPerWrong: Number(quiz.penaltyPerWrong || 0),
    penaltyRatio: Number(quiz.penaltyRatio || 0),
    shuffleQuestions: !!quiz.shuffleQuestions,
    shuffleOptions: !!quiz.shuffleOptions,
    showCorrectAnswers: !!quiz.showCorrectAnswers,
    weight: Number(quiz.weight || 0),
    isOpen
  };
}

function roundScore(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return 0;
  return Math.round((number + Number.EPSILON) * 100) / 100;
}

function serializeQuizQuestion(row, options = {}) {
  const question = {
    ...row,
    points: row.quizPoints,
    options: JSON.parse(row.options || '[]'),
    acceptedAnswers: JSON.parse(row.acceptedAnswers || '[]'),
    caseSensitive: !!row.caseSensitive,
    status: row.status || 'valid',
    validationMessage: row.validationMessage || ''
  };
  delete question.quizPoints;
  if (!options.includeCorrect) {
    delete question.correctAnswer;
  }
  return question;
}

module.exports = {
  serializeQuiz,
  serializeQuizQuestion
};
