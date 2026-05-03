export const API = {
  BASE: '/api',

  token() {
    return localStorage.getItem('quiz_lms_token') || '';
  },

  setSession(session) {
    localStorage.setItem('quiz_lms_token', session.token);
    localStorage.setItem('quiz_lms_user', JSON.stringify(session.user));
    document.cookie = `auth_token=${session.token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Strict`;
  },

  clearSession() {
    localStorage.removeItem('quiz_lms_token');
    localStorage.removeItem('quiz_lms_user');
    document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Strict';
  },

  cachedUser() {
    try {
      return JSON.parse(localStorage.getItem('quiz_lms_user') || 'null');
    } catch (e) {
      return null;
    }
  },

  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (this.token()) headers.Authorization = `Bearer ${this.token()}`;

    const config = { ...options, headers };
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(this.BASE + endpoint, config);
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : {};

    if (!response.ok) {
      if (response.status === 401) this.clearSession();
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  },

  login(identifier, password) { return this.request('/auth/login', { method: 'POST', body: { identifier, password } }); },
  changeCredentials(data) { return this.request('/auth/change-credentials', { method: 'POST', body: data }); },
  requestPasswordReset(username) { return this.request('/auth/password-reset/request', { method: 'POST', body: { username } }); },
  completePasswordReset(data) { return this.request('/auth/password-reset/complete', { method: 'POST', body: data }); },
  logout() { return this.request('/auth/logout', { method: 'POST' }); },
  me() { return this.request('/auth/me'); },

  getUsers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.role) params.set('role', filters.role);
    if (filters.search) params.set('search', filters.search);
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
  markAttendance(id, records) { return this.request(`/academic/attendance/sessions/${id}/records`, { method: 'POST', body: { records } }); },
  getMyAttendance() { return this.request('/academic/attendance/my'); },
  getAttendanceSummary(courseOfferingId) { return this.request(`/academic/attendance/offerings/${courseOfferingId}/summary`); },
  getAdminAnalytics() { return this.request('/analytics/admin'); },

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
  getAttempt(id) { return this.request(`/quizzes/attempts/${id}`); },
  submitAttempt(id, answers, timeSpentSeconds) {
    return this.request(`/quizzes/attempts/${id}/submit`, {
      method: 'POST',
      body: { answers, timeSpentSeconds }
    });
  }
};

window.API = API;
