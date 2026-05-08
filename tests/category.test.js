const { initDatabase, closeDatabase, resolveDatabaseFiles, getDatabase } = require('../database/db');
const categoryService = require('../services/categoryService');
const path = require('path');
const fs = require('fs');

const TEST_DB = path.join(__dirname, 'test_categories.db');

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
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('CategoryService', () => {

  let createdId;

  test('should create a new category', () => {
    const cat = categoryService.create({ name: 'Test Category', description: 'A test category' });
    expect(cat).toBeDefined();
    expect(cat.id).toBeDefined();
    expect(cat.name).toBe('Test Category');
    expect(cat.description).toBe('A test category');
    createdId = cat.id;
  });

  test('should not create a category with duplicate name', () => {
    expect(() => {
      categoryService.create({ name: 'Test Category' });
    }).toThrow('already exists');
  });

  test('should not create a category without a name', () => {
    expect(() => {
      categoryService.create({ name: '' });
    }).toThrow('required');
  });

  test('should not create a category with name too long', () => {
    expect(() => {
      categoryService.create({ name: 'x'.repeat(101) });
    }).toThrow('100 characters');
  });

  test('should get all categories', () => {
    const cats = categoryService.getAll();
    expect(Array.isArray(cats)).toBe(true);
    expect(cats.length).toBeGreaterThanOrEqual(1);
    expect(cats[0]).toHaveProperty('questionCount');
  });

  test('should get a category by ID', () => {
    const cat = categoryService.getById(createdId);
    expect(cat).toBeDefined();
    expect(cat.name).toBe('Test Category');
  });

  test('should return null for non-existent ID', () => {
    const cat = categoryService.getById(99999);
    expect(cat).toBeNull();
  });

  test('should update a category', () => {
    const updated = categoryService.update(createdId, { name: 'Updated Category', description: 'Updated desc' });
    expect(updated.name).toBe('Updated Category');
    expect(updated.description).toBe('Updated desc');
  });

  test('should not update to a duplicate name', () => {
    categoryService.create({ name: 'Another Category' });
    expect(() => {
      categoryService.update(createdId, { name: 'Another Category' });
    }).toThrow('already exists');
  });

  test('allows the same category name in different courses but not twice in one course', () => {
    const db = getDatabase();
    const courseA = db.prepare("INSERT INTO courses (code, title, visibility) VALUES (?, ?, 'published')")
      .run(`CAT-A-${Date.now()}`, 'Category Course A');
    const courseB = db.prepare("INSERT INTO courses (code, title, visibility) VALUES (?, ?, 'published')")
      .run(`CAT-B-${Date.now()}`, 'Category Course B');
    const courseAId = Number(courseA.lastInsertRowid);
    const courseBId = Number(courseB.lastInsertRowid);

    const first = categoryService.create({ courseId: courseAId, name: 'Midterm' });
    const second = categoryService.create({ courseId: courseBId, name: 'Midterm' });

    expect(first.name).toBe('Midterm');
    expect(second.name).toBe('Midterm');
    expect(first.courseId).toBe(courseAId);
    expect(second.courseId).toBe(courseBId);
    expect(() => categoryService.create({ courseId: courseAId, name: 'midterm' })).toThrow('already exists');
  });

  test('should throw when updating non-existent category', () => {
    expect(() => {
      categoryService.update(99999, { name: 'Ghost' });
    }).toThrow('not found');
  });

  test('should delete a category', () => {
    const result = categoryService.delete(createdId);
    expect(result).toBe(true);
    const deleted = categoryService.getById(createdId);
    expect(deleted).toBeNull();
  });

  test('should throw when deleting non-existent category', () => {
    expect(() => {
      categoryService.delete(99999);
    }).toThrow('not found');
  });
});
