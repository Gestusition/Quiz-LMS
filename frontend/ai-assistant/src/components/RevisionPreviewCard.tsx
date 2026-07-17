import { RevisionPreview } from '../types';

interface RevisionPreviewCardProps {
  revision: RevisionPreview;
  applying: boolean;
  onApply: () => void;
  onDismiss: () => void;
}

export function RevisionPreviewCard({
  revision,
  applying,
  onApply,
  onDismiss
}: RevisionPreviewCardProps) {
  const beforeCount = revision.beforeSnapshot.questionCount;
  const proposedCount = revision.proposedSnapshot.questionCount;
  const proposedTitle = revision.proposedSnapshot.title || revision.beforeSnapshot.title || 'Untitled quiz';
  const hasQuestionCounts = beforeCount !== null || proposedCount !== null;

  return (
    <section className="aiw-revision-preview" aria-labelledby="aiw-revision-title">
      <div>
        <span className="aiw-eyebrow">Revision preview</span>
        <h3 id="aiw-revision-title">{revision.summary}</h3>
        <p>No quiz content has been replaced yet.</p>
      </div>
      <dl className="aiw-revision-facts">
        <div>
          <dt>Proposed title</dt>
          <dd>{proposedTitle}</dd>
        </div>
        {hasQuestionCounts ? (
          <div>
            <dt>Questions</dt>
            <dd
              aria-label={`Question count changes from ${beforeCount ?? 'unknown'} to ${proposedCount ?? 'unknown'}`}
            >
              {beforeCount ?? '—'} <span aria-hidden="true">→</span> {proposedCount ?? '—'}
            </dd>
          </div>
        ) : null}
        {revision.changedQuestionCount ? (
          <div>
            <dt>Changed</dt>
            <dd>{revision.changedQuestionCount}</dd>
          </div>
        ) : null}
        {revision.removedQuestionCount ? (
          <div>
            <dt>Removed</dt>
            <dd>{revision.removedQuestionCount}</dd>
          </div>
        ) : null}
        {revision.addedQuestionCount ? (
          <div>
            <dt>Added</dt>
            <dd>{revision.addedQuestionCount}</dd>
          </div>
        ) : null}
      </dl>
      {revision.changes.length ? (
        <ul>
          {revision.changes.map((change, index) => <li key={`${index}-${change}`}>{change}</li>)}
        </ul>
      ) : null}
      {revision.destructive ? (
        <p className="aiw-warning-note">
          This revision replaces or removes existing questions. Review it carefully before applying.
        </p>
      ) : null}
      <div className="aiw-inline-actions">
        <button className="aiw-button aiw-button--quiet" type="button" onClick={onDismiss} disabled={applying}>
          Keep current draft
        </button>
        <button className="aiw-button aiw-button--primary" type="button" onClick={onApply} disabled={applying}>
          {applying ? 'Applying…' : 'Apply revision'}
        </button>
      </div>
    </section>
  );
}
