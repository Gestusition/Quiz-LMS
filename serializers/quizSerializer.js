function serializeQuiz(quiz) {
  if (!quiz) return null;
  const now = Date.now();
  const opensAt = quiz.openAt ? new Date(quiz.openAt).getTime() : null;
  const closesAt = quiz.closeAt ? new Date(quiz.closeAt).getTime() : null;
  const isOpen = quiz.status === 'published' &&
    (!opensAt || opensAt <= now) &&
    (!closesAt || closesAt >= now);

  return {
    ...quiz,
    shuffleQuestions: !!quiz.shuffleQuestions,
    showCorrectAnswers: !!quiz.showCorrectAnswers,
    isOpen
  };
}

function serializeQuizQuestion(row, options = {}) {
  const question = {
    ...row,
    points: row.quizPoints,
    options: JSON.parse(row.options || '[]')
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
