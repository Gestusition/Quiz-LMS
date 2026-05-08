const categoryRepository = require('../repositories/categoryRepository');
const questionRepository = require('../repositories/questionRepository');
const { questionDifficultyValues, questionTypeValues } = require('../constants/enums');
const { validateQuestion } = require('../validators/questionValidators');
const { serializeQuestion } = require('../serializers/questionSerializer');

class QuestionService {
  getAll(filters = {}) {
    return questionRepository.list(filters, questionTypeValues, questionDifficultyValues).map(q => this.enrichQuestion(serializeQuestion(q)));
  }

  getById(id) {
    const question = serializeQuestion(questionRepository.getById(id));
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

  create(data) {
    const payload = validateQuestion(data);
    const category = categoryRepository.findById(payload.categoryId);
    if (!category) {
      throw new Error('Category not found.');
    }

    const result = questionRepository.insert(payload, data.createdBy);
    const questionId = Number(result.lastInsertRowid);

    // Save parts for multi-part questions
    if (payload.type === 'MP' && Array.isArray(payload.parts)) {
      questionRepository.insertParts(questionId, payload.parts);
    }

    // Save table config for math table questions
    if (payload.type === 'MT' && payload.tableConfig) {
      questionRepository.insertTableConfig(questionId, payload.tableConfig);
    }

    return this.getById(questionId);
  }

  update(id, data) {
    const existing = questionRepository.getById(id);
    if (!existing) {
      throw new Error('Question not found.');
    }
    const enrichedExisting = this.enrichQuestion(serializeQuestion(existing));

    const payload = validateQuestion({
      categoryId: data.categoryId !== undefined ? data.categoryId : existing.categoryId,
      text: data.text !== undefined ? data.text : existing.text,
      type: data.type !== undefined ? data.type : existing.type,
      options: data.options !== undefined ? data.options : JSON.parse(existing.options || '[]'),
      correctAnswer: data.correctAnswer !== undefined ? data.correctAnswer : existing.correctAnswer,
      difficulty: data.difficulty !== undefined ? data.difficulty : existing.difficulty,
      points: data.points !== undefined ? data.points : existing.points,
      richText: data.richText !== undefined ? data.richText : existing.richText,
      explanationText: data.explanationText !== undefined ? data.explanationText : existing.explanationText,
      hintText: data.hintText !== undefined ? data.hintText : existing.hintText,
      mediaUrl: data.mediaUrl !== undefined ? data.mediaUrl : existing.mediaUrl,
      acceptedAnswers: data.acceptedAnswers !== undefined ? data.acceptedAnswers : enrichedExisting.acceptedAnswers,
      caseSensitive: data.caseSensitive !== undefined ? data.caseSensitive : enrichedExisting.caseSensitive,
      gradingType: data.gradingType !== undefined ? data.gradingType : (existing.gradingType || 'standard'),
      parts: data.parts !== undefined ? data.parts : enrichedExisting.parts,
      tableConfig: data.tableConfig !== undefined ? data.tableConfig : enrichedExisting.tableConfig
    });

    const category = categoryRepository.findById(payload.categoryId);
    if (!category) {
      throw new Error('Category not found.');
    }

    questionRepository.update(id, payload);

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

    return this.getById(id);
  }

  duplicate(id) {
    const original = this.getById(id);
    if (!original) {
      throw new Error('Question not found.');
    }

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

    return this.create(data);
  }

  delete(id) {
    const existing = questionRepository.getById(id);
    if (!existing) {
      throw new Error('Question not found.');
    }

    questionRepository.deleteParts(id);
    questionRepository.deleteTableConfig(id);
    questionRepository.deleteById(id);
    return true;
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
