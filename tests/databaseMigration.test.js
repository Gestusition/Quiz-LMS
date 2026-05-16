const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const TEST_DB = path.join(__dirname, 'test_database_migration.db');

function freshDbModule() {
  jest.resetModules();
  return require('../database/db');
}

function removeDbFiles(dbModule) {
  const files = Object.values(dbModule.resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

function createLegacyDatabase(filePath, withCourse = true) {
  const legacy = new DatabaseSync(filePath);
  if (withCourse) {
    legacy.exec(`
      CREATE TABLE courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        visibility TEXT DEFAULT 'published',
        createdAt TEXT DEFAULT 'legacy'
      );
      INSERT INTO courses (code, title, description, visibility)
      VALUES ('LEG101', 'Legacy Course', 'Copied from the legacy database.', 'published');
    `);
  } else {
    legacy.exec('CREATE TABLE unrelated (id INTEGER PRIMARY KEY, name TEXT);');
  }
  legacy.close();
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function createOldSplitSchemaFiles(files) {
  ensureParentDir(files.learning);
  const learning = new DatabaseSync(files.learning);
  learning.exec(`
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER,
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      createdAt TEXT DEFAULT 'legacy'
    );
    INSERT INTO categories (courseId, name, description)
    VALUES (NULL, 'Legacy Category', 'Old unique category schema');

    CREATE TABLE attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId INTEGER NOT NULL,
      studentId INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late', 'excused')),
      note TEXT DEFAULT '',
      markedBy INTEGER,
      removedBy INTEGER,
      removedAt TEXT DEFAULT '',
      removalNote TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(sessionId, studentId)
    );
  `);
  learning.close();

  ensureParentDir(files.assessment);
  const assessment = new DatabaseSync(files.assessment);
  assessment.exec(`
    CREATE TABLE questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER NOT NULL,
      text TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('MC', 'TF', 'FB', 'MT', 'MP', 'SA', 'ES', 'OR')),
      options TEXT DEFAULT '[]',
      correctAnswer TEXT NOT NULL DEFAULT '',
      difficulty TEXT NOT NULL DEFAULT 'MEDIUM' CHECK(difficulty IN ('EASY', 'MEDIUM', 'HARD')),
      points REAL NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'valid',
      validationMessage TEXT DEFAULT '',
      acceptedAnswers TEXT DEFAULT '[]',
      caseSensitive INTEGER NOT NULL DEFAULT 0,
      richText TEXT DEFAULT '',
      explanationText TEXT DEFAULT '',
      hintText TEXT DEFAULT '',
      mediaUrl TEXT DEFAULT '',
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now'))
    );
    INSERT INTO questions (categoryId, text, type, options, correctAnswer)
    VALUES (1, 'Legacy question?', 'MC', '["A","B"]', '0');
  `);
  assessment.close();
}

function createLegacyIdentityDatabase(files) {
  ensureParentDir(files.legacyIdentity);
  const identity = new DatabaseSync(files.legacyIdentity);
  identity.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      passwordSalt TEXT NOT NULL,
      passwordAlgorithm TEXT NOT NULL DEFAULT 'legacy',
      status TEXT NOT NULL DEFAULT 'active',
      createdAt TEXT DEFAULT 'legacy'
    );
    INSERT INTO users (id, name, username, email, role, passwordHash, passwordSalt, passwordAlgorithm)
    VALUES
      (11, 'Legacy Admin', NULL, 'admin@example.com', 'admin', 'hash', 'salt', 'legacy'),
      (10, 'Legacy Existing Number', NULL, 'existing-number@example.com', 'student', 'hash', 'salt', 'legacy'),
      (12, 'Legacy Student Invalid', NULL, 'tiny@example.com', 'student', 'hash', 'salt', 'legacy'),
      (13, 'Legacy Student Missing', NULL, 'missing@example.com', 'student', 'hash', 'salt', 'legacy'),
      (14, 'Legacy Taken User', 'taken', 'taken-user@example.com', 'student', 'hash', 'salt', 'legacy'),
      (15, 'Legacy Needs Suffix', NULL, 'taken@example.com', 'student', 'hash', 'salt', 'legacy');
  `);
  identity.close();

  ensureParentDir(files.student);
  const student = new DatabaseSync(files.student);
  student.exec(`
    CREATE TABLE student_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL UNIQUE,
      displayName TEXT DEFAULT '',
      studentNumber TEXT DEFAULT ''
    );
    INSERT INTO student_profiles (userId, displayName, studentNumber)
    VALUES
      (10, 'Legacy Existing Number', 'STU-0012'),
      (12, 'Legacy Student Invalid', 'x');
  `);
  student.close();
}

function createOldSessionDatabase(files) {
  ensureParentDir(files.users);
  const users = new DatabaseSync(files.users);
  users.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      username TEXT,
      passwordHash TEXT NOT NULL,
      passwordSalt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active'
    );
    CREATE TABLE sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      tokenHash TEXT NOT NULL UNIQUE,
      expiresAt TEXT NOT NULL,
      createdAt TEXT DEFAULT 'legacy',
      lastSeenAt TEXT DEFAULT 'legacy'
    );
    INSERT INTO users (id, name, email, role, username, passwordHash, passwordSalt, status)
    VALUES (1, 'Legacy Session User', 'legacy-session@example.com', 'student', 'legacy-session', 'hash', 'salt', 'active');
    INSERT INTO sessions (userId, tokenHash, expiresAt)
    VALUES (1, 'legacy-token', '2099-01-01T00:00:00.000Z');
  `);
  users.close();
}

