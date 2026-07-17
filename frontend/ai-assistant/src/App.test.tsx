import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AiAssistantApp } from './App';
import { DEFAULT_PLAN, LegacyAiApi, QuizPlan } from './types';

function conversation(overrides: Record<string, unknown> = {}) {
  return {
    id: 41,
    title: 'New quiz conversation',
    status: 'gathering_requirements',
    courseId: null,
    createdAt: '2026-07-17T10:00:00.000Z',
    updatedAt: '2026-07-17T10:00:00.000Z',
    plan: {
      ...DEFAULT_PLAN,
      missingRequiredFields: []
    },
    messages: [],
    draft: null,
    generation: null,
    ...overrides
  };
}

function summary(overrides: Record<string, unknown> = {}) {
  return {
    id: 41,
    title: 'New quiz conversation',
    status: 'gathering_requirements',
    courseId: null,
    createdAt: '2026-07-17T10:00:00.000Z',
    updatedAt: '2026-07-17T10:00:00.000Z',
    messageCount: 0,
    draftId: null,
    ...overrides
  };
}

function mockApi(options: {
  conversations?: unknown[];
  detail?: unknown;
  courses?: unknown[];
  materials?: unknown[];
} = {}): LegacyAiApi & Record<string, ReturnType<typeof vi.fn>> {
  const detail = options.detail ?? conversation();
  const api = {
    getCourses: vi.fn().mockResolvedValue(options.courses ?? [
      { id: 7, code: 'DEMO101', title: 'Programming Fundamentals' }
    ]),
    getAiConversations: vi.fn().mockResolvedValue(options.conversations ?? []),
    createAiConversation: vi.fn().mockResolvedValue(detail),
    getAiConversation: vi.fn().mockResolvedValue(detail),
    sendAiConversationMessage: vi.fn().mockResolvedValue({}),
    updateAiConversationPlan: vi.fn().mockResolvedValue({}),
    generateAiConversationDraft: vi.fn().mockResolvedValue({}),
    getAiConversationGenerationStatus: vi.fn().mockResolvedValue({
      status: 'review_required',
      stage: 'opening_review',
      canCancel: false
    }),
    cancelAiConversationGeneration: vi.fn().mockResolvedValue({}),
    reviseAiConversationDraft: vi.fn().mockResolvedValue({}),
    applyAiConversationRevision: vi.fn().mockResolvedValue({}),
    regenerateAiConversationQuestions: vi.fn().mockResolvedValue({}),
    saveAiConversationDraft: vi.fn().mockResolvedValue({}),
    getAiSettingsStatus: vi.fn().mockResolvedValue({
      enabled: true,
      configured: true,
      conversationApiVersion: 1,
      source: 'user',
      endpoint: 'https://example.openai.azure.com',
      maskedApiKey: '****1234',
      chatDeployment: 'chat',
      embeddingDeployment: 'embedding',
      apiVersion: '2024-10-21'
    }),
    saveAiSettings: vi.fn().mockResolvedValue({
      enabled: true,
      configured: true
    }),
    testAiSettings: vi.fn().mockResolvedValue({ chat: true, embeddings: true }),
    getAiMaterials: vi.fn().mockResolvedValue(options.materials ?? []),
    uploadAiMaterial: vi.fn().mockResolvedValue({ id: 1 }),
    pasteAiMaterial: vi.fn().mockResolvedValue({ id: 1 }),
    deleteAiMaterial: vi.fn().mockResolvedValue({ message: 'removed' }),
    getAiMaterialChunk: vi.fn().mockResolvedValue({ label: 'Week 4', content: 'Loop notes' })
  };
  return api as LegacyAiApi & Record<string, ReturnType<typeof vi.fn>>;
}

