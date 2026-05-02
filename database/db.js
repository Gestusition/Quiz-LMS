const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const { hashPassword } = require('../utils/security');

const DATABASE_CONTEXTS = {
  identity: 'Users, password hashes, and sessions',
  learning: 'Courses, enrollments, and question categories',
  assessment: 'Questions, quizzes, attempts, and grades',
  content: 'Announcements and learning resources'
};

let db;
let activeFiles;

function initDatabase(dbPath) {
  activeFiles = resolveDatabaseFiles(dbPath);
  ensureDatabaseDirectory(activeFiles);

  db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 5000');

  attachContextDatabases(activeFiles);
  createTables();
  migrateExistingTables();
  migrateLegacySingleDatabase(dbPath);

  return db;
}

function resolveDatabaseFiles(dbPath) {
  if (dbPath) {
    const dir = path.dirname(dbPath);
    const ext = path.extname(dbPath);
    const base = path.basename(dbPath, ext);
    return {
      identity: path.join(dir, `${base}.identity.sqlite`),
      learning: path.join(dir, `${base}.learning.sqlite`),
      assessment: path.join(dir, `${base}.assessment.sqlite`),
      content: path.join(dir, `${base}.content.sqlite`),
      legacy: dbPath
    };
  }

  const dataDir = path.join(__dirname, '..', 'data');
  return {
    identity: path.join(dataDir, 'quiz.identity.sqlite'),
    learning: path.join(dataDir, 'quiz.learning.sqlite'),
    assessment: path.join(dataDir, 'quiz.assessment.sqlite'),
    content: path.join(dataDir, 'quiz.content.sqlite'),
    legacy: path.join(__dirname, '..', 'quiz.db')
  };
}

function ensureDatabaseDirectory(files) {
  Object.entries(files)
    .filter(([name]) => name !== 'legacy')
    .forEach(([, filePath]) => {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    });
}

function attachContextDatabases(files) {
  Object.keys(DATABASE_CONTEXTS).forEach(schema => {
    db.exec(`ATTACH DATABASE '${escapeSqlPath(files[schema])}' AS ${schema}`);
    db.exec(`PRAGMA ${schema}.journal_mode = WAL`);
  });
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS identity.users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student')),
      passwordHash TEXT NOT NULL,
      passwordSalt TEXT NOT NULL,
      passwordAlgorithm TEXT NOT NULL DEFAULT 'scrypt+salt+spice',
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'disabled')),
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS identity.sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      tokenHash TEXT NOT NULL UNIQUE,
      expiresAt TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      lastSeenAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning.courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private', 'published', 'archived')),
      startDate TEXT DEFAULT '',
      endDate TEXT DEFAULT '',
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS learning.enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('teacher', 'student')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended')),
      createdAt TEXT DEFAULT (datetime('now')),
      UNIQUE(courseId, userId, role),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning.categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER,
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS assessment.questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER NOT NULL,
      text TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('MC', 'TF', 'FB')),
      options TEXT DEFAULT '[]',
      correctAnswer TEXT NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'MEDIUM' CHECK(difficulty IN ('EASY', 'MEDIUM', 'HARD')),
      points REAL NOT NULL DEFAULT 1,
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assessment.quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'closed')),
      openAt TEXT DEFAULT '',
      closeAt TEXT DEFAULT '',
      timeLimitMinutes INTEGER NOT NULL DEFAULT 0,
      attemptsAllowed INTEGER NOT NULL DEFAULT 1,
      shuffleQuestions INTEGER NOT NULL DEFAULT 0,
      showCorrectAnswers INTEGER NOT NULL DEFAULT 1,
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assessment.quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quizId INTEGER NOT NULL,
      questionId INTEGER NOT NULL,
      points REAL NOT NULL DEFAULT 1,
      position INTEGER NOT NULL DEFAULT 0,
      UNIQUE(quizId, questionId),
      FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
      FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment.quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quizId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      attemptNumber INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'submitted')),
      startedAt TEXT DEFAULT (datetime('now')),
      submittedAt TEXT DEFAULT '',
      score REAL NOT NULL DEFAULT 0,
      maxScore REAL NOT NULL DEFAULT 0,
      percentage REAL NOT NULL DEFAULT 0,
      timeSpentSeconds INTEGER NOT NULL DEFAULT 0,
      UNIQUE(quizId, userId, attemptNumber),
      FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment.attempt_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attemptId INTEGER NOT NULL,
      questionId INTEGER NOT NULL,
      answer TEXT DEFAULT '',
      isCorrect INTEGER NOT NULL DEFAULT 0,
      pointsAwarded REAL NOT NULL DEFAULT 0,
      UNIQUE(attemptId, questionId),
      FOREIGN KEY (attemptId) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS content.announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS content.resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'link' CHECK(type IN ('link', 'file', 'page')),
      url TEXT DEFAULT '',
      description TEXT DEFAULT '',
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);
}

