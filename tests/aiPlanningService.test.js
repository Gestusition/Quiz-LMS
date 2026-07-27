const aiQuizService = require('../services/aiQuizService');
const aiPlanningService = require('../services/aiPlanningService');
const { createEmptyQuizPlan } = require('../validators/aiConversationValidator');

const EMPTY_DISTRIBUTION = {
  multipleChoice: 0,
  trueFalse: 0,
  shortAnswer: 0,
  essay: 0,
  coding: 0
};

function providerPlan(overrides = {}) {
  return {
    courseId: null,
    topic: '',
    learningObjectives: [],
    difficulty: '',
    questionCount: null,
    language: '',
    questionTypeDistribution: EMPTY_DISTRIBUTION,
    materialMode: 'general_model_knowledge_allowed',
    includeExplanations: true,
    timeLimitMinutes: null,
    tags: [],
    specialInstructions: '',
    gradingPreferences: '',
    materialIds: [],
    ...overrides
  };
}

function providerResponse(assistantResponse, proposedPlan) {
  return JSON.stringify({
    assistantResponse,
    proposedPlan,
    quickReplies: ['Easy', 'Medium', 'Hard']
  });
}

describe('AI planning turn state preservation', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('does not ask for difficulty again after mixed difficulty and a bare count reply', async () => {
    jest.spyOn(aiQuizService, 'getConfigForUser').mockReturnValue({ enabled: true });
    jest.spyOn(aiQuizService, 'callAzureOpenAI')
      .mockResolvedValueOnce(providerResponse(
        'Noted. How many total questions would you like?',
        providerPlan()
      ))
      .mockResolvedValueOnce(providerResponse(
        'What difficulty level should I use?',
        providerPlan({ questionCount: 7 })
      ));

    const courses = [{ id: 1, code: 'CATS101', title: 'Cats' }];
    const initialPlan = createEmptyQuizPlan({ courseId: 1, topic: 'cats' });
    const difficultyTurn = await aiPlanningService.planConversation({
      content: 'use mixed difficulty that includes both easy hard medium',
      currentPlan: initialPlan,
      courses,
      userId: 42
    });

    expect(difficultyTurn.plan).toEqual(expect.objectContaining({
      courseId: 1,
      topic: 'cats',
      difficulty: 'mixed',
      questionCount: null
    }));
    expect(difficultyTurn.plan.specialInstructions)
      .toMatch(/mix of easy, medium, and hard question difficulties/i);
    expect(difficultyTurn.assistantResponse).toMatch(/how many(?: total)? questions/i);

    const countTurn = await aiPlanningService.planConversation({
      content: '7',
      currentPlan: difficultyTurn.plan,
      courses,
      userId: 42
    });

    expect(countTurn.plan).toEqual(expect.objectContaining({
      courseId: 1,
      topic: 'cats',
      difficulty: 'mixed',
      questionCount: 7
    }));
    expect(countTurn.plan.missingRequiredFields).not.toContain('difficulty');
    expect(countTurn.plan.missingRequiredFields).not.toContain('questionCount');
    expect(countTurn.assistantResponse).not.toMatch(/what difficulty|difficulty level should/i);
    expect(countTurn.assistantResponse).toMatch(/distributed by type/i);
    expect(countTurn.quickReplies).toContain('Mixed');
  });

  test('ends planning instead of accepting extra provider questions after the plan is complete', async () => {
    jest.spyOn(aiQuizService, 'getConfigForUser').mockReturnValue({ enabled: true });
    jest.spyOn(aiQuizService, 'callAzureOpenAI').mockResolvedValue(providerResponse(
      'Which target architecture and assembler syntax should we use?',
      providerPlan({
        courseId: 1,
        topic: 'cats',
        difficulty: 'mixed',
        questionCount: 7,
        language: 'English',
        questionTypeDistribution: {
          ...EMPTY_DISTRIBUTION,
          coding: 7
        }
      })
    ));

    const turn = await aiPlanningService.planConversation({
      content: 'generate',
      currentPlan: createEmptyQuizPlan({
        courseId: 1,
        topic: 'cats',
        difficulty: 'mixed',
        questionCount: 7,
        questionTypeDistribution: {
          ...EMPTY_DISTRIBUTION,
          coding: 7
        }
      }),
      courses: [{ id: 1, code: 'CATS101', title: 'Cats' }],
      userId: 42
    });

    expect(turn.ready).toBe(true);
    expect(turn.plan.missingRequiredFields).toEqual([]);
    expect(turn.assistantResponse).toMatch(/quiz plan is ready/i);
    expect(turn.assistantResponse).not.toMatch(/architecture|assembler syntax/i);
    expect(turn.quickReplies).toContain('Generate draft');
  });

  test('asks only for the first required field when the provider asks for an optional detail', async () => {
    jest.spyOn(aiQuizService, 'getConfigForUser').mockReturnValue({ enabled: true });
    jest.spyOn(aiQuizService, 'callAzureOpenAI').mockResolvedValue(providerResponse(
      'Which target architecture and assembler syntax should we use?',
      providerPlan({
        courseId: 1,
        topic: 'cats',
        difficulty: 'mixed',
        questionCount: 7,
        language: 'English'
      })
    ));

    const turn = await aiPlanningService.planConversation({
      content: 'assembly',
      currentPlan: createEmptyQuizPlan({
        courseId: 1,
        topic: 'cats',
        difficulty: 'mixed',
        questionCount: 7
      }),
      courses: [{ id: 1, code: 'CATS101', title: 'Cats' }],
      userId: 42
    });

    expect(turn.ready).toBe(false);
    expect(turn.plan.missingRequiredFields[0]).toBe('questionTypeDistribution');
    expect(turn.assistantResponse).toMatch(/distributed by type/i);
    expect(turn.assistantResponse).not.toMatch(/architecture|assembler syntax/i);
  });
});
