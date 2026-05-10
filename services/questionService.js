const categoryRepository = require('../repositories/categoryRepository');
const questionRepository = require('../repositories/questionRepository');
const resourceAccessRepository = require('../repositories/resourceAccessRepository');
const { questionDifficultyValues, questionTypeValues } = require('../constants/enums');
const { validateQuestion } = require('../validators/questionValidators');
const { serializeQuestion } = require('../serializers/questionSerializer');
const resourceAccessService = require('./resourceAccessService');
const { forbiddenError, notFoundError } = require('../utils/appError');

class QuestionService {
  getAll(filters = {}) {
    return questionRepository.list(filters, questionTypeValues, questionDifficultyValues).map(q => this.enrichQuestion(serializeQuestion(q)));
  }

  getById(id, user = null) {
    const question = serializeQuestion(questionRepository.getById(id, user));
    return question ? this.enrichQuestion(question) : null;
  }

  getRandom(opts = {}) {
    return questionRepository.getRandom(opts, questionDifficultyValues).map(q => this.enrichQuestion(serializeQuestion(q)));
  }

  enrichQuestion(question) {
    if (!question) return null;
    if (question.type === 'MP') {
      question.parts = questionRepository.getParts(question.id).map(part => ({
        ...part,
        acceptedAnswers: JSON.parse(part.acceptedAnswers || '[]'),
        validationRule: parseJson(part.validationRule, '')
      }));
    }
    if (question.type === 'MT') {
      const config = questionRepository.getTableConfig(question.id);
      if (config) {
        question.tableConfig = {
          columns: JSON.parse(config.columnsJson || '[]'),
          rowCount: config.rowCount,
          prefill: JSON.parse(config.prefillJson || '{}'),
          correctData: JSON.parse(config.correctDataJson || '{}'),
          validation: JSON.parse(config.validationJson || '{}')
        };
      }
    }
    return question;
  }

  create(data, user = null) {
    const payload = validateQuestion(data);
    const category = categoryRepository.findById(payload.categoryId);
    if (!category) {
      throw new Error('Category not found.');
    }

    const actorUserId = data.createdBy || (user ? user.id : null);
    const result = questionRepository.insert(payload, actorUserId);
    const questionId = Number(result.lastInsertRowid);

    // Save parts for multi-part questions
    if (payload.type === 'MP' && Array.isArray(payload.parts)) {
      questionRepository.insertParts(questionId, payload.parts);
    }

    // Save table config for math table questions
    if (payload.type === 'MT' && payload.tableConfig) {
      questionRepository.insertTableConfig(questionId, payload.tableConfig);
    }

    return this.getById(questionId, user);
  }

  update(id, data, user = null) {
    const existing = questionRepository.getById(id);
    if (!existing) {
      throw new Error('Question not found.');
    }
    if (user) this.assertCanWrite(existing, user);

    const enrichedExisting = this.enrichQuestion(serializeQuestion(existing));
    const personalSettings = this.extractPersonalSettings(existing, data, user);
    const sharedData = personalSettings ? { ...data } : data;
    if (personalSettings) {
      delete sharedData.points;
      delete sharedData.gradingType;
    }

    const payload = validateQuestion({
      categoryId: sharedData.categoryId !== undefined ? sharedData.categoryId : existing.categoryId,
      text: sharedData.text !== undefined ? sharedData.text : existing.text,
      type: sharedData.type !== undefined ? sharedData.type : existing.type,
      options: sharedData.options !== undefined ? sharedData.options : JSON.parse(existing.options || '[]'),
      correctAnswer: sharedData.correctAnswer !== undefined ? sharedData.correctAnswer : existing.correctAnswer,
      difficulty: sharedData.difficulty !== undefined ? sharedData.difficulty : existing.difficulty,
      points: sharedData.points !== undefined ? sharedData.points : existing.points,
      richText: sharedData.richText !== undefined ? sharedData.richText : existing.richText,
      explanationText: sharedData.explanationText !== undefined ? sharedData.explanationText : existing.explanationText,
      hintText: sharedData.hintText !== undefined ? sharedData.hintText : existing.hintText,
      mediaUrl: sharedData.mediaUrl !== undefined ? sharedData.mediaUrl : existing.mediaUrl,
      acceptedAnswers: sharedData.acceptedAnswers !== undefined ? sharedData.acceptedAnswers : enrichedExisting.acceptedAnswers,
      caseSensitive: sharedData.caseSensitive !== undefined ? sharedData.caseSensitive : enrichedExisting.caseSensitive,
      gradingType: sharedData.gradingType !== undefined ? sharedData.gradingType : (existing.gradingType || 'standard'),
      parts: sharedData.parts !== undefined ? sharedData.parts : enrichedExisting.parts,
      tableConfig: sharedData.tableConfig !== undefined ? sharedData.tableConfig : enrichedExisting.tableConfig
    });

    const category = categoryRepository.findById(payload.categoryId);
    if (!category) {
      throw new Error('Category not found.');
    }

    questionRepository.update(id, payload, user ? user.id : null);
    if (personalSettings) {
      questionRepository.upsertUserSettings(id, user.id, personalSettings);
    }

    // Update parts
    if (payload.type === 'MP') {
      questionRepository.deleteParts(id);
      if (Array.isArray(payload.parts)) {
        questionRepository.insertParts(id, payload.parts);
      }
    } else {
      questionRepository.deleteParts(id);
    }

    // Update table config
    if (payload.type === 'MT') {
      questionRepository.deleteTableConfig(id);
      if (payload.tableConfig) {
        questionRepository.insertTableConfig(id, payload.tableConfig);
      }
    } else {
      questionRepository.deleteTableConfig(id);
    }

    return this.getById(id, user);
  }