function migrateExistingTables() {
  ensureColumn('learning', 'categories', 'courseId', 'courseId INTEGER');
  ensureColumn('assessment', 'questions', 'points', 'points REAL NOT NULL DEFAULT 1');
  ensureColumn('assessment', 'questions', 'createdBy', 'createdBy INTEGER');
}

function ensureColumn(schema, tableName, columnName, columnSql) {
  const columns = db.prepare(`PRAGMA ${schema}.table_info(${tableName})`).all();
  if (!columns.some(column => column.name === columnName)) {
    db.exec(`ALTER TABLE ${schema}.${tableName} ADD COLUMN ${columnSql}`);
  }
}

function migrateLegacySingleDatabase(dbPath) {
  const legacyPath = activeFiles.legacy;
  if (!legacyPath || !fs.existsSync(legacyPath)) return;

  const splitFiles = Object.keys(DATABASE_CONTEXTS).map(schema => path.resolve(activeFiles[schema]));
  if (splitFiles.includes(path.resolve(legacyPath))) return;

  db.exec(`ATTACH DATABASE '${escapeSqlPath(legacyPath)}' AS legacy`);
  try {
    const legacyHasAnyTable = [
      'users', 'courses', 'categories', 'questions', 'quizzes'
    ].some(tableName => tableExists('legacy', tableName));

    if (!legacyHasAnyTable) return;

    copyLegacyTable('identity', 'users');
    copyLegacyTable('identity', 'sessions');
    copyLegacyTable('learning', 'courses');
    copyLegacyTable('learning', 'enrollments');
    copyLegacyTable('learning', 'categories');
    copyLegacyTable('assessment', 'questions');
    copyLegacyTable('assessment', 'quizzes');
    copyLegacyTable('assessment', 'quiz_questions');
    copyLegacyTable('assessment', 'quiz_attempts');
    copyLegacyTable('assessment', 'attempt_answers');
    copyLegacyTable('content', 'announcements');
    copyLegacyTable('content', 'resources');
  } finally {
    db.exec('DETACH DATABASE legacy');
  }
}

function tableExists(schema, tableName) {
  const row = db.prepare(`
    SELECT name FROM ${schema}.sqlite_master
    WHERE type = 'table' AND name = ?
  `).get(tableName);
  return !!row;
}

function copyLegacyTable(targetSchema, tableName) {
  if (!tableExists('legacy', tableName)) return;

  const targetColumns = db.prepare(`PRAGMA ${targetSchema}.table_info(${tableName})`).all()
    .map(column => column.name);
  const sourceColumns = db.prepare(`PRAGMA legacy.table_info(${tableName})`).all()
    .map(column => column.name);
  const columns = targetColumns.filter(column => sourceColumns.includes(column));
  if (columns.length === 0) return;

  const columnList = columns.join(', ');
  db.exec(`
    INSERT OR IGNORE INTO ${targetSchema}.${tableName} (${columnList})
    SELECT ${columnList} FROM legacy.${tableName}
  `);
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

function getDatabaseFiles() {
  return activeFiles ? { ...activeFiles } : resolveDatabaseFiles();
}

function closeDatabase() {
  if (db) {
    db.close();
    db = undefined;
    activeFiles = undefined;
  }
}

function seedDatabase() {
  const database = getDatabase();

  const userCount = database.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    seedUsers(database);
  }

  const courseCount = database.prepare('SELECT COUNT(*) as count FROM courses').get().count;
  if (courseCount === 0) {
    seedLmsData(database);
  }

  const categoryCount = database.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (categoryCount === 0) {
    seedQuestionBank(database);
  } else {
    attachLegacyDataToDemoCourse(database);
  }

  ensureDemoQuiz(database);
}

