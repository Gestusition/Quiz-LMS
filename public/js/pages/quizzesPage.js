import { API } from '../api.js';
import { value } from '../components/form.js';

export const QuizzesPage = {
  async renderQuizzes() {
    this.setApp(this.loading('Loading quizzes'));

    try {
      const courses = await API.getCourses();
      const selectedCourseId = this.activeQuizCourseId || (courses[0] ? String(courses[0].id) : '');
      this.activeQuizCourseId = selectedCourseId;
      const [quizzes, templates] = await Promise.all([
        API.getQuizzes({ courseId: selectedCourseId }),
        this.canManageLearning() ? API.getTemplates({ courseId: selectedCourseId }) : []
      ]);

      this.setApp(`
        <header class="page-header">
          <div><h1>Quizzes & Exams</h1><p>${quizzes.length} quiz${quizzes.length === 1 ? '' : 'zes'}</p></div>
          ${this.canManageLearning() ? `<div class="header-actions">
            <button class="btn btn-ghost" id="btn-manage-templates">Templates</button>
            <button class="btn btn-primary" id="btn-new-quiz">New Quiz / Exam</button>
          </div>` : ''}
        </header>
        <div class="toolbar">
          <select class="form-select" id="quiz-course-filter">
            ${courses.map(course => `<option value="${course.id}" ${String(course.id) === selectedCourseId ? 'selected' : ''}>${this.esc(course.code)} - ${this.esc(course.title)}</option>`).join('')}
          </select>
          <select class="form-select" id="quiz-status-filter">
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
          <input class="form-input" id="quiz-search" placeholder="Search quizzes...">
        </div>
        <div class="quiz-grid" id="quiz-list">
          ${quizzes.map(quiz => this.quizCard(quiz)).join('') || this.emptyBlock('No quizzes found.')}
        </div>
      `);

      document.getElementById('quiz-course-filter').addEventListener('change', event => {
        this.activeQuizCourseId = event.target.value;
        this.renderQuizzes();
      });

      const filterQuizzes = async () => {
        const filtered = await API.getQuizzes({
          courseId: this.activeQuizCourseId,
          status: document.getElementById('quiz-status-filter').value,
          search: document.getElementById('quiz-search').value
        });
        document.getElementById('quiz-list').innerHTML =
          filtered.map(quiz => this.quizCard(quiz)).join('') || this.emptyBlock('No quizzes found.');
      };
      document.getElementById('quiz-search')?.addEventListener('input', filterQuizzes);
      document.getElementById('quiz-status-filter')?.addEventListener('change', filterQuizzes);

      document.getElementById('btn-new-quiz')?.addEventListener('click', () => this.showQuizForm(null, Number(selectedCourseId)));
      document.getElementById('btn-manage-templates')?.addEventListener('click', () => this.showTemplateManager(Number(selectedCourseId)));
    } catch (err) {
      this.renderError(err);
    }
  },

  quizCard(quiz) {
    const statusMap = { draft: 'status-draft', published: 'status-published', closed: 'status-closed' };
    const statusClass = statusMap[quiz.status] || '';
    const isManager = this.canManageLearning();
    const readOnly = quiz.accessLevel === 'read';
    const canDelete = this.user.role === 'admin' || Number(quiz.createdBy) === Number(this.user.id);
    const attribution = [
      quiz.createdByName ? `Created by ${this.esc(quiz.createdByName)}` : '',
      quiz.updatedByName ? `Edited by ${this.esc(quiz.updatedByName)}` : '',
      quiz.accessLevel ? `${quiz.accessLevel === 'write' ? 'Full access' : 'Read only'}` : ''
    ].filter(Boolean).join(' - ');

    return `
      <div class="quiz-card">
        <div class="quiz-card-header">
          <span class="status-badge ${statusClass}">${quiz.status}</span>
          <span class="quiz-course-tag">${this.esc(quiz.courseCode || '')}</span>
        </div>
        <h3 class="quiz-card-title">${this.esc(quiz.title)}</h3>
        <p class="quiz-card-desc">${this.esc((quiz.description || '').slice(0, 120))}</p>
        ${attribution ? `<small class="muted">${attribution}</small>` : ''}
        <div class="quiz-card-meta">
          <span title="Questions">📋 ${quiz.questionCount || 0}</span>
          <span title="Duration">⏱ ${quiz.durationMinutes || quiz.timeLimitMinutes || 0}m</span>
          <span title="Max score">⭐ ${quiz.maxScore || 0}</span>
          <span title="Attempts">${quiz.maxAttempts || quiz.attemptsAllowed || 1} attempt${(quiz.maxAttempts || 1) > 1 ? 's' : ''}</span>
        </div>
        <div class="quiz-card-actions">
          ${isManager ? `
            ${readOnly ? '' : `<button class="btn btn-ghost btn-sm" onclick="App.showQuizForm(${quiz.id})">Edit</button>
            <button class="btn btn-ghost btn-sm" onclick="App.showAssignQuestions(${quiz.id})">Questions</button>
            <button class="btn btn-ghost btn-sm" onclick="App.showShareQuizForm(${quiz.id})">Shared Access</button>`}
            ${readOnly ? '' : `<button class="btn btn-ghost btn-sm" onclick="App.showQuizAttempts(${quiz.id})">Attempts</button>`}
            ${quiz.showResultPolicy === 'after_manual_release' ? `<button class="btn btn-ghost btn-sm" onclick="App.releaseQuizResults(${quiz.id})">${quiz.manualResultReleasedAt ? 'Results released' : 'Release results'}</button>` : ''}
            ${readOnly ? '' : `<button class="btn btn-ghost btn-sm" onclick="App.saveAsTemplate(${quiz.id})">Save as Template</button>`}
            ${canDelete ? `<button class="btn btn-danger btn-sm" onclick="App.deleteQuiz(${quiz.id})">Delete</button>` : ''}
          ` : `
            ${quiz.isOpen ? `<button class="btn btn-primary btn-sm" onclick="App.startQuizAttempt(${quiz.id})">Start</button>` : ''}
            <button class="btn btn-ghost btn-sm" onclick="App.showQuizAttempts(${quiz.id})">My Attempts</button>
          `}
        </div>
      </div>
    `;
  },

  quizRow(quiz, showCourse = false, manager = false) {
    const duration = quiz.durationMinutes || quiz.timeLimitMinutes || 0;
    const attempts = quiz.maxAttempts || quiz.attemptsAllowed || 1;
    const detail = [
      showCourse ? this.esc(quiz.courseCode || '') : '',
      `${quiz.questionCount || 0} questions`,
      `${quiz.maxScore || 0} points`,
      `${duration} min`,
      `${attempts} attempt${attempts > 1 ? 's' : ''}`
    ].filter(Boolean).join(' - ');
    const statusClass = quiz.status || 'draft';
    const studentActions = this.user.role === 'student'
      ? `${quiz.isOpen && Number(quiz.questionCount || 0) > 0
        ? `<button class="btn btn-primary btn-sm" onclick="App.startQuizAttempt(${quiz.id})">Start</button>`
        : `<button class="btn btn-ghost btn-sm" disabled>${Number(quiz.questionCount || 0) > 0 ? 'Closed' : 'No questions'}</button>`}
        <button class="btn btn-ghost btn-sm" onclick="App.showQuizAttempts(${quiz.id})">My Attempts</button>`
      : '';
    const managerActions = manager
      ? `<button class="btn btn-ghost btn-sm" onclick="App.showQuizForm(${quiz.id})">Edit</button>
        <button class="btn btn-primary btn-sm" onclick="App.showAssignQuestions(${quiz.id})">Questions</button>
        <button class="btn btn-ghost btn-sm" onclick="App.showQuizAttempts(${quiz.id})">Attempts</button>`
      : '';

    return `
      <div class="list-row">
        <div>
          <strong>${this.esc(quiz.title)}</strong>
          <small>${detail}</small>
        </div>
        <div class="row-actions">
          <span class="status ${this.esc(statusClass)}">${this.esc(quiz.status || 'draft')}</span>
          ${studentActions}${managerActions}
        </div>
      </div>
    `;
  },

  async showQuizForm(id, courseId) {
    const courses = await API.getCourses();
    const templates = await API.getTemplates({ courseId });
    const quiz = id ? await API.getQuiz(id) : {
      courseId: courseId || '', title: '', description: '', status: 'draft',
      startAt: '', endAt: '', durationMinutes: 30, maxAttempts: 1,
      shuffleQuestions: false, shuffleOptions: false, showCorrectAnswers: false,
      showResultPolicy: 'immediately', gradingMode: 'standard',
      penaltyEnabled: false, penaltyPerWrong: 0, requiresSeb: false, templateName: ''
    };

    this.openModal(id ? 'Edit quiz' : 'New quiz / exam', `
      <form id="quiz-form" class="stack quiz-form-advanced">
        <div class="form-section">
          <h3>Workflow</h3>
          <div class="workflow-steps">
            <span class="status-chip draft">1 Create draft</span>
            <span class="status-chip">2 Assign questions</span>
            <span class="status-chip">3 Review</span>
            <span class="status-chip published">4 Publish</span>
          </div>
        </div>
        <div class="form-section">
          <h3>Template</h3>
          <select class="form-select" id="quiz-template">
            <option value="">No template (custom)</option>
            ${templates.map(template => `
              <option value="${template.id}" data-template-name="${this.esc(template.name)}" data-defaults='${this.esc(JSON.stringify(template.defaults || {}))}' ${quiz.templateName === template.name ? 'selected' : ''}>
                ${this.esc(template.name)} ${template.isSystem ? '(system)' : template.courseId ? '(course)' : ''}
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form-section">
          <h3>Basic Settings</h3>
          <div class="form-grid">
            <label class="form-field"><span>Course</span><select class="form-select" id="quiz-course">
              ${courses.map(course => `<option value="${course.id}" ${Number(quiz.courseId) === course.id ? 'selected' : ''}>${this.esc(course.code)} - ${this.esc(course.title)}</option>`).join('')}
            </select></label>
            ${this.input('quiz-title', 'Title', quiz.title)}
          </div>
          ${this.textarea('quiz-description', 'Description', quiz.description || '')}
          <label class="form-field"><span>Status</span><select class="form-select" id="quiz-status">
            ${['draft', 'published', 'closed'].map(status => `<option value="${status}" ${quiz.status === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select></label>
        </div>
        <div class="form-section">
          <h3>Timing & Attempts</h3>
          <div class="form-grid">
            ${this.input('quiz-duration', 'Duration (min)', quiz.durationMinutes || 30, 'number')}
            ${this.input('quiz-max-attempts', 'Max attempts', quiz.maxAttempts || 1, 'number')}
            ${this.input('quiz-start', 'Opens at', this.toDateTimeLocal(quiz.startAt || quiz.openAt), 'datetime-local')}
            ${this.input('quiz-end', 'Closes at', this.toDateTimeLocal(quiz.endAt || quiz.closeAt), 'datetime-local')}
          </div>
        </div>
        <div class="form-section">
          <h3>Behavior</h3>
          <div class="form-grid">
            <label class="form-field"><span>Show results</span><select class="form-select" id="quiz-show-result">
              ${['immediately', 'after_close', 'after_manual_release', 'never'].map(policy => `<option value="${policy}" ${quiz.showResultPolicy === policy ? 'selected' : ''}>${policy.replace(/_/g, ' ')}</option>`).join('')}
            </select></label>
            ${this.input('quiz-penalty-amount', 'Penalty per wrong answer', quiz.penaltyPerWrong || 0, 'number', '', { min: 0, max: 100, step: 'any' })}
          </div>
          <p class="form-hint" style="margin-top:4px;color:var(--text-muted)">Penalty applies to questions set as "Negative marking" grading type. Set per question in Question Bank.</p>
          <div class="check-grid">
            <label class="check-field"><input type="checkbox" id="quiz-shuffle-q" ${quiz.shuffleQuestions ? 'checked' : ''}> Shuffle questions</label>
            <label class="check-field"><input type="checkbox" id="quiz-shuffle-o" ${quiz.shuffleOptions ? 'checked' : ''}> Shuffle options</label>
            <label class="check-field"><input type="checkbox" id="quiz-show-correct" ${quiz.showCorrectAnswers ? 'checked' : ''}> Show correct answers</label>
            <label class="check-field"><input type="checkbox" id="quiz-seb" ${quiz.requiresSeb ? 'checked' : ''}> Require SEB</label>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button class="btn btn-primary">${id ? 'Update' : 'Create'} Quiz</button>
        </div>
      </form>
    `);

    // Template selection applies defaults
    document.getElementById('quiz-template').addEventListener('change', (event) => {
      const opt = event.target.selectedOptions[0];
      if (!opt || !opt.dataset.defaults) return;
      try {
        const defaults = JSON.parse(opt.dataset.defaults);
        if (defaults.durationMinutes) document.getElementById('quiz-duration').value = defaults.durationMinutes;
        if (defaults.maxAttempts) document.getElementById('quiz-max-attempts').value = defaults.maxAttempts;
        if (defaults.showResultPolicy) document.getElementById('quiz-show-result').value = defaults.showResultPolicy;
        document.getElementById('quiz-shuffle-q').checked = !!defaults.shuffleQuestions;
        document.getElementById('quiz-shuffle-o').checked = !!defaults.shuffleOptions;
        document.getElementById('quiz-show-correct').checked = !!defaults.showCorrectAnswers;
        document.getElementById('quiz-seb').checked = !!defaults.requiresSeb;
        if (defaults.penaltyPerWrong) document.getElementById('quiz-penalty-amount').value = defaults.penaltyPerWrong;
      } catch (e) { /* ignore */ }
    });

    document.getElementById('quiz-form').addEventListener('submit', async event => {
      event.preventDefault();
      const data = {
        courseId: Number(value('quiz-course')),
        title: value('quiz-title'),
        description: value('quiz-description'),
        status: value('quiz-status'),
        startAt: value('quiz-start'),
        endAt: value('quiz-end'),
        durationMinutes: Number(value('quiz-duration')),
        maxAttempts: Number(value('quiz-max-attempts')),
        shuffleQuestions: document.getElementById('quiz-shuffle-q').checked,
        shuffleOptions: document.getElementById('quiz-shuffle-o').checked,
        showCorrectAnswers: document.getElementById('quiz-show-correct').checked,
        showResultPolicy: value('quiz-show-result'),
        penaltyPerWrong: Number(value('quiz-penalty-amount') || 0),
        requiresSeb: document.getElementById('quiz-seb').checked,
        templateName: document.getElementById('quiz-template').selectedOptions[0]?.dataset.templateName || ''
      };

      try {
        if (!id && data.status === 'published') {
          this.toast('Create the quiz as a draft, assign questions, then publish.', 'error');
          return;
        }
        const saved = id ? await API.updateQuiz(id, data) : await API.createQuiz(data);
        this.closeModal();
        this.renderQuizzes();
        if (!id && confirm('Quiz created. Assign questions now?')) {
          this.showAssignQuestions(saved.id);
        }
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  async showAssignQuestions(quizId) {
    const quiz = await API.getQuiz(quizId);
    const [allQuestions, categories] = await Promise.all([
      API.getQuestions({ courseId: quiz.courseId }),
      API.getCategories({ courseId: quiz.courseId })
    ]);
    const assignedIds = new Set((quiz.questions || []).map(q => q.id));

    // Build a map of categoryId -> category for quick lookup
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    // Difficulty badge helper
    const diffBadge = (diff) => {
      if (!diff) return '';
      const cls = diff.toLowerCase();
      return `<span class="diff-badge-mini diff-${cls}">${diff}</span>`;
    };

    // Helper: render available questions grouped by category
    const renderAvailableGrouped = (questions, selectedCategoryId, selectedDifficulty) => {
      let available = questions.filter(q => !this._assignedIds.has(q.id));
      if (selectedCategoryId) {
        available = available.filter(q => String(q.categoryId) === String(selectedCategoryId));
      }
      if (selectedDifficulty) {
        available = available.filter(q => q.difficulty === selectedDifficulty);
      }

      if (available.length === 0) return '<p class="muted">No available questions.</p>';

      // Group by category
      const grouped = new Map();
      for (const q of available) {
        const catId = q.categoryId || 0;
        if (!grouped.has(catId)) grouped.set(catId, []);
        grouped.get(catId).push(q);
      }

      let html = '';
      for (const [catId, catQuestions] of grouped) {
        const catName = (categoryMap.get(catId) || {}).name || 'Uncategorized';
        const totalPts = Math.round(catQuestions.reduce((sum, q) => sum + (q.points || 0), 0) * 100) / 100;
        html += `
          <div class="category-group" data-category-id="${catId}">
            <div class="category-group-header" onclick="this.parentElement.classList.toggle('collapsed')">
              <span class="category-group-toggle">▾</span>
              <strong>${this.esc(catName)}</strong>
              <span class="category-group-meta">${catQuestions.length} question${catQuestions.length !== 1 ? 's' : ''} · ${totalPts} pts</span>
            </div>
            <div class="category-group-body">
              ${catQuestions.map(q => `
                <div class="question-mini-item" data-id="${q.id}" data-category="${catId}">
                  <button class="btn btn-ghost btn-sm" onclick="App.addAssigned(${q.id})">+</button>
                  <span class="type-badge-sm">${q.type}</span>
                  ${diffBadge(q.difficulty)}
                  <span>${this.esc(q.text.slice(0, 55))}</span>
                  ${q.gradingType === 'negative' ? '<span class="grading-badge grading-negative" title="Negative marking">➖</span>' : q.gradingType === 'manual' ? '<span class="grading-badge grading-manual" title="Manual grading">📝</span>' : ''}
                  <span class="pts">${Math.round(q.points * 100) / 100} pts</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
      return html;
    };

    this._assignedIds = new Set(assignedIds);
    this._quizId = quizId;
    this._allQuestions = allQuestions;
    this._categories = categories;

    this.openModal('Assign questions to ' + quiz.title, `
      <div class="assign-questions-panel">
        <div class="assigned-section">
          <div class="assigned-header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="margin: 0;">Assigned (<span id="assigned-count">${assignedIds.size}</span>)</h3>
            <div class="qb-points-bar" style="margin: 0; padding: 4px 8px; border-radius: 6px; display: flex; align-items: center; gap: 12px; background: var(--bg-surface-alt); border: 1px solid var(--border);">
              <span class="qb-points-total" style="font-size: 0.85rem;">Total: <strong id="assign-total-pts-display">0.00 pts</strong></span>
              <button type="button" class="btn btn-sm btn-outline" id="btn-assign-sync-100" title="Distribute 100 points proportionally" style="padding: 2px 8px; font-size: 0.8rem;">⚖️ Sync to 100</button>
            </div>
          </div>
          <div id="assigned-list" class="question-mini-list">
            ${(quiz.questions || []).map(q => `
              <div class="question-mini-item assigned" data-id="${q.id}">
                <button class="btn btn-ghost btn-sm" onclick="App.removeAssigned(${q.id})">✕</button>
                <span class="type-badge-sm">${q.type}</span>
                ${diffBadge(q.difficulty)}
                <span>${this.esc(q.text.slice(0, 55))}</span>
                ${q.gradingType === 'negative' ? '<span class="grading-badge grading-negative" title="Negative marking">➖</span>' : q.gradingType === 'manual' ? '<span class="grading-badge grading-manual" title="Manual grading">📝</span>' : ''}
                <span class="pts-container"><input type="number" class="form-input qb-card-pts-input assign-pts-input" value="${Math.round(q.points * 100) / 100}" min="0.1" max="100" step="any" style="width: 70px; display: inline-block; padding: 2px 6px; height: 28px;"> pts</span>
              </div>
            `).join('') || '<p class="muted">No questions assigned.</p>'}
          </div>
        </div>
        <div class="available-section">
          <h3>Available</h3>
          <div class="assign-filters">
            <select class="form-select" id="assign-category-filter">
              <option value="">All Categories</option>
              ${categories.map(c => {
                const count = allQuestions.filter(q => q.categoryId === c.id && !assignedIds.has(q.id)).length;
                return `<option value="${c.id}">${this.esc(c.name)} (${count})</option>`;
              }).join('')}
            </select>
            <select class="form-select" id="assign-difficulty-filter">
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <input class="form-input" id="assign-search" placeholder="Search...">
          </div>
          <div id="available-list" class="question-mini-list">
            ${renderAvailableGrouped(allQuestions, '', '')}
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button class="btn btn-primary" id="btn-save-assign">Save</button>
        </div>
      </div>
    `);

    // After modal renders, give the available-list a concrete pixel height
    // so overflow-y creates a real scrollbar.
    requestAnimationFrame(() => {
      const modal = document.getElementById('modal');
      const availableList = document.getElementById('available-list');
      if (!modal || !availableList) return;

      // Set a concrete pixel height on the list
      const listHeight = 340;
      availableList.style.height = listHeight + 'px';
      availableList.style.maxHeight = listHeight + 'px';
      availableList.style.overflowY = 'scroll';
      availableList.style.overflowX = 'hidden';
      availableList.style.display = 'block';

      // Prevent mouse wheel from bubbling to the modal when inside the list
      availableList.addEventListener('wheel', (e) => {
        const { scrollTop, scrollHeight, clientHeight } = availableList;
        const atTop = scrollTop === 0 && e.deltaY < 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
        if (!atTop && !atBottom) {
          e.stopPropagation();
        }
      }, { passive: true });
    });

    // Re-render available list based on filters
    const refreshAvailable = () => {
      const searchTerm = (document.getElementById('assign-search')?.value || '').toLowerCase();
      const catFilter = document.getElementById('assign-category-filter')?.value || '';
      const diffFilter = document.getElementById('assign-difficulty-filter')?.value || '';
      const filtered = searchTerm
        ? this._allQuestions.filter(q => q.text.toLowerCase().includes(searchTerm))
        : this._allQuestions;
      const el = document.getElementById('available-list');
      if (el) {
        el.innerHTML = renderAvailableGrouped(filtered, catFilter, diffFilter);
      }
    };

    this._refreshAvailable = refreshAvailable;

    document.getElementById('assign-category-filter')?.addEventListener('change', refreshAvailable);
    document.getElementById('assign-difficulty-filter')?.addEventListener('change', refreshAvailable);
    document.getElementById('assign-search')?.addEventListener('input', refreshAvailable);

    // Total updating
    const updateAssignTotal = () => {
      const inputs = Array.from(document.querySelectorAll('#assigned-list .assign-pts-input'));
      let sum = inputs.reduce((acc, input) => acc + (parseFloat(input.value) || 0), 0);
      sum = Math.round(sum * 100) / 100;
      const display = document.getElementById('assign-total-pts-display');
      if (display) {
        display.textContent = sum.toFixed(2) + ' pts';
        display.className = sum > 100 ? 'qb-over-100' : '';
      }
    };
    this._updateAssignTotal = updateAssignTotal;

    document.getElementById('assigned-list')?.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('assign-pts-input')) {
        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
          e.preventDefault();
        }
      }
    });

    document.getElementById('assigned-list')?.addEventListener('input', (e) => {
      if (e.target.classList.contains('assign-pts-input')) {
        e.target.dataset.edited = 'true';
        let val = Number(e.target.value);
        if (val > 100) e.target.value = 100;
        if (val < 0 && e.target.value !== '') e.target.value = Math.abs(val);
        updateAssignTotal();
      }
    });

    document.getElementById('assigned-list')?.addEventListener('change', (e) => {
      if (e.target.classList.contains('assign-pts-input')) {
        let val = Number(e.target.value) || 0;
        if (val < 0.1) e.target.value = 0.1;
        if (val > 100) e.target.value = 100;
        updateAssignTotal();
      }
    });

    document.getElementById('btn-assign-sync-100')?.addEventListener('click', () => {
      const inputs = Array.from(document.querySelectorAll('#assigned-list .assign-pts-input'));
      if (inputs.length === 0) return;

      const lockedInputs = inputs.filter(inp => inp.dataset.edited === 'true');
      const unlockedInputs = inputs.filter(inp => inp.dataset.edited !== 'true');
      const lockedSum = lockedInputs.reduce((sum, inp) => sum + (parseFloat(inp.value) || 0), 0);
      
      if (unlockedInputs.length > 0 && lockedSum < 100) {
        const remainingBudget = 100 - lockedSum;
        const perQuestion = remainingBudget / unlockedInputs.length;
        let currentSum = 0;
        unlockedInputs.forEach((inp, idx) => {
          if (idx === unlockedInputs.length - 1) {
            inp.value = (Math.round((remainingBudget - currentSum) * 100) / 100).toFixed(2);
          } else {
            const val = Math.round(perQuestion * 100) / 100;
            inp.value = val.toFixed(2);
            currentSum += val;
          }
          inp.dataset.edited = 'true';
        });
      } else {
        // Proportionally scale ALL inputs
        const currentTotal = inputs.reduce((sum, inp) => sum + (parseFloat(inp.value) || 0), 0);
        
        if (currentTotal === 0) {
          const perQuestion = 100 / inputs.length;
          let currentSum = 0;
          inputs.forEach((inp, idx) => {
            if (idx === inputs.length - 1) {
              inp.value = (Math.round((100 - currentSum) * 100) / 100).toFixed(2);
            } else {
              const val = Math.round(perQuestion * 100) / 100;
              inp.value = val.toFixed(2);
              currentSum += val;
            }
          });
        } else {
          let currentSum = 0;
          inputs.forEach((inp, idx) => {
            const currentVal = parseFloat(inp.value) || 0;
            if (idx === inputs.length - 1) {
              inp.value = (Math.round((100 - currentSum) * 100) / 100).toFixed(2);
            } else {
              const val = Math.round((currentVal / currentTotal * 100) * 100) / 100;
              inp.value = val.toFixed(2);
              currentSum += val;
            }
          });
        }
        inputs.forEach(inp => {
          inp.dataset.edited = 'true';
        });
      }
      updateAssignTotal();
    });

    document.getElementById('btn-save-assign')?.addEventListener('click', async () => {
      try {
        const payloadQuestions = [];
        document.querySelectorAll('#assigned-list .question-mini-item.assigned').forEach(item => {
          const id = Number(item.dataset.id);
          const points = parseFloat(item.querySelector('.assign-pts-input')?.value || 1);
          if (id) payloadQuestions.push({ id, points });
        });
        
        await API.setQuizQuestions(this._quizId, payloadQuestions);
        this.closeModal();
        this.renderQuizzes();
        this.toast('Questions assigned.', 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });

    // Run initial total calculation
    requestAnimationFrame(updateAssignTotal);
  },

  addAssigned(questionId) {
    this._assignedIds.add(questionId);
    const item = document.querySelector(`.question-mini-item[data-id="${questionId}"]`);
    if (item) {
      item.classList.add('assigned');
      item.querySelector('button').textContent = '✕';
      item.querySelector('button').setAttribute('onclick', `App.removeAssigned(${questionId})`);
      const ptsSpan = item.querySelector('.pts');
      if (ptsSpan) {
        const ptsValue = parseFloat(ptsSpan.textContent);
        ptsSpan.outerHTML = `<span class="pts-container"><input type="number" class="form-input qb-card-pts-input assign-pts-input" value="${ptsValue}" min="0.1" max="100" step="any" style="width: 70px; display: inline-block; padding: 2px 6px; height: 28px;"> pts</span>`;
      }
      document.getElementById('assigned-list')?.appendChild(item);
      // Remove "No questions assigned" placeholder if present
      const placeholder = document.querySelector('#assigned-list .muted');
      if (placeholder) placeholder.remove();
    }
    // Update count
    const countEl = document.getElementById('assigned-count');
    if (countEl) countEl.textContent = this._assignedIds.size;
    // Refresh the available grouped list
    if (this._refreshAvailable) this._refreshAvailable();
    if (this._updateAssignTotal) this._updateAssignTotal();
  },

  removeAssigned(questionId) {
    this._assignedIds.delete(questionId);
    // Remove the item from assigned list
    const item = document.querySelector(`#assigned-list .question-mini-item[data-id="${questionId}"]`);
    if (item) item.remove();
    // Show placeholder if no questions assigned
    const assignedList = document.getElementById('assigned-list');
    if (assignedList && assignedList.querySelectorAll('.question-mini-item').length === 0) {
      assignedList.innerHTML = '<p class="muted">No questions assigned.</p>';
    }
    // Update count
    const countEl = document.getElementById('assigned-count');
    if (countEl) countEl.textContent = this._assignedIds.size;
    // Refresh the available grouped list
    if (this._refreshAvailable) this._refreshAvailable();
    if (this._updateAssignTotal) this._updateAssignTotal();
  },

  async showQuizAttempts(quizId) {
    try {
      const attempts = await API.getQuizAttempts(quizId);
      this.openModal('Quiz Attempts', `
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Student</th><th>#</th><th>Score</th><th>%</th><th>Grade</th><th>Status</th><th>Time</th><th></th></tr></thead>
            <tbody>${attempts.map(attempt => `
              <tr>
                <td>${this.esc(attempt.studentName || 'You')}</td>
                <td>${attempt.attemptNumber}</td>
                <td>${attempt.score ?? '-'}/${attempt.maxScore ?? '-'}</td>
                <td>${attempt.percentage != null ? attempt.percentage + '%' : '-'}</td>
                <td>${this.esc(attempt.letterGrade || '-')}</td>
                <td><span class="status-badge status-${attempt.status}">${attempt.status}</span></td>
                <td>${attempt.timeSpentSeconds ? Math.round(attempt.timeSpentSeconds / 60) + 'm' : '-'}</td>
                <td>
                  ${attempt.status === 'in_progress' ? `<a class="btn btn-primary btn-sm" href="#/attempt/${attempt.id}">Continue</a>` : ''}
                  ${attempt.status === 'submitted' ? `<a class="btn btn-ghost btn-sm" href="#/attempt/${attempt.id}">Review</a>` : ''}
                </td>
              </tr>
            `).join('') || '<tr><td colspan="8">No attempts yet.</td></tr>'}</tbody>
          </table>
        </div>
      `);
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async releaseQuizResults(quizId) {
    if (!confirm('Release results for this quiz now? Students will be able to see their scores according to the quiz settings.')) return;
    try {
      await API.releaseQuizResults(quizId);
      this.toast('Quiz results released.', 'success');
      this.renderQuizzes();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async startQuizAttempt(quizId) {
    if (!confirm('Start a new attempt?')) return;
    try {
      const attempt = await API.startAttempt(quizId);
      location.hash = `#/attempt/${attempt.id}`;
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async deleteQuiz(id) {
    if (!confirm('Delete this quiz?')) return;
    try {
      await API.deleteQuiz(id);
      this.renderQuizzes();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  showShareQuizForm(id) {
    this.openAccessManager('quiz', id, 'Quiz shared access');
  },

  async saveAsTemplate(quizId) {
    this.openModal('Save as Template', `
      <form id="save-template-form" class="stack">
        ${this.input('template-name', 'Template Name')}
        ${this.textarea('template-desc', 'Description (optional)')}
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button class="btn btn-primary">Save</button>
        </div>
      </form>
    `);
    document.getElementById('save-template-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.saveQuizAsTemplate(quizId, { name: value('template-name'), description: value('template-desc') });
        this.closeModal();
        this.toast('Template saved!', 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  async showTemplateManager(courseId) {
    try {
      const templates = await API.getTemplates({ courseId });
      this.openModal('Manage Templates', `
        <div class="stack">
          <div class="toolbar">
            <button class="btn btn-primary btn-sm" id="btn-create-template">Create Template</button>
          </div>
          <div class="template-list">
            ${templates.map(template => `
              <div class="template-item">
                <div class="template-info">
                  <strong>${this.esc(template.name)}</strong>
                  ${template.isSystem ? '<span class="badge badge-system">System</span>' : '<span class="badge badge-custom">Custom</span>'}
                  ${template.courseId ? '<span class="badge badge-course">Course</span>' : ''}
                  <p class="template-desc">${this.esc(template.description || '')}</p>
                </div>
                <div class="template-actions">
                  ${(!template.isSystem || this.user.role === 'admin') ? `
                    <button class="btn btn-danger btn-sm" onclick="App.deleteTemplate(${template.id})">Delete</button>
                  ` : ''}
                </div>
              </div>
            `).join('') || '<p>No templates found.</p>'}
          </div>
        </div>
      `);
      document.getElementById('btn-create-template')?.addEventListener('click', () => this.showCreateTemplateForm(courseId));
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async showCreateTemplateForm(courseId) {
    this.openModal('Create Template', `
      <form id="create-template-form" class="stack">
        ${this.input('new-template-name', 'Template Name')}
        ${this.textarea('new-template-desc', 'Description')}
        <div class="form-section">
          <h3>Default Settings</h3>
          <div class="form-grid">
            ${this.input('tpl-duration', 'Duration (min)', 30, 'number')}
            ${this.input('tpl-attempts', 'Max attempts', 1, 'number')}
            <label class="form-field"><span>Show results</span><select class="form-select" id="tpl-show-result">
              ${['immediately', 'after_close', 'after_manual_release', 'never'].map(p => `<option value="${p}">${p.replace(/_/g, ' ')}</option>`).join('')}
            </select></label>
            ${this.input('tpl-penalty-amount', 'Penalty per wrong answer', 0, 'number', '', { min: 0, max: 100, step: 'any' })}
          </div>
          <div class="check-grid">
            <label class="check-field"><input type="checkbox" id="tpl-shuffle-q"> Shuffle questions</label>
            <label class="check-field"><input type="checkbox" id="tpl-shuffle-o"> Shuffle options</label>
            <label class="check-field"><input type="checkbox" id="tpl-show-correct"> Show correct answers</label>
            <label class="check-field"><input type="checkbox" id="tpl-seb"> Require SEB</label>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.showTemplateManager(${courseId})">Back</button>
          <button class="btn btn-primary">Create</button>
        </div>
      </form>
    `);
    document.getElementById('create-template-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.createTemplate({
          name: value('new-template-name'),
          description: value('new-template-desc'),
          courseId,
          defaults: {
            durationMinutes: Number(value('tpl-duration') || 30),
            maxAttempts: Number(value('tpl-attempts') || 1),
            showResultPolicy: value('tpl-show-result'),
            shuffleQuestions: document.getElementById('tpl-shuffle-q').checked,
            shuffleOptions: document.getElementById('tpl-shuffle-o').checked,
            showCorrectAnswers: document.getElementById('tpl-show-correct').checked,
            penaltyPerWrong: Number(value('tpl-penalty-amount') || 0),
            requiresSeb: document.getElementById('tpl-seb').checked
          }
        });
        this.toast('Template created!', 'success');
        this.showTemplateManager(courseId);
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  async deleteTemplate(id) {
    if (!confirm('Delete this template?')) return;
    try {
      await API.deleteTemplate(id);
      this.toast('Template deleted.', 'success');
      this.renderQuizzes();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  toDateTimeLocal(valueText) {
    if (!valueText) return '';
    const date = new Date(valueText);
    if (Number.isNaN(date.getTime())) return String(valueText).slice(0, 16);
    const pad = number => String(number).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
};
