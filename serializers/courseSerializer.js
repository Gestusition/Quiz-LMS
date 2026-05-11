function serializeCourse(course) {
  if (!course) return null;

  const startDate = cleanDate(course.startDate);
  const endDate = cleanDate(course.endDate);
  const firstWeekStartsAt = cleanDate(course.firstWeekStartsAt);
  const lastWeekEndsAt = cleanDate(course.lastWeekEndsAt);
  const effectiveStartDate = startDate || firstWeekStartsAt;
  const effectiveEndDate = endDate || lastWeekEndsAt;
  const isPrevious = hasEnded(effectiveEndDate);

  return {
    ...course,
    startDate,
    endDate,
    firstWeekStartsAt,
    lastWeekEndsAt,
    effectiveStartDate,
    effectiveEndDate,
    isPrevious,
    lifecycle: isPrevious ? 'previous' : 'current'
  };
}

function cleanDate(value) {
  return String(value || '').trim();
}

function hasEnded(value) {
  const text = cleanDate(value);
  if (!text) return false;
  const endTime = /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? Date.parse(`${text}T23:59:59.999Z`)
    : Date.parse(text);
  return Number.isFinite(endTime) && endTime < Date.now();
}

module.exports = { serializeCourse };
