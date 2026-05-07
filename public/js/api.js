export const API = {
  BASE: '/api',

  async clearSession() {
    try {
      await fetch(`${this.BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'same-origin'
      });
    } catch (e) {
      // The server-set HttpOnly cookie can only be cleared when the API is reachable.
    }
  },

  async request(endpoint, options = {}) {
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers = isFormData
      ? { ...(options.headers || {}) }
      : { 'Content-Type': 'application/json', ...(options.headers || {}) };

    const config = { ...options, headers, credentials: 'same-origin' };
    if (config.body && typeof config.body === 'object' && !isFormData) {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(this.BASE + endpoint, config);
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : {};

    if (!response.ok) {
      if (response.status === 401 && endpoint !== '/auth/logout') await this.clearSession();
      throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
    }

    return data;
  },

  login(identifier, password) { return this.request('/auth/login', { method: 'POST', body: { identifier, password } }); },
  changeCredentials(data) { return this.request('/auth/change-credentials', { method: 'POST', body: data }); },
  requestPasswordReset(identifier) { return this.request('/auth/password-reset/request', { method: 'POST', body: { identifier } }); },
  completePasswordReset(data) { return this.request('/auth/password-reset/complete', { method: 'POST', body: data }); },
  logout() { return this.request('/auth/logout', { method: 'POST' }); },
  me() { return this.request('/auth/me'); },

  getUsers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.role) params.set('role', filters.role);
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.departmentId) params.set('departmentId', filters.departmentId);
    if (filters.classYearId) params.set('classYearId', filters.classYearId);
    if (filters.sectionId) params.set('sectionId', filters.sectionId);
    if (filters.page) params.set('page', filters.page);
    if (filters.limit) params.set('limit', filters.limit);
    return this.request(`/users${params.toString() ? `?${params}` : ''}`);
  },
  createUser(data) { return this.request('/users', { method: 'POST', body: data }); },
  updateUser(id, data) { return this.request(`/users/${id}`, { method: 'PUT', body: data }); },
  updateUserPassword(id, password) { return this.request(`/users/${id}/password`, { method: 'PUT', body: { password } }); },
  deleteUser(id) { return this.request(`/users/${id}`, { method: 'DELETE' }); },
  getPasswordResetRequests() { return this.request('/users/password-reset-requests'); },
  issuePasswordResetCode(id) { return this.request(`/users/${id}/password-reset-code`, { method: 'POST' }); },

  getCourses(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.visibility) params.set('visibility', filters.visibility);
    return this.request(`/courses${params.toString() ? `?${params}` : ''}`);
  },
  getCourse(id) { return this.request(`/courses/${id}`); },
  createCourse(data) { return this.request('/courses', { method: 'POST', body: data }); },
  updateCourse(id, data) { return this.request(`/courses/${id}`, { method: 'PUT', body: data }); },
  deleteCourse(id) { return this.request(`/courses/${id}`, { method: 'DELETE' }); },
  getParticipants(courseId) { return this.request(`/courses/${courseId}/participants`); },
  enroll(courseId, data) { return this.request(`/courses/${courseId}/enrollments`, { method: 'POST', body: data }); },
  updateEnrollment(id, data) { return this.request(`/courses/enrollments/${id}`, { method: 'PUT', body: data }); },
  deleteEnrollment(id) { return this.request(`/courses/enrollments/${id}`, { method: 'DELETE' }); },
  getAnnouncements(courseId) { return this.request(`/courses/${courseId}/announcements`); },
  createAnnouncement(courseId, data) { return this.request(`/courses/${courseId}/announcements`, { method: 'POST', body: data }); },
  deleteAnnouncement(id) { return this.request(`/courses/announcements/${id}`, { method: 'DELETE' }); },
  getResources(courseId) { return this.request(`/courses/${courseId}/resources`); },
  createResource(courseId, data) { return this.request(`/courses/${courseId}/resources`, { method: 'POST', body: data }); },
  deleteResource(id) { return this.request(`/courses/resources/${id}`, { method: 'DELETE' }); },
  getGradebook(courseId) { return this.request(`/courses/${courseId}/gradebook`); },

  getFaculties() { return this.request('/academic/faculties'); },
  createFaculty(data) { return this.request('/academic/faculties', { method: 'POST', body: data }); },
  updateFaculty(id, data) { return this.request(`/academic/faculties/${id}`, { method: 'PUT', body: data }); },
  deleteFaculty(id) { return this.request(`/academic/faculties/${id}`, { method: 'DELETE' }); },
  getDepartments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.facultyId) params.set('facultyId', filters.facultyId);
    return this.request(`/academic/departments${params.toString() ? `?${params}` : ''}`);
  },
  createDepartment(data) { return this.request('/academic/departments', { method: 'POST', body: data }); },
  updateDepartment(id, data) { return this.request(`/academic/departments/${id}`, { method: 'PUT', body: data }); },
  deleteDepartment(id) { return this.request(`/academic/departments/${id}`, { method: 'DELETE' }); },
  getClassYears(filters = {}) {
    const params = new URLSearchParams();
    if (filters.departmentId) params.set('departmentId', filters.departmentId);
    return this.request(`/academic/class-years${params.toString() ? `?${params}` : ''}`);
  },
  createClassYear(data) { return this.request('/academic/class-years', { method: 'POST', body: data }); },
  updateClassYear(id, data) { return this.request(`/academic/class-years/${id}`, { method: 'PUT', body: data }); },
  deleteClassYear(id) { return this.request(`/academic/class-years/${id}`, { method: 'DELETE' }); },
  getSections(filters = {}) {
    const params = new URLSearchParams();
    if (filters.classYearId) params.set('classYearId', filters.classYearId);
    return this.request(`/academic/sections${params.toString() ? `?${params}` : ''}`);
  },
  createSection(data) { return this.request('/academic/sections', { method: 'POST', body: data }); },
  updateSection(id, data) { return this.request(`/academic/sections/${id}`, { method: 'PUT', body: data }); },
  deleteSection(id) { return this.request(`/academic/sections/${id}`, { method: 'DELETE' }); },
  getTerms() { return this.request('/academic/terms'); },
  createTerm(data) { return this.request('/academic/terms', { method: 'POST', body: data }); },
  updateTerm(id, data) { return this.request(`/academic/terms/${id}`, { method: 'PUT', body: data }); },
  setActiveTerm(id) { return this.request(`/academic/terms/${id}/active`, { method: 'POST' }); },
  deleteTerm(id) { return this.request(`/academic/terms/${id}`, { method: 'DELETE' }); },
  getCourseOfferings(filters = {}) {
    const params = new URLSearchParams();
    if (filters.courseId) params.set('courseId', filters.courseId);
    if (filters.termId) params.set('termId', filters.termId);
    if (filters.activeTerm) params.set('activeTerm', 'true');
    return this.request(`/academic/offerings${params.toString() ? `?${params}` : ''}`);
  },
  getCourseOffering(id) { return this.request(`/academic/offerings/${id}`); },
  createCourseOffering(data) { return this.request('/academic/offerings', { method: 'POST', body: data }); },
  updateCourseOffering(id, data) { return this.request(`/academic/offerings/${id}`, { method: 'PUT', body: data }); },
  deleteCourseOffering(id) { return this.request(`/academic/offerings/${id}`, { method: 'DELETE' }); },
  getOfferingEnrollments(id) { return this.request(`/academic/offerings/${id}/enrollments`); },
  enrollOffering(data) { return this.request('/academic/enrollments', { method: 'POST', body: data }); },
  updateOfferingEnrollment(id, data) { return this.request(`/academic/enrollments/${id}`, { method: 'PUT', body: data }); },
  deleteOfferingEnrollment(id) { return this.request(`/academic/enrollments/${id}`, { method: 'DELETE' }); },
  getAssignments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.courseOfferingId) params.set('courseOfferingId', filters.courseOfferingId);
    if (filters.termId) params.set('termId', filters.termId);
    return this.request(`/academic/assignments${params.toString() ? `?${params}` : ''}`);
  },
  getAssignment(id) { return this.request(`/academic/assignments/${id}`); },
  createAssignment(data) { return this.request('/academic/assignments', { method: 'POST', body: data }); },
  updateAssignment(id, data) { return this.request(`/academic/assignments/${id}`, { method: 'PUT', body: data }); },
  deleteAssignment(id) { return this.request(`/academic/assignments/${id}`, { method: 'DELETE' }); },
  submitAssignment(id, data) { return this.request(`/academic/assignments/${id}/submissions`, { method: 'POST', body: data }); },
  getAssignmentSubmissions(id) { return this.request(`/academic/assignments/${id}/submissions`); },
  gradeSubmission(id, data) { return this.request(`/academic/submissions/${id}/grade`, { method: 'PUT', body: data }); },
  getAttendanceSessions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.courseOfferingId) params.set('courseOfferingId', filters.courseOfferingId);
    return this.request(`/academic/attendance/sessions${params.toString() ? `?${params}` : ''}`);
  },
  createAttendanceSession(data) { return this.request('/academic/attendance/sessions', { method: 'POST', body: data }); },
  getAttendanceRecords(id) { return this.request(`/academic/attendance/sessions/${id}/records`); },
  getAttendanceRecordDetails(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.courseOfferingId) params.set('courseOfferingId', filters.courseOfferingId);
    return this.request(`/academic/attendance/records${params.toString() ? `?${params}` : ''}`);
  },
  markAttendance(id, records) { return this.request(`/academic/attendance/sessions/${id}/records`, { method: 'POST', body: { records } }); },
  getMyAttendance() { return this.request('/academic/attendance/my'); },
  getAttendanceSummary(courseOfferingId) { return this.request(`/academic/attendance/offerings/${courseOfferingId}/summary`); },
  getAdminAnalytics() { return this.request('/analytics/admin'); },
  getAuditLogs(limit = 20) { return this.request(`/audit?limit=${encodeURIComponent(limit)}`); },

  getValidationIssues(filters = {}) {
    const params = new URLSearchParams();
    if (filters.entityType) params.set('entityType', filters.entityType);
    if (filters.entityId) params.set('entityId', filters.entityId);
    if (filters.severity) params.set('severity', filters.severity);
    if (filters.status) params.set('status', filters.status);
    if (filters.relatedCourseId) params.set('relatedCourseId', filters.relatedCourseId);
    if (filters.relatedUserId) params.set('relatedUserId', filters.relatedUserId);
    if (filters.page) params.set('page', filters.page);
    if (filters.limit) params.set('limit', filters.limit);
    return this.request(`/issues${params.toString() ? `?${params}` : ''}`);
  },
  createValidationIssue(data) { return this.request('/issues', { method: 'POST', body: data }); },
  updateValidationIssueStatus(id, status) { return this.request(`/issues/${id}/status`, { method: 'PUT', body: { status } }); },

  getRestrictions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.userId) params.set('userId', filters.userId);
    if (filters.restrictionType) params.set('restrictionType', filters.restrictionType);
    if (filters.scopeType) params.set('scopeType', filters.scopeType);
    if (filters.scopeId) params.set('scopeId', filters.scopeId);
    if (filters.activeOnly) params.set('activeOnly', 'true');
    if (filters.page) params.set('page', filters.page);
    if (filters.limit) params.set('limit', filters.limit);
    return this.request(`/restrictions${params.toString() ? `?${params}` : ''}`);
  },
  createRestriction(data) { return this.request('/restrictions', { method: 'POST', body: data }); },
  deactivateRestriction(id) { return this.request(`/restrictions/${id}/deactivate`, { method: 'PUT' }); },

  getImportBatches(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.set('type', filters.type);
    if (filters.status) params.set('status', filters.status);
    if (filters.page) params.set('page', filters.page);
    if (filters.limit) params.set('limit', filters.limit);
    return this.request(`/imports/batches${params.toString() ? `?${params}` : ''}`);
  },
  createImportBatch(data) { return this.request('/imports/batches', { method: 'POST', body: data }); },
  getImportErrors(batchId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.page) params.set('page', filters.page);
    if (filters.limit) params.set('limit', filters.limit);
    return this.request(`/imports/batches/${batchId}/errors${params.toString() ? `?${params}` : ''}`);
  },
  createImportError(batchId, data) { return this.request(`/imports/batches/${batchId}/errors`, { method: 'POST', body: data }); },
  resolveImportError(id, data) { return this.request(`/imports/errors/${id}/resolve`, { method: 'PUT', body: data }); },

  getCourseWeeks(courseId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', filters.page);
    if (filters.limit) params.set('limit', filters.limit);
    return this.request(`/weeks/courses/${courseId}/weeks${params.toString() ? `?${params}` : ''}`);
  },
  createCourseWeek(courseId, data) { return this.request(`/weeks/courses/${courseId}/weeks`, { method: 'POST', body: data }); },
  updateCourseWeek(id, data) { return this.request(`/weeks/weeks/${id}`, { method: 'PUT', body: data }); },
  deleteCourseWeek(id) { return this.request(`/weeks/weeks/${id}`, { method: 'DELETE' }); },
  getWeekResources(weekId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', filters.page);
    if (filters.limit) params.set('limit', filters.limit);
    return this.request(`/weeks/weeks/${weekId}/resources${params.toString() ? `?${params}` : ''}`);
  },
  createWeekResource(weekId, data) { return this.request(`/weeks/weeks/${weekId}/resources`, { method: 'POST', body: data }); },
  deleteWeekResource(id) { return this.request(`/weeks/week-resources/${id}`, { method: 'DELETE' }); },

  getThreads(courseId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.page) params.set('page', filters.page);
    if (filters.limit) params.set('limit', filters.limit);
    return this.request(`/discussion/courses/${courseId}/threads${params.toString() ? `?${params}` : ''}`);
  },
  createThread(courseId, data) { return this.request(`/discussion/courses/${courseId}/threads`, { method: 'POST', body: data }); },
  updateThreadStatus(id, status) { return this.request(`/discussion/threads/${id}/status`, { method: 'PUT', body: { status } }); },
  getThread(id) { return this.request(`/discussion/threads/${id}`); },
  getThreadReplies(id, filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', filters.page);
    if (filters.limit) params.set('limit', filters.limit);
    return this.request(`/discussion/threads/${id}/replies${params.toString() ? `?${params}` : ''}`);
  },
  createThreadReply(id, data) { return this.request(`/discussion/threads/${id}/replies`, { method: 'POST', body: data }); },

  getCategories(filters = {}) {
    const params = new URLSearchParams();
    if (filters.courseId) params.set('courseId', filters.courseId);
    return this.request(`/categories${params.toString() ? `?${params}` : ''}`);
  },
  getCategory(id) { return this.request(`/categories/${id}`); },
  createCategory(data) { return this.request('/categories', { method: 'POST', body: data }); },
  updateCategory(id, data) { return this.request(`/categories/${id}`, { method: 'PUT', body: data }); },
  deleteCategory(id) { return this.request(`/categories/${id}`, { method: 'DELETE' }); },

  getQuestions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.courseId) params.set('courseId', filters.courseId);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.type) params.set('type', filters.type);
    if (filters.search) params.set('search', filters.search);
    return this.request(`/questions${params.toString() ? `?${params}` : ''}`);
  },
  getQuestion(id) { return this.request(`/questions/${id}`); },
  createQuestion(data) { return this.request('/questions', { method: 'POST', body: data }); },
  updateQuestion(id, data) { return this.request(`/questions/${id}`, { method: 'PUT', body: data }); },
  deleteQuestion(id) { return this.request(`/questions/${id}`, { method: 'DELETE' }); },

  getQuizzes(filters = {}) {
    const params = new URLSearchParams();
    if (filters.courseId) params.set('courseId', filters.courseId);
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    return this.request(`/quizzes${params.toString() ? `?${params}` : ''}`);
  },
  getQuiz(id) { return this.request(`/quizzes/${id}`); },
  createQuiz(data) { return this.request('/quizzes', { method: 'POST', body: data }); },
  updateQuiz(id, data) { return this.request(`/quizzes/${id}`, { method: 'PUT', body: data }); },
  deleteQuiz(id) { return this.request(`/quizzes/${id}`, { method: 'DELETE' }); },
  setQuizQuestions(id, questionIds) { return this.request(`/quizzes/${id}/questions`, { method: 'PUT', body: { questionIds } }); },
  getQuizAttempts(id) { return this.request(`/quizzes/${id}/attempts`); },
  startAttempt(id) { return this.request(`/quizzes/${id}/attempts`, { method: 'POST' }); },
  releaseQuizResults(id) { return this.request(`/quizzes/${id}/release-results`, { method: 'POST' }); },
  getAttempt(id) { return this.request(`/quizzes/attempts/${id}`); },
  submitAttempt(id, answers, timeSpentSeconds) {
    return this.request(`/quizzes/attempts/${id}/submit`, {
      method: 'POST',
      body: { answers, timeSpentSeconds }
    });
  },

  // Template CRUD
  getTemplates(filters = {}) {
    const params = new URLSearchParams();
    if (filters.courseId) params.set('courseId', filters.courseId);
    return this.request(`/quizzes/templates${params.toString() ? `?${params}` : ''}`);
  },
  createTemplate(data) { return this.request('/quizzes/templates', { method: 'POST', body: data }); },
  deleteTemplate(id) { return this.request(`/quizzes/templates/${id}`, { method: 'DELETE' }); },
  saveQuizAsTemplate(quizId, data) { return this.request(`/quizzes/${quizId}/save-as-template`, { method: 'POST', body: data }); },

  // Question advanced
  duplicateQuestion(id) { return this.request(`/questions/${id}/duplicate`, { method: 'POST' }); },
  async uploadQuestionImage(file) {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(`${this.BASE}/questions/upload`, {
      method: 'POST',
      credentials: 'same-origin',
      body: form
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data;
  }
};

window.API = API;
