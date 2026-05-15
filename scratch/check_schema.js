const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'quiz.assessment.sqlite');
console.log('Checking path:', dbPath);
console.log('File exists:', fs.existsSync(dbPath));

const db = new DatabaseSync(dbPath);

const tableInfo = db.prepare("PRAGMA table_info(quizzes)").all();
console.log(JSON.stringify(tableInfo, null, 2));
