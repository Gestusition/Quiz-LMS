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

  test('rejects multiple response correct indexes that do not match options', () => {
    expect(() => questionService.create({
      categoryId: testCategoryId,
      text: 'Pick valid letters.',
      type: 'MR',
      options: ['A', 'B'],
      correctAnswer: '0,5'
    })).toThrow('valid option indexes');

    expect(() => questionService.create({
      categoryId: testCategoryId,
      text: 'Pick unique letters.',
      type: 'MR',
      options: ['A', 'B'],
      correctAnswer: '0,0'
    })).toThrow('duplicates');
  });

  test('ordering questions filter blank options before storing correctAnswer', () => {
    const ordering = questionService.create({
      categoryId: testCategoryId,
      text: 'Order the steps.',
      type: 'OR',
      options: ['First', '', 'Second'],
      correctAnswer: '0,1,2'
    });

    expect(ordering.options).toEqual(['First', 'Second']);
    expect(ordering.correctAnswer).toBe('0,1');
  });

  test('stores LaTeX and script-looking text as inert question content', () => {
    const latex = questionService.create({
      categoryId: testCategoryId,
      text: 'Compute $$\\frac{1}{2}$$ <script>alert(1)</script>',
      type: 'FB',
      correctAnswer: '0.5',
      richText: 'Use \\(a^2+b^2\\).',
      explanationText: 'Because $$1/2 = 0.5$$.',
      hintText: 'Write a decimal.'
    });

    const found = questionService.getById(latex.id);
    expect(found.text).toContain('\\frac{1}{2}');
    expect(found.text).toContain('<script>');
    expect(found.richText).toContain('\\(a^2+b^2\\)');
  });

  test('multi-part partial updates preserve existing parts and reject invalid nested updates', () => {
    const multi = questionService.create({
      categoryId: testCategoryId,
      text: 'Solve both parts.',
      type: 'MP',
      difficulty: 'MEDIUM',
      points: 2,
      parts: [
        { partLabel: '(a)', partText: 'Compute $1+1$.', answerType: 'numeric', correctAnswer: '2', points: 1 },
        { partLabel: '(b)', partText: 'Compute $2+2$.', answerType: 'numeric', correctAnswer: '4', points: 1 }
      ]
    });

    const updated = questionService.update(multi.id, { text: 'Solve the updated parts.' });
    expect(updated.parts).toHaveLength(2);
    expect(updated.parts[0].correctAnswer).toBe('2');

    expect(() => questionService.update(multi.id, {
      parts: [{ partLabel: '(a)', partText: 'Missing answer', answerType: 'numeric', correctAnswer: '', points: 1 }]
    })).toThrow('correct answer');
  });

  test('math table partial updates preserve tableConfig and reject invalid cell keys', () => {
    const table = questionService.create({
      categoryId: testCategoryId,
      text: 'Fill the table.',
      type: 'MT',
      difficulty: 'HARD',
      points: 3,
      tableConfig: {
        columns: [{ header: 'n', type: 'label' }, { header: 'value', type: 'input' }],
        rowCount: 2,
        prefill: { r0_c0: '1', r1_c0: '2' },
        correctData: { r0_c1: '10', r1_c1: '20' }
      }
    });

    const updated = questionService.update(table.id, { difficulty: 'MEDIUM' });
    expect(updated.tableConfig.correctData.r0_c1).toBe('10');

    expect(() => questionService.update(table.id, {
      tableConfig: {
        columns: [{ header: 'n', type: 'label' }, { header: 'value', type: 'input' }],
        rowCount: 1,
        correctData: { r9_c1: 'bad' }
      }
    })).toThrow('table shape');
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
