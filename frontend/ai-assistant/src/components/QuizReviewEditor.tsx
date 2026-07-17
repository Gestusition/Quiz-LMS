import { useEffect, useId, useMemo, useState } from 'react';
import { DraftQuestion, QuizDraft, SourceReference } from '../types';

interface QuizReviewEditorProps {
  draft: QuizDraft;
  saving: boolean;
  regenerating: boolean;
  onSave: (draft: QuizDraft, showToast?: boolean) => Promise<boolean>;
  onRegenerate: (indexes: number[], instruction?: string) => Promise<void>;
  onOpenSource: (source: SourceReference) => void;
}

interface QuestionEditorProps {
  question: DraftQuestion;
  index: number;
  total: number;
  selected: boolean;
  disabled: boolean;
  onSelect: (selected: boolean) => void;
  onChange: (question: DraftQuestion) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRegenerate: () => void;
  onOpenSource: (source: SourceReference) => void;
}

const QUESTION_TYPES = [
  ['multiple_choice', 'Multiple choice'],
  ['true_false', 'True / false'],
  ['short_answer', 'Short answer'],
  ['essay', 'Essay'],
  ['coding', 'Coding']
];

function cloneDraft(draft: QuizDraft): QuizDraft {
  return {
    ...draft,
    questions: draft.questions.map(question => ({
      ...question,
      options: [...question.options],
      sourceReferences: question.sourceReferences.map(source => ({ ...source }))
    }))
  };
}

function newQuestion(): DraftQuestion {
  return {
    type: 'multiple_choice',
    text: '',
    options: ['Option A', 'Option B', 'Option C'],
    correctAnswer: 'Option A',
    explanation: '',
    difficulty: 'medium',
    learningObjective: '',
    points: 1,
    sourceReferences: [],
    validationStatus: 'pending_review'
  };
}