function renderAssistant(
  api: LegacyAiApi,
  callbacks: {
    onToast?: (message: string, type?: 'info' | 'success' | 'error') => void;
    onNavigate?: (hash: string) => void;
    onFallback?: () => void;
  } = {}
) {
  return render(
    <AiAssistantApp
      api={api}
      user={{ id: 3, name: 'Teacher', role: 'teacher' }}
      onToast={callbacks.onToast || vi.fn()}
      onNavigate={callbacks.onNavigate}
      onFallback={callbacks.onFallback}
    />
  );
}

describe('AI Assistant island', () => {
  test('shows course-aware suggestions only after selecting a course first', async () => {
    const selectedDetail = conversation({
      courseId: 22,
      plan: {
        ...DEFAULT_PLAN,
        courseId: 22
      }
    });
    const api = mockApi({
      courses: [{ id: 22, code: 'CHEM204', title: 'Organic Chemistry' }],
      detail: selectedDetail
    });
    const user = userEvent.setup();
    renderAssistant(api);

    expect(await screen.findByRole('heading', { name: 'AI Quiz Assistant' })).toBeInTheDocument();
    expect(screen.getByText(/What kind of quiz would you like to create/i)).toBeVisible();
    expect(screen.getByLabelText(/Describe the quiz you want to create/i)).toBeDisabled();

    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Choose a course to start' }),
      '22'
    );

    await waitFor(() => expect(api.createAiConversation).toHaveBeenCalledWith({ courseId: 22 }));
    expect(api.sendAiConversationMessage).not.toHaveBeenCalled();
    expect(await screen.findByLabelText(/Describe the quiz you want to create/i)).toBeEnabled();
    expect(await screen.findByRole('button', { name: /Choose a CHEM204 topic/i })).toBeVisible();
    expect(screen.queryByText(/Python loops/i)).not.toBeInTheDocument();
  });

  test('lists every authorized course before a conversation and creates the selected course workspace directly', async () => {
    const courses = [
      { id: 7, code: 'DEMO101', title: 'Programming Fundamentals' },
      { id: 12, code: 'MATH220', title: 'Discrete Mathematics' },
      { id: 18, code: 'HIST310', title: 'Modern History' }
    ];
    const selectedDetail = conversation({
      courseId: 12,
      plan: {
        ...DEFAULT_PLAN,
        courseId: 12
      }
    });
    const api = mockApi({ courses, detail: selectedDetail });
    const user = userEvent.setup();
    renderAssistant(api);

    const chooser = await screen.findByRole('combobox', { name: 'Choose a course to start' });
    expect(within(chooser).getByRole('option', { name: 'DEMO101 — Programming Fundamentals' }))
      .toBeInTheDocument();
    expect(within(chooser).getByRole('option', { name: 'MATH220 — Discrete Mathematics' }))
      .toBeInTheDocument();
    expect(within(chooser).getByRole('option', { name: 'HIST310 — Modern History' }))
      .toBeInTheDocument();

    await user.selectOptions(chooser, '12');

    await waitFor(() => expect(api.createAiConversation).toHaveBeenCalledTimes(1));
    expect(api.createAiConversation).toHaveBeenCalledWith({ courseId: 12 });
    expect(api.sendAiConversationMessage).not.toHaveBeenCalled();
  });

  test('selects a course for an existing course-less conversation and clears stale material ids', async () => {
    const detail = conversation({
      plan: {
        ...DEFAULT_PLAN,
        materialIds: [5, 9]
      }
    });
    const api = mockApi({
      conversations: [summary()],
      detail
    });
    const user = userEvent.setup();
    renderAssistant(api);

    await waitFor(() => expect(api.getAiConversation).toHaveBeenCalledWith(41));
    const chooser = await screen.findByRole('combobox', { name: 'Choose a course to start' });
    await user.selectOptions(chooser, '7');

    await waitFor(() => expect(api.updateAiConversationPlan).toHaveBeenCalledWith(41, {
      courseId: 7,
      materialIds: []
    }));
    expect(api.createAiConversation).not.toHaveBeenCalled();
    expect(api.sendAiConversationMessage).not.toHaveBeenCalled();
  });

  test('shows a retryable course error and recovers without treating it as an empty course list', async () => {
    const courseError = Object.assign(new Error('Course API unavailable.'), { status: 503 });
    const api = mockApi();
    vi.mocked(api.getCourses)
      .mockRejectedValueOnce(courseError)
      .mockRejectedValueOnce(courseError)
      .mockResolvedValue([
        { id: 7, code: 'DEMO101', title: 'Programming Fundamentals' }
      ]);
    const user = userEvent.setup();
    renderAssistant(api);

    const heading = await screen.findByRole(
      'heading',
      { name: 'Choose the course for this quiz' },
      { timeout: 4000 }
    );
    const courseStart = heading.closest('section');
    expect(courseStart).not.toBeNull();
    expect(await within(courseStart as HTMLElement).findByText('Courses could not be loaded.')).toBeVisible();
    expect(within(courseStart as HTMLElement).queryByText(/No courses are available/i)).not.toBeInTheDocument();

    await user.click(within(courseStart as HTMLElement).getByRole('button', { name: 'Retry' }));

    expect(await within(courseStart as HTMLElement).findByRole('option', {
      name: 'DEMO101 — Programming Fundamentals'
    })).toBeInTheDocument();
    expect(api.getCourses).toHaveBeenCalledTimes(3);
  });

  test('offers Open Courses when the authorized course list is genuinely empty', async () => {
    const api = mockApi({ courses: [] });
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    renderAssistant(api, { onNavigate });

    const heading = await screen.findByRole('heading', { name: 'Choose the course for this quiz' });
    const courseStart = heading.closest('section');
    expect(courseStart).not.toBeNull();
    expect(within(courseStart as HTMLElement).getByText(/No courses are available for your account yet/i))
      .toBeVisible();
    expect(screen.queryByLabelText('Suggested replies')).not.toBeInTheDocument();

    await user.click(within(courseStart as HTMLElement).getByRole('button', { name: 'Open Courses' }));
    expect(onNavigate).toHaveBeenCalledWith('#/courses');
  });

  test('shows a conversation query error instead of a false empty state', async () => {
    const conversationError = Object.assign(new Error('Conversation service unavailable.'), {
      status: 503
    });
    const api = mockApi();
    vi.mocked(api.getAiConversations).mockRejectedValue(conversationError);
    renderAssistant(api);

    expect(await screen.findByText(
      'Conversations could not be loaded.',
      {},
      { timeout: 4000 }
    )).toBeVisible();
    expect(screen.queryByText('No conversations yet.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('shows compatibility recovery and fallback when the server contract is stale', async () => {
    const api = mockApi();
    vi.mocked(api.getAiSettingsStatus).mockResolvedValue({
      enabled: true,
      configured: true,
      conversationApiVersion: 0
    });
    const onFallback = vi.fn();
    const user = userEvent.setup();
    renderAssistant(api, { onFallback });

    const heading = await screen.findByRole('heading', {
      name: /AI workspace and the running LMS server are out of sync/i
    });
    const recovery = heading.closest('main');
    expect(recovery).not.toBeNull();
    expect(within(recovery as HTMLElement).getByRole('button', { name: 'Check again' })).toBeVisible();

    await user.click(within(recovery as HTMLElement).getByRole('button', {
      name: 'Open existing assistant'
    }));
    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  test('shows compatibility recovery and fallback when conversation routes return 404', async () => {
    const routeError = Object.assign(new Error('API route not found.'), {
      status: 404,
      code: 'ROUTE_NOT_FOUND'
    });
    const api = mockApi();
    vi.mocked(api.getAiConversations).mockRejectedValue(routeError);
    const onFallback = vi.fn();
    const user = userEvent.setup();
    renderAssistant(api, { onFallback });

    const heading = await screen.findByRole(
      'heading',
      { name: /AI workspace and the running LMS server are out of sync/i },
      { timeout: 4000 }
    );
    const recovery = heading.closest('main');
    expect(recovery).not.toBeNull();
    expect(within(recovery as HTMLElement).getByText(/Restart the LMS server/i)).toBeVisible();
    expect(within(recovery as HTMLElement).getByRole('button', { name: 'Check again' })).toBeVisible();

    await user.click(within(recovery as HTMLElement).getByRole('button', {
      name: 'Open existing assistant'
    }));
    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  test('locks the course picker after a draft has been generated', async () => {
    const detail = conversation({
      status: 'review_required',
      courseId: 7,
      plan: {
        ...DEFAULT_PLAN,
        courseId: 7,
        topic: 'Loops',
        difficulty: 'medium',
        questionCount: 1,
        questionTypeDistribution: {
          multipleChoice: 1,
          trueFalse: 0,
          shortAnswer: 0,
          essay: 0,
          coding: 0
        }
      },
      draft: {
        id: 9,
        title: 'Loops quiz',
        description: '',
        status: 'draft',
        questions: [],
        updatedAt: '2026-07-17T10:05:00Z'
      }
    });
    const api = mockApi({
      conversations: [summary({ status: 'review_required', courseId: 7, draftId: 9 })],
      detail,
      courses: [
        { id: 7, code: 'DEMO101', title: 'Programming Fundamentals' },
        { id: 12, code: 'MATH220', title: 'Discrete Mathematics' }
      ]
    });
    renderAssistant(api);

    const course = await screen.findByRole('combobox', { name: 'Quiz course' });
    expect(course).toBeDisabled();
    expect(within(course).getByRole('option', { name: 'MATH220 — Discrete Mathematics' }))
      .toBeInTheDocument();
    expect(screen.getByText('Locked after draft generation')).toBeVisible();
    expect(screen.getByText('Start a new conversation to use another course.')).toBeVisible();
    expect(api.updateAiConversationPlan).not.toHaveBeenCalled();
  });

  test('uses live course, type, and selected-material context for suggestion chips', async () => {
    const detail = conversation({
      status: 'ready_to_generate',
      courseId: 7,
      suggestedReplies: [],
      plan: {
        ...DEFAULT_PLAN,
        courseId: 7,
        topic: 'Graph traversal',
        difficulty: 'medium',
        questionCount: 8,
        language: 'English',
        materialScope: 'course_material_preferred',
        materialIds: [5],
        questionTypeDistribution: {
          multipleChoice: 6,
          trueFalse: 0,
          shortAnswer: 0,
          essay: 0,
          coding: 2
        },
        missingRequiredFields: [],
        readinessStatus: 'ready_to_generate'
      }
    });
    const api = mockApi({
      conversations: [summary({ courseId: 7, status: 'ready_to_generate' })],
      detail,
      materials: [{
        id: 5,
        courseId: 7,
        originalName: 'Week_4_Graphs.pdf',
        byteSize: 4000,
        chunkCount: 3,
        status: 'ready'
      }]
    });
    renderAssistant(api);

    expect(await screen.findByRole('button', { name: 'Keep 6 MCQ + 2 coding' })).toBeVisible();
    expect(await screen.findByRole('button', { name: 'Ground in Week 4 Graphs' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Make coding questions scenario-based' })).toBeVisible();
  });

  test('replaces stale chips after a conversation direction and sends the contextual value', async () => {
    const initial = conversation({
      courseId: 7,
      plan: {
        ...DEFAULT_PLAN,
        courseId: 7
      },
      suggestedReplies: [{
        label: 'Keep multiple choice',
        value: 'Keep this quiz multiple-choice only.'
      }],
      messages: [{
        id: 1,
        senderType: 'assistant',
        content: 'An older direction.',
        metadata: { quickReplies: ['Old generic chip'] },
        createdAt: '2026-07-17T10:00:00Z'
      }]
    });
    const updated = conversation({
      courseId: 7,
      suggestedReplies: [{
        label: 'Focus on Dijkstra invariants',
        value: 'Emphasize Dijkstra relaxation invariants in the short-answer questions.'
      }],
      plan: {
        ...DEFAULT_PLAN,
        courseId: 7,
        topic: 'Shortest paths',
        difficulty: 'medium',
        questionCount: 6,
        language: 'English',
        questionTypeDistribution: {
          multipleChoice: 2,
          trueFalse: 0,
          shortAnswer: 4,
          essay: 0,
          coding: 0
        },
        missingRequiredFields: [],
        readinessStatus: 'ready_to_generate'
      },
      messages: [{
        id: 2,
        senderType: 'user',
        content: 'Switch to short answers about Dijkstra invariants.',
        createdAt: '2026-07-17T10:01:00Z'
      }]
    });
    const api = mockApi({
      conversations: [summary({ courseId: 7 })],
      detail: initial
    });
    vi.mocked(api.getAiConversation)
      .mockResolvedValueOnce(initial)
      .mockResolvedValue(updated);
    const user = userEvent.setup();
    renderAssistant(api);

    expect(await screen.findByRole('button', { name: 'Keep multiple choice' })).toBeVisible();
    const composer = screen.getByLabelText(/Describe the quiz you want to create/i);
    await user.type(composer, 'Switch to short answers about Dijkstra invariants.');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    const contextual = await screen.findByRole('button', { name: 'Focus on Dijkstra invariants' });
    expect(screen.queryByRole('button', { name: 'Keep multiple choice' })).not.toBeInTheDocument();
    await user.click(contextual);
    await waitFor(() => expect(api.sendAiConversationMessage).toHaveBeenLastCalledWith(
      41,
      'Emphasize Dijkstra relaxation invariants in the short-answer questions.'
    ));
  });

  test('refreshes the shared Quiz Plan after a natural-language requirement message', async () => {
    const initial = conversation({
      courseId: 7,
      plan: {
        ...DEFAULT_PLAN,
        courseId: 7
      }
    });
    const updated = conversation({
      status: 'ready_to_generate',
      plan: {
        ...DEFAULT_PLAN,
        courseId: 7,
        topic: 'Python loops',
        difficulty: 'medium',
        questionCount: 8,
        language: 'English',
        questionTypeDistribution: {
          multipleChoice: 6,
          trueFalse: 0,
          shortAnswer: 0,
          essay: 0,
          coding: 2
        },
        missingRequiredFields: [],
        readinessStatus: 'ready_to_generate'
      },
      messages: [
        { id: 1, senderType: 'user', content: 'Create 8 questions about Python loops.', createdAt: '2026-07-17T10:01:00Z' },
        { id: 2, senderType: 'assistant', content: 'Your plan is ready.', createdAt: '2026-07-17T10:01:01Z' }
      ]
    });
    const api = mockApi({
      conversations: [summary({ courseId: 7 })],
      detail: initial
    });
    vi.mocked(api.getAiConversation)
      .mockResolvedValueOnce(initial)
      .mockResolvedValue(updated);
    const user = userEvent.setup();
    renderAssistant(api);

    const composer = await screen.findByLabelText(/Describe the quiz you want to create/i);
    await user.type(composer, 'Create 8 questions about Python loops.');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(api.sendAiConversationMessage).toHaveBeenCalledWith(
      41,
      'Create 8 questions about Python loops.'
    ));
    expect(await screen.findByText('Python loops')).toBeVisible();
    expect(screen.getByText('8')).toBeVisible();
    expect(screen.getByText('Ready')).toBeVisible();
  });

  test('keeps advanced controls and readiness on the same Quiz Plan state', async () => {
    const detail = conversation({
      courseId: 7,
      plan: {
        ...DEFAULT_PLAN,
        courseId: 7
      }
    });
    const api = mockApi({
      conversations: [summary({ courseId: 7 })],
      detail
    });
    const user = userEvent.setup();
    renderAssistant(api);

    const course = await screen.findByRole('combobox', { name: 'Quiz course' });
    await within(course).findByRole('option', { name: /Programming Fundamentals/ });
    expect(course).toHaveValue('7');
    await user.click(screen.getByText('Advanced settings'));
    await user.type(screen.getByRole('textbox', { name: 'Topic' }), 'Data structures');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Difficulty' }), 'medium');
    await user.clear(screen.getByRole('spinbutton', { name: 'Question count' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Question count' }), '5');
    await user.clear(screen.getByRole('spinbutton', { name: 'Multiple choice count' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Multiple choice count' }), '5');

    expect(await screen.findByText('Ready')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Generate Draft' })).toBeEnabled();
    await waitFor(() => expect(api.updateAiConversationPlan).toHaveBeenCalled(), { timeout: 1500 });
    const latestPatch = vi.mocked(api.updateAiConversationPlan).mock.calls.at(-1)?.[1] as Partial<QuizPlan>;
    expect(latestPatch).toMatchObject({
      courseId: 7,
      topic: 'Data structures',
      questionCount: 5
    });
    expect(latestPatch.questionTypeDistribution?.multipleChoice).toBe(5);
  });

  test('supports review editing, save-before-regenerate, and semantic question controls', async () => {
    const detail = conversation({
      title: 'Loops quiz',
      status: 'review_required',
      courseId: 7,
      plan: {
        ...DEFAULT_PLAN,
        courseId: 7,
        topic: 'Loops',
        difficulty: 'medium',
        questionCount: 2,
        questionTypeDistribution: {
          multipleChoice: 2,
          trueFalse: 0,
          shortAnswer: 0,
          essay: 0,
          coding: 0
        },
        missingRequiredFields: []
      },
      draft: {
        id: 9,
        title: 'Python Loops Quiz',
        description: 'Review loop concepts.',
        status: 'draft',
        updatedAt: '2026-07-17T10:05:00Z',
        questions: [
          {
            id: 1,
            type: 'multiple_choice',
            text: 'Which keyword starts a loop?',
            options: ['for', 'if', 'def'],
            correctAnswer: 'for',
            explanation: 'for iterates over an iterable.',
            difficulty: 'easy',
            learningObjective: 'Recognize loop syntax',
            points: 2,
            validationStatus: 'valid',
            sourceReferences: []
          },
          {
            id: 2,
            type: 'multiple_choice',
            text: 'What does break do?',
            options: ['Stops the loop', 'Skips one item', 'Restarts'],
            correctAnswer: 'Stops the loop',
            explanation: 'break exits the nearest loop.',
            difficulty: 'medium',
            learningObjective: 'Explain loop control',
            points: 2,
            validationStatus: 'valid',
            sourceReferences: []
          }
        ]
      }
    });
    const api = mockApi({
      conversations: [summary({ title: 'Loops quiz', status: 'review_required', courseId: 7, draftId: 9 })],
      detail
    });
    const user = userEvent.setup();
    renderAssistant(api);

    const title = await screen.findByRole('textbox', { name: 'Quiz title' });
    await user.clear(title);
    await user.type(title, 'Revised Loops Quiz');
    const firstQuestion = screen.getAllByRole('article', { name: /Question 1/i })[0];
    expect(within(firstQuestion).getByRole('button', { name: 'Move question 1 down' })).toBeEnabled();
    await user.click(within(firstQuestion).getByRole('button', { name: 'Regenerate' }));

    await waitFor(() => expect(api.saveAiConversationDraft).toHaveBeenCalled());
    expect(vi.mocked(api.saveAiConversationDraft).mock.calls[0][1]).toMatchObject({ title: 'Revised Loops Quiz' });
    await waitFor(() => expect(api.regenerateAiConversationQuestions).toHaveBeenCalledWith(41, [0], undefined));
  });

  test('restores a persisted revision preview with proposed snapshot details after reload', async () => {
    const beforeSnapshot = {
      title: 'Original loops quiz',
      questions: [
        { id: 1, text: 'Question one' },
        { id: 2, text: 'Question two' },
        { id: 3, text: 'Question three' }
      ]
    };
    const proposedSnapshot = {
      title: 'Focused loops quiz',
      questions: [
        { id: 1, text: 'Question one' },
        { id: 2, text: 'A revised question two' }
      ]
    };
    const detail = conversation({
      title: 'Loops quiz',
      status: 'review_required',
      revisions: [
        {
          id: 18,
          revisionNumber: 4,
          revisionType: 'chat_revision',
          requestText: 'Make the quiz shorter.',
          status: 'preview',
          metadata: { previewOnly: true, requiresConfirmation: true },
          beforeSnapshot,
          proposedSnapshot
        }
      ]
    });
    const api = mockApi({
      conversations: [summary({ title: 'Loops quiz', status: 'review_required' })],
      detail
    });
    const user = userEvent.setup();
    renderAssistant(api);

    const heading = await screen.findByRole('heading', {
      name: 'Requested change: Make the quiz shorter.'
    });
    const preview = heading.closest('section');
    expect(preview).not.toBeNull();
    expect(within(preview as HTMLElement).getByText('Focused loops quiz')).toBeVisible();
    expect(within(preview as HTMLElement).getByLabelText(
      'Question count changes from 3 to 2'
    )).toBeVisible();
    expect(within(within(preview as HTMLElement).getByText('Changed').closest('div') as HTMLElement)
      .getByText('1')).toBeVisible();
    expect(within(within(preview as HTMLElement).getByText('Removed').closest('div') as HTMLElement)
      .getByText('1')).toBeVisible();

    await user.click(within(preview as HTMLElement).getByRole('button', { name: 'Keep current draft' }));
    expect(screen.queryByText('Focused loops quiz')).not.toBeInTheDocument();
  });

  test.each([
    ['Azure is not configured', { enabled: true, configured: false }, /Configure Azure OpenAI/i],
    ['AI generation is disabled', { enabled: false, configured: true }, /AI generation is currently disabled/i]
  ])('disables Generate Draft when %s', async (_label, settings, note) => {
    const readyDetail = conversation({
      status: 'ready_to_generate',
      courseId: 7,
      plan: {
        ...DEFAULT_PLAN,
        courseId: 7,
        topic: 'Python loops',
        difficulty: 'medium',
        questionCount: 2,
        questionTypeDistribution: {
          multipleChoice: 2,
          trueFalse: 0,
          shortAnswer: 0,
          essay: 0,
          coding: 0
        },
        missingRequiredFields: [],
        readinessStatus: 'ready_to_generate'
      }
    });
    const api = mockApi({
      conversations: [summary({ status: 'ready_to_generate', courseId: 7 })],
      detail: readyDetail
    });
    vi.mocked(api.getAiSettingsStatus).mockResolvedValue({
      ...settings,
      conversationApiVersion: 1
    });
    renderAssistant(api);

    expect(await screen.findByText(note)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Generate Draft' })).toBeDisabled();
  });

  test('exposes mobile workspace navigation as keyboard-friendly tabs', async () => {
    const user = userEvent.setup();
    renderAssistant(mockApi());

    const tablist = await screen.findByRole('tablist', { name: 'AI Assistant workspace panels' });
    const chatTab = within(tablist).getByRole('tab', { name: 'Chat' });
    const planTab = within(tablist).getByRole('tab', { name: 'Quiz Plan' });
    expect(chatTab).toHaveAttribute('aria-selected', 'true');
    expect(planTab).toHaveAttribute('aria-selected', 'false');

    await user.click(planTab);
    expect(planTab).toHaveAttribute('aria-selected', 'true');
    expect(chatTab).toHaveAttribute('aria-selected', 'false');
    expect(planTab).toHaveAttribute('aria-controls', 'aiw-plan-panel');
  });
});
