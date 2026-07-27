import { FormEvent, KeyboardEvent, useRef, useState } from 'react';

interface ChatComposerProps {
  disabled: boolean;
  startRequired: boolean;
  isSending: boolean;
  hasDraft: boolean;
  onSend: (content: string) => void;
  onAttach: () => void;
  onPasteMaterial: () => void;
}

export function ChatComposer({
  disabled,
  startRequired,
  isSending,
  hasDraft,
  onSend,
  onAttach,
  onPasteMaterial
}: ChatComposerProps) {
  const [content, setContent] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerDisabled = disabled || startRequired;

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const next = content.trim();
    if (composerDisabled || isSending) return;
    if (!next) {
      if (hasDraft) {
        setValidationMessage('Describe what you want to change first.');
        textareaRef.current?.focus();
      }
      return;
    }
    onSend(next);
    setContent('');
    setValidationMessage('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form className="aiw-composer" onSubmit={submit} aria-label="Message the AI quiz assistant">
      <label htmlFor="aiw-chat-message" className="aiw-sr-only">
        {hasDraft ? 'Describe a revision to the quiz draft' : 'Describe the quiz you want to create'}
      </label>
      <textarea
        ref={textareaRef}
        id="aiw-chat-message"
        value={content}
        onChange={event => {
          setContent(event.target.value);
          if (validationMessage) setValidationMessage('');
        }}
        onKeyDown={onKeyDown}
        rows={3}
        maxLength={8000}
        disabled={composerDisabled || isSending}
        placeholder={
          hasDraft
            ? 'Ask for a controlled revision, for example “Make question 3 harder”…'
            : 'Describe the course, topic, outcomes, difficulty, question types, and special instructions…'
        }
        aria-describedby={validationMessage ? 'aiw-composer-validation' : undefined}
      />
      {validationMessage ? (
        <p id="aiw-composer-validation" className="aiw-composer__validation" role="status">
          {validationMessage}
        </p>
      ) : null}
      <div className="aiw-composer__footer">
        <div className="aiw-composer__tools">
          <button type="button" onClick={onAttach} disabled={disabled} aria-label="Upload course material">
            <span aria-hidden="true">＋</span> Attach
          </button>
          <button type="button" onClick={onPasteMaterial} disabled={disabled} aria-label="Paste course material">
            Paste notes
          </button>
        </div>
        <div className="aiw-composer__send">
          <span>{content.length}/8000</span>
          <button
            className="aiw-button aiw-button--primary"
            type="submit"
            disabled={(!hasDraft && !content.trim()) || composerDisabled || isSending}
          >
            {isSending ? 'Sending…' : hasDraft ? 'Request revision' : 'Send'}
          </button>
        </div>
      </div>
    </form>
  );
}
