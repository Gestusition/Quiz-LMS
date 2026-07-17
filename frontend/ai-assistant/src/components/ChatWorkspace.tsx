import { ReactNode, useEffect, useMemo, useRef } from 'react';
import {
  AiMessage,
  ConversationDetail,
  Course,
  CourseMaterial,
  GenerationState,
  QuizPlan,
  RevisionPreview
} from '../types';
import { buildContextualReplies } from '../suggestions';
import { fieldLabel, formatTimestamp, getMissingPlanFields } from '../utils';
import { ChatComposer } from './ChatComposer';
import { GenerationProgress } from './GenerationProgress';
import { RevisionPreviewCard } from './RevisionPreviewCard';
import { SuggestedReplies } from './SuggestedReplies';

interface ChatWorkspaceProps {
  detail: ConversationDetail | null;
  plan: QuizPlan;
  courses: Course[];
  materials: CourseMaterial[];
  coursesLoading: boolean;
  coursesError: boolean;
  courseSelectionPending: boolean;
  loading: boolean;
  error: boolean;
  isSending: boolean;
  generation: GenerationState | null;
  cancelling: boolean;
  revision: RevisionPreview | null;
  applyingRevision: boolean;
  onRetryLoad: () => void;
  onRetryCourses: () => void;
  onOpenCourses: () => void;
  onCourseSelect: (courseId: number) => void;
  onSend: (content: string) => void;
  onRetryMessage: (message: AiMessage) => void;
  onAttach: () => void;
  onPasteMaterial: () => void;
  onCancelGeneration: () => void;
  onApplyRevision: (revision: RevisionPreview) => void;
  onDismissRevision: () => void;
  review: ReactNode;
}

const GREETING = 'What kind of quiz would you like to create? You can describe the course, topic, learning objectives, difficulty, question types and any special instructions.';