afterEach(() => {
  const dbModule = freshDbModule();
  try {
    dbModule.closeDatabase();
  } catch (err) {
    // The isolated module may not have an open database.
  }
  removeDbFiles(dbModule);
});

describe('database helper and migration coverage', () => {
  test('resolves default database files and rejects getDatabase before init', () => {
    jest.isolateModules(() => {
      const dbModule = require('../database/db');
      const files = dbModule.resolveDatabaseFiles();

      expect(files.users).toContain(path.join('data', 'quiz.users.sqlite'));
      expect(files.legacy).toContain('quiz.db');
      expect(() => dbModule.getDatabase()).toThrow(/not initialized/i);
    });
  });

  test('migrates a legacy single database table into split context files', () => {
    let dbModule = freshDbModule();
    removeDbFiles(dbModule);
    createLegacyDatabase(TEST_DB, true);

    dbModule.initDatabase(TEST_DB);
    const copied = dbModule.getDatabase().prepare('SELECT code, title FROM courses WHERE code = ?').get('LEG101');

    expect(copied).toEqual({ code: 'LEG101', title: 'Legacy Course' });
    expect(fs.existsSync(dbModule.getDatabaseFiles().learning)).toBe(true);

    dbModule.closeDatabase();
  });

  test('ignores legacy files that do not contain migratable tables', () => {
    let dbModule = freshDbModule();
    removeDbFiles(dbModule);
    createLegacyDatabase(TEST_DB, false);

    dbModule.initDatabase(TEST_DB);
    const copied = dbModule.getDatabase().prepare('SELECT code FROM courses WHERE code = ?').get('LEG101');

    expect(copied).toBeUndefined();

    dbModule.closeDatabase();
  });

  test('migrates old split-schema category, attendance, and question constraints', () => {
    let dbModule = freshDbModule();
    removeDbFiles(dbModule);
    const files = dbModule.resolveDatabaseFiles(TEST_DB);
    createOldSplitSchemaFiles(files);

    dbModule.initDatabase(TEST_DB);
    const database = dbModule.getDatabase();

    const categoryTable = database.prepare(`
      SELECT sql FROM learning.sqlite_master
      WHERE type = 'table' AND name = 'categories'
    `).get();
    const attendanceTable = database.prepare(`
      SELECT sql FROM learning.sqlite_master
      WHERE type = 'table' AND name = 'attendance_records'
    `).get();
    const questionTable = database.prepare(`
      SELECT sql FROM assessment.sqlite_master
      WHERE type = 'table' AND name = 'questions'
    `).get();
    const legacyQuestion = database.prepare('SELECT text, type FROM questions WHERE text = ?').get('Legacy question?');

    expect(categoryTable.sql).not.toMatch(/name\s+TEXT\s+NOT\s+NULL\s+UNIQUE/i);
    expect(attendanceTable.sql).toContain("'removed'");
    expect(questionTable.sql).toContain("'MR'");
    expect(legacyQuestion).toEqual({ text: 'Legacy question?', type: 'MC' });

    dbModule.closeDatabase();
  });

  test('migrates legacy identity database and normalizes usernames and student profiles', () => {
    let dbModule = freshDbModule();
    removeDbFiles(dbModule);
    const files = dbModule.resolveDatabaseFiles(TEST_DB);
    createLegacyIdentityDatabase(files);

    dbModule.initDatabase(TEST_DB);
    const database = dbModule.getDatabase();

    const admin = database.prepare('SELECT username, mustChangeCredentials FROM users WHERE id = ?').get(11);
    const suffixed = database.prepare('SELECT username FROM users WHERE id = ?').get(15);
    const repairedProfile = database.prepare('SELECT studentNumber FROM student_profiles WHERE userId = ?').get(12);
    const insertedProfile = database.prepare('SELECT studentNumber FROM student_profiles WHERE userId = ?').get(13);

    expect(admin).toEqual({ username: 'admin', mustChangeCredentials: 1 });
    expect(suffixed.username).toBe('taken1');
    expect(repairedProfile.studentNumber).toBe('STU-0012-1');
    expect(insertedProfile.studentNumber).toBe('STU-0013');

    dbModule.closeDatabase();
  });

  test('removes legacy migrated sessions after adding tokenType', () => {
    let dbModule = freshDbModule();
    removeDbFiles(dbModule);
    const files = dbModule.resolveDatabaseFiles(TEST_DB);
    createOldSessionDatabase(files);

    dbModule.initDatabase(TEST_DB);
    const database = dbModule.getDatabase();

    expect(database.prepare('PRAGMA users.table_info(sessions)').all().map(column => column.name))
      .toContain('tokenType');
    expect(database.prepare('SELECT COUNT(*) as count FROM sessions').get().count).toBe(0);

    dbModule.closeDatabase();
  });

  test('seed activates an existing inactive term and creates a demo quiz from an existing bank', () => {
    let dbModule = freshDbModule();
    removeDbFiles(dbModule);
    dbModule.initDatabase(TEST_DB);

    const database = dbModule.getDatabase();
    database.prepare(`
      INSERT INTO academic_terms (name, academicYear, semesterType, startDate, endDate, isActive)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run('Inactive Seed Term', '2030-2031', 'fall', '2030-09-01', '2031-01-15');
    const courseId = Number(database.prepare(`
      INSERT INTO courses (code, title, visibility)
      VALUES (?, ?, ?)
    `).run('WEB101', 'Existing Question Bank Course', 'published').lastInsertRowid);
    const categoryId = Number(database.prepare(`
      INSERT INTO categories (courseId, name, description)
      VALUES (?, ?, ?)
    `).run(courseId, 'Existing Bank', 'Questions already existed before seed.').lastInsertRowid);
    const insertQuestion = database.prepare(`
      INSERT INTO questions (categoryId, text, type, options, correctAnswer, difficulty, points)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (let index = 0; index < 5; index += 1) {
      insertQuestion.run(categoryId, `Existing bank question ${index}?`, 'TF', '[]', 'true', 'EASY', 1);
    }

    dbModule.seedDatabase();

    expect(database.prepare('SELECT COUNT(*) as count FROM academic_terms WHERE isActive = 1').get().count)
      .toBe(1);
    const demoQuiz = database.prepare('SELECT id FROM quizzes WHERE title = ?').get('Programming Basics Quiz');
    expect(demoQuiz).toBeDefined();
    expect(database.prepare('SELECT COUNT(*) as count FROM quiz_questions WHERE quizId = ?').get(demoQuiz.id).count)
      .toBe(5);

    dbModule.closeDatabase();
  });

  test('seed creates the advanced full demo exam on a fresh install', () => {
    let dbModule = freshDbModule();
    removeDbFiles(dbModule);
    dbModule.initDatabase(TEST_DB);

    dbModule.seedDatabase();
    const database = dbModule.getDatabase();

    const quiz = database.prepare(`
      SELECT id, durationMinutes, maxAttempts
      FROM quizzes
      WHERE LOWER(title) LIKE 'numerical methods%full demo exam'
    `).get();
    expect(quiz).toBeDefined();
    expect(quiz.durationMinutes).toBe(120);
    expect(quiz.maxAttempts).toBe(99);

    const linkedQuestions = database.prepare(`
      SELECT q.type, qq.points
      FROM quiz_questions qq
      JOIN questions q ON q.id = qq.questionId
      WHERE qq.quizId = ?
      ORDER BY qq.position ASC
    `).all(quiz.id);
    const expectedTypes = Array(5).fill(['MC', 'TF', 'FB', 'SA', 'MR', 'OR', 'ES', 'MT', 'MP']).flat();
    expect(linkedQuestions.map(question => question.type))
      .toEqual(expectedTypes);
    
    const expectedPoints = Array(45).fill(2.22);
    expectedPoints[2] = 2.32;
    expect(linkedQuestions.map(question => question.points))
      .toEqual(expectedPoints);

    const mathTable = database.prepare(`
      SELECT COUNT(*) as count
      FROM question_table_config qtc
      JOIN questions q ON q.id = qtc.questionId
      JOIN quiz_questions qq ON qq.questionId = q.id
      WHERE qq.quizId = ? AND q.type = 'MT'
    `).get(quiz.id);
    const multiPart = database.prepare(`
      SELECT COUNT(*) as count
      FROM question_parts qp
      JOIN questions q ON q.id = qp.questionId
      JOIN quiz_questions qq ON qq.questionId = q.id
      WHERE qq.quizId = ? AND q.type = 'MP'
    `).get(quiz.id);

    expect(mathTable.count).toBe(5);
    expect(multiPart.count).toBe(25);

    dbModule.closeDatabase();
  });

  test('attaches legacy categories and repairs published quiz question links during seed', () => {
    let dbModule = freshDbModule();
    removeDbFiles(dbModule);
    dbModule.initDatabase(TEST_DB);

    const database = dbModule.getDatabase();
    const course = database.prepare(`
      INSERT INTO courses (code, title, visibility)
      VALUES (?, ?, ?)
    `).run('WEB101', 'Pre-existing Course', 'published');
    const courseId = Number(course.lastInsertRowid);
    const category = database.prepare(`
      INSERT INTO categories (courseId, name, description)
      VALUES (NULL, ?, ?)
    `).run('Advanced Demo', 'Legacy detached question bank');
    const categoryId = Number(category.lastInsertRowid);
    const insertQuestion = database.prepare(`
      INSERT INTO questions (categoryId, text, type, options, correctAnswer, difficulty, points)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const mc = insertQuestion.run(
      categoryId,
      'Legacy multiple choice?',
      'MC',
      JSON.stringify(['A', 'B']),
      '0',
      'EASY',
      2
    );
    insertQuestion.run(categoryId, 'Legacy true/false?', 'TF', '[]', 'true', 'EASY', 1);
    insertQuestion.run(categoryId, 'Legacy fill blank?', 'FB', '[]', 'answer', 'MEDIUM', 1);
    const quiz = database.prepare(`
      INSERT INTO quizzes (courseId, title, description, status)
      VALUES (?, ?, ?, ?)
    `).run(courseId, 'Full Demo Legacy Quiz', 'All question types should be repaired.', 'published');
    const quizId = Number(quiz.lastInsertRowid);
    const plainQuiz = database.prepare(`
      INSERT INTO quizzes (courseId, title, description, status)
      VALUES (?, ?, ?, ?)
    `).run(courseId, 'Plain Legacy Quiz', 'Uses fallback question selection.', 'published');
    const plainQuizId = Number(plainQuiz.lastInsertRowid);

    dbModule.seedDatabase();

    const attachedCategory = database.prepare('SELECT courseId FROM categories WHERE id = ?').get(categoryId);
    const repairedLinks = database.prepare('SELECT COUNT(*) as count FROM quiz_questions WHERE quizId = ?').get(quizId);
    const fallbackLinks = database.prepare('SELECT COUNT(*) as count FROM quiz_questions WHERE quizId = ?').get(plainQuizId);
    const firstLink = database.prepare('SELECT questionId FROM quiz_questions WHERE quizId = ? ORDER BY position ASC LIMIT 1').get(quizId);

    expect(attachedCategory.courseId).toBe(courseId);
    expect(repairedLinks.count).toBeGreaterThan(0);
    expect(fallbackLinks.count).toBeGreaterThan(0);
    expect(firstLink.questionId).toBe(Number(mc.lastInsertRowid));

    dbModule.closeDatabase();
  });
});
