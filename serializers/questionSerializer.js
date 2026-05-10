function serializeQuestion(question) {
  if (!question) return null;
  const serialized = {
    ...question,
    options: JSON.parse(question.options || '[]'),
    acceptedAnswers: JSON.parse(question.acceptedAnswers || '[]'),
    caseSensitive: !!question.caseSensitive,
    status: question.status || 'valid',
    validationMessage: question.validationMessage || '',
    richText: question.richText || '',
    explanationText: question.explanationText || '',
    hintText: question.hintText || '',
    mediaUrl: question.mediaUrl || '',
    points: question.viewerPoints !== null && question.viewerPoints !== undefined
      ? Number(question.viewerPoints)
      : Number(question.points || 1),
    gradingType: question.viewerGradingType || question.gradingType || 'standard',
    createdByName: question.createdByName || '',
    updatedByName: question.updatedByName || ''
  };
  delete serialized.viewerPoints;
  delete serialized.viewerGradingType;
  return serialized;
}

module.exports = { serializeQuestion };