  duplicate(id, user = null) {
    const original = this.getById(id, user);
    if (!original) {
      throw new Error('Question not found.');
    }
    if (user) this.assertCanRead(original, user);

    const data = {
      categoryId: original.categoryId,
      text: `${original.text} (copy)`,
      type: original.type,
      options: original.options,
      correctAnswer: original.correctAnswer,
      difficulty: original.difficulty,
      points: original.points,
      richText: original.richText,
      explanationText: original.explanationText,
      hintText: original.hintText,
      mediaUrl: original.mediaUrl,
      acceptedAnswers: original.acceptedAnswers,
      caseSensitive: original.caseSensitive,
      gradingType: original.gradingType || 'standard',
      parts: original.parts,
      tableConfig: original.tableConfig
    };

    return this.create(data, user);
  }

  delete(id, user = null) {
    const existing = questionRepository.getById(id);
    if (!existing) {
      throw new Error('Question not found.');
    }
    if (user && user.role !== 'admin' && Number(existing.createdBy) !== Number(user.id)) {
      throw forbiddenError('Only the question owner or an admin can delete this question.');
    }

    questionRepository.deleteParts(id);
    questionRepository.deleteTableConfig(id);
    resourceAccessRepository.deleteForResource('question', id);
    questionRepository.deleteById(id);
    return true;
  }

  share(id, data, actor) {
    const question = questionRepository.getById(id);
    if (!question) throw notFoundError('Question not found.');
    this.assertCanWrite(question, actor);
    return resourceAccessService.share('question', id, data, actor);
  }

  accessSummary(id, actor) {
    const question = questionRepository.getById(id);
    if (!question) throw notFoundError('Question not found.');
    this.assertCanWrite(question, actor);
    return resourceAccessService.summary('question', id);
  }

  removeAccess(id, teacherUserId, actor) {
    const question = questionRepository.getById(id);
    if (!question) throw notFoundError('Question not found.');
    this.assertCanWrite(question, actor);
    resourceAccessService.remove('question', id, teacherUserId, actor);
    return this.accessSummary(id, actor);
  }

  assertCanRead(question, user) {
    if (!user || user.role === 'admin') return;
    if (user.role !== 'teacher') throw forbiddenError('Teacher or admin access required.');
    if (this.canRead(question, user)) return;
    throw forbiddenError('Question access required.');
  }

  assertCanWrite(question, user) {
    if (!user || user.role === 'admin') return;
    if (user.role !== 'teacher') throw forbiddenError('Teacher or admin access required.');
    if (Number(question.createdBy) === Number(user.id)) return;
    if (Number(question.categoryCreatedBy || question.categoryOwnerId) === Number(user.id)) return;
    const direct = resourceAccessRepository.findGrant('question', question.id, user.id);
    if (direct && direct.accessLevel === 'write') return;
    const category = question.categoryId ? resourceAccessRepository.findGrant('category', question.categoryId, user.id) : null;
    if (category && category.accessLevel === 'write') return;
    throw forbiddenError('Full question access is required.');
  }

  canRead(question, user) {
    if (!question || !user) return false;
    if (user.role === 'admin') return true;
    if (user.role !== 'teacher') return false;
    if (Number(question.createdBy) === Number(user.id)) return true;
    if (Number(question.categoryCreatedBy || question.categoryOwnerId) === Number(user.id)) return true;
    if (resourceAccessRepository.findGrant('question', question.id, user.id)) return true;
    if (question.categoryId && resourceAccessRepository.findGrant('category', question.categoryId, user.id)) return true;
    return false;
  }

  extractPersonalSettings(existing, data, user) {
    if (!user || user.role !== 'teacher') return null;
    if (Number(existing.createdBy) === Number(user.id)) return null;
    const settings = {};
    if (data.points !== undefined) settings.points = data.points;
    if (data.gradingType !== undefined) settings.gradingType = data.gradingType;
    return Object.keys(settings).length ? settings : null;
  }
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || 'null') || fallback;
  } catch (e) {
    return fallback;
  }
}

module.exports = new QuestionService();