function QuestionEditorCard({
  question,
  index,
  total,
  selected,
  disabled,
  onSelect,
  onChange,
  onMove,
  onDelete,
  onDuplicate,
  onRegenerate,
  onOpenSource
}: QuestionEditorProps) {
  const id = useId();
  const isMultipleChoice = question.type === 'multiple_choice';
  const isTrueFalse = question.type === 'true_false';
  const update = <Key extends keyof DraftQuestion>(key: Key, value: DraftQuestion[Key]) => {
    onChange({ ...question, [key]: value });
  };

  const changeType = (type: string) => {
    if (type === 'multiple_choice') {
      const options = question.options.length >= 3 ? question.options : ['Option A', 'Option B', 'Option C'];
      onChange({ ...question, type, options, correctAnswer: options.includes(question.correctAnswer) ? question.correctAnswer : options[0] });
    } else if (type === 'true_false') {
      onChange({ ...question, type, options: ['true', 'false'], correctAnswer: ['true', 'false'].includes(question.correctAnswer) ? question.correctAnswer : 'true' });
    } else {
      onChange({ ...question, type, options: [] });
    }
  };

  return (
    <article className={`aiw-question ${selected ? 'is-selected' : ''}`} aria-labelledby={`${id}-title`}>
      <header className="aiw-question__header">
        <label className="aiw-question__select">
          <input
            type="checkbox"
            checked={selected}
            onChange={event => onSelect(event.target.checked)}
            disabled={disabled}
          />
          <span className="aiw-question__number" aria-hidden="true">{index + 1}</span>
          <span className="aiw-sr-only">Select question {index + 1}</span>
        </label>
        <div>
          <h4 id={`${id}-title`}>Question {index + 1}</h4>
          <span className={`aiw-validation aiw-validation--${question.validationStatus}`}>
            {question.validationStatus.replaceAll('_', ' ')}
          </span>
        </div>
        <div className="aiw-question__order" aria-label={`Reorder question ${index + 1}`}>
          <button
            className="aiw-icon-button aiw-icon-button--small"
            type="button"
            onClick={() => onMove(-1)}
            disabled={disabled || index === 0}
            aria-label={`Move question ${index + 1} up`}
          >
            ↑
          </button>
          <button
            className="aiw-icon-button aiw-icon-button--small"
            type="button"
            onClick={() => onMove(1)}
            disabled={disabled || index === total - 1}
            aria-label={`Move question ${index + 1} down`}
          >
            ↓
          </button>
        </div>
      </header>

      <div className="aiw-question__body">
        <div className="aiw-field-row aiw-field-row--three">
          <label className="aiw-field">
            <span>Question type</span>
            <select value={question.type} onChange={event => changeType(event.target.value)} disabled={disabled}>
              {QUESTION_TYPES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label className="aiw-field">
            <span>Difficulty</span>
            <select value={question.difficulty} onChange={event => update('difficulty', event.target.value)} disabled={disabled}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label className="aiw-field">
            <span>Points</span>
            <input
              type="number"
              min={0.25}
              max={100}
              step={0.25}
              value={question.points}
              onChange={event => update('points', Number(event.target.value || 1))}
              disabled={disabled}
            />
          </label>
        </div>
        <label className="aiw-field">
          <span>Question prompt</span>
          <textarea
            rows={3}
            maxLength={4000}
            value={question.text}
            onChange={event => update('text', event.target.value)}
            disabled={disabled}
          />
        </label>
        {isMultipleChoice ? (
          <label className="aiw-field">
            <span>Answer options <small>one per line</small></span>
            <textarea
              rows={4}
              value={question.options.join('\n')}
              onChange={event => {
                const options = event.target.value.split('\n');
                const correctAnswer = options.includes(question.correctAnswer)
                  ? question.correctAnswer
                  : options.find(Boolean) || '';
                onChange({ ...question, options, correctAnswer });
              }}
              disabled={disabled}
            />
          </label>
        ) : null}
        <label className="aiw-field">
          <span>{question.type === 'essay' ? 'Expected answer or rubric' : 'Correct answer'}</span>
          {isMultipleChoice || isTrueFalse ? (
            <select value={question.correctAnswer} onChange={event => update('correctAnswer', event.target.value)} disabled={disabled}>
              {(isTrueFalse ? ['true', 'false'] : question.options.filter(Boolean)).map((option, optionIndex) => (
                <option key={`${optionIndex}-${option}`} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <textarea
              rows={2}
              maxLength={2000}
              value={question.correctAnswer}
              onChange={event => update('correctAnswer', event.target.value)}
              disabled={disabled}
            />
          )}
        </label>
        <label className="aiw-field">
          <span>Explanation</span>
          <textarea
            rows={3}
            maxLength={4000}
            value={question.explanation}
            onChange={event => update('explanation', event.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="aiw-field">
          <span>Learning objective</span>
          <input
            maxLength={500}
            value={question.learningObjective}
            onChange={event => update('learningObjective', event.target.value)}
            disabled={disabled}
          />
        </label>

        {question.sourceReferences.length ? (
          <div className="aiw-question__sources">
            <span>Sources</span>
            <div>
              {question.sourceReferences.map(source => (
                <button
                  type="button"
                  key={source.id || source.label}
                  onClick={() => onOpenSource(source)}
                  disabled={disabled && !source.excerpt && !(source.materialId && source.chunkId)}
                >
                  {source.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <footer className="aiw-question__actions">
        <button className="aiw-button aiw-button--quiet aiw-button--small" type="button" onClick={onRegenerate} disabled={disabled}>
          Regenerate
        </button>
        <button className="aiw-button aiw-button--quiet aiw-button--small" type="button" onClick={onDuplicate} disabled={disabled}>
          Duplicate
        </button>
        <button className="aiw-button aiw-button--danger aiw-button--small" type="button" onClick={onDelete} disabled={disabled}>
          Delete
        </button>
      </footer>
    </article>
  );
}

export function QuizReviewEditor({
  draft,
  saving,
  regenerating,
  onSave,
  onRegenerate,
  onOpenSource
}: QuizReviewEditorProps) {
  const [editable, setEditable] = useState(() => cloneDraft(draft));
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(draft));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const busy = saving || regenerating;

  useEffect(() => {
    setEditable(cloneDraft(draft));
    setSavedSnapshot(JSON.stringify(draft));
    setSelected(new Set());
  }, [draft]);

  const dirty = useMemo(() => JSON.stringify(editable) !== savedSnapshot, [editable, savedSnapshot]);

  const updateQuestion = (index: number, question: DraftQuestion) => {
    setEditable(current => ({
      ...current,
      questions: current.questions.map((item, itemIndex) => itemIndex === index ? question : item)
    }));
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= editable.questions.length) return;
    setEditable(current => {
      const questions = [...current.questions];
      [questions[index], questions[target]] = [questions[target], questions[index]];
      return { ...current, questions };
    });
    setSelected(new Set());
  };

  const deleteQuestion = (index: number) => {
    if (!window.confirm(`Delete question ${index + 1} from this draft?`)) return;
    setEditable(current => ({
      ...current,
      questions: current.questions.filter((_, itemIndex) => itemIndex !== index)
    }));
    setSelected(new Set());
  };

  const duplicateQuestion = (index: number) => {
    setEditable(current => {
      const source = current.questions[index];
      const copy = {
        ...source,
        id: undefined,
        text: `${source.text} (copy)`,
        options: [...source.options],
        sourceReferences: source.sourceReferences.map(reference => ({ ...reference }))
      };
      const questions = [...current.questions];
      questions.splice(index + 1, 0, copy);
      return { ...current, questions };
    });
    setSelected(new Set());
  };

  const save = async (showToast = true) => {
    const saved = await onSave(editable, showToast);
    if (saved) setSavedSnapshot(JSON.stringify(editable));
    return saved;
  };

  const regenerate = async (indexes: number[]) => {
    if (!indexes.length) return;
    if (dirty && !await save(false)) return;
    await onRegenerate(indexes);
  };

  return (
    <section className="aiw-review" aria-labelledby="aiw-review-heading">
      <header className="aiw-review__header">
        <div>
          <span className="aiw-eyebrow">Review required</span>
          <h3 id="aiw-review-heading">Edit quiz draft</h3>
          <p>Review every question before saving. The quiz remains private.</p>
        </div>
        <span className={`aiw-save-state ${dirty ? 'is-unsaved' : ''}`} role="status">
          {dirty ? 'Unsaved changes' : 'All changes saved'}
        </span>
      </header>

      <div className="aiw-review__meta">
        <label className="aiw-field">
          <span>Quiz title</span>
          <input
            value={editable.title}
            maxLength={160}
            onChange={event => setEditable(current => ({ ...current, title: event.target.value }))}
            disabled={busy}
          />
        </label>
        <label className="aiw-field">
          <span>Description</span>
          <textarea
            rows={3}
            value={editable.description}
            maxLength={2000}
            onChange={event => setEditable(current => ({ ...current, description: event.target.value }))}
            disabled={busy}
          />
        </label>
      </div>

      <div className="aiw-review__toolbar">
        <label>
          <input
            type="checkbox"
            checked={editable.questions.length > 0 && selected.size === editable.questions.length}
            onChange={event => setSelected(event.target.checked
              ? new Set(editable.questions.map((_, index) => index))
              : new Set())}
            disabled={busy || !editable.questions.length}
          />
          Select all
        </label>
        <span>{editable.questions.length} questions · {editable.questions.reduce((sum, question) => sum + Number(question.points || 0), 0)} points</span>
        <button
          className="aiw-button aiw-button--quiet aiw-button--small"
          type="button"
          disabled={!selected.size || busy}
          onClick={() => regenerate([...selected].sort((a, b) => a - b))}
        >
          {regenerating ? 'Regenerating…' : `Regenerate selected (${selected.size})`}
        </button>
      </div>

      <div className="aiw-question-list">
        {editable.questions.map((question, index) => (
          <QuestionEditorCard
            key={question.id || `${index}-${question.text.slice(0, 24)}`}
            question={question}
            index={index}
            total={editable.questions.length}
            selected={selected.has(index)}
            disabled={busy}
            onSelect={checked => setSelected(current => {
              const next = new Set(current);
              checked ? next.add(index) : next.delete(index);
              return next;
            })}
            onChange={next => updateQuestion(index, next)}
            onMove={direction => moveQuestion(index, direction)}
            onDelete={() => deleteQuestion(index)}
            onDuplicate={() => duplicateQuestion(index)}
            onRegenerate={() => regenerate([index])}
            onOpenSource={onOpenSource}
          />
        ))}
        {!editable.questions.length ? (
          <div className="aiw-mini-empty">
            <strong>This draft has no questions.</strong>
            <p>Add a manual question or ask the assistant to revise the quiz.</p>
          </div>
        ) : null}
      </div>

      <footer className="aiw-review__footer">
        <button
          className="aiw-button aiw-button--quiet"
          type="button"
          disabled={busy || editable.questions.length >= 20}
          onClick={() => setEditable(current => ({ ...current, questions: [...current.questions, newQuestion()] }))}
        >
          ＋ Add manual question
        </button>
        <button
          className="aiw-button aiw-button--primary"
          type="button"
          onClick={() => save(true)}
          disabled={!dirty || busy || !editable.title.trim() || !editable.questions.length}
        >
          {saving ? 'Saving…' : 'Save as draft'}
        </button>
      </footer>
    </section>
  );
}
