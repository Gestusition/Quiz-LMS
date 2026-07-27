import { useEffect, useState } from 'react';
import { Course, GenerationState, QuizPlan } from '../types';
import { fieldLabel, getMissingPlanFields, isPlanReady, statusLabel } from '../utils';

interface QuizPlanPanelProps {
  plan: QuizPlan;
  courses: Course[];
  coursesLoading: boolean;
  coursesError: boolean;
  courseSelectionPending: boolean;
  courseLocked: boolean;
  conversationId: number | null;
  conversationStatus: string;
  generation: GenerationState | null;
  generating: boolean;
  generationAvailable: boolean;
  generationConfigured: boolean;
  onCourseSelect: (courseId: number) => void;
  onRetryCourses: () => void;
  onOpenCourses: () => void;
  onPatch: (patch: Partial<QuizPlan>) => void;
  onGenerate: (draftTitle?: string) => void;
}

const TYPE_FIELDS: Array<[keyof QuizPlan['questionTypeDistribution'], string]> = [
  ['multipleChoice', 'Multiple choice'],
  ['trueFalse', 'True / false'],
  ['shortAnswer', 'Short answer'],
  ['essay', 'Essay'],
  ['coding', 'Coding']
];

function valueOrDash(value: string | number | null | undefined) {
  return value === null || value === undefined || value === '' ? 'Not set' : value;
}

