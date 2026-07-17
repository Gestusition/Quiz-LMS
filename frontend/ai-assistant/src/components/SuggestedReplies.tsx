interface SuggestedRepliesProps {
  replies: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function SuggestedReplies({ replies, onSelect, disabled = false }: SuggestedRepliesProps) {
  if (!replies.length) return null;
  return (
    <div className="aiw-suggestions" aria-label="Suggested replies">
      {replies.map(reply => (
        <button
          key={`${reply.label}-${reply.value}`}
          type="button"
          onClick={() => onSelect(reply.value)}
          disabled={disabled}
        >
          {reply.label}
        </button>
      ))}
    </div>
  );
}
