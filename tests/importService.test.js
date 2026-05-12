const path = require('path');
const fs = require('fs');
const {
  initDatabase,
  seedDatabase,
  closeDatabase,
  resolveDatabaseFiles
} = require('../database/db');
const authService = require('../services/authService');
const courseService = require('../services/courseService');
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
  const adminActor = { id: 1, role: 'admin' };

  function unique(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`.replace(/[^a-zA-Z0-9@._-]/g, '');
  }

  function csvImport(type, fileName, csv) {
    return importService.runCsvImport({
      type,
      fileName,
      buffer: Buffer.from(csv)
    }, adminActor);
  }

  function createStudent(prefix = 'import-student') {
    const id = unique(prefix).slice(0, 28);
    return authService.createUser({
      name: `Import Student ${id}`,
      username: `u-${id}`.slice(0, 32).toLowerCase(),
      email: `${id}@example.com`.toLowerCase(),
      role: 'student',
      password: 'Import123!',
      studentNumber: `s-${id}`.slice(0, 30)
    });
  }

  function createCourse(prefix = 'IMPC') {
    const code = unique(prefix).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 18).toUpperCase();
    return courseService.create({
      code,
      title: `Import Course ${code}`,
      visibility: 'published'
    }, adminActor);
  }

  test('creates import batches and manages row-level errors', () => {
    const batch = importService.createBatch({
      type: 'users',
      fileName: 'users.csv',
      status: 'completed_with_errors',
      totalRows: 3,
      successRows: 2,
      failedRows: 1
    }, 1);

    expect(batch.type).toBe('users');
    expect(batch.fileName).toBe('users.csv');
    expect(batch.status).toBe('completed_with_errors');
    expect(batch.totalRows).toBe(3);
    expect(batch.successRows).toBe(2);

    const listed = importService.listBatches({ type: 'users', limit: 5 });
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
      type: 'courses',
      fileName: 'courses.csv'
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

  test('successful user import creates users without exposing plaintext passwords', () => {
    const stamp = unique('users');
    const batch = csvImport('users', 'users.csv', [
      'email,password,firstName,lastName,role',
      `student-${stamp}@example.com,Password123,Student,One,student`,
      `teacher-${stamp}@example.com,Password123,Teacher,One,teacher`
    ].join('\n'));

    expect(batch.status).toBe('completed');
    expect(batch.totalRows).toBe(2);
    expect(batch.successRows).toBe(2);
    expect(batch.failedRows).toBe(0);
    expect(JSON.stringify(batch)).not.toContain('Password123');
  });

  test('duplicate user email handling records a row error and skips the duplicate', () => {
    const stamp = unique('dup-user');
    const email = `duplicate-${stamp}@example.com`;
    const batch = csvImport('users', 'users.csv', [
      'email,password,firstName,lastName,role',
      `${email},Password123,Student,One,student`,
      `${email},Password123,Student,Duplicate,student`
    ].join('\n'));

    expect(batch.status).toBe('completed_with_errors');
    expect(batch.successRows).toBe(1);
    expect(batch.failedRows).toBe(1);

    const errors = importService.listErrors(batch.id, { limit: 10 });
    expect(errors.items).toHaveLength(1);
    expect(errors.items[0].errorField).toBe('email');
    expect(errors.items[0].errorMessage).toMatch(/already exists/i);
    expect(errors.items[0].rawDataJson).toContain('[redacted]');
    expect(errors.items[0].rawDataJson).not.toContain('Password123');
  });

  test('invalid role handling records a row error', () => {
    const stamp = unique('bad-role');
    const batch = csvImport('users', 'users.csv', [
      'email,password,firstName,lastName,role',
      `role-${stamp}@example.com,Password123,Role,Fail,manager`
    ].join('\n'));

    expect(batch.status).toBe('completed_with_errors');
    expect(batch.successRows).toBe(0);
    expect(batch.failedRows).toBe(1);
    const errors = importService.listErrors(batch.id);
    expect(errors.items[0].errorField).toBe('role');
  });

  test('successful course import creates courses', () => {
    const code = unique('COURSE').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 18).toUpperCase();
    const batch = csvImport('courses', 'courses.csv', [
      'code,title,description,visibility',
      `${code},Introduction to Imports,Basic import course,published`
    ].join('\n'));

    expect(batch.status).toBe('completed');
    expect(batch.successRows).toBe(1);
    expect(batch.failedRows).toBe(0);
  });

  test('duplicate course handling records a row error', () => {
    const code = unique('DUPCRS').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 18).toUpperCase();
    const batch = csvImport('courses', 'courses.csv', [
      'code,title,description,visibility',
      `${code},Original Course,,published`,
      `${code},Duplicate Course,,published`
    ].join('\n'));

    expect(batch.status).toBe('completed_with_errors');
    expect(batch.successRows).toBe(1);
    expect(batch.failedRows).toBe(1);
    expect(importService.listErrors(batch.id).items[0].errorField).toBe('code');
  });

  test('enrollment import with missing user records a row error', () => {
    const course = createCourse('MISSU');
    const batch = csvImport('enrollments', 'enrollments.csv', [
      'userEmail,courseCode',
      `missing-${Date.now()}@example.com,${course.code}`
    ].join('\n'));

    expect(batch.status).toBe('completed_with_errors');
    expect(batch.failedRows).toBe(1);
    expect(importService.listErrors(batch.id).items[0].errorField).toBe('userEmail');
  });

  test('enrollment import with missing course records a row error', () => {
    const student = createStudent('missing-course');
    const batch = csvImport('enrollments', 'enrollments.csv', [
      'userEmail,courseCode',
      `${student.email},NOCOURSE${Date.now()}`
    ].join('\n'));

    expect(batch.status).toBe('completed_with_errors');
    expect(batch.failedRows).toBe(1);
    expect(importService.listErrors(batch.id).items[0].errorField).toBe('courseCode');
  });

  test('duplicate enrollment handling records a row error', () => {
    const student = createStudent('dup-enroll');
    const course = createCourse('DUPEN');
    const batch = csvImport('enrollments', 'enrollments.csv', [
      'userEmail,courseCode',
      `${student.email},${course.code}`,
      `${student.email},${course.code}`
    ].join('\n'));

    expect(batch.status).toBe('completed_with_errors');
    expect(batch.successRows).toBe(1);
    expect(batch.failedRows).toBe(1);
    expect(importService.listErrors(batch.id).items[0].errorMessage).toMatch(/already enrolled/i);
  });

  test('row error recording and completed status values are persisted', () => {
    const completed = importService.createBatch({
      type: 'courses',
      fileName: 'ok.csv',
      status: 'completed',
      totalRows: 1,
      successRows: 1,
      failedRows: 0
    }, 1);
    const errored = importService.createBatch({
      type: 'courses',
      fileName: 'bad.csv',
      status: 'completed_with_errors',
      totalRows: 1,
      successRows: 0,
      failedRows: 1
    }, 1);

    const rowError = importService.addError(errored.id, {
      rowNumber: 2,
      rawData: { code: '' },
      errorField: 'code',
      errorMessage: 'code is required.'
    });

    expect(importService.listBatches({ status: 'completed' }).items.map(item => item.id)).toContain(completed.id);
    expect(importService.listBatches({ status: 'completed_with_errors' }).items.map(item => item.id)).toContain(errored.id);
    expect(importService.listErrors(errored.id).items.map(item => item.id)).toContain(rowError.id);
  });
});
