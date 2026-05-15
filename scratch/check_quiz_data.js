const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'quiz.assessment.sqlite');
const db = new DatabaseSync(dbPath);

const quiz = db.prepare("SELECT * FROM quizzes WHERE title LIKE '%Programming Basics%'").get();
console.log('Quiz Data:', JSON.stringify(quiz, null, 2));
console.log('Weight Type:', typeof quiz.weight);
