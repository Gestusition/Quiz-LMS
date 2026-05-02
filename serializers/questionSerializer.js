function serializeQuestion(question) {
  if (!question) return null;
  return {
    ...question,
    options: JSON.parse(question.options || '[]')
  };
}

module.exports = { serializeQuestion };
