const quizService = require('../services/quizService');
const db = require('../database/db');
const quizRepository = require('../repositories/quizRepository');

db.initDatabase();

// Create a dummy quiz with all fields to avoid binding errors
quizRepository.insert({
    courseId: 1,
    title: 'Test Quiz',
    description: 'Test Desc',
    status: 'draft',
    startAt: '',
    endAt: '',
    durationMinutes: 30,
    maxAttempts: 1,
    shuffleQuestions: 0,
    showCorrectAnswers: 1,
    shuffleOptions: 0,
    showResultPolicy: 'immediately',
    gradingMode: 'standard',
    penaltyEnabled: 0,
    penaltyPerWrong: 0,
    penaltyRatio: 0,
    requiresSeb: 0,
    sebConfigName: '',
    sebConfigUrl: '',
    templateName: '',
    weight: 0
}, 1);

console.log('--- Initial State ---');
const initial = quizService.getById(1);
console.log('Initial Weight:', initial.weight);

console.log('\n--- Updating Weight to 60 ---');
quizService.update(1, { weight: 60 });

const after = quizService.getById(1);
console.log('Weight after update:', after.weight);

console.log('\n--- Updating Weight to 59.99999999999999 ---');
quizService.update(1, { weight: 59.99999999999999 });

const after2 = quizService.getById(1);
console.log('Weight after update 2:', after2.weight);
