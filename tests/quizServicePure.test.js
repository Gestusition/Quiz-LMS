const quizService = require('../services/quizService');

describe('QuizService pure grading and policy helpers', () => {
  test('evaluates manual, essay, blank, true/false, short answer, MR, and ordering answers', () => {
    expect(quizService.evaluateAnswer({ type: 'MC', points: 5, gradingType: 'manual', correctAnswer: '0' }, '0', {}))
      .toEqual({ isCorrect: false, pointsAwarded: 0, needsReview: true });
    expect(quizService.evaluateAnswer({ type: 'ES', points: 5, correctAnswer: '' }, 'essay', {}))
      .toEqual({ isCorrect: false, pointsAwarded: 0, needsReview: true });
    expect(quizService.evaluateAnswer({ type: 'MC', points: 2, correctAnswer: '1' }, '', {}))
      .toEqual({ isCorrect: false, pointsAwarded: 0 });
    expect(quizService.evaluateAnswer({ type: 'TF', points: 2, correctAnswer: 'true' }, 'TRUE', {}))
      .toEqual({ isCorrect: true, pointsAwarded: 2 });
    expect(quizService.evaluateAnswer({
      type: 'FB',
      points: 3,
      correctAnswer: 'JavaScript',
      acceptedAnswers: ['JS'],
      caseSensitive: false
    }, 'js', {})).toEqual({ isCorrect: true, pointsAwarded: 3 });
    expect(quizService.evaluateAnswer({
      type: 'FB',
      points: 3,
      correctAnswer: 'JavaScript',
      caseSensitive: true
    }, 'javascript', {})).toEqual({ isCorrect: false, pointsAwarded: -0 });
    expect(quizService.evaluateAnswer({
      type: 'SA',
      points: 4,
      correctAnswer: '100'
    }, '100.05', {})).toEqual({ isCorrect: true, pointsAwarded: 4 });
    expect(quizService.evaluateAnswer({
      type: 'MR',
      points: 4,
      correctAnswer: '0,2'
    }, '2,0', {})).toEqual({ isCorrect: true, pointsAwarded: 4 });
    expect(quizService.evaluateAnswer({
      type: 'OR',
      points: 4,
      correctAnswer: '0,1,2'
    }, '0,2,1', {
      penaltyPerWrong: 1
    })).toEqual({ isCorrect: false, pointsAwarded: -0 });
    expect(quizService.evaluateAnswer({
      type: 'OR',
      points: 4,
      correctAnswer: '0,1,2'
    }, '', {})).toEqual({ isCorrect: false, pointsAwarded: 0 });
    expect(quizService.evaluateAnswer({
      type: 'OR',
      points: 4,
      correctAnswer: '0,1,2'
    }, '0,1', {})).toEqual({ isCorrect: false, pointsAwarded: -0 });
    expect(quizService.evaluateAnswer({
      type: 'OR',
      points: 4,
      correctAnswer: '0,1,2'
    }, '0,1,1', {})).toEqual({ isCorrect: false, pointsAwarded: -0 });
    expect(quizService.evaluateAnswer({
      type: 'OR',
      points: 4,
      correctAnswer: '0,1,2'
    }, '0,1,2', {})).toEqual({ isCorrect: true, pointsAwarded: 4 });
  });

  test('applies negative marking only for negative-grading questions', () => {
    expect(quizService.calculatePenalty(5, { penaltyPerWrong: 2, penaltyRatio: 0.5 }, { gradingType: 'standard' }))
      .toBe(0);
    expect(quizService.calculatePenalty(5, { penaltyPerWrong: 2, penaltyRatio: 0.5 }, { gradingType: 'negative' }))
      .toBe(2);
    expect(quizService.calculatePenalty(5, { penaltyPerWrong: 0, penaltyRatio: 0.5 }, { gradingType: 'negative' }))
      .toBe(2.5);
    expect(quizService.evaluateAnswer({
      type: 'MC',
      points: 5,
      correctAnswer: '0',
      gradingType: 'negative'
    }, '1', { penaltyPerWrong: 2 })).toEqual({ isCorrect: false, pointsAwarded: -2 });
  });

  test('evaluates multi-part answers with accepted aliases and partial credit', () => {
    const question = {
      type: 'MP',
      parts: [
        { partLabel: 'a', correctAnswer: 'alpha', acceptedAnswers: ['A'], points: 2 },
        { partLabel: 'b', correctAnswer: 'beta', points: 3 }
      ]
    };

    expect(quizService.evaluateAnswer(question, { part_0: 'a', b: 'beta' }, {})).toEqual({
      isCorrect: true,
      pointsAwarded: 5
    });
    expect(quizService.evaluateAnswer(question, JSON.stringify({ a: 'alpha', b: 'wrong' }), {})).toEqual({
      isCorrect: false,
      pointsAwarded: 2
    });
    expect(quizService.evaluateAnswer(question, '{bad json', {})).toEqual({
      isCorrect: false,
      pointsAwarded: 0
    });
  });

  test('evaluates math table answers with numeric tolerance, star cells, and empty configs', () => {
    const question = {
      type: 'MT',
      points: 6,
      tableConfig: {
        correctData: {
          r0_c0: '100',
          r0_c1: '*',
          r0_c2: 'Done'
        }
      }
    };

    expect(quizService.evaluateAnswer(question, {
      r0_c0: '100.05',
      r0_c1: '*',
      r0_c2: 'done'
    }, {})).toEqual({
      isCorrect: true,
      pointsAwarded: 6
    });
    expect(quizService.evaluateAnswer(question, JSON.stringify({
      r0_c0: '90',
      r0_c1: '*',
      r0_c2: ''
    }), {})).toEqual({
      isCorrect: false,
      pointsAwarded: 2
    });
    expect(quizService.evaluateAnswer({
      type: 'MT',
      tableConfig: { correctData: {} }
    }, {}, {})).toEqual({
      isCorrect: false,
      pointsAwarded: 0,
      needsReview: true
    });
  });

  test('compares answers for mismatch branches', () => {
    expect(quizService.compareAnswer({ type: 'SA', acceptedAnswers: [] }, '10.5', '10')).toBe(false);
    expect(quizService.compareAnswer({ type: 'TF' }, 'false', 'true')).toBe(false);
    expect(quizService.compareAnswer({ type: 'MR' }, '0,1', '0,2')).toBe(false);
    expect(quizService.compareAnswer({ type: 'MR' }, '0', '0,2')).toBe(false);
    expect(quizService.compareAnswer({ type: 'OR' }, '0,1', '0,1')).toBe(true);
    expect(quizService.compareAnswer({ type: 'MC' }, '2', '2')).toBe(true);
  });

  test('validates question integrity for every supported invalid shape', () => {
    expect(quizService.validateQuestionIntegrity(null)).toEqual({
      valid: false,
      error: 'Question payload is missing.'
    });
    expect(quizService.validateQuestionIntegrity({ text: 'x', type: 'FB', correctAnswer: 'a' }).error)
      .toMatch(/text/i);
    expect(quizService.validateQuestionIntegrity({ text: 'MC', type: 'MC', options: ['A'], correctAnswer: '0' }).error)
      .toMatch(/at least two/i);
    expect(quizService.validateQuestionIntegrity({ text: 'MC', type: 'MC', options: ['A', 'B'], correctAnswer: '3' }).error)
      .toMatch(/index/i);
    expect(quizService.validateQuestionIntegrity({ text: 'TF', type: 'TF', correctAnswer: 'maybe' }).error)
      .toMatch(/true or false/i);
    expect(quizService.validateQuestionIntegrity({ text: 'FB', type: 'FB', correctAnswer: '' }).error)
      .toMatch(/accepted answer/i);
    expect(quizService.validateQuestionIntegrity({ text: 'MP', type: 'MP', parts: [] }).error)
      .toMatch(/at least one/i);
    expect(quizService.validateQuestionIntegrity({
      text: 'MP',
      type: 'MP',
      parts: [{ correctAnswer: '' }]
    }).error).toMatch(/correct answer/i);
    expect(quizService.validateQuestionIntegrity({ text: 'MT', type: 'MT', tableConfig: null }).error)
      .toMatch(/columns/i);
    expect(quizService.validateQuestionIntegrity({
      text: 'MT',
      type: 'MT',
      tableConfig: { columns: [{ header: 'A' }], correctData: {} }
    }).error).toMatch(/correct cell/i);
    expect(quizService.validateQuestionIntegrity({
      text: 'OK',
      type: 'MC',
      options: ['A', 'B'],
      correctAnswer: '1'
    })).toEqual({ valid: true, error: '' });
  });

  test('strips correct data and evaluates result visibility policies', () => {
    const stripped = quizService.stripQuestionCorrectData({
      correctAnswer: 'secret',
      explanationText: 'because',
      acceptedAnswers: ['secret'],
      parts: [{ correctAnswer: 'a', acceptedAnswers: ['A'], visible: true }],
      tableConfig: { correctData: { r0_c0: '1' }, columns: [] }
    });
    expect(stripped.correctAnswer).toBeUndefined();
    expect(stripped.explanationText).toBe('');
    expect(stripped.acceptedAnswers).toEqual([]);
    expect(stripped.parts[0].correctAnswer).toBeUndefined();
    expect(stripped.parts[0].acceptedAnswers).toEqual([]);
    expect(stripped.tableConfig.correctData).toEqual({});
    expect(quizService.stripQuestionCorrectData(null)).toBeNull();

    const hidden = quizService.hideAttemptResult({ score: 10, maxScore: 20, percentage: 50 }, 'never');
    expect(hidden.hiddenByPolicy).toBe(true);
    expect(hidden.score).toBeNull();
    expect(hidden.policyMessage).toMatch(/not visible/i);

    expect(quizService.canStudentSeeResult('immediately')).toBe(true);
    expect(quizService.canStudentSeeResult('never')).toBe(false);
    expect(quizService.canStudentSeeResult('after_close', { endAt: new Date(Date.now() - 1000).toISOString() })).toBe(true);
    expect(quizService.canStudentSeeResult('after_close', { endAt: new Date(Date.now() + 1000).toISOString() })).toBe(false);
    expect(quizService.canStudentSeeResult('after_close', null)).toBe(false);
    expect(quizService.canStudentSeeResult('after_manual_release', { manualResultReleasedAt: 'now' })).toBe(true);
    expect(quizService.canStudentSeeResult('unknown')).toBe(true);
    expect(quizService.resultPolicyMessage('after_close')).toMatch(/after the exam closes/i);
    expect(quizService.resultPolicyMessage('after_manual_release')).toMatch(/released manually/i);
    expect(quizService.resultPolicyMessage('other')).toMatch(/not available yet/i);
  });

  test('checks availability, expiry, templates, and SEB compatibility helpers', () => {
    expect(quizService.withAvailability({
      status: 'published',
      startAt: new Date(Date.now() - 1000).toISOString(),
      endAt: new Date(Date.now() + 1000).toISOString()
    }).isOpen).toBe(true);
    expect(quizService.isAnswerCorrect({ type: 'TF', points: 1, correctAnswer: 'true' }, 'TRUE')).toBe(true);
    expect(() => quizService.assertQuizPublishable({ questions: [] })).toThrow(/without at least one valid question/i);
    expect(quizService.isAttemptExpired(null)).toBe(false);
    expect(quizService.isAttemptExpired({ expiresAt: '' })).toBe(false);
    expect(quizService.isAttemptExpired({ expiresAt: 'not-date' })).toBe(false);
    expect(quizService.isAttemptExpired({ expiresAt: new Date(Date.now() - 1000).toISOString() })).toBe(true);
    expect(quizService.applyTemplate({ title: 'Quiz' }, '')).toEqual({ title: 'Quiz' });
    expect(() => quizService.assertSebCompatible({ headers: {} })).toThrow(/Safe Exam Browser/i);
    expect(() => quizService.assertSebCompatible({ headers: { 'x-safe-exam-browser': '1' } })).not.toThrow();
    expect(() => quizService.assertSebCompatible({ userAgent: 'SafeExamBrowser/3.0' })).not.toThrow();
    expect(() => quizService.assertSebCompatible({ headers: { 'user-agent': 'seb client' } })).not.toThrow();
  });
});
