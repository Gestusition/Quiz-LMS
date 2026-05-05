const { initDatabase, closeDatabase, resolveDatabaseFiles } = require('../database/db');
const categoryService = require('../services/categoryService');
const questionService = require('../services/questionService');
const path = require('path');
const fs = require('fs');

const TEST_DB = path.join(__dirname, 'test_questions.db');

let testCategoryId;

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

  // Create a test category for questions
  const cat = categoryService.create({ name: 'Test Cat', description: 'For question tests' });
  testCategoryId = cat.id;
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('QuestionService', () => {

  let mcId, tfId, fbId;

  // ===== CREATE =====
  test('should create a multiple choice question', () => {
    const q = questionService.create({
      categoryId: testCategoryId,
      text: 'What is 2+2?',
      type: 'MC',
      options: ['3', '4', '5', '6'],
      correctAnswer: '1',
      difficulty: 'EASY'
    });
    expect(q).toBeDefined();
    expect(q.id).toBeDefined();
    expect(q.type).toBe('MC');
    expect(q.options).toEqual(['3', '4', '5', '6']);
    mcId = q.id;
  });

  test('should create a true/false question', () => {
    const q = questionService.create({
      categoryId: testCategoryId,
      text: 'The sky is blue.',
      type: 'TF',
      correctAnswer: 'true',
      difficulty: 'EASY'
    });
    expect(q).toBeDefined();
    expect(q.type).toBe('TF');
    tfId = q.id;
  });

  test('should create a fill-in-the-blank question', () => {
    const q = questionService.create({
      categoryId: testCategoryId,
      text: 'The capital of France is _____.',
      type: 'FB',
      correctAnswer: 'Paris',
      difficulty: 'MEDIUM'
    });
    expect(q).toBeDefined();
    expect(q.type).toBe('FB');
    fbId = q.id;
  });

  // ===== VALIDATION =====
  test('should reject question without text', () => {
    expect(() => {
      questionService.create({ categoryId: testCategoryId, text: '', type: 'TF', correctAnswer: 'true' });
    }).toThrow('required');
  });

  test('should reject question with invalid type', () => {
    expect(() => {
      questionService.create({ categoryId: testCategoryId, text: 'Test?', type: 'INVALID', correctAnswer: 'x' });
    }).toThrow('type must be');
  });

  test('should reject MC with fewer than 2 options', () => {
    expect(() => {
      questionService.create({ categoryId: testCategoryId, text: 'Test?', type: 'MC', options: ['Only one'], correctAnswer: '0' });
    }).toThrow('between 2 and 6');
  });

  test('should reject MC with invalid correct answer index', () => {
    expect(() => {
      questionService.create({ categoryId: testCategoryId, text: 'Test?', type: 'MC', options: ['A', 'B'], correctAnswer: '5' });
    }).toThrow('valid option index');
  });

  test('should reject TF with invalid answer', () => {
    expect(() => {
      questionService.create({ categoryId: testCategoryId, text: 'Test?', type: 'TF', correctAnswer: 'maybe' });
    }).toThrow('true');
  });

  test('should reject question with non-existent category', () => {
    expect(() => {
      questionService.create({ categoryId: 99999, text: 'Test?', type: 'TF', correctAnswer: 'true' });
    }).toThrow('Category not found');
  });

  // ===== READ =====
  test('should get all questions', () => {
    const all = questionService.getAll();
    expect(all.length).toBe(3);
  });

  test('should get a question by ID', () => {
    const q = questionService.getById(mcId);
    expect(q).toBeDefined();
    expect(q.text).toBe('What is 2+2?');
  });

  test('should return null for non-existent question', () => {
    expect(questionService.getById(99999)).toBeNull();
  });

  // ===== FILTER =====
  test('should filter questions by difficulty', () => {
    const easy = questionService.getAll({ difficulty: 'EASY' });
    expect(easy.length).toBe(2);
  });

  test('should filter questions by type', () => {
    const mc = questionService.getAll({ type: 'MC' });
    expect(mc.length).toBe(1);
  });

  test('should search questions by text', () => {
    const results = questionService.getAll({ search: 'France' });
    expect(results.length).toBe(1);
    expect(results[0].text).toContain('France');
  });

  // ===== RANDOM =====
  test('should get random questions', () => {
    const random = questionService.getRandom({ limit: 2 });
    expect(random.length).toBeLessThanOrEqual(2);
  });

  // ===== UPDATE =====
  test('should update a question', () => {
    const updated = questionService.update(mcId, { text: 'What is 3+3?', correctAnswer: '2' });
    expect(updated.text).toBe('What is 3+3?');
    expect(updated.correctAnswer).toBe('2');
  });

  test('should throw when updating non-existent question', () => {
    expect(() => {
      questionService.update(99999, { text: 'Ghost question' });
    }).toThrow('not found');
  });

  // ===== DELETE =====
  test('should delete a question', () => {
    const result = questionService.delete(fbId);
    expect(result).toBe(true);
    expect(questionService.getById(fbId)).toBeNull();
  });

  test('should delete related questions when a category is deleted', () => {
    categoryService.delete(testCategoryId);
    expect(questionService.getAll()).toHaveLength(0);
  });

  test('should throw when deleting non-existent question', () => {
    expect(() => {
      questionService.delete(99999);
    }).toThrow('not found');
  });
});
