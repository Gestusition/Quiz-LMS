import { ReactNode, useMemo, useState } from 'react';
import { ConversationSummary } from '../types';
import { statusLabel } from '../utils';

interface ConversationSidebarProps {
  conversations: ConversationSummary[];
  selectedId: number | null;
  isLoading: boolean;
  isError: boolean;
  isCreating: boolean;
  onNew: () => void;
  onSelect: (id: number) => void;
  onRetry: () => void;
  materials: ReactNode;
}

export function ConversationSidebar({
  conversations,
  selectedId,
  isLoading,
  isError,
  isCreating,
  onNew,
  onSelect,
  onRetry,
  materials
}: ConversationSidebarProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    return conversations.filter(conversation => {
      const matchesSearch = !needle || conversation.title.toLocaleLowerCase().includes(needle);
      const matchesStatus = statusFilter === 'all' || conversation.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [conversations, search, statusFilter]);
  const recentDrafts = conversations.filter(conversation => conversation.draftId).slice(0, 4);

  return (
    <aside className="aiw-sidebar" aria-label="AI conversations and materials">
      <div className="aiw-sidebar__top">
        <button className="aiw-button aiw-button--primary aiw-button--full" type="button" onClick={onNew} disabled={isCreating}>
          <span aria-hidden="true">＋</span>
          {isCreating ? 'Starting…' : 'New conversation'}
        </button>
        <label className="aiw-search">
          <span className="aiw-sr-only">Search conversations</span>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search conversations"
          />
        </label>
        <label className="aiw-field aiw-field--compact">
          <span>Status</span>
          <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
            <option value="all">All conversations</option>
            <option value="gathering_requirements">Gathering requirements</option>
            <option value="ready_to_generate">Ready to generate</option>
            <option value="review_required">Review required</option>
            <option value="draft_saved">Draft saved</option>
            <option value="generation_failed">Generation failed</option>
          </select>
        </label>
      </div>

      <section className="aiw-sidebar__section" aria-labelledby="aiw-conversations-heading">
        <div className="aiw-section-heading">
          <h2 id="aiw-conversations-heading">Conversations</h2>
          <span>{filtered.length}</span>
        </div>
        <div className="aiw-conversation-list">
          {isLoading ? <p className="aiw-muted" role="status">Loading conversations…</p> : null}
          {isError ? (
            <div className="aiw-inline-error" role="alert">
              <span>Conversations could not be loaded.</span>
              <button type="button" onClick={onRetry}>Retry</button>
            </div>
          ) : null}
          {!isLoading && !isError && !filtered.length ? (
            <div className="aiw-mini-empty">
              <p>{conversations.length ? 'No conversations match this filter.' : 'No conversations yet.'}</p>
            </div>
          ) : null}
          {filtered.map(conversation => (
            <button
              className={`aiw-conversation ${selectedId === conversation.id ? 'is-active' : ''}`}
              type="button"
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              aria-current={selectedId === conversation.id ? 'page' : undefined}
            >
              <span className="aiw-conversation__title">{conversation.title}</span>
              <span className={`aiw-status aiw-status--${conversation.status}`}>
                {statusLabel(conversation.status)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {recentDrafts.length ? (
        <section className="aiw-sidebar__section" aria-labelledby="aiw-drafts-heading">
          <div className="aiw-section-heading">
            <h2 id="aiw-drafts-heading">Recent drafts</h2>
          </div>
          <div className="aiw-compact-list">
            {recentDrafts.map(conversation => (
              <button type="button" key={conversation.id} onClick={() => onSelect(conversation.id)}>
                <span>{conversation.title}</span>
                <small>{statusLabel(conversation.status)}</small>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {materials}
    </aside>
  );
}