function seedUsers(database) {
  const insertUser = database.prepare(`
    INSERT INTO users (name, email, role, passwordHash, passwordSalt, passwordAlgorithm)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  [
    ['Admin User', 'admin@example.com', 'admin', 'Admin123!'],
    ['Teacher User', 'teacher@example.com', 'teacher', 'Teacher123!'],
    ['Student User', 'student@example.com', 'student', 'Student123!']
  ].forEach(([name, email, role, password]) => {
    const hashed = hashPassword(password);
    insertUser.run(
      name,
      email,
      role,
      hashed.passwordHash,
      hashed.passwordSalt,
      hashed.passwordAlgorithm
    );
  });
}

function seedLmsData(database) {
  const admin = database.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('admin');
  const teacher = database.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('teacher');
  const student = database.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('student');

  const course = database.prepare(`
    INSERT INTO courses (code, title, description, visibility, createdBy)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'WEB101',
    'Web Programming Fundamentals',
    'Demo course with quiz, resources, announcements, and a gradebook.',
    'published',
    admin ? admin.id : null
  );

  const courseId = Number(course.lastInsertRowid);
  if (teacher) {
    database.prepare('INSERT INTO enrollments (courseId, userId, role) VALUES (?, ?, ?)')
      .run(courseId, teacher.id, 'teacher');
  }
  if (student) {
    database.prepare('INSERT INTO enrollments (courseId, userId, role) VALUES (?, ?, ?)')
      .run(courseId, student.id, 'student');
  }

  if (teacher) {
    database.prepare(`
      INSERT INTO announcements (courseId, title, body, createdBy)
      VALUES (?, ?, ?, ?)
    `).run(courseId, 'Welcome to WEB101', 'Read the resources and complete the first quiz.', teacher.id);

    database.prepare(`
      INSERT INTO resources (courseId, title, type, url, description, createdBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(courseId, 'Course syllabus', 'page', '', 'Weekly topics, assessment policy, and quiz rules.', teacher.id);
  }
}

function seedQuestionBank(database) {
  const demoCourse = database.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');
  const teacher = database.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('teacher');
  const courseId = demoCourse ? demoCourse.id : null;
  const teacherId = teacher ? teacher.id : null;

  const insertCategory = database.prepare(
    'INSERT INTO categories (courseId, name, description) VALUES (?, ?, ?)'
  );
  const insertQuestion = database.prepare(`
    INSERT INTO questions (categoryId, text, type, options, correctAnswer, difficulty, points, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  database.exec('BEGIN TRANSACTION');
  try {
    const categories = {
      javascript: Number(insertCategory.run(courseId, 'JavaScript', 'Questions about JavaScript programming language fundamentals').lastInsertRowid),
      html: Number(insertCategory.run(courseId, 'HTML & CSS', 'Questions about web markup and styling').lastInsertRowid),
      databases: Number(insertCategory.run(courseId, 'Databases', 'Questions about database concepts and SQL').lastInsertRowid),
      general: Number(insertCategory.run(courseId, 'General Knowledge', 'General programming and computer science questions').lastInsertRowid)
    };

    const seededQuestionIds = [];
    const addQuestion = (...args) => {
      const result = insertQuestion.run(...args);
      seededQuestionIds.push(Number(result.lastInsertRowid));
    };

    addQuestion(categories.javascript, 'Which keyword is used to declare a constant in JavaScript?', 'MC',
      JSON.stringify(['var', 'let', 'const', 'define']), '2', 'EASY', 1, teacherId);
    addQuestion(categories.javascript, 'JavaScript is a statically typed language.', 'TF',
      '[]', 'false', 'EASY', 1, teacherId);
    addQuestion(categories.javascript, 'The method used to parse a JSON string in JavaScript is JSON._____.', 'FB',
      '[]', 'parse', 'MEDIUM', 1, teacherId);
    addQuestion(categories.javascript, 'What does the "===" operator check in JavaScript?', 'MC',
      JSON.stringify(['Value only', 'Type only', 'Value and type', 'Reference']), '2', 'MEDIUM', 1, teacherId);
    addQuestion(categories.javascript, 'Which array method creates a new array with elements that pass a test?', 'MC',
      JSON.stringify(['map', 'filter', 'reduce', 'forEach']), '1', 'MEDIUM', 1, teacherId);
    addQuestion(categories.html, 'HTML stands for HyperText Markup Language.', 'TF',
      '[]', 'true', 'EASY', 1, teacherId);
    addQuestion(categories.html, 'Which CSS property is used to change the background color?', 'MC',
      JSON.stringify(['color', 'bgcolor', 'background-color', 'background']), '2', 'EASY', 1, teacherId);
    addQuestion(categories.html, 'The CSS property used to make text bold is font-_____.', 'FB',
      '[]', 'weight', 'EASY', 1, teacherId);
    addQuestion(categories.html, 'Which HTML element is used for the largest heading?', 'MC',
      JSON.stringify(['h6', 'heading', 'h1', 'head']), '2', 'EASY', 1, teacherId);
    addQuestion(categories.databases, 'SQL stands for Structured _____ Language.', 'FB',
      '[]', 'Query', 'EASY', 1, teacherId);
    addQuestion(categories.databases, 'Which SQL command is used to retrieve data from a database?', 'MC',
      JSON.stringify(['GET', 'FETCH', 'SELECT', 'RETRIEVE']), '2', 'EASY', 1, teacherId);
    addQuestion(categories.databases, 'A primary key can contain NULL values.', 'TF',
      '[]', 'false', 'MEDIUM', 1, teacherId);
    addQuestion(categories.databases, 'Which SQL clause is used to filter results?', 'MC',
      JSON.stringify(['FILTER', 'WHERE', 'HAVING', 'CONDITION']), '1', 'MEDIUM', 1, teacherId);
    addQuestion(categories.general, 'What does API stand for?', 'MC',
      JSON.stringify(['Application Programming Interface', 'Applied Programming Integration', 'Application Process Integration', 'Automated Programming Interface']),
      '0', 'EASY', 1, teacherId);
    addQuestion(categories.general, 'Git is a version control system.', 'TF',
      '[]', 'true', 'EASY', 1, teacherId);
    addQuestion(categories.general, 'The design pattern where a class has only one instance is called _____.', 'FB',
      '[]', 'Singleton', 'HARD', 1, teacherId);

    const quiz = database.prepare(`
      INSERT INTO quizzes (courseId, title, description, status, attemptsAllowed, shuffleQuestions, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(courseId, 'Programming Basics Quiz', 'A short quiz generated from the seed question bank.', 'published', 3, 1, teacherId);
    const quizId = Number(quiz.lastInsertRowid);
    const addQuizQuestion = database.prepare(
      'INSERT INTO quiz_questions (quizId, questionId, points, position) VALUES (?, ?, ?, ?)'
    );
    [0, 1, 3, 6, 10].forEach((questionIndex, index) => {
      addQuizQuestion.run(quizId, seededQuestionIds[questionIndex], 1, index + 1);
    });

    database.exec('COMMIT');
  } catch (e) {
    database.exec('ROLLBACK');
    throw e;
  }
}

function attachLegacyDataToDemoCourse(database) {
  const course = database.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');
  if (!course) return;

  database.prepare('UPDATE categories SET courseId = ? WHERE courseId IS NULL').run(course.id);
}

function ensureDemoQuiz(database) {
  const quizCount = database.prepare('SELECT COUNT(*) as count FROM quizzes').get().count;
  if (quizCount > 0) return;

  const course = database.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');
  const teacher = database.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('teacher');
  if (!course) return;

  const questions = database.prepare(`
    SELECT q.id
    FROM questions q
    JOIN categories c ON c.id = q.categoryId
    WHERE c.courseId = ?
    ORDER BY q.id ASC
    LIMIT 5
  `).all(course.id);
  if (questions.length === 0) return;

  database.exec('BEGIN TRANSACTION');
  try {
    const quiz = database.prepare(`
      INSERT INTO quizzes (courseId, title, description, status, attemptsAllowed, shuffleQuestions, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      course.id,
      'Programming Basics Quiz',
      'A short quiz generated from the course question bank.',
      'published',
      3,
      1,
      teacher ? teacher.id : null
    );

    const insert = database.prepare(`
      INSERT INTO quiz_questions (quizId, questionId, points, position)
      VALUES (?, ?, ?, ?)
    `);
    questions.forEach((question, index) => insert.run(quiz.lastInsertRowid, question.id, 1, index + 1));
    database.exec('COMMIT');
  } catch (e) {
    database.exec('ROLLBACK');
    throw e;
  }
}

function escapeSqlPath(filePath) {
  return filePath.replace(/'/g, "''");
}

module.exports = {
  DATABASE_CONTEXTS,
  closeDatabase,
  getDatabase,
  getDatabaseFiles,
  initDatabase,
  resolveDatabaseFiles,
  seedDatabase
};
