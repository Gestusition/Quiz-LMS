import { useQuery } from '@tanstack/react-query';
import { AiClient } from '../client';
import { SourceReference } from '../types';
import { Modal } from './Modal';

interface SourceReferenceViewerProps {
  client: AiClient;
  courseId: number;
  source: SourceReference;
  onClose: () => void;
}

export function SourceReferenceViewer({ client, courseId, source, onClose }: SourceReferenceViewerProps) {
  const canLoad = Boolean(source.materialId && source.chunkId);
  const sourceQuery = useQuery({
    queryKey: ['ai', 'source', courseId, source.materialId, source.chunkId],
    queryFn: () => client.getMaterialChunk(courseId, source.materialId as number, source.chunkId as number),
    enabled: canLoad
  });

  return (
    <Modal
      title={source.label || 'Course material source'}
      description="Use this excerpt to verify the generated question against the selected course material."
      onClose={onClose}
      size="wide"
    >
      {sourceQuery.isLoading ? <p role="status">Loading source excerpt…</p> : null}
      {sourceQuery.isError ? (
        <div className="aiw-error-state" role="alert">
          <div><strong>Source unavailable</strong><p>The excerpt could not be loaded.</p></div>
          <button className="aiw-button aiw-button--quiet" type="button" onClick={() => sourceQuery.refetch()}>Retry</button>
        </div>
      ) : null}
      <article className="aiw-source-excerpt">
        <h3>{sourceQuery.data?.label || source.label}</h3>
        <pre>{sourceQuery.data?.content || source.excerpt || 'No excerpt is available for this source reference.'}</pre>
      </article>
      <div className="aiw-dialog-actions">
        <button className="aiw-button aiw-button--primary" type="button" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}