export function ChatWorkspace({
  detail,
  plan,
  courses,
  materials,
  coursesLoading,
  coursesError,
  courseSelectionPending,
  loading,
  error,
  isSending,
  generation,
  cancelling,
  revision,
  applyingRevision,
  onRetryLoad,
  onRetryCourses,
  onOpenCourses,
  onCourseSelect,
  onSend,
  onRetryMessage,
  onAttach,
  onPasteMaterial,
  onCancelGeneration,
  onApplyRevision,
  onDismissRevision,
  review
}: ChatWorkspaceProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const messages = detail?.messages || [];
  const replies = useMemo(
    () => buildContextualReplies({ detail, plan, courses, materials }),
    [courses, detail, materials, plan]
  );
  const showReplies = Boolean(plan.courseId) && !coursesLoading && !coursesError && courses.length > 0;
  const hasDraft = Boolean(detail?.draft);
  const missing = useMemo(() => getMissingPlanFields(plan), [plan]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  }, [messages.length, isSending]);

  return (
    <section className={`aiw-chat ${hasDraft ? 'aiw-chat--with-review' : ''}`} aria-labelledby="aiw-chat-heading">
      <header className="aiw-chat__header">
        <div>
          <span className="aiw-eyebrow">Guided quiz designer</span>
          <h2 id="aiw-chat-heading">{detail?.title || 'New quiz conversation'}</h2>
        </div>
        {detail ? (
          <span className="aiw-chat__context">
            {missing.length ? `Still needs ${missing.map(fieldLabel).slice(0, 2).join(' and ')}` : 'Quiz plan is ready'}
          </span>
        ) : null}
      </header>

      {error ? (
        <div className="aiw-error-state" role="alert">
          <div>
            <strong>Conversation unavailable</strong>
            <p>Your work is still stored. Try loading it again.</p>
          </div>
          <button className="aiw-button aiw-button--quiet" type="button" onClick={onRetryLoad}>Retry</button>
        </div>
      ) : null}

      <div
        ref={listRef}
        className="aiw-message-list"
        aria-live="polite"
        aria-busy={loading || isSending}
        aria-label="Conversation messages"
      >
        {loading ? <p className="aiw-loading-message" role="status">Loading conversation…</p> : null}
        {!loading && !messages.length ? (
          <article className="aiw-message aiw-message--assistant">
            <div className="aiw-avatar" aria-hidden="true">AI</div>
            <div className="aiw-message__bubble">
              <span className="aiw-message__author">Quiz Assistant</span>
              <p>{GREETING}</p>
            </div>
          </article>
        ) : null}
        {!loading && !plan.courseId ? (
          <section className="aiw-course-start" aria-labelledby="aiw-course-start-heading">
            <div>
              <span className="aiw-eyebrow">First step</span>
              <h3 id="aiw-course-start-heading">Choose the course for this quiz</h3>
              <p>The course controls available materials, context, and course-specific suggestions.</p>
            </div>
            {coursesLoading ? (
              <p className="aiw-muted" role="status">Loading courses…</p>
            ) : coursesError ? (
              <div className="aiw-inline-error" role="alert">
                <span>Courses could not be loaded.</span>
                <button type="button" onClick={onRetryCourses}>Retry</button>
              </div>
            ) : courses.length ? (
              <label className="aiw-field">
                <span>Course</span>
                <select
                  id="aiw-start-course"
                  aria-label="Choose a course to start"
                  value=""
                  disabled={courseSelectionPending}
                  onChange={event => {
                    const courseId = Number(event.target.value);
                    if (courseId) onCourseSelect(courseId);
                  }}
                >
                  <option value="">
                    {courseSelectionPending ? 'Starting course workspace…' : 'Select a course'}
                  </option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.code} — {course.title}</option>
                  ))}
                </select>
                <small>Selecting a course starts and saves this conversation.</small>
              </label>
            ) : (
              <div className="aiw-course-start__empty">
                <p>No courses are available for your account yet.</p>
                <button className="aiw-button aiw-button--quiet" type="button" onClick={onOpenCourses}>
                  Open Courses
                </button>
              </div>
            )}
          </section>
        ) : null}
        {messages.map(message => (
          <article
            key={message.id}
            className={`aiw-message aiw-message--${message.sender}`}
            data-status={message.status}
          >
            <div className="aiw-avatar" aria-hidden="true">{message.sender === 'user' ? 'You' : 'AI'}</div>
            <div className="aiw-message__bubble">
              <div className="aiw-message__meta">
                <span className="aiw-message__author">{message.sender === 'user' ? 'You' : 'Quiz Assistant'}</span>
                {message.createdAt ? <time dateTime={message.createdAt}>{formatTimestamp(message.createdAt)}</time> : null}
              </div>
              <p>{message.content}</p>
              {message.status === 'failed' ? (
                <button type="button" className="aiw-text-button" onClick={() => onRetryMessage(message)}>
                  Retry message
                </button>
              ) : null}
            </div>
          </article>
        ))}
        {isSending ? (
          <article className="aiw-message aiw-message--assistant aiw-message--pending" role="status">
            <div className="aiw-avatar" aria-hidden="true">AI</div>
            <div className="aiw-message__bubble">
              <span className="aiw-message__author">Quiz Assistant</span>
              <span className="aiw-typing" aria-label="Assistant is responding">
                <i /><i /><i />
              </span>
            </div>
          </article>
        ) : null}
      </div>

      <SuggestedReplies
        replies={showReplies ? replies : []}
        onSelect={onSend}
        disabled={isSending || Boolean(generation) || courseSelectionPending}
      />

      {revision ? (
        <RevisionPreviewCard
          revision={revision}
          applying={applyingRevision}
          onApply={() => onApplyRevision(revision)}
          onDismiss={onDismissRevision}
        />
      ) : null}

      {generation?.status === 'generating' ? (
        <GenerationProgress generation={generation} cancelling={cancelling} onCancel={onCancelGeneration} />
      ) : null}

      <ChatComposer
        disabled={
          courseSelectionPending ||
          Boolean(generation && ['queued', 'generating', 'cancel_requested'].includes(generation.status))
        }
        startRequired={!detail && !plan.courseId}
        isSending={isSending}
        hasDraft={hasDraft}
        onSend={onSend}
        onAttach={onAttach}
        onPasteMaterial={onPasteMaterial}
      />

      {review}
    </section>
  );
}

export { GREETING };
