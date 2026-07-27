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
      difficulty: 'medium',
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
      difficulty: 'medium',
      questionCount: 7
    }));
    expect(countTurn.plan.missingRequiredFields).not.toContain('difficulty');
    expect(countTurn.plan.missingRequiredFields).not.toContain('questionCount');
    expect(countTurn.assistantResponse).not.toMatch(/what difficulty|difficulty level should/i);
    expect(countTurn.assistantResponse).toMatch(/distributed by type/i);
    expect(countTurn.quickReplies).toContain('Mixed');
  });
});
