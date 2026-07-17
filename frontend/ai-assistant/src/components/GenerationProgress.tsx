import { GenerationState } from '../types';
import { stageLabel } from '../utils';

interface GenerationProgressProps {
  generation: GenerationState;
  cancelling: boolean;
  onCancel: () => void;
}

const STAGES = [
  'validating_quiz_plan',
  'retrieving_course_material',
  'selecting_source_passages',
  'generating_questions',
  'validating_generated_output',
  'saving_draft',
  'opening_review_workspace'
];

export function GenerationProgress({ generation, cancelling, onCancel }: GenerationProgressProps) {
  const currentIndex = STAGES.indexOf(generation.stage);
  return (
    <section className="aiw-generation" aria-labelledby="aiw-generation-title" aria-live="polite">
      <div className="aiw-generation__head">
        <div>
          <span className="aiw-eyebrow">Generation in progress</span>
          <h3 id="aiw-generation-title">{stageLabel(generation.stage)}</h3>
          {generation.message ? <p>{generation.message}</p> : null}
        </div>
        {generation.canCancel ? (
          <button
            className="aiw-button aiw-button--danger aiw-button--small"
            type="button"
            onClick={onCancel}
            disabled={cancelling}
          >
            {cancelling ? 'Stopping…' : 'Stop generation'}
          </button>
        ) : null}
      </div>
      <ol className="aiw-generation__stages" aria-label="Generation stages">
        {STAGES.map((stage, index) => (
          <li
            key={stage}
            className={[
              stage === generation.stage ? 'is-current' : '',
              currentIndex >= 0 && index < currentIndex ? 'is-complete' : ''
            ].filter(Boolean).join(' ')}
            aria-current={stage === generation.stage ? 'step' : undefined}
          >
            <span aria-hidden="true">{currentIndex >= 0 && index < currentIndex ? '✓' : index + 1}</span>
            {stageLabel(stage)}
          </li>
        ))}
      </ol>
    </section>
  );
}
