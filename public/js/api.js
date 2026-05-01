/**
 * API Client — Fetch wrapper for communicating with the backend REST API.
 * All API calls go through this module.
 */
const API = {
  BASE: '/api',

  /**
   * Make a fetch request to the API.
   * @param {string} endpoint - API endpoint (e.g., '/categories').
   * @param {Object} [options] - Fetch options.
   * @returns {Promise<any>} Parsed JSON response.
   */
  async request(endpoint, options = {}) {
    const url = this.BASE + endpoint;
    const config = {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  },

  // ========== Categories ==========
  getCategories() { return this.request('/categories'); },
  getCategory(id) { return this.request(`/categories/${id}`); },
  createCategory(data) { return this.request('/categories', { method: 'POST', body: data }); },
  updateCategory(id, data) { return this.request(`/categories/${id}`, { method: 'PUT', body: data }); },
  deleteCategory(id) { return this.request(`/categories/${id}`, { method: 'DELETE' }); },

  // ========== Questions ==========
  getQuestions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.type) params.set('type', filters.type);
    if (filters.search) params.set('search', filters.search);
    const qs = params.toString();
    return this.request('/questions' + (qs ? '?' + qs : ''));
  },
  getQuestion(id) { return this.request(`/questions/${id}`); },
  createQuestion(data) { return this.request('/questions', { method: 'POST', body: data }); },
  updateQuestion(id, data) { return this.request(`/questions/${id}`, { method: 'PUT', body: data }); },
  deleteQuestion(id) { return this.request(`/questions/${id}`, { method: 'DELETE' }); },
  getRandomQuestions(opts = {}) {
    const params = new URLSearchParams();
    if (opts.categoryId) params.set('categoryId', opts.categoryId);
    if (opts.difficulty) params.set('difficulty', opts.difficulty);
    if (opts.limit) params.set('limit', opts.limit);
    const qs = params.toString();
    return this.request('/questions/random' + (qs ? '?' + qs : ''));
  },
};
