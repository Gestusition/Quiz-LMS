function serializeGradebook(gradebook) {
  return gradebook || { quizzes: [], students: [] };
}

module.exports = { serializeGradebook };
