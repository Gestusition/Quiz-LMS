const { validateQuiz } = require('../validators/quizValidators');

describe('quiz validation', () => {
  test('accepts fractional negative marking penalties', () => {
    const quiz = validateQuiz({
      courseId: 1,
      title: 'Fractional penalty quiz',
      durationMinutes: 30,
      maxAttempts: 1,
      gradingMode: 'negative_marking',
      penaltyEnabled: true,
      penaltyPerWrong: '0.25',
      penaltyRatio: '0.25'
    });

    expect(quiz.penaltyPerWrong).toBe(0.25);
    expect(quiz.penaltyRatio).toBe(0.25);
  });
});
