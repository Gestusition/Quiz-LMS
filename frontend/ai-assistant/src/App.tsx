import {
  Component,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import { AiClient, createAiClient } from './client';
import { AzureSettingsDialog } from './components/AzureSettingsDialog';
import { ChatWorkspace } from './components/ChatWorkspace';
import { ConversationSidebar } from './components/ConversationSidebar';
import { MaterialsPanel } from './components/MaterialsPanel';
import { PasteMaterialDialog } from './components/PasteMaterialDialog';
import { QuizPlanPanel } from './components/QuizPlanPanel';
import { QuizReviewEditor } from './components/QuizReviewEditor';
import { SourceReferenceViewer } from './components/SourceReferenceViewer';
import {
  AiAssistantUser,
  AssistantCallbacks,
  ConversationDetail,
  ConversationSummary,
  DEFAULT_PLAN,
  GenerationState,
  LegacyAiApi,
  QuizDraft,
  QuizPlan,
  RevisionPreview,
  SourceReference
} from './types';
import { createIdempotencyKey } from './utils';

interface AiAssistantAppProps extends AssistantCallbacks {
  api: LegacyAiApi;
  user: AiAssistantUser;
  onFallback?: () => void;
}

interface WorkspaceProps extends AssistantCallbacks {
  client: AiClient;
  user: AiAssistantUser;
  onFallback?: () => void;
}

interface ErrorBoundaryProps extends PropsWithChildren {
  onFallback?: () => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
}

const CONVERSATION_API_VERSION = 1;
const ROUTE_UPDATE_MESSAGE =
  'The running LMS server has not loaded the conversational AI routes. Restart the LMS server, then check again.';

function isMissingConversationRoute(error: unknown) {
  if (!(error instanceof Error)) return false;
  const apiError = error as ApiError;
  return apiError.status === 404 && /api route not found/i.test(apiError.message);
}

function actionError(error: unknown, fallback: string) {
  if (isMissingConversationRoute(error)) return ROUTE_UPDATE_MESSAGE;
  return error instanceof Error ? error.message : fallback;
}

class AssistantErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    const safeName = typeof error?.name === 'string' && error.name
      ? error.name.slice(0, 80)
      : 'RenderError';
    console.error('AI Assistant frontend failed safely.', { name: safeName });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="aiw-fatal" role="alert">
        <span className="aiw-eyebrow">AI Assistant unavailable</span>
        <h1>The conversational workspace could not start.</h1>
        <p>Your saved conversations and drafts were not changed.</p>
        <div className="aiw-inline-actions">
          <button className="aiw-button aiw-button--quiet" type="button" onClick={() => location.reload()}>
            Reload page
          </button>
          {this.props.onFallback ? (
            <button className="aiw-button aiw-button--primary" type="button" onClick={this.props.onFallback}>
              Open legacy assistant
            </button>
          ) : null}
        </div>
      </div>
    );
  }
}

function mergePlan(plan: QuizPlan, patch: Partial<QuizPlan>): QuizPlan {
  return {
    ...plan,
    ...patch,
    questionTypeDistribution: patch.questionTypeDistribution
      ? { ...plan.questionTypeDistribution, ...patch.questionTypeDistribution }
      : plan.questionTypeDistribution
  };
}

function ApiCompatibilityState({
  checking,
  onCheckAgain,
  onFallback
}: {
  checking: boolean;
  onCheckAgain: () => void;
  onFallback?: () => void;
}) {
  return (
    <main className="aiw-compatibility" role="alert">
      <span className="aiw-eyebrow">Server update required</span>
      <h1>The AI workspace and the running LMS server are out of sync.</h1>
      <p>{ROUTE_UPDATE_MESSAGE}</p>
      <p>Your existing LMS, conversations, and drafts have not been changed.</p>
      <div className="aiw-inline-actions">
        <button
          className="aiw-button aiw-button--primary"
          type="button"
          disabled={checking}
          onClick={onCheckAgain}
        >
          {checking ? 'Checking…' : 'Check again'}
        </button>
        {onFallback ? (
          <button className="aiw-button aiw-button--quiet" type="button" onClick={onFallback}>
            Open existing assistant
          </button>
        ) : null}
      </div>
    </main>
  );
}

