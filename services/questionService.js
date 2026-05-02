const categoryRepository = require('../repositories/categoryRepository');
const questionRepository = require('../repositories/questionRepository');
const { questionDifficultyValues, questionTypeValues } = require('../constants/enums');
const { validateQuestion } = require('../validators/questionValidators');
const { serializeQuestion } = require('../serializers/questionSerializer');

class QuestionService {
  getAll(filters = {}) {
    return questionRepository.list(filters, questionTypeValues, questionDifficultyValues).map(serializeQuestion);
  }

  getById(id) {
    return serializeQuestion(questionRepository.getById(id));
  }

  getRandom(opts = {}) {
    return questionRepository.getRandom(opts, questionDifficultyValues).map(serializeQuestion);
  }

  create(data) {
    const payload = validateQuestion(data);
    const category = categoryRepository.findById(payload.categoryId);
    if (!category) {
      throw new Error('Category not found.');
    }

    const result = questionRepository.insert(payload, data.createdBy);
    return this.getById(result.lastInsertRowid);
  }

  update(id, data) {
    const existing = questionRepository.getById(id);
    if (!existing) {
      throw new Error('Question not found.');
    }

    const payload = validateQuestion({
      categoryId: data.categoryId !== undefined ? data.categoryId : existing.categoryId,
      text: data.text !== undefined ? data.text : existing.text,
      type: data.type !== undefined ? data.type : existing.type,
      options: data.options !== undefined ? data.options : JSON.parse(existing.options || '[]'),
      correctAnswer: data.correctAnswer !== undefined ? data.correctAnswer : existing.correctAnswer,
      difficulty: data.difficulty !== undefined ? data.difficulty : existing.difficulty,
      points: data.points !== undefined ? data.points : existing.points
    });

    const category = categoryRepository.findById(payload.categoryId);
    if (!category) {
      throw new Error('Category not found.');
    }

    questionRepository.update(id, payload);
    return this.getById(id);
  }

  delete(id) {
    const existing = questionRepository.getById(id);
    if (!existing) {
      throw new Error('Question not found.');
    }

    questionRepository.deleteById(id);
    return true;
  }
}

module.exports = new QuestionService();
