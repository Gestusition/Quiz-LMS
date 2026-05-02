const categoryRepository = require('../repositories/categoryRepository');
const courseRepository = require('../repositories/courseRepository');
const questionRepository = require('../repositories/questionRepository');
const { validateCategory } = require('../validators/categoryValidators');
const { serializeCategory } = require('../serializers/categorySerializer');

class CategoryService {
  getAll(filters = {}) {
    return categoryRepository.list(filters).map(serializeCategory);
  }

  getById(id) {
    return serializeCategory(categoryRepository.getById(id));
  }

  create(data) {
    const payload = validateCategory(data);

    if (payload.courseId !== undefined && payload.courseId !== null && payload.courseId !== '') {
      const course = courseRepository.findById(payload.courseId);
      if (!course) {
        throw new Error('Course not found.');
      }
    }

    const existing = categoryRepository.findDuplicateName(payload.name);
    if (existing) {
      throw new Error('A category with this name already exists.');
    }

    const result = categoryRepository.insert(payload);
    return this.getById(result.lastInsertRowid);
  }

  update(id, data) {
    const existing = categoryRepository.findById(id);
    if (!existing) {
      throw new Error('Category not found.');
    }

    const payload = validateCategory({
      name: data.name !== undefined ? data.name : existing.name,
      description: data.description !== undefined ? data.description : existing.description,
      courseId: data.courseId !== undefined ? data.courseId : existing.courseId
    });

    if (payload.courseId !== undefined && payload.courseId !== null && payload.courseId !== '') {
      const course = courseRepository.findById(payload.courseId);
      if (!course) {
        throw new Error('Course not found.');
      }
    }

    const duplicate = categoryRepository.findDuplicateName(payload.name, id);
    if (duplicate) {
      throw new Error('A category with this name already exists.');
    }

    categoryRepository.update(id, payload);
    return this.getById(id);
  }

  delete(id) {
    const existing = categoryRepository.findById(id);
    if (!existing) {
      throw new Error('Category not found.');
    }

    categoryRepository.withTransaction(() => {
      questionRepository.deleteByCategoryId(id);
      categoryRepository.deleteById(id);
    });

    return true;
  }
}

module.exports = new CategoryService();
