import { describe, expect, test } from 'vitest';
import {
  parseConversationDetail,
  parseMaterialChunk,
  parseMutationResult
} from './schemas';

const beforeSnapshot = {
  title: 'Original loops quiz',
  questions: [
    { id: 1, text: 'Question one' },
    { id: 2, text: 'Question two' },
    { id: 3, text: 'Question three' }
  ]
};

const proposedSnapshot = {
  title: 'Focused loops quiz',
  questions: [
    { id: 1, text: 'Question one' },
    { id: 2, text: 'A revised question two' }
  ]
};

test('accepts the source chunk excerpt alias when content is absent', () => {
  expect(parseMaterialChunk({
    source: {
      sourceLabel: 'Week 4 notes',
      excerpt: 'A loop repeats a block of code.',
      chunkIndex: 3
    }
  })).toEqual({
    label: 'Week 4 notes',
    content: 'A loop repeats a block of code.'
  });
});

test('normalizes live suggestion labels and values separately from persisted messages', () => {
  const detail = parseConversationDetail({
    id: 41,
    title: 'Algorithms quiz',
    status: 'gathering_requirements',
    suggestedReplies: [
      {
        label: 'Focus on Dijkstra invariants',
        value: 'Emphasize Dijkstra relaxation invariants in short-answer questions.'
      },
      'Use the selected graph notes'
    ],
    messages: [{
      id: 1,
      senderType: 'assistant',
      content: 'Old reply',
      metadata: { quickReplies: ['Old persisted chip'] }
    }]
  });

  expect(detail.suggestedReplies).toEqual([
    {
      label: 'Focus on Dijkstra invariants',
      value: 'Emphasize Dijkstra relaxation invariants in short-answer questions.'
    },
    {
      label: 'Use the selected graph notes',
      value: 'Use the selected graph notes'
    }
  ]);
});

test('summarizes the outer preview snapshot returned by a revision mutation', () => {
  const result = parseMutationResult({
    revision: {
      id: 31,
      revisionNumber: 4,
      revisionType: 'chat_revision',
      requestText: 'Make the quiz shorter.',
      status: 'preview',
      metadata: { requiresConfirmation: true },
      beforeSnapshot
    },
    preview: proposedSnapshot
  });

  expect(result.revision).toMatchObject({
    id: 31,
    summary: 'Requested change: Make the quiz shorter.',
    beforeSnapshot: {
      title: 'Original loops quiz',
      questionCount: 3
    },
    proposedSnapshot: {
      title: 'Focused loops quiz',
      questionCount: 2
    },
    changedQuestionCount: 1,
    removedQuestionCount: 1,
    addedQuestionCount: 0,
    destructive: true
  });
});

describe('persisted revision recovery', () => {
  test('selects the latest unapplied confirmation preview after reload', () => {
    const detail = parseConversationDetail({
      id: 41,
      title: 'Loops quiz',
      status: 'review_required',
      courseId: 7,
      revisions: [
        {
          id: 34,
          revisionNumber: 8,
          revisionType: 'whole_quiz_revision',
          status: 'preview',
          metadata: { draftOnly: true },
          beforeSnapshot: {},
          proposedSnapshot
        },
        {
          id: 33,
          revisionNumber: 7,
          revisionType: 'chat_revision',
          status: 'applied',
          appliedAt: '2026-07-17T11:00:00Z',
          metadata: { requiresConfirmation: true },
          beforeSnapshot,
          proposedSnapshot
        },
        {
          id: 32,
          revisionNumber: 6,
          revisionType: 'chat_revision',
          requestText: 'Make the quiz shorter.',
          status: 'preview',
          metadata: { previewOnly: true, requiresConfirmation: true },
          beforeSnapshot,
          proposedSnapshot
        },
        {
          id: 30,
          revisionNumber: 5,
          revisionType: 'chat_revision',
          status: 'pending_confirmation',
          metadata: { requiresConfirmation: true },
          beforeSnapshot,
          proposedSnapshot: {
            title: 'Older proposal',
            questions: beforeSnapshot.questions
          }
        }
      ]
    });

    expect(detail.pendingRevision).toMatchObject({
      id: 32,
      revisionNumber: 6,
      proposedSnapshot: {
        title: 'Focused loops quiz',
        questionCount: 2
      }
    });
  });
});
