const path = require('path');
const fs = require('fs');
const {
  initDatabase,
  seedDatabase,
  closeDatabase,
  resolveDatabaseFiles
} = require('../database/db');
const importService = require('../services/importService');

const TEST_DB = path.join(__dirname, 'test_import_service.db');

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('ImportService', () => {
  test('creates import batches and manages row-level errors', () => {
    const batch = importService.createBatch({
      type: 'students',
      fileName: 'students.csv',
      status: 'partially_failed',
      totalRows: 3,
      successCount: 2,
      failedCount: 1
    }, 1);

    expect(batch.type).toBe('students');
    expect(batch.fileName).toBe('students.csv');
    expect(batch.status).toBe('partially_failed');
    expect(batch.totalRows).toBe(3);

    const listed = importService.listBatches({ type: 'students', limit: 5 });
    expect(listed.items.some(item => item.id === batch.id)).toBe(true);
    expect(listed.pagination.total).toBeGreaterThanOrEqual(1);

    const rowError = importService.addError(batch.id, {
      rowNumber: 2,
      rawData: { studentNumber: 'DUP-1' },
      errorField: 'studentNumber',
      errorMessage: 'Duplicate student number'
    });

    expect(rowError.batchId).toBe(batch.id);
    expect(rowError.rowNumber).toBe(2);
    expect(rowError.status).toBe('unresolved');
    expect(importService.countOpenErrors()).toBeGreaterThanOrEqual(1);

    const errors = importService.listErrors(batch.id, { status: 'unresolved' });
    expect(errors.items.map(item => item.id)).toContain(rowError.id);

    const resolved = importService.resolveError(rowError.id, {
      status: 'fixed',
      fixedData: { studentNumber: 'STU-9999' }
    }, 1);

    expect(resolved.status).toBe('fixed');
    expect(resolved.resolvedBy).toBe(1);
    expect(resolved.fixedDataJson).toContain('STU-9999');
    expect(resolved.resolvedAt).toBeTruthy();
  });

  test('validates import batch and error payloads', () => {
    expect(() => importService.createBatch({
      type: 'unknown',
      fileName: 'bad.csv'
    }, 1)).toThrow(/type must be one of/i);

    expect(() => importService.createBatch({
      type: 'users',
      fileName: ''
    }, 1)).toThrow(/file_name/i);

    const batch = importService.createBatch({
      type: 'questions',
      fileName: 'questions.csv'
    }, 1);

    expect(() => importService.listErrors(999999)).toThrow(/batch not found/i);
    expect(() => importService.addError(batch.id, {
      rowNumber: 0,
      errorMessage: 'Bad row'
    })).toThrow(/positive integer/i);
    expect(() => importService.addError(999999, {
      rowNumber: 1,
      errorMessage: 'Bad row'
    })).toThrow(/batch not found/i);

    const rowError = importService.addError(batch.id, {
      rowNumber: 1,
      errorMessage: 'Missing answer'
    });

    expect(() => importService.resolveError(999999, { status: 'fixed' }, 1)).toThrow(/error not found/i);
    expect(() => importService.resolveError(rowError.id, { status: 'bad' }, 1)).toThrow(/status must be one of/i);

    const unresolved = importService.resolveError(rowError.id, { status: 'unresolved' }, 1);
    expect(unresolved.status).toBe('unresolved');
    expect(unresolved.resolvedAt).toBe('');
  });
});
