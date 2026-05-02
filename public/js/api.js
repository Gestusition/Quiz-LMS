const API = {
  BASE: '/api',

  token() {
    return localStorage.getItem('quiz_lms_token') || '';
  },

  setSession(session) {
    localStorage.setItem('quiz_lms_token', session.token);
    localStorage.setItem('quiz_lms_user', JSON.stringify(session.user));
  },

  clearSession() {
    localStorage.removeItem('quiz_lms_token');
    localStorage.removeItem('quiz_lms_user');
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

  login(email, password) { return this.request('/auth/login', { method: 'POST', body: { email, password } }); },
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
  deleteUser(id) { return this.request(`/users/${id}`, { method: 'DELETE' }); },

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
