function serializeQuestion(question) {
  if (!question) return null;
  return {
    ...question,
    options: JSON.parse(question.options || '[]'),
    acceptedAnswers: JSON.parse(question.acceptedAnswers || '[]'),
    caseSensitive: !!question.caseSensitive,
    status: question.status || 'valid',
    validationMessage: question.validationMessage || ''
  };
}

module.exports = { serializeQuestion };