function Workspace({
  client,
  user,
  onToast,
  onNavigate,
  onFallback
}: WorkspaceProps) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isComposingNew, setIsComposingNew] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'conversations' | 'chat' | 'plan'>('chat');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [source, setSource] = useState<SourceReference | null>(null);
  const [revision, setRevision] = useState<RevisionPreview | null>(null);
  const [dismissedRevisionId, setDismissedRevisionId] = useState<number | null>(null);
  const planSaveTimer = useRef<number | null>(null);
  const queuedPlanPatch = useRef<{ id: number; patch: Partial<QuizPlan> } | null>(null);

  const toast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    onToast?.(message, type);
  }, [onToast]);

  const conversationsQuery = useQuery({
    queryKey: ['ai', 'conversations'],
    queryFn: client.listConversations
  });
  const coursesQuery = useQuery({
    queryKey: ['ai', 'courses'],
    queryFn: client.listCourses
  });
  const settingsQuery = useQuery({
    queryKey: ['ai', 'settings'],
    queryFn: client.getSettings
  });
  const detailQuery = useQuery({
    queryKey: ['ai', 'conversation', selectedId],
    queryFn: () => client.getConversation(selectedId as number),
    enabled: Boolean(selectedId)
  });

  useEffect(() => {
    if (selectedId || isComposingNew || !conversationsQuery.data?.length) return;
    setSelectedId(conversationsQuery.data[0].id);
  }, [conversationsQuery.data, isComposingNew, selectedId]);

  useEffect(() => {
    setRevision(null);
    setDismissedRevisionId(null);
  }, [selectedId]);

  const detail = detailQuery.data || null;
  const plan = detail?.plan || DEFAULT_PLAN;
  const courses = coursesQuery.data || [];
  const materialsQuery = useQuery({
    queryKey: ['ai', 'materials', plan.courseId],
    queryFn: () => client.listMaterials(plan.courseId as number),
    enabled: Boolean(plan.courseId)
  });
  const materials = materialsQuery.data || [];
  const conversationStatus = detail?.status || 'gathering_requirements';

  const flushPlanPatch = useCallback(async () => {
    const queued = queuedPlanPatch.current;
    if (!queued) return;
    queuedPlanPatch.current = null;
    if (planSaveTimer.current) window.clearTimeout(planSaveTimer.current);
    planSaveTimer.current = null;
    try {
      const result = await client.updatePlan(queued.id, queued.patch);
      if (result.conversation) {
        queryClient.setQueryData(['ai', 'conversation', queued.id], result.conversation);
      } else {
        await queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', queued.id] });
      }
      await queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
    } catch (error) {
      await queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', queued.id] });
      toast(actionError(error, 'Quiz Plan could not be saved.'), 'error');
    }
  }, [client, queryClient, toast]);

  useEffect(() => {
    return () => {
      if (planSaveTimer.current) window.clearTimeout(planSaveTimer.current);
      if (queuedPlanPatch.current) void flushPlanPatch();
    };
  }, [flushPlanPatch, selectedId]);

  const patchPlan = useCallback((patch: Partial<QuizPlan>) => {
    if (!selectedId) {
      toast('Start a conversation before editing the Quiz Plan.', 'info');
      return;
    }
    queryClient.setQueryData<ConversationDetail>(
      ['ai', 'conversation', selectedId],
      current => current
        ? {
            ...current,
            plan: mergePlan(current.plan, patch),
            suggestedReplies: []
          }
        : current
    );
    const queued = queuedPlanPatch.current;
    queuedPlanPatch.current = {
      id: selectedId,
      patch: queued?.id === selectedId ? { ...queued.patch, ...patch } : patch
    };
    if (planSaveTimer.current) window.clearTimeout(planSaveTimer.current);
    planSaveTimer.current = window.setTimeout(() => void flushPlanPatch(), 450);
  }, [flushPlanPatch, queryClient, selectedId, toast]);

  const courseMutation = useMutation({
    mutationFn: async ({
      courseId,
      conversationId
    }: {
      courseId: number;
      conversationId: number | null;
    }) => {
      if (!conversationId) {
        return {
          mode: 'created' as const,
          conversation: await client.createConversation({ courseId })
        };
      }
      return {
        mode: 'updated' as const,
        conversationId,
        result: await client.updatePlan(conversationId, {
          courseId,
          materialIds: []
        })
      };
    },
    onSuccess: async payload => {
      if (payload.mode === 'created') {
        queryClient.setQueryData(
          ['ai', 'conversation', payload.conversation.id],
          payload.conversation
        );
        setSelectedId(payload.conversation.id);
        setIsComposingNew(false);
        setRevision(null);
        setDismissedRevisionId(null);
      } else if (payload.result.conversation) {
        queryClient.setQueryData(
          ['ai', 'conversation', payload.conversationId],
          payload.result.conversation
        );
      } else {
        await queryClient.invalidateQueries({
          queryKey: ['ai', 'conversation', payload.conversationId]
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
    },
    onError: error => toast(actionError(error, 'The course could not be selected.'), 'error')
  });

  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId: number) => client.deleteConversation(conversationId),
    onSuccess: async (_, conversationId) => {
      const conversations = queryClient.getQueryData<ConversationSummary[]>(['ai', 'conversations']) || [];
      const remaining = conversations.filter(conversation => conversation.id !== conversationId);
      queryClient.setQueryData(['ai', 'conversations'], remaining);
      queryClient.removeQueries({ queryKey: ['ai', 'conversation', conversationId], exact: true });
      queryClient.removeQueries({ queryKey: ['ai', 'generation', conversationId], exact: true });
      if (selectedId === conversationId) {
        setSelectedId(remaining[0]?.id || null);
        setIsComposingNew(!remaining.length);
        setRevision(null);
        setDismissedRevisionId(null);
      }
      await queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
      toast('Conversation deleted.', 'success');
    },
    onError: error => toast(actionError(error, 'The conversation could not be deleted.'), 'error')
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedId || !detail) {
        throw new Error('Choose a course before starting the conversation.');
      }
      const result = detail.draft
        ? await client.reviseDraft(selectedId, content)
        : await client.sendMessage(selectedId, content);
      return { conversationId: selectedId, currentDetail: detail, result };
    },
    onSuccess: async ({ conversationId, currentDetail, result }) => {
      setSelectedId(conversationId);
      setMobilePanel('chat');
      if (result.conversation) {
        queryClient.setQueryData(['ai', 'conversation', conversationId], result.conversation);
      } else if (currentDetail && selectedId !== conversationId) {
        queryClient.setQueryData(['ai', 'conversation', conversationId], currentDetail);
      }
      if (result.revision) {
        setRevision(result.revision);
        setDismissedRevisionId(null);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', conversationId] }),
        queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] })
      ]);
    },
    onError: error => toast(actionError(error, 'The message could not be sent.'), 'error')
  });

  const generateMutation = useMutation({
    mutationFn: () => client.generateDraft(selectedId as number, createIdempotencyKey()),
    onSuccess: async result => {
      if (result.conversation && selectedId) {
        queryClient.setQueryData(['ai', 'conversation', selectedId], result.conversation);
        queryClient.setQueryData(
          ['ai', 'generation', selectedId],
          result.conversation.generation || null
        );
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', selectedId] }),
        queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] })
      ]);
    },
    onError: error => toast(actionError(error, 'Draft generation failed.'), 'error')
  });

  const detailGenerating = detail?.status === 'generating' || detail?.generation?.status === 'generating';
  const generationStatusQuery = useQuery({
    queryKey: ['ai', 'generation', selectedId],
    queryFn: () => client.getGenerationStatus(selectedId as number),
    enabled: Boolean(selectedId && (detailGenerating || generateMutation.isPending)),
    refetchInterval: query => ['queued', 'generating', 'cancel_requested'].includes(query.state.data?.status || '')
      ? 1400
      : false
  });
  const effectiveGeneration: GenerationState | null =
    detailGenerating || generateMutation.isPending
      ? generationStatusQuery.data ||
        detail?.generation ||
        {
          status: 'generating',
          stage: 'validating_quiz_plan',
          message: '',
          canCancel: false,
          startedAt: '',
          updatedAt: ''
        }
      : detail?.generation || null;

  const lastGenerationStatus = useRef<string>('');
  useEffect(() => {
    const status = generationStatusQuery.data?.status;
    if (!status || status === lastGenerationStatus.current) return;
    lastGenerationStatus.current = status;
    if (status !== 'generating' && selectedId) {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', selectedId] }),
        queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] })
      ]);
      if (status === 'completed') {
        toast('Quiz draft is ready for review.', 'success');
      }
    }
  }, [generationStatusQuery.data?.status, queryClient, selectedId, toast]);

  const cancelMutation = useMutation({
    mutationFn: () => client.cancelGeneration(selectedId as number),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', selectedId] }),
        queryClient.invalidateQueries({ queryKey: ['ai', 'generation', selectedId] })
      ]);
      toast('Generation stopped.', 'info');
    },
    onError: error => toast(actionError(error, 'Generation could not be stopped.'), 'error')
  });

  const applyRevisionMutation = useMutation({
    mutationFn: (nextRevision: RevisionPreview) =>
      client.applyRevision(selectedId as number, nextRevision.id),
    onSuccess: async result => {
      setRevision(null);
      setDismissedRevisionId(null);
      if (result.conversation && selectedId) {
        queryClient.setQueryData(['ai', 'conversation', selectedId], result.conversation);
      }
      await queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', selectedId] });
      toast('Revision applied to the draft.', 'success');
    },
    onError: error => toast(actionError(error, 'Revision could not be applied.'), 'error')
  });

  const saveDraftMutation = useMutation({
    mutationFn: (draft: QuizDraft) => client.saveDraft(selectedId as number, draft),
    onSuccess: async result => {
      if (result.conversation && selectedId) {
        queryClient.setQueryData(['ai', 'conversation', selectedId], result.conversation);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', selectedId] }),
        queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] })
      ]);
    }
  });

  const saveDraft = async (draft: QuizDraft, showToast = true) => {
    try {
      await saveDraftMutation.mutateAsync(draft);
      if (showToast) toast('Draft changes saved.', 'success');
      return true;
    } catch (error) {
      toast(actionError(error, 'Draft could not be saved.'), 'error');
      return false;
    }
  };

  const regenerateMutation = useMutation({
    mutationFn: ({ indexes, instruction }: { indexes: number[]; instruction?: string }) =>
      client.regenerateQuestions(selectedId as number, indexes, instruction),
    onSuccess: async result => {
      if (result.conversation && selectedId) {
        queryClient.setQueryData(['ai', 'conversation', selectedId], result.conversation);
      }
      await queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', selectedId] });
      toast('Selected questions regenerated. Review the changes before saving.', 'success');
    },
    onError: error => toast(actionError(error, 'Questions could not be regenerated.'), 'error')
  });

  const revisionCandidate = revision || detail?.pendingRevision || null;
  const activeRevision = revisionCandidate?.id === dismissedRevisionId ? null : revisionCandidate;
  const currentCourseId = plan.courseId;
  const compatibilityIssue = Boolean(
    (settingsQuery.data && settingsQuery.data.conversationApiVersion < CONVERSATION_API_VERSION) ||
    isMissingConversationRoute(conversationsQuery.error)
  );

  const selectCourse = (courseId: number) => {
    const conversationId = selectedId;
    void flushPlanPatch().then(() => {
      courseMutation.mutate({ courseId, conversationId });
    });
  };

  const beginNewConversation = () => {
    void flushPlanPatch();
    setSelectedId(null);
    setIsComposingNew(true);
    setRevision(null);
    setDismissedRevisionId(null);
    setMobilePanel('chat');
    window.setTimeout(() => document.getElementById('aiw-start-course')?.focus(), 0);
  };

  const openCourses = () => {
    if (onNavigate) {
      onNavigate('#/courses');
    } else {
      location.hash = '#/courses';
    }
  };

  const focusCourseSelection = () => {
    setMobilePanel('chat');
    window.setTimeout(() => document.getElementById('aiw-start-course')?.focus(), 0);
  };

  const openPaste = () => {
    if (!currentCourseId) {
      focusCourseSelection();
      toast('Choose a course before adding material.', 'info');
      return;
    }
    setPasteOpen(true);
  };

  const openUpload = () => {
    if (!currentCourseId) {
      focusCourseSelection();
      toast('Choose a course before uploading material.', 'info');
      return;
    }
    document.getElementById('aiw-material-upload')?.click();
  };

  const review = detail?.draft ? (
    <QuizReviewEditor
      draft={detail.draft}
      draftSaved={detail.status === 'draft_saved'}
      saving={saveDraftMutation.isPending}
      regenerating={regenerateMutation.isPending}
      onSave={saveDraft}
      onRegenerate={async (indexes, instruction) => {
        await regenerateMutation.mutateAsync({ indexes, instruction });
      }}
      onOpenSource={setSource}
    />
  ) : null;

  if (compatibilityIssue) {
    return (
      <ApiCompatibilityState
        checking={settingsQuery.isFetching || conversationsQuery.isFetching}
        onCheckAgain={() => {
          void Promise.all([settingsQuery.refetch(), conversationsQuery.refetch()]);
        }}
        onFallback={onFallback}
      />
    );
  }

  return (
    <div className="aiw-app">
      <header className="aiw-topbar">
        <div className="aiw-topbar__title">
          <div className="aiw-product-mark" aria-hidden="true">AI</div>
          <div>
            <span className="aiw-eyebrow">
              {user.role === 'admin' ? 'Administrator workspace' : 'Teacher workspace'}
            </span>
            <h1>AI Quiz Assistant</h1>
            <p>Plan together, generate a private draft, then review every question.</p>
          </div>
        </div>
        <div className="aiw-topbar__actions">
          <span className={`aiw-config-status ${settingsQuery.data?.configured ? 'is-ready' : ''}`}>
            <i aria-hidden="true" />
            {settingsQuery.data?.configured ? 'Azure configured' : 'Setup required'}
          </span>
          <button className="aiw-button aiw-button--quiet" type="button" onClick={() => setSettingsOpen(true)}>
            Azure settings
          </button>
        </div>
      </header>

      {!settingsQuery.data?.enabled && settingsQuery.data ? (
        <div className="aiw-page-alert" role="alert">
          <strong>AI generation is disabled.</strong>
          <span>{settingsQuery.data.message || 'Contact an administrator to enable the assistant.'}</span>
        </div>
      ) : null}

      <div className="aiw-mobile-tabs" role="tablist" aria-label="AI Assistant workspace panels">
        {([
          ['conversations', 'Conversations'],
          ['chat', detail?.draft ? 'Chat & review' : 'Chat'],
          ['plan', 'Quiz Plan']
        ] as const).map(([panel, label]) => (
          <button
            key={panel}
            id={`aiw-${panel}-tab`}
            type="button"
            role="tab"
            aria-selected={mobilePanel === panel}
            aria-controls={`aiw-${panel}-panel`}
            tabIndex={mobilePanel === panel ? 0 : -1}
            onClick={() => setMobilePanel(panel)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="aiw-layout">
        <div
          id="aiw-conversations-panel"
          className={`aiw-region aiw-region--left ${mobilePanel === 'conversations' ? 'is-mobile-active' : ''}`}
          role="tabpanel"
          aria-labelledby="aiw-conversations-tab"
        >
          <ConversationSidebar
            conversations={conversationsQuery.data || []}
            selectedId={selectedId}
            isLoading={conversationsQuery.isLoading}
            isError={conversationsQuery.isError}
            isCreating={courseMutation.isPending}
            deletingId={deleteConversationMutation.isPending
              ? deleteConversationMutation.variables
              : null}
            onNew={beginNewConversation}
            onRetry={() => {
              void conversationsQuery.refetch();
            }}
            onSelect={id => {
              void flushPlanPatch();
              setSelectedId(id);
              setIsComposingNew(false);
              setRevision(null);
              setDismissedRevisionId(null);
              setMobilePanel('chat');
            }}
            onDelete={id => {
              if (queuedPlanPatch.current?.id === id) {
                queuedPlanPatch.current = null;
                if (planSaveTimer.current) window.clearTimeout(planSaveTimer.current);
                planSaveTimer.current = null;
              }
              deleteConversationMutation.mutate(id);
            }}
            materials={(
              <MaterialsPanel
                client={client}
                conversationId={selectedId}
                plan={plan}
                courseId={currentCourseId}
                courses={courses}
                coursesLoading={coursesQuery.isLoading}
                coursesError={coursesQuery.isError}
                courseSelectionPending={courseMutation.isPending}
                onPlanPatch={patchPlan}
                onCourseSelect={selectCourse}
                onRetryCourses={() => {
                  void coursesQuery.refetch();
                }}
                onOpenCourses={openCourses}
                onToast={toast}
              />
            )}
          />
        </div>

        <div
          id="aiw-chat-panel"
          className={`aiw-region aiw-region--center ${mobilePanel === 'chat' ? 'is-mobile-active' : ''}`}
          role="tabpanel"
          aria-labelledby="aiw-chat-tab"
        >
          <ChatWorkspace
            detail={detail}
            plan={plan}
            courses={courses}
            materials={materials}
            coursesLoading={coursesQuery.isLoading}
            coursesError={coursesQuery.isError}
            courseSelectionPending={courseMutation.isPending}
            loading={detailQuery.isLoading}
            error={detailQuery.isError}
            isSending={sendMutation.isPending}
            generation={effectiveGeneration}
            cancelling={cancelMutation.isPending}
            revision={activeRevision}
            applyingRevision={applyRevisionMutation.isPending}
            onRetryLoad={() => detailQuery.refetch()}
            onRetryCourses={() => {
              void coursesQuery.refetch();
            }}
            onOpenCourses={openCourses}
            onCourseSelect={selectCourse}
            onSend={content => sendMutation.mutate(content)}
            onRetryMessage={message => sendMutation.mutate(message.content)}
            onAttach={openUpload}
            onPasteMaterial={openPaste}
            onCancelGeneration={() => cancelMutation.mutate()}
            onApplyRevision={nextRevision => applyRevisionMutation.mutate(nextRevision)}
            onDismissRevision={() => {
              setDismissedRevisionId(activeRevision?.id || null);
              setRevision(null);
            }}
            review={review}
          />
        </div>

        <div
          id="aiw-plan-panel"
          className={`aiw-region aiw-region--right ${mobilePanel === 'plan' ? 'is-mobile-active' : ''}`}
          role="tabpanel"
          aria-labelledby="aiw-plan-tab"
        >
          <QuizPlanPanel
            plan={plan}
            courses={courses}
            coursesLoading={coursesQuery.isLoading}
            coursesError={coursesQuery.isError}
            courseSelectionPending={courseMutation.isPending}
            courseLocked={Boolean(detail?.draft)}
            conversationId={selectedId}
            conversationStatus={conversationStatus}
            generation={effectiveGeneration}
            generating={Boolean(
              effectiveGeneration && ['queued', 'generating', 'cancel_requested'].includes(effectiveGeneration.status)
            )}
            generationAvailable={Boolean(settingsQuery.data?.enabled && settingsQuery.data?.configured)}
            generationConfigured={Boolean(settingsQuery.data?.configured)}
            onCourseSelect={selectCourse}
            onRetryCourses={() => {
              void coursesQuery.refetch();
            }}
            onOpenCourses={openCourses}
            onPatch={patchPlan}
            onGenerate={() => generateMutation.mutate()}
          />
        </div>
      </div>

      <div className="aiw-sr-only" aria-live="polite" aria-atomic="true">
        {sendMutation.isPending ? 'The assistant is responding.' : ''}
        {effectiveGeneration?.status === 'generating' ? `Generation stage: ${effectiveGeneration.stage}.` : ''}
      </div>

      {settingsOpen ? (
        <AzureSettingsDialog client={client} onClose={() => setSettingsOpen(false)} onToast={toast} />
      ) : null}
      {pasteOpen && currentCourseId ? (
        <PasteMaterialDialog
          client={client}
          courseId={currentCourseId}
          conversationId={selectedId}
          onClose={() => setPasteOpen(false)}
          onToast={toast}
        />
      ) : null}
      {source && currentCourseId ? (
        <SourceReferenceViewer
          client={client}
          courseId={currentCourseId}
          source={source}
          onClose={() => setSource(null)}
        />
      ) : null}
    </div>
  );
}

export function AiAssistantApp({
  api,
  user,
  onToast,
  onNavigate,
  onFallback
}: AiAssistantAppProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        retry: 1,
        refetchOnWindowFocus: false
      },
      mutations: {
        retry: false
      }
    }
  }));
  const client = useMemo(() => createAiClient(api), [api]);

  return (
    <AssistantErrorBoundary onFallback={onFallback}>
      <QueryClientProvider client={queryClient}>
        <Workspace
          client={client}
          user={user}
          onToast={onToast}
          onNavigate={onNavigate}
          onFallback={onFallback}
        />
      </QueryClientProvider>
    </AssistantErrorBoundary>
  );
}
