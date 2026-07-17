import { FormEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AiClient } from '../client';
import { Modal } from './Modal';

interface PasteMaterialDialogProps {
  client: AiClient;
  courseId: number;
  conversationId: number | null;
  onClose: () => void;
  onToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

export function PasteMaterialDialog({
  client,
  courseId,
  conversationId,
  onClose,
  onToast
}: PasteMaterialDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('Pasted course notes');
  const [content, setContent] = useState('');
  const mutation = useMutation({
    mutationFn: () => client.pasteMaterial(courseId, { name: name.trim(), content: content.trim() }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ai', 'materials', courseId] }),
        conversationId
          ? queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', conversationId] })
          : Promise.resolve()
      ]);
      onToast('Pasted notes indexed.', 'success');
      onClose();
    },
    onError: error => onToast(error instanceof Error ? error.message : 'Could not index pasted notes.', 'error')
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim() && content.trim()) mutation.mutate();
  };

  return (
    <Modal
      title="Paste course material"
      description="The text is treated as untrusted reference content and indexed only for this course."
      onClose={onClose}
      size="wide"
    >
      <form className="aiw-dialog-form" onSubmit={submit}>
        <label className="aiw-field">
          <span>Material name</span>
          <input value={name} onChange={event => setName(event.target.value)} maxLength={160} required />
        </label>
        <label className="aiw-field">
          <span>Course notes</span>
          <textarea
            value={content}
            onChange={event => setContent(event.target.value)}
            rows={12}
            maxLength={100000}
            required
            placeholder="Paste lecture notes, reading excerpts, or other course-owned content…"
          />
        </label>
        <p className="aiw-field-hint">{content.length.toLocaleString()} / 100,000 characters</p>
        <div className="aiw-dialog-actions">
          <button className="aiw-button aiw-button--quiet" type="button" onClick={onClose}>Cancel</button>
          <button
            className="aiw-button aiw-button--primary"
            type="submit"
            disabled={!name.trim() || !content.trim() || mutation.isPending}
          >
            {mutation.isPending ? 'Indexing notes…' : 'Index pasted text'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
