import { describe, expect, test } from 'vitest';
import { formatTimestamp, normalizeTimestamp } from './utils';

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
