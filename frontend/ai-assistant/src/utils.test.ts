import { describe, expect, test } from 'vitest';
import { formatTimestamp, isExplicitGenerationRequest, normalizeTimestamp } from './utils';

describe('chat timestamp formatting', () => {
  test('treats timezone-less SQLite timestamps as UTC before using the browser timezone', () => {
    const databaseTimestamp = '2026-07-27 18:22:00';
    const normalized = normalizeTimestamp(databaseTimestamp);

    expect(normalized).toBe('2026-07-27T18:22:00Z');
    expect(new Date(normalized).toISOString()).toBe('2026-07-27T18:22:00.000Z');
    expect(formatTimestamp(databaseTimestamp)).toBe(new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date('2026-07-27T18:22:00Z')));
  });

  test('preserves timestamps that already include an explicit timezone', () => {
    expect(normalizeTimestamp('2026-07-27T21:22:00+03:00'))
      .toBe('2026-07-27T21:22:00+03:00');
  });
});

describe('generation chat commands', () => {
  test.each([
    'generate',
    'Generate the quiz now!',
    'please create the draft',
    'go ahead and generate it',
    'oluştur',
    'Sınavı hazırla şimdi'
  ])('recognizes the explicit command %s', command => {
    expect(isExplicitGenerationRequest(command)).toBe(true);
  });

  test.each([
    'do not generate',
    'generate 8 questions about loops',
    'can you generate it?',
    'change the topic before generating'
  ])('does not treat the planning message %s as an immediate generation command', message => {
    expect(isExplicitGenerationRequest(message)).toBe(false);
  });
});
