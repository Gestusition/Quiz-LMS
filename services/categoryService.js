const categoryRepository = require('../repositories/categoryRepository');
const courseRepository = require('../repositories/courseRepository');
const questionRepository = require('../repositories/questionRepository');
const resourceAccessRepository = require('../repositories/resourceAccessRepository');
const { validateCategory } = require('../validators/categoryValidators');
const { serializeCategory } = require('../serializers/categorySerializer');
const resourceAccessService = require('./resourceAccessService');
const { forbiddenError, notFoundError } = require('../utils/appError');

class CategoryService {
  getAll(filters = {}) {
    return categoryRepository.list(filters).map(serializeCategory);
  }

  getById(id) {
    return serializeCategory(categoryRepository.getById(id));
  }

  create(data, user = null) {
    const payload = validateCategory(data);

    if (payload.courseId !== undefined && payload.courseId !== null && payload.courseId !== '') {
      const course = courseRepository.findById(payload.courseId);
      if (!course) {
        throw new Error('Course not found.');
      }
    }

    const existing = categoryRepository.findDuplicateName(payload.name, payload.courseId);
    if (existing) {
      throw new Error('A category with this name already exists for this course.');
    }

    const result = categoryRepository.insert(payload, user ? user.id : null);
    return this.getById(result.lastInsertRowid);
  }

  update(id, data, user = null) {
    const existing = categoryRepository.findById(id);
    if (!existing) {
      throw new Error('Category not found.');
    }
    if (user) this.assertCanWrite(existing, user);

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

    const duplicate = categoryRepository.findDuplicateName(payload.name, payload.courseId, id);
    if (duplicate) {
      throw new Error('A category with this name already exists for this course.');
    }

    categoryRepository.update(id, payload, user ? user.id : null);
    return this.getById(id);
  }

  delete(id, user = null) {
    const existing = categoryRepository.findById(id);
    if (!existing) {
      throw new Error('Category not found.');
    }
    if (user && user.role !== 'admin' && Number(existing.createdBy) !== Number(user.id)) {
      throw forbiddenError('Only the category owner or an admin can delete this category.');
    }

    categoryRepository.withTransaction(() => {
      questionRepository.deleteByCategoryId(id);
      resourceAccessRepository.deleteForResource('category', id);
      categoryRepository.deleteById(id);
    });

    return true;
  }

  share(id, data, actor) {
    const category = categoryRepository.findById(id);
    if (!category) throw notFoundError('Category not found.');
    this.assertCanWrite(category, actor);
    return resourceAccessService.share('category', id, data, actor);
  }

  accessSummary(id, actor) {
    const category = categoryRepository.findById(id);
    if (!category) throw notFoundError('Category not found.');
    this.assertCanWrite(category, actor);
    return resourceAccessService.summary('category', id);
  }

  removeAccess(id, teacherUserId, actor) {
    const category = categoryRepository.findById(id);
    if (!category) throw notFoundError('Category not found.');
    this.assertCanWrite(category, actor);
    resourceAccessService.remove('category', id, teacherUserId, actor);
    return this.accessSummary(id, actor);
  }

  assertCanRead(category, user) {
    if (!user || user.role === 'admin') return;
    if (user.role !== 'teacher') throw forbiddenError('Teacher or admin access required.');
    if (Number(category.createdBy) === Number(user.id)) return;
    if (resourceAccessRepository.findGrant('category', category.id, user.id)) return;
    throw forbiddenError('Category access required.');
  }

  assertCanWrite(category, user) {
    if (!user || user.role === 'admin') return;
    if (user.role !== 'teacher') throw forbiddenError('Teacher or admin access required.');
    if (Number(category.createdBy) === Number(user.id)) return;
    const grant = resourceAccessRepository.findGrant('category', category.id, user.id);
    if (grant && grant.accessLevel === 'write') return;
    throw forbiddenError('Full category access is required.');
  }
}

module.exports = new CategoryService();