export function QuizPlanPanel({
  plan,
  courses,
  coursesLoading,
  coursesError,
  courseSelectionPending,
  courseLocked,
  conversationId,
  conversationStatus,
  generation,
  generating,
  generationAvailable,
  generationConfigured,
  onCourseSelect,
  onRetryCourses,
  onOpenCourses,
  onPatch,
  onGenerate
}: QuizPlanPanelProps) {
  const [draftTitle, setDraftTitle] = useState('');
  const missing = getMissingPlanFields(plan);
  const ready = Boolean(conversationId) && isPlanReady(plan);
  const selectedCourse = courses.find(course => course.id === plan.courseId);
  const distributionTotal = Object.values(plan.questionTypeDistribution)
    .reduce((sum, value) => sum + Number(value || 0), 0);

  useEffect(() => {
    setDraftTitle('');
  }, [conversationId]);

  const patchDistribution = (
    key: keyof QuizPlan['questionTypeDistribution'],
    value: number
  ) => {
    onPatch({
      questionTypeDistribution: {
        ...plan.questionTypeDistribution,
        [key]: Math.max(0, value)
      }
    });
  };

  return (
    <aside className="aiw-plan" aria-labelledby="aiw-plan-heading">
      <header className="aiw-plan__header">
        <div>
          <span className="aiw-eyebrow">Live specification</span>
          <h2 id="aiw-plan-heading">Quiz Plan</h2>
        </div>
        <span className={`aiw-readiness ${ready ? 'is-ready' : ''}`}>
          <i aria-hidden="true" />
          {ready ? 'Ready' : `${missing.length} missing`}
        </span>
      </header>

      <div className="aiw-plan__status">
        <span>Status</span>
        <strong>{statusLabel(generation?.status || conversationStatus)}</strong>
      </div>

      <section className="aiw-plan-course" aria-labelledby="aiw-plan-course-heading">
        <div>
          <h3 id="aiw-plan-course-heading">Course</h3>
          <small>{courseLocked ? 'Locked after draft generation' : 'Required before planning or adding material'}</small>
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
            <span className="aiw-sr-only">Quiz course</span>
            <select
              aria-label="Quiz course"
              value={plan.courseId || ''}
              disabled={courseSelectionPending || generating || courseLocked}
              onChange={event => {
                const courseId = Number(event.target.value);
                if (courseId) onCourseSelect(courseId);
              }}
            >
              <option value="" disabled>
                {courseSelectionPending ? 'Saving course…' : 'Select a course'}
              </option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.code} — {course.title}</option>
              ))}
            </select>
          </label>
        ) : (
          <button className="aiw-button aiw-button--quiet aiw-button--small" type="button" onClick={onOpenCourses}>
            Open Courses
          </button>
        )}
        {courseLocked ? <p>Start a new conversation to use another course.</p> : null}
      </section>

      <dl className="aiw-plan-summary">
        <div>
          <dt>Course</dt>
          <dd>{selectedCourse ? `${selectedCourse.code} · ${selectedCourse.title}` : 'Not set'}</dd>
        </div>
        <div>
          <dt>Topic</dt>
          <dd>{valueOrDash(plan.topic)}</dd>
        </div>
        <div>
          <dt>Difficulty</dt>
          <dd>{valueOrDash(plan.difficulty)}</dd>
        </div>
        <div>
          <dt>Questions</dt>
          <dd>{valueOrDash(plan.questionCount)}</dd>
        </div>
        <div>
          <dt>Language</dt>
          <dd>{valueOrDash(plan.language)}</dd>
        </div>
        <div>
          <dt>Knowledge scope</dt>
          <dd>{plan.materialScope.replaceAll('_', ' ')}</dd>
        </div>
      </dl>

      {plan.learningObjectives.length ? (
        <section className="aiw-plan__objectives" aria-labelledby="aiw-objectives-heading">
          <h3 id="aiw-objectives-heading">Learning objectives</h3>
          <ul>{plan.learningObjectives.map(objective => <li key={objective}>{objective}</li>)}</ul>
        </section>
      ) : null}

      <section className="aiw-plan__types" aria-labelledby="aiw-type-summary-heading">
        <div className="aiw-section-heading">
          <h3 id="aiw-type-summary-heading">Question mix</h3>
          <span>{distributionTotal}/{plan.questionCount || 0}</span>
        </div>
        <div className="aiw-type-bars">
          {TYPE_FIELDS.filter(([key]) => plan.questionTypeDistribution[key] > 0).map(([key, label]) => (
            <div key={key}>
              <span>{label}</span>
              <strong>{plan.questionTypeDistribution[key]}</strong>
            </div>
          ))}
          {!distributionTotal ? <p className="aiw-muted">No question types selected.</p> : null}
        </div>
      </section>

      <label className="aiw-field aiw-draft-title">
        <span>Draft title <small>optional</small></span>
        <input
          value={draftTitle}
          maxLength={120}
          disabled={!conversationId || generating}
          onChange={event => setDraftTitle(event.target.value)}
          placeholder="AI will suggest one if left blank"
        />
      </label>

      {!conversationId || !plan.courseId ? (
        <div className="aiw-plan-note" role="status">
          Choose a course above to start a saved quiz plan.
        </div>
      ) : !generationConfigured ? (
        <div className="aiw-plan-note" role="status">
          Configure Azure OpenAI in Azure settings before generating a draft.
        </div>
      ) : !generationAvailable ? (
        <div className="aiw-plan-note" role="status">
          AI generation is currently disabled. Your Quiz Plan remains saved.
        </div>
      ) : missing.length ? (
        <div className="aiw-plan-note" role="status">
          <strong>Still needed:</strong> {missing.map(fieldLabel).join(', ')}
        </div>
      ) : (
        <div className="aiw-plan-note aiw-plan-note--success" role="status">
          The plan is complete. Generation starts only when you choose Generate Draft.
        </div>
      )}

      <button
        className="aiw-button aiw-button--primary aiw-button--full aiw-generate-button"
        type="button"
        onClick={() => onGenerate(draftTitle.trim() || undefined)}
        disabled={!ready || generating || !generationAvailable}
      >
        {generating ? 'Generating draft…' : conversationStatus === 'generation_failed' ? 'Retry generation' : 'Generate Draft'}
      </button>
      <p className="aiw-safety-copy">Generation always creates a private draft. Nothing is published automatically.</p>

      <details className="aiw-advanced">
        <summary>
          <span>Advanced settings</span>
          <small>Direct controls for the same Quiz Plan</small>
        </summary>
        <fieldset disabled={!conversationId || generating}>
          <legend className="aiw-sr-only">Advanced Quiz Plan settings</legend>
          <label className="aiw-field">
            <span>Topic</span>
            <input
              value={plan.topic}
              maxLength={500}
              onChange={event => onPatch({ topic: event.target.value })}
              placeholder="e.g. Python loops"
            />
          </label>
          <label className="aiw-field">
            <span>Learning objectives <small>one per line</small></span>
            <textarea
              rows={3}
              value={plan.learningObjectives.join('\n')}
              onChange={event => onPatch({
                learningObjectives: event.target.value.split('\n').map(value => value.trim()).filter(Boolean)
              })}
            />
          </label>
          <div className="aiw-field-row">
            <label className="aiw-field">
              <span>Difficulty</span>
              <select
                value={plan.difficulty}
                onChange={event => onPatch({ difficulty: event.target.value as QuizPlan['difficulty'] })}
              >
                <option value="">Select difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label className="aiw-field">
              <span>Question count</span>
              <input
                type="number"
                min={1}
                max={20}
                value={plan.questionCount || ''}
                onChange={event => onPatch({
                  questionCount: event.target.value ? Number(event.target.value) : null
                })}
              />
            </label>
          </div>
          <fieldset className="aiw-distribution">
            <legend>Question type distribution</legend>
            <div className="aiw-distribution__grid">
              {TYPE_FIELDS.map(([key, label]) => (
                <label key={key}>
                  <span>{label}</span>
                  <input
                    aria-label={`${label} count`}
                    type="number"
                    min={0}
                    max={20}
                    value={plan.questionTypeDistribution[key]}
                    onChange={event => patchDistribution(key, Number(event.target.value || 0))}
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <label className="aiw-field">
            <span>Language</span>
            <input value={plan.language} maxLength={60} onChange={event => onPatch({ language: event.target.value })} />
          </label>
          <label className="aiw-field">
            <span>Knowledge scope</span>
            <select
              value={plan.materialScope}
              onChange={event => {
                const materialScope = event.target.value as QuizPlan['materialScope'];
                onPatch({
                  materialScope,
                  useIndexedMaterialOnly: materialScope === 'course_material_only'
                });
              }}
            >
              <option value="general_knowledge_allowed">General model knowledge allowed</option>
              <option value="course_material_preferred">Course material preferred</option>
              <option value="course_material_only">Course material only</option>
            </select>
          </label>
          <label className="aiw-check">
            <input
              type="checkbox"
              checked={plan.includeExplanations}
              onChange={event => onPatch({ includeExplanations: event.target.checked })}
            />
            <span>Include answer explanations</span>
          </label>
          <div className="aiw-field-row">
            <label className="aiw-field">
              <span>Time limit <small>minutes</small></span>
              <input
                type="number"
                min={1}
                max={600}
                value={plan.timeLimitMinutes || ''}
                onChange={event => onPatch({
                  timeLimitMinutes: event.target.value ? Number(event.target.value) : null
                })}
              />
            </label>
            <label className="aiw-field">
              <span>Tags <small>comma separated</small></span>
              <input
                value={plan.tags.join(', ')}
                onChange={event => onPatch({
                  tags: event.target.value.split(',').map(value => value.trim()).filter(Boolean)
                })}
              />
            </label>
          </div>
          <label className="aiw-field">
            <span>Additional instructions</span>
            <textarea
              rows={3}
              maxLength={4000}
              value={plan.specialInstructions}
              onChange={event => onPatch({ specialInstructions: event.target.value })}
            />
          </label>
          <label className="aiw-field">
            <span>Scoring preferences</span>
            <textarea
              rows={2}
              maxLength={1000}
              value={plan.scoringPreferences}
              onChange={event => onPatch({ scoringPreferences: event.target.value })}
              placeholder="e.g. 2 points each, partial credit for essays"
            />
          </label>
        </fieldset>
      </details>
    </aside>
  );
}
