const { DatabaseSync } = require('node:sqlite');
const path = require('path');

let db;

/**
 * Initialize the SQLite database and create tables if they don't exist.
 * @param {string} [dbPath] - Optional path to the database file. Defaults to quiz.db in project root.
 * @returns {DatabaseSync} The database instance.
 */
function initDatabase(dbPath) {
  const resolvedPath = dbPath || path.join(__dirname, '..', 'quiz.db');
  db = new DatabaseSync(resolvedPath);

  // Enable WAL mode for better performance
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER NOT NULL,
      text TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('MC', 'TF', 'FB')),
      options TEXT DEFAULT '[]',
      correctAnswer TEXT NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'MEDIUM' CHECK(difficulty IN ('EASY', 'MEDIUM', 'HARD')),
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  return db;
}

/**
 * Get the current database instance.
 * @returns {DatabaseSync} The database instance.
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection.
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = undefined;
  }
}

/**
 * Seed the database with sample data if tables are empty.
 */
function seedDatabase() {
  const database = getDatabase();

  const categoryCount = database.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (categoryCount > 0) return;

  const insertCategory = database.prepare(
    'INSERT INTO categories (name, description) VALUES (?, ?)'
  );
  const insertQuestion = database.prepare(
    'INSERT INTO questions (categoryId, text, type, options, correctAnswer, difficulty) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const seedTransaction = () => {
    // Seed categories
    insertCategory.run('JavaScript', 'Questions about JavaScript programming language fundamentals');
    insertCategory.run('HTML & CSS', 'Questions about web markup and styling');
    insertCategory.run('Databases', 'Questions about database concepts and SQL');
    insertCategory.run('General Knowledge', 'General programming and computer science questions');

    // Seed questions — JavaScript (categoryId: 1)
    insertQuestion.run(1, 'Which keyword is used to declare a constant in JavaScript?', 'MC',
      JSON.stringify(['var', 'let', 'const', 'define']), '2', 'EASY');
    insertQuestion.run(1, 'JavaScript is a statically typed language.', 'TF',
      '[]', 'false', 'EASY');
    insertQuestion.run(1, 'The method used to parse a JSON string in JavaScript is JSON._____.', 'FB',
      '[]', 'parse', 'MEDIUM');
    insertQuestion.run(1, 'What does the "===" operator check in JavaScript?', 'MC',
      JSON.stringify(['Value only', 'Type only', 'Value and type', 'Reference']), '2', 'MEDIUM');
    insertQuestion.run(1, 'Which array method creates a new array with elements that pass a test?', 'MC',
      JSON.stringify(['map', 'filter', 'reduce', 'forEach']), '1', 'MEDIUM');

    // Seed questions — HTML & CSS (categoryId: 2)
    insertQuestion.run(2, 'HTML stands for HyperText Markup Language.', 'TF',
      '[]', 'true', 'EASY');
    insertQuestion.run(2, 'Which CSS property is used to change the background color?', 'MC',
      JSON.stringify(['color', 'bgcolor', 'background-color', 'background']), '2', 'EASY');
    insertQuestion.run(2, 'The CSS property used to make text bold is font-_____.', 'FB',
      '[]', 'weight', 'EASY');
    insertQuestion.run(2, 'Which HTML element is used for the largest heading?', 'MC',
      JSON.stringify(['h6', 'heading', 'h1', 'head']), '2', 'EASY');

    // Seed questions — Databases (categoryId: 3)
    insertQuestion.run(3, 'SQL stands for Structured _____ Language.', 'FB',
      '[]', 'Query', 'EASY');
    insertQuestion.run(3, 'Which SQL command is used to retrieve data from a database?', 'MC',
      JSON.stringify(['GET', 'FETCH', 'SELECT', 'RETRIEVE']), '2', 'EASY');
    insertQuestion.run(3, 'A primary key can contain NULL values.', 'TF',
      '[]', 'false', 'MEDIUM');
    insertQuestion.run(3, 'Which SQL clause is used to filter results?', 'MC',
      JSON.stringify(['FILTER', 'WHERE', 'HAVING', 'CONDITION']), '1', 'MEDIUM');

    // Seed questions — General Knowledge (categoryId: 4)
    insertQuestion.run(4, 'What does API stand for?', 'MC',
      JSON.stringify(['Application Programming Interface', 'Applied Programming Integration', 'Application Process Integration', 'Automated Programming Interface']),
      '0', 'EASY');
    insertQuestion.run(4, 'Git is a version control system.', 'TF',
      '[]', 'true', 'EASY');
    insertQuestion.run(4, 'The design pattern where a class has only one instance is called _____.', 'FB',
      '[]', 'Singleton', 'HARD');
  };

  db.exec('BEGIN TRANSACTION');
  try {
    seedTransaction();
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

module.exports = { initDatabase, getDatabase, closeDatabase, seedDatabase };
