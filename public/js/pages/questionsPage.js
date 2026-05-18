import { API } from '../api.js';
import { value } from '../components/form.js';

const TYPE_LABELS = {
  MC: 'Multiple Choice', TF: 'True / False', FB: 'Fill Blank',
  MT: 'Math Table', MP: 'Multi-Part', SA: 'Numeric',
  ES: 'Essay', OR: 'Ordering', MR: 'Multiple Response'
};
const TYPE_COLORS = {
  MC: '#6366f1', TF: '#10b981', FB: '#f59e0b',
  MT: '#ec4899', MP: '#8b5cf6', SA: '#06b6d4',
  ES: '#64748b', OR: '#f97316', MR: '#14b8a6'
};
const QUESTION_LIMITS = {
  textMax: 2000,
  optionTextMax: 500,
  pointsMax: 100,
  minOptions: 2,
  maxOptions: 6,
  maxMultiResponse: 10,
  maxOrderItems: 20,
  maxTableRows: 15,
  maxTableCols: 8,
  maxParts: 20,
  richTextMax: 10000,
  hintMax: 1000,
  explanationMax: 5000
};
const TABLE_COLUMN_TYPES = ['label', 'input', 'prefill', 'sign'];
const MULTI_PART_ANSWER_TYPES = ['text', 'numeric', 'select', 'sign'];

export const QuestionsPage = {
  async renderQuestionBank() {
    if (!this.canManageLearning()) return this.setApp(this.emptyBlock('Question bank access is restricted.'));
    this.setApp(this.loading('Loading question bank'));

    // Preserve filter state across renders
    if (!this._qbFilters) this._qbFilters = { type: '', difficulty: '', categoryId: '', search: '' };

    try {
      const courses = await API.getCourses();
      const selectedCourseId = this.activeCourseId || (courses[0] ? String(courses[0].id) : '');
      this.activeCourseId = selectedCourseId;
      const [categories, questions] = selectedCourseId
        ? await Promise.all([
            API.getCategories({ courseId: selectedCourseId }), 
            API.getQuestions({ courseId: selectedCourseId, ...this._qbFilters })
          ])
        : [[], []];

      // Count questions by type for filter badges
      const typeCounts = {};
      const diffCounts = {};
      questions.forEach(q => {
        typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
        diffCounts[q.difficulty] = (diffCounts[q.difficulty] || 0) + 1;
      });

      // Build active filters chips HTML
      const buildActiveFilters = () => {
        const f = this._qbFilters;
        const chips = [];
        if (f.type) chips.push(`<span class="qb-filter-chip" data-clear="type"><span class="qb-chip-dot" style="background:${TYPE_COLORS[f.type] || '#64748b'}"></span>${TYPE_LABELS[f.type] || f.type}<button class="qb-chip-x">&times;</button></span>`);
        if (f.difficulty) chips.push(`<span class="qb-filter-chip" data-clear="difficulty"><span class="qb-chip-dot diff-dot-${f.difficulty.toLowerCase()}"></span>${f.difficulty}<button class="qb-chip-x">&times;</button></span>`);
        if (f.categoryId) {
          const cat = categories.find(c => String(c.id) === String(f.categoryId));
          chips.push(`<span class="qb-filter-chip" data-clear="categoryId">📂 ${this.esc(cat ? cat.name : 'Category')}<button class="qb-chip-x">&times;</button></span>`);
        }
        if (f.search) chips.push(`<span class="qb-filter-chip" data-clear="search">🔍 "${this.esc(f.search)}"<button class="qb-chip-x">&times;</button></span>`);
        if (chips.length === 0) return '';
        return `<div class="qb-active-filters">
          <span class="qb-active-label">Active filters:</span>
          ${chips.join('')}
          <button class="qb-clear-all" id="qb-clear-all">Clear all</button>
        </div>`;
      };

      this.setApp(`
        <header class="page-header">
          <div><h1>Question Bank</h1><p>${questions.length} question${questions.length === 1 ? '' : 's'} across ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}</p></div>
          <div class="header-actions">
            <button class="btn btn-ghost" id="btn-new-category">New Category</button>
            <button class="btn btn-primary" id="btn-new-question">New Question</button>
          </div>
        </header>

        <div class="qb-filter-bar">
          <div class="qb-filter-row">
            <div class="qb-filter-group">
              <label class="qb-filter-label">Course</label>
              <select class="form-select" id="question-course-filter">
                ${courses.map(course => `<option value="${course.id}" ${String(course.id) === selectedCourseId ? 'selected' : ''}>${this.esc(course.code)} - ${this.esc(course.title)}</option>`).join('')}
              </select>
            </div>
            <div class="qb-filter-group">
              <label class="qb-filter-label">Type</label>
              <select class="form-select" id="question-type-filter">
                <option value="">All types</option>
                ${Object.entries(TYPE_LABELS).map(([k, v]) => `<option value="${k}" ${this._qbFilters.type === k ? 'selected' : ''}>${v} (${typeCounts[k] || 0})</option>`).join('')}
              </select>
            </div>
            <div class="qb-filter-group">
              <label class="qb-filter-label">Difficulty</label>
              <select class="form-select" id="question-diff-filter">
                <option value="">All levels</option>
                ${['EASY', 'MEDIUM', 'HARD'].map(d => `<option value="${d}" ${this._qbFilters.difficulty === d ? 'selected' : ''}>${d} (${diffCounts[d] || 0})</option>`).join('')}
              </select>
            </div>
            <div class="qb-filter-group">
              <label class="qb-filter-label">Category</label>
              <select class="form-select" id="question-cat-filter">
                <option value="">All categories</option>
                ${categories.map(cat => `<option value="${cat.id}" ${String(this._qbFilters.categoryId) === String(cat.id) ? 'selected' : ''}>${this.esc(cat.name)} (${cat.questionCount})</option>`).join('')}
              </select>
            </div>
            <div class="qb-filter-group qb-search-group">
              <label class="qb-filter-label">Search</label>
              <div class="qb-search-wrap">
                <svg class="qb-search-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
                <input class="form-input qb-search-input" id="question-search" placeholder="Search questions..." value="${this.esc(this._qbFilters.search)}">
              </div>
            </div>
          </div>
          <div id="qb-active-filters-area">${buildActiveFilters()}</div>
        </div>

        <section class="qb-layout">
          <aside class="qb-sidebar">
            <div class="panel">
              <div class="panel-header"><h2>Categories</h2><span class="qb-cat-count">${categories.length}</span></div>
              <div class="list qb-cat-list">${categories.map(category => {
                const readOnly = category.accessLevel === 'read';
                const canDelete = this.user.role === 'admin' || Number(category.createdBy) === Number(this.user.id);
                const canManageAccess = this.user.role === 'admin'
                  || Number(category.createdBy) === Number(this.user.id)
                  || category.accessLevel === 'write';
                const meta = [
                  `${category.questionCount} question${category.questionCount === 1 ? '' : 's'}`,
                  category.createdByName ? `Created by ${this.esc(category.createdByName)}` : '',
                  category.updatedByName ? `Edited by ${this.esc(category.updatedByName)}` : '',
                  category.accessLevel ? `${readOnly ? 'Read only' : 'Full access'}` : ''
                ].filter(Boolean).join(' - ');
                return `
                  <div class="list-row qb-cat-row ${String(this._qbFilters.categoryId) === String(category.id) ? 'qb-cat-active' : ''}" data-cat-id="${category.id}">
                    <div class="qb-cat-info">
                      <strong>${this.esc(category.name)}</strong>
                      <small>${meta}</small>
                    </div>
                    <div class="qb-cat-actions">
                      ${canManageAccess ? `<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); App.showShareCategoryForm(${category.id})" title="Manage shared category access">Shared Access</button>` : ''}
                      ${canDelete ? `<button class="btn btn-ghost btn-sm qb-cat-del" onclick="event.stopPropagation(); App.deleteCategory(${category.id})" title="Delete category">Delete</button>` : ''}
                    </div>
                  </div>
                `;
              }).join('') || this.emptyLine('No categories.')}</div>
            </div>
          </aside>

          <main class="qb-main">
            <div class="qb-results-header">
              <span class="qb-results-count" id="qb-results-count">${questions.length} question${questions.length === 1 ? '' : 's'}</span>
            </div>
            <div class="qb-points-bar" id="qb-points-bar" style="display: ${this._qbFilters.categoryId ? 'flex' : 'none'}">
              <span class="qb-points-total" id="qb-points-total">Total: <span class="qb-total-value" id="qb-total-value">${Math.round(questions.reduce((s, q) => s + (q.points || 0), 0) * 100) / 100}</span> pts</span>
              <button type="button" class="btn-sync-100" id="btn-sync-100" title="Distribute 100 points across visible questions, respecting manually-set values">⚖️ Sync to 100</button>
            </div>
            <div class="qb-question-list" id="question-rows">
              ${questions.map(question => this.questionCard(question)).join('') || this.emptyLine('No questions found.')}
            </div>
          </main>
        </section>
      `);

      // ── Points live-total updater ──
      this._qbUpdateTotal = () => {
        const inputs = document.querySelectorAll('.qb-card-pts-input');
        let total = 0;
        inputs.forEach(inp => { total += Number(inp.value) || 0; });
        
        const roundedTotal = Math.round(total * 100) / 100;
        const totalEl = document.getElementById('qb-total-value');
        const wrapEl = document.getElementById('qb-points-total');
        const barEl = document.getElementById('qb-points-bar');
        
        if (totalEl) totalEl.textContent = roundedTotal;
        if (wrapEl) {
          wrapEl.classList.toggle('qb-over-100', roundedTotal > 100.005);
        }
        if (barEl) {
          barEl.style.display = this._qbFilters.categoryId ? 'flex' : 'none';
        }
      };

      // ── Sync to 100 algorithm ──
      document.getElementById('btn-sync-100')?.addEventListener('click', async () => {
        if (!this._qbFilters.categoryId) {
          this.toast('Please select a specific category first to sync points.', 'warning');
          return;
        }
        const inputs = Array.from(document.querySelectorAll('.qb-card-pts-input'));
        if (inputs.length === 0) return;

        // Find which inputs were manually edited (have a data-edited flag)
        const locked = inputs.filter(inp => inp.dataset.edited === 'true');
        const unlocked = inputs.filter(inp => inp.dataset.edited !== 'true');

        const lockedSum = locked.reduce((s, inp) => s + (Number(inp.value) || 0), 0);

        if (unlocked.length > 0 && lockedSum < 100) {
          const remaining = 100 - lockedSum;
          const perQuestion = remaining / unlocked.length;
          let distributed = 0;
          unlocked.forEach((inp, i) => {
            if (i < unlocked.length - 1) {
              const pts = Math.round(perQuestion * 100) / 100;
              inp.value = pts;
              distributed += pts;
            } else {
              inp.value = Math.round((remaining - distributed) * 100) / 100;
            }
            inp.classList.add('pts-synced');
            setTimeout(() => inp.classList.remove('pts-synced'), 1200);
            inp.dataset.edited = 'true';
          });
        } else {
          // Proportionally scale ALL inputs to sum to 100
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
            inp.classList.add('pts-synced');
            setTimeout(() => inp.classList.remove('pts-synced'), 1200);
            inp.dataset.edited = 'true';
          });
        }

        this._qbUpdateTotal();

        // Save all changed points via API
        const promises = [];
        inputs.forEach(inp => {
          const qId = Number(inp.dataset.qid);
          const pts = Number(inp.value) || 0;
          if (pts !== Number(inp.dataset.original)) {
            promises.push(API.updateQuestion(qId, { points: pts }));
          }
        });
        if (promises.length > 0) {
          try {
            await Promise.all(promises);
            this.toast('Points synced to 100!', 'success');
            // Update original values
            inputs.forEach(inp => { inp.dataset.original = inp.value; });
          } catch (err) {
            this.toast(err.message, 'error');
          }
        }
      });

      // Course filter triggers full reload
      document.getElementById('question-course-filter').addEventListener('change', event => {
        this.activeCourseId = event.target.value;
        this._qbFilters = { type: '', difficulty: '', categoryId: '', search: '' };
        this.renderQuestionBank();
      });

      // Filter logic
      const filterQuestions = async () => {
        this._qbFilters.type = document.getElementById('question-type-filter').value;
        this._qbFilters.difficulty = document.getElementById('question-diff-filter').value;
        this._qbFilters.categoryId = document.getElementById('question-cat-filter').value;
        this._qbFilters.search = document.getElementById('question-search').value;

        const filtered = await API.getQuestions({
          courseId: this.activeCourseId,
          search: this._qbFilters.search || undefined,
          type: this._qbFilters.type || undefined,
          difficulty: this._qbFilters.difficulty || undefined,
          categoryId: this._qbFilters.categoryId || undefined
        });
        document.getElementById('question-rows').innerHTML =
          filtered.map(question => this.questionCard(question)).join('') || this.emptyLine('No questions found.');
        document.getElementById('qb-results-count').textContent = `${filtered.length} question${filtered.length === 1 ? '' : 's'}`;
        document.getElementById('qb-active-filters-area').innerHTML = buildActiveFilters();
        this.bindFilterChips();
        this.bindPointsInputs();
        this._qbUpdateTotal();
      };

      document.getElementById('question-search').addEventListener('input', filterQuestions);
      document.getElementById('question-type-filter').addEventListener('change', filterQuestions);
      document.getElementById('question-diff-filter').addEventListener('change', filterQuestions);
      document.getElementById('question-cat-filter').addEventListener('change', filterQuestions);

      // Category click to filter
      document.querySelectorAll('.qb-cat-row[data-cat-id]').forEach(row => {
        row.addEventListener('click', () => {
          const catId = row.dataset.catId;
          const catFilter = document.getElementById('question-cat-filter');
          catFilter.value = String(this._qbFilters.categoryId) === catId ? '' : catId;
          // Update active state
          document.querySelectorAll('.qb-cat-row').forEach(r => r.classList.remove('qb-cat-active'));
          if (catFilter.value) row.classList.add('qb-cat-active');
          filterQuestions();
        });
      });

      this.bindFilterChips();
      this.bindPointsInputs();
      this._qbUpdateTotal();

      document.getElementById('btn-new-category').addEventListener('click', () => this.showCategoryForm(Number(this.activeCourseId)));
      document.getElementById('btn-new-question').addEventListener('click', () => this.showQuestionForm(null, Number(this.activeCourseId)));
    } catch (err) {
      this.renderError(err);
    }
  },

  bindFilterChips() {
    document.querySelectorAll('.qb-filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.clear;
        this._qbFilters[key] = '';
        const el = document.getElementById({
          type: 'question-type-filter',
          difficulty: 'question-diff-filter',
          categoryId: 'question-cat-filter',
          search: 'question-search'
        }[key]);
        if (el) { el.value = ''; el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input')); }
      });
    });
    document.getElementById('qb-clear-all')?.addEventListener('click', () => {
      this._qbFilters = { type: '', difficulty: '', categoryId: '', search: '' };
      ['question-type-filter', 'question-diff-filter', 'question-cat-filter'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
      });
      const searchEl = document.getElementById('question-search'); if (searchEl) searchEl.value = '';
      document.querySelectorAll('.qb-cat-row').forEach(r => r.classList.remove('qb-cat-active'));
      // trigger filter
      document.getElementById('question-type-filter')?.dispatchEvent(new Event('change'));
    });
  },

  async showCategoryForm(courseId) {
    this.openModal('New category', `
      <form id="category-form" class="stack">
        ${this.input('category-name', 'Name')}
        ${this.textarea('category-description', 'Description')}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Create</button></div>
      </form>
    `);
    document.getElementById('category-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.createCategory({ courseId, name: value('category-name'), description: value('category-description') });
        this.closeModal();
        this.renderQuestionBank();
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  async showQuestionForm(id, courseId) {
    const [categories, question] = await Promise.all([
      API.getCategories({ courseId }),
      id ? API.getQuestion(id) : Promise.resolve({
        categoryId: '', text: '', type: 'MC', options: ['', '', '', ''],
        correctAnswer: '0', difficulty: 'MEDIUM', points: 1,
        richText: '', explanationText: '', hintText: '', mediaUrl: '',
        parts: [], tableConfig: null
      })
    ]);

    this.openModal(id ? 'Edit question' : 'New question', `
      <form id="question-form" class="stack question-form-advanced">
        <div class="form-grid">
          <label class="form-field"><span>Category</span><select class="form-select" id="question-category">
            ${categories.map(category => `<option value="${category.id}" ${Number(question.categoryId) === Number(category.id) ? 'selected' : ''}>${this.esc(category.name)}</option>`).join('')}
          </select></label>
          <label class="form-field"><span>Type</span><select class="form-select" id="question-type">
            ${Object.entries(TYPE_LABELS).map(([k, v]) => `<option value="${k}" ${question.type === k ? 'selected' : ''}>${v}</option>`).join('')}
          </select></label>
          <label class="form-field"><span>Difficulty</span><select class="form-select" id="question-difficulty">
            ${['EASY', 'MEDIUM', 'HARD'].map(level => `<option value="${level}" ${question.difficulty === level ? 'selected' : ''}>${level}</option>`).join('')}
          </select></label>
          <label class="form-field"><span>Grading type</span><select class="form-select" id="question-grading-type">
            ${[['standard', 'Standard'], ['negative', 'Negative marking'], ['manual', 'Manual grading']].map(([val, label]) => `<option value="${val}" ${(question.gradingType || 'standard') === val ? 'selected' : ''}>${label}</option>`).join('')}
          </select></label>
          ${this.input('question-points', 'Points', question.points ?? 1, 'number', '', { step: '0.1', min: '0', max: QUESTION_LIMITS.pointsMax, required: true })}
        </div>
        ${this.textarea('question-text', 'Question text (supports $$LaTeX$$)', question.text)}
        ${this.textarea('question-richtext', 'Extended rich text / LaTeX body (optional)', question.richText || '')}
        <div id="question-answer-fields"></div>
        <details class="form-details">
          <summary>Advanced Options</summary>
          <div class="stack">
            ${this.textarea('question-hint', 'Hint (shown to students)', question.hintText || '')}
            ${this.textarea('question-explanation', 'Explanation (shown after grading)', question.explanationText || '')}
            <label class="form-field"><span>Image / Diagram</span>
              <div class="file-upload-group">
                <input class="form-input" id="question-media-url" placeholder="Image URL or upload below" value="${this.esc(question.mediaUrl || '')}">
                <input type="file" id="question-media-file" accept="image/*" class="file-input">
                <button type="button" class="btn btn-ghost btn-sm" id="btn-upload-media">Upload</button>
              </div>
            </label>
            ${question.mediaUrl ? `<div class="media-preview"><img src="${this.esc(question.mediaUrl)}" alt="Question image"></div>` : ''}
          </div>
        </details>
        <div id="question-preview-area"></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button type="button" class="btn btn-ghost" id="btn-preview-question">Preview</button>
          <button class="btn btn-primary">Save</button>
        </div>
      </form>
    `);

    const renderAnswerFields = () => {
      const type = value('question-type');
      const container = document.getElementById('question-answer-fields');
      if (type === 'MC') {
        const options = question.type === 'MC' ? question.options : ['', '', '', ''];
        container.innerHTML = `
          <div class="stack"><label class="form-field"><span>Options & correct answer</span></label>
            <div class="options-list stack">
              ${options.map((option, index) => `
                <label class="option-field" style="display: flex; gap: 0.5rem; align-items: center;">
                  <input type="radio" name="question-correct" value="${index}" ${String(question.correctAnswer) === String(index) ? 'checked' : ''} title="Mark as correct answer">
                  <input class="form-input question-option" value="${this.esc(option)}" placeholder="Option ${index + 1}" style="flex: 1;">
                  <button type="button" class="btn btn-ghost btn-sm btn-remove-option" style="padding: 0.25rem 0.5rem;" title="Remove option">✕</button>
                </label>
              `).join('')}
            </div>
            <button type="button" class="btn btn-ghost btn-sm" id="btn-add-option">+ Add option</button>
          </div>`;
        document.getElementById('btn-add-option')?.addEventListener('click', () => {
          const opts = document.querySelectorAll('.question-option');
          if (opts.length >= QUESTION_LIMITS.maxOptions) {
            this.toast(`Multiple choice allows at most ${QUESTION_LIMITS.maxOptions} options.`, 'error');
            return;
          }
          const newIndex = opts.length;
          const wrapper = document.createElement('label');
          wrapper.className = 'option-field';
          wrapper.style.cssText = 'display: flex; gap: 0.5rem; align-items: center;';
          wrapper.innerHTML = `<input type="radio" name="question-correct" value="${newIndex}" title="Mark as correct answer"><input class="form-input question-option" placeholder="Option ${newIndex + 1}" style="flex: 1;"><button type="button" class="btn btn-ghost btn-sm btn-remove-option" style="padding: 0.25rem 0.5rem;" title="Remove option">✕</button>`;
          container.querySelector('.options-list').appendChild(wrapper);
        });
      } else if (type === 'TF') {
        container.innerHTML = `<label class="form-field"><span>Correct answer</span><select class="form-select" id="question-answer"><option value="true">true</option><option value="false" ${question.correctAnswer === 'false' ? 'selected' : ''}>false</option></select></label>`;
      } else if (type === 'FB') {
        container.innerHTML = `
          ${this.input('question-answer', 'Correct answer', question.type === 'FB' ? question.correctAnswer : '')}
          <label class="check-field"><input type="checkbox" id="question-case-sensitive" ${question.caseSensitive ? 'checked' : ''}> Case sensitive</label>
        `;
      } else if (type === 'SA') {
        container.innerHTML = `
          ${this.input('question-answer', 'Correct numeric answer', question.type === 'SA' ? question.correctAnswer : '', 'text')}
          <small class="form-hint">Enter the exact numeric answer. Tolerance of 0.1% is applied automatically. Supports scientific notation (e.g. 1.23456E+00).</small>
        `;
      } else if (type === 'MR') {
        const options = question.type === 'MR' ? question.options : ['', '', '', ''];
        const correctSet = new Set(String(question.type === 'MR' ? question.correctAnswer : '').split(',').filter(Boolean));
        container.innerHTML = `
          <div class="stack"><label class="form-field"><span>Options (check all correct)</span></label>
            <div class="options-list stack">
              ${options.map((option, index) => `
                <label class="option-field" style="display: flex; gap: 0.5rem; align-items: center;">
                  <input type="checkbox" name="question-correct-mr" value="${index}" ${correctSet.has(String(index)) ? 'checked' : ''} title="Mark as a correct answer">
                  <input class="form-input question-option" value="${this.esc(option)}" placeholder="Option ${index + 1}" style="flex: 1;">
                  <button type="button" class="btn btn-ghost btn-sm btn-remove-option" style="padding: 0.25rem 0.5rem;" title="Remove option">✕</button>
                </label>
              `).join('')}
            </div>
            <button type="button" class="btn btn-ghost btn-sm" id="btn-add-mr-option">+ Add option</button>
          </div>`;
        document.getElementById('btn-add-mr-option')?.addEventListener('click', () => {
          const opts = document.querySelectorAll('.question-option');
          if (opts.length >= QUESTION_LIMITS.maxMultiResponse) {
            this.toast(`Multiple response allows at most ${QUESTION_LIMITS.maxMultiResponse} options.`, 'error');
            return;
          }
          const newIndex = opts.length;
          const wrapper = document.createElement('label');
          wrapper.className = 'option-field';
          wrapper.style.cssText = 'display: flex; gap: 0.5rem; align-items: center;';
          wrapper.innerHTML = `<input type="checkbox" name="question-correct-mr" value="${newIndex}" title="Mark as a correct answer"><input class="form-input question-option" placeholder="Option ${newIndex + 1}" style="flex: 1;"><button type="button" class="btn btn-ghost btn-sm btn-remove-option" style="padding: 0.25rem 0.5rem;" title="Remove option">✕</button>`;
          container.querySelector('.options-list').appendChild(wrapper);
        });
      } else if (type === 'OR') {
        const options = question.type === 'OR' ? question.options : ['Step 1', 'Step 2', 'Step 3'];
        container.innerHTML = `
          <div class="stack"><label class="form-field"><span>Items in correct order (drag to reorder)</span></label>
            <div id="ordering-items" class="ordering-list stack">
              ${options.map((item, index) => `
                <div class="ordering-item" draggable="true" data-index="${index}" style="display: flex; gap: 0.5rem; align-items: center;">
                  <span class="ordering-handle" style="cursor: grab;">☰</span>
                  <input class="form-input question-option" value="${this.esc(item)}" placeholder="Item ${index + 1}" style="flex: 1;">
                  <button type="button" class="btn btn-ghost btn-sm btn-remove-option" style="padding: 0.25rem 0.5rem;" title="Remove item">✕</button>
                </div>
              `).join('')}
            </div>
            <button type="button" class="btn btn-ghost btn-sm" id="btn-add-order-item">+ Add item</button>
          </div>`;
        document.getElementById('btn-add-order-item')?.addEventListener('click', () => {
          const items = document.querySelectorAll('.ordering-item');
          if (items.length >= QUESTION_LIMITS.maxOrderItems) {
            this.toast(`Ordering questions allow at most ${QUESTION_LIMITS.maxOrderItems} items.`, 'error');
            return;
          }
          const wrapper = document.createElement('div');
          wrapper.className = 'ordering-item';
          wrapper.draggable = true;
          wrapper.dataset.index = items.length;
          wrapper.style.cssText = 'display: flex; gap: 0.5rem; align-items: center;';
          wrapper.innerHTML = `<span class="ordering-handle" style="cursor: grab;">☰</span><input class="form-input question-option" placeholder="Item ${items.length + 1}" style="flex: 1;"><button type="button" class="btn btn-ghost btn-sm btn-remove-option" style="padding: 0.25rem 0.5rem;" title="Remove item">✕</button>`;
          container.querySelector('.ordering-list').appendChild(wrapper);
        });
      } else if (type === 'ES') {
        container.innerHTML = `<p class="form-hint">Essay questions require manual grading. Students will see a large text area.</p>`;
      } else if (type === 'MT') {
        this.renderMathTableBuilder(container, question);
      } else if (type === 'MP') {
        this.renderMultiPartBuilder(container, question);
      }
      
      container.onclick = e => {
        const btn = e.target.closest('.btn-remove-option');
        if (btn) {
          const field = btn.closest('.option-field') || btn.closest('.ordering-item');
          if (field) {
            const list = field.parentElement;
            field.remove();
            
            if (list.classList.contains('options-list')) {
              list.querySelectorAll('.option-field').forEach((el, idx) => {
                const check = el.querySelector('input[type="radio"], input[type="checkbox"]');
                if (check) check.value = idx;
                const inp = el.querySelector('.question-option');
                if (inp) inp.placeholder = `Option ${idx + 1}`;
              });
            } else if (list.classList.contains('ordering-list')) {
              list.querySelectorAll('.ordering-item').forEach((el, idx) => {
                el.dataset.index = idx;
                const inp = el.querySelector('.question-option');
                if (inp) inp.placeholder = `Item ${idx + 1}`;
              });
            }
          }
        }
      };
    };

    renderAnswerFields();
    document.getElementById('question-type').addEventListener('change', renderAnswerFields);

    // File upload handler
    document.getElementById('btn-upload-media')?.addEventListener('click', async () => {
      const fileInput = document.getElementById('question-media-file');
      if (!fileInput.files.length) return this.toast('Select a file first', 'error');
      try {
        const result = await API.uploadQuestionImage(fileInput.files[0]);
        document.getElementById('question-media-url').value = result.url;
        this.toast('Image uploaded', 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });

    // Preview handler
    document.getElementById('btn-preview-question')?.addEventListener('click', () => {
      const previewArea = document.getElementById('question-preview-area');
      previewArea.innerHTML = this.questionPreviewHtml(this.collectQuestionDraft());
      this.renderLatex(previewArea);
    });

    document.getElementById('question-form').addEventListener('submit', async event => {
      event.preventDefault();
      const data = this.collectQuestionDraft();
      const validationMessage = this.validateQuestionDraft(data);

      if (validationMessage) return this.toast(validationMessage, 'error');

      try {
        const payload = this.cleanQuestionDraft(data);
        if (id) await API.updateQuestion(id, payload);
        else await API.createQuestion(payload);
        this.closeModal();
        this.renderQuestionBank();
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  collectQuestionDraft() {
    const type = value('question-type');
    const pointValue = value('question-points');
    const data = {
      categoryId: Number(value('question-category')),
      text: value('question-text'),
      type,
      difficulty: value('question-difficulty'),
      gradingType: value('question-grading-type') || 'standard',
      points: pointValue === '' ? NaN : Number(pointValue),
      options: [],
      correctAnswer: '',
      richText: value('question-richtext') || '',
      explanationText: value('question-explanation') || '',
      hintText: value('question-hint') || '',
      mediaUrl: value('question-media-url') || ''
    };

    if (type === 'MC') {
      const rows = this.collectOptionRows('input[name="question-correct"]');
      const filledRows = rows.filter(row => row.text);
      data.options = filledRows.map(row => row.text);
      const selected = rows.find(row => row.checked);
      const selectedIndex = selected ? filledRows.findIndex(row => row.index === selected.index) : -1;
      data.correctAnswer = selectedIndex >= 0 ? String(selectedIndex) : '';
      data._hasBlankCorrectOption = !!selected && !selected.text;
    } else if (type === 'MR') {
      const rows = this.collectOptionRows('input[name="question-correct-mr"]');
      const filledRows = rows.filter(row => row.text);
      data.options = filledRows.map(row => row.text);
      data.correctAnswer = filledRows
        .map((row, index) => row.checked ? String(index) : '')
        .filter(Boolean)
        .join(',');
      data._hasBlankCorrectOption = rows.some(row => row.checked && !row.text);
    } else if (type === 'OR') {
      data.options = Array.from(document.querySelectorAll('.question-option')).map(input => input.value.trim()).filter(Boolean);
      data.correctAnswer = data.options.map((_, i) => i).join(',');
    } else if (type === 'MT') {
      data.tableConfig = this.collectTableConfig();
      data.correctAnswer = '';
    } else if (type === 'MP') {
      data.parts = this.collectMultiParts();
      data.correctAnswer = '';
    } else {
      data.correctAnswer = value('question-answer') || '';
    }

    if (type === 'FB') {
      data.caseSensitive = document.getElementById('question-case-sensitive')?.checked || false;
    }
    return data;
  },

  collectOptionRows(correctSelector) {
    return Array.from(document.querySelectorAll('.option-field')).map((row, index) => ({
      index,
      text: row.querySelector('.question-option')?.value.trim() || '',
      checked: !!row.querySelector(correctSelector)?.checked
    }));
  },

  cleanQuestionDraft(data) {
    const payload = { ...data };
    delete payload._hasBlankCorrectOption;
    if (payload.tableConfig) {
      payload.tableConfig = { ...payload.tableConfig };
      delete payload.tableConfig._jsonErrors;
    }
    return payload;
  },

  validateQuestionDraft(data) {
    const text = String(data.text || '').trim();
    const gradingTypes = ['standard', 'negative', 'manual'];

    if (!Number.isInteger(data.categoryId) || data.categoryId <= 0) return 'Category is required.';
    if (text.length < 2) return 'Question text must be at least 2 characters.';
    if (text.length > QUESTION_LIMITS.textMax) return `Question text must be ${QUESTION_LIMITS.textMax} characters or less.`;
    if (!['MC', 'TF', 'FB', 'MT', 'MP', 'SA', 'ES', 'OR', 'MR'].includes(data.type)) return 'Question type is invalid.';
    if (!['EASY', 'MEDIUM', 'HARD'].includes(data.difficulty)) return 'Difficulty is invalid.';
    if (!gradingTypes.includes(data.gradingType || 'standard')) return 'Grading type is invalid.';
    if (!Number.isFinite(data.points) || data.points < 0 || data.points > QUESTION_LIMITS.pointsMax) {
      return `Points must be between 0 and ${QUESTION_LIMITS.pointsMax}.`;
    }
    if (String(data.richText || '').length > QUESTION_LIMITS.richTextMax) {
      return `Extended rich text must be ${QUESTION_LIMITS.richTextMax} characters or less.`;
    }
    if (String(data.hintText || '').length > QUESTION_LIMITS.hintMax) {
      return `Hint must be ${QUESTION_LIMITS.hintMax} characters or less.`;
    }
    if (String(data.explanationText || '').length > QUESTION_LIMITS.explanationMax) {
      return `Explanation must be ${QUESTION_LIMITS.explanationMax} characters or less.`;
    }
    if (!this.isValidQuestionMediaUrl(data.mediaUrl)) {
      return 'Image / diagram must be an http(s) URL or a safe /uploads/ path.';
    }

    if (['MC', 'MR', 'OR'].includes(data.type)) {
      const optionLengthError = this.validateOptionLengths(data.options || []);
      if (optionLengthError) return optionLengthError;
    }

    if (data.type === 'MC') return this.validateSingleChoiceDraft(data);
    if (data.type === 'MR') return this.validateMultipleResponseDraft(data);
    if (data.type === 'OR') return this.validateOrderingDraft(data);
    if (data.type === 'TF') return this.validateTrueFalseDraft(data);
    if (data.type === 'FB') return this.validateFillBlankDraft(data);
    if (data.type === 'SA') return this.validateNumericDraft(data);
    if (data.type === 'MT') return this.validateTableDraft(data.tableConfig);
    if (data.type === 'MP') return this.validateMultiPartDraft(data.parts);
    return '';
  },

  validateOptionLengths(options) {
    const index = options.findIndex(option => String(option || '').length > QUESTION_LIMITS.optionTextMax);
    return index >= 0 ? `Option ${index + 1} must be ${QUESTION_LIMITS.optionTextMax} characters or less.` : '';
  },

  validateSingleChoiceDraft(data) {
    const options = data.options || [];
    if (data._hasBlankCorrectOption) return 'The selected correct option must have text.';
    if (options.length < QUESTION_LIMITS.minOptions || options.length > QUESTION_LIMITS.maxOptions) {
      return `Multiple choice questions need ${QUESTION_LIMITS.minOptions}-${QUESTION_LIMITS.maxOptions} options.`;
    }
    if (data.correctAnswer === '') return 'Select a correct answer.';
    const answerIndex = Number(data.correctAnswer);
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) {
      return 'Correct answer must match one of the options.';
    }
    return '';
  },

  validateMultipleResponseDraft(data) {
    const options = data.options || [];
    if (data._hasBlankCorrectOption) return 'Correct answers must have option text.';
    if (options.length < QUESTION_LIMITS.minOptions || options.length > QUESTION_LIMITS.maxMultiResponse) {
      return `Multiple response questions need ${QUESTION_LIMITS.minOptions}-${QUESTION_LIMITS.maxMultiResponse} options.`;
    }
    const indexes = String(data.correctAnswer || '').split(',').map(item => item.trim()).filter(Boolean);
    if (indexes.length === 0) return 'Select at least one correct answer.';
    const seen = new Set();
    for (const item of indexes) {
      if (!/^[0-9]+$/.test(item)) return 'Correct answers must match options.';
      const index = Number(item);
      if (seen.has(index)) return 'Correct answers cannot contain duplicates.';
      if (index < 0 || index >= options.length) return 'Correct answers must match options.';
      seen.add(index);
    }
    return '';
  },

  validateOrderingDraft(data) {
    const options = data.options || [];
    if (options.length < QUESTION_LIMITS.minOptions || options.length > QUESTION_LIMITS.maxOrderItems) {
      return `Ordering questions need ${QUESTION_LIMITS.minOptions}-${QUESTION_LIMITS.maxOrderItems} items.`;
    }
    return '';
  },

  validateTrueFalseDraft(data) {
    const answer = String(data.correctAnswer || '').trim().toLowerCase();
    return ['true', 'false'].includes(answer) ? '' : 'True/false answer must be true or false.';
  },

  validateFillBlankDraft(data) {
    const answer = String(data.correctAnswer || '').trim();
    if (!answer) return 'Correct answer is required.';
    if (answer.length > QUESTION_LIMITS.optionTextMax) {
      return `Correct answer must be ${QUESTION_LIMITS.optionTextMax} characters or less.`;
    }
    return '';
  },

  validateNumericDraft(data) {
    const answer = String(data.correctAnswer || '').trim();
    if (!answer) return 'Correct numeric answer is required.';
    return Number.isFinite(Number(answer)) ? '' : 'Numeric correct answers must be plain numbers.';
  },

  parseJsonObjectField(id, label) {
    const raw = document.getElementById(id)?.value.trim() || '';
    if (!raw) return { value: {}, error: '' };
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { value: {}, error: `${label} must be a JSON object.` };
      }
      return { value: parsed, error: '' };
    } catch (err) {
      return { value: {}, error: `${label} must contain valid JSON.` };
    }
  },

  validateTableDraft(config) {
    if (!config) return 'Table configuration is required for math table questions.';
    if (config._jsonErrors?.length) return config._jsonErrors[0];

    const columns = Array.isArray(config.columns) ? config.columns : [];
    if (columns.length < 1 || columns.length > QUESTION_LIMITS.maxTableCols) {
      return `Table must have 1-${QUESTION_LIMITS.maxTableCols} columns.`;
    }

    for (let index = 0; index < columns.length; index += 1) {
      const column = columns[index];
      const header = String(column.header || '').trim();
      const type = String(column.type || '').trim();
      if (!header || header.length > QUESTION_LIMITS.optionTextMax) {
        return `Column ${index + 1} must have a valid header.`;
      }
      if (!TABLE_COLUMN_TYPES.includes(type)) {
        return `Column ${index + 1} type must be one of: ${TABLE_COLUMN_TYPES.join(', ')}.`;
      }
    }

    const rowCount = Number(config.rowCount);
    if (!Number.isInteger(rowCount) || rowCount < 1 || rowCount > QUESTION_LIMITS.maxTableRows) {
      return `Table must have 1-${QUESTION_LIMITS.maxTableRows} rows.`;
    }

    return this.validateTableCellMap(config.correctData, columns, rowCount, 'Correct answers', true)
      || this.validateTableCellMap(config.prefill, columns, rowCount, 'Pre-filled values', false);
  },

  validateTableCellMap(cellMap, columns, rowCount, label, required) {
    if (!cellMap || typeof cellMap !== 'object' || Array.isArray(cellMap)) {
      return `${label} must be a JSON object.`;
    }
    const entries = Object.entries(cellMap);
    if (required && entries.length === 0) return 'Math table questions require at least one correct cell.';

    for (const [key, cellValue] of entries) {
      const match = /^r([0-9]+)_c([0-9]+)$/.exec(key);
      if (!match) return `${label} cell keys must match r{row}_c{column}.`;
      const row = Number(match[1]);
      const column = Number(match[2]);
      if (row < 0 || row >= rowCount || column < 0 || column >= columns.length) {
        return `${label} cell keys must fit the configured table shape.`;
      }
      if (String(cellValue ?? '').length > QUESTION_LIMITS.optionTextMax) {
        return `${label} values must be ${QUESTION_LIMITS.optionTextMax} characters or less.`;
      }
    }

    return '';
  },

  validateMultiPartDraft(parts) {
    if (!Array.isArray(parts) || parts.length < 1 || parts.length > QUESTION_LIMITS.maxParts) {
      return `Multi-part questions need 1-${QUESTION_LIMITS.maxParts} parts.`;
    }

    for (let index = 0; index < parts.length; index += 1) {
      const part = parts[index];
      const label = String(part.partLabel || '').trim();
      const answerType = String(part.answerType || 'text').trim();
      const correctAnswer = String(part.correctAnswer || '').trim();
      const points = Number(part.points);
      if (!label) return `Part ${index + 1} must have a label.`;
      if (!MULTI_PART_ANSWER_TYPES.includes(answerType)) {
        return `Part ${index + 1} answer type must be one of: ${MULTI_PART_ANSWER_TYPES.join(', ')}.`;
      }
      if (!correctAnswer) return `Part ${index + 1} must have a correct answer.`;
      if (!Number.isFinite(points) || points < 0 || points > QUESTION_LIMITS.pointsMax) {
        return `Part ${index + 1} points must be between 0 and ${QUESTION_LIMITS.pointsMax}.`;
      }
      for (const field of ['partLabel', 'partText', 'correctAnswer']) {
        if (String(part[field] || '').length > QUESTION_LIMITS.optionTextMax) {
          return `Part ${index + 1} ${field} must be ${QUESTION_LIMITS.optionTextMax} characters or less.`;
        }
      }
    }

    return '';
  },

  isValidQuestionMediaUrl(url) {
    const text = String(url || '').trim();
    if (!text) return true;
    if (text.startsWith('/')) return text.startsWith('/uploads/') && !text.includes('\\');
    try {
      const parsed = new URL(text);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch (err) {
      return false;
    }
  },

  questionPreviewHtml(question) {
    return `
      <div class="question-preview-card">
        <h3>Preview</h3>
        <div class="preview-body">${this.esc(question.text || '')}</div>
        ${question.richText ? `<div class="preview-rich">${this.esc(question.richText)}</div>` : ''}
        ${question.mediaUrl ? `<img src="${this.esc(question.mediaUrl)}" class="preview-media" alt="Question image">` : ''}
        ${this.previewAnswerArea(question)}
        ${question.hintText ? `<div class="preview-note"><strong>Hint</strong><p>${this.esc(question.hintText)}</p></div>` : ''}
        ${question.explanationText ? `<div class="preview-note"><strong>Explanation</strong><p>${this.esc(question.explanationText)}</p></div>` : ''}
      </div>
    `;
  },

  previewAnswerArea(question) {
    const options = (question.options || []).filter(Boolean);
    if (question.type === 'MC') {
      return `<div class="preview-options">${options.map((option, index) => `<label><input type="radio" disabled> <span>${this.esc(option || `Option ${index + 1}`)}</span></label>`).join('')}</div>`;
    }
    if (question.type === 'MR') {
      return `<div class="preview-options">${options.map((option, index) => `<label><input type="checkbox" disabled> <span>${this.esc(option || `Option ${index + 1}`)}</span></label>`).join('')}</div>`;
    }
    if (question.type === 'TF') {
      return `<div class="preview-options"><label><input type="radio" disabled> True</label><label><input type="radio" disabled> False</label></div>`;
    }
    if (question.type === 'FB') {
      return `<input class="form-input" disabled placeholder="Type your answer">`;
    }
    if (question.type === 'SA') {
      return `<input class="form-input" disabled placeholder="Numeric answer"><small>LaTeX is for display only. Correct numeric answers should be plain numbers.</small>`;
    }
    if (question.type === 'OR') {
      return `<ol class="preview-ordering">${options.map(option => `<li>${this.esc(option)}</li>`).join('')}</ol>`;
    }
    if (question.type === 'ES') {
      return `<textarea class="form-input" disabled rows="4" placeholder="Essay response"></textarea>`;
    }
    if (question.type === 'MT') {
      const config = question.tableConfig || {};
      const columns = config.columns || [];
      const rows = Array.from({ length: Number(config.rowCount || 1) });
      return `<div class="table-wrap"><table class="table"><thead><tr>${columns.map(col => `<th>${this.esc(col.header || '')}</th>`).join('')}</tr></thead><tbody>${rows.map((_, rowIndex) => `<tr>${columns.map((col, colIndex) => `<td>${col.type === 'input' || col.type === 'sign' ? '<input class="form-input" disabled>' : this.esc((config.prefill || {})[`r${rowIndex}_c${colIndex}`] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    if (question.type === 'MP') {
      return `<div class="preview-parts">${(question.parts || []).map(part => `<div class="list-row"><div><strong>${this.esc(part.partLabel || '')}</strong><small>${this.esc(part.partText || '')}</small></div><input class="form-input" disabled placeholder="${this.esc(part.placeholder || 'Answer')}"></div>`).join('')}</div>`;
    }
    return '';
  },

  renderMathTableBuilder(container, question) {
    const config = question.tableConfig || { columns: [{ header: 'n', type: 'label' }, { header: 'Value', type: 'input' }], rowCount: 3, prefill: {}, correctData: {} };
    container.innerHTML = `
      <div class="stack table-builder">
        <label class="form-field"><span>Table Configuration</span></label>
        <div class="form-grid">
          ${this.input('table-rows', 'Number of rows', config.rowCount, 'number', '', { min: '1', max: QUESTION_LIMITS.maxTableRows, step: '1', required: true })}
        </div>
        <div id="table-columns-editor">
          <label class="form-field"><span>Columns</span></label>
          <div id="table-col-list">
            ${config.columns.map((col, i) => `
              <div class="table-col-item" data-index="${i}">
                <input class="form-input table-col-header" value="${this.esc(col.header || '')}" placeholder="Column header">
                <select class="form-select table-col-type">
                  <option value="label" ${col.type === 'label' ? 'selected' : ''}>Label (row number)</option>
                  <option value="input" ${col.type === 'input' ? 'selected' : ''}>Input field</option>
                  <option value="prefill" ${col.type === 'prefill' ? 'selected' : ''}>Pre-filled</option>
                  <option value="sign" ${col.type === 'sign' ? 'selected' : ''}>Sign (+/-)</option>
                </select>
                <button type="button" class="btn btn-ghost btn-sm" onclick="this.closest('.table-col-item').remove()">✕</button>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn btn-ghost btn-sm" id="btn-add-table-col">+ Add column</button>
        </div>
        <details>
          <summary>Correct answers (JSON)</summary>
          <textarea class="form-input" id="table-correct-data" rows="4" placeholder='{"r0_c1": "1.50000", "r1_c1": "2.30000"}'>${JSON.stringify(config.correctData || {}, null, 2)}</textarea>
        </details>
        <details>
          <summary>Pre-filled values (JSON)</summary>
          <textarea class="form-input" id="table-prefill-data" rows="4" placeholder='{"r0_c0": "1"}'>${JSON.stringify(config.prefill || {}, null, 2)}</textarea>
        </details>
      </div>
    `;
    document.getElementById('btn-add-table-col')?.addEventListener('click', () => {
      const list = document.getElementById('table-col-list');
      const index = list.children.length;
      const div = document.createElement('div');
      div.className = 'table-col-item';
      div.dataset.index = index;
      div.innerHTML = `
        <input class="form-input table-col-header" placeholder="Column header">
        <select class="form-select table-col-type">
          <option value="label">Label (row number)</option>
          <option value="input" selected>Input field</option>
          <option value="prefill">Pre-filled</option>
          <option value="sign">Sign (+/-)</option>
        </select>
        <button type="button" class="btn btn-ghost btn-sm" onclick="this.closest('.table-col-item').remove()">✕</button>
      `;
      list.appendChild(div);
    });
  },

  renderMultiPartBuilder(container, question) {
    const parts = question.parts && question.parts.length > 0 ? question.parts : [
      { partLabel: '(a)', partText: '', answerType: 'text', correctAnswer: '', points: 1 }
    ];
    container.innerHTML = `
      <div class="stack multi-part-builder">
        <label class="form-field"><span>Question Parts</span></label>
        <div id="parts-list">
          ${parts.map((part, i) => this.partEditorRow(part, i)).join('')}
        </div>
        <button type="button" class="btn btn-ghost btn-sm" id="btn-add-part">+ Add part</button>
      </div>
    `;
    document.getElementById('btn-add-part')?.addEventListener('click', () => {
      const list = document.getElementById('parts-list');
      const index = list.children.length;
      const labels = ['(a)', '(b)', '(c)', '(d)', '(e)', '(f)', '(g)', '(h)', '(i)', '(ii)', '(iii)', '(iv)', '(v)'];
      const div = document.createElement('div');
      div.className = 'part-editor-row';
      div.innerHTML = this.partEditorRowInner({ partLabel: labels[index] || `(${index + 1})`, partText: '', answerType: 'text', correctAnswer: '', points: 1 }, index);
      list.appendChild(div);
    });
  },

  partEditorRow(part, index) {
    return `<div class="part-editor-row">${this.partEditorRowInner(part, index)}</div>`;
  },

  partEditorRowInner(part, index) {
    return `
      <div class="part-editor-fields">
        <input class="form-input part-label" value="${this.esc(part.partLabel || '')}" placeholder="Label" style="width:60px">
        <input class="form-input part-text" value="${this.esc(part.partText || '')}" placeholder="Part description (supports $$LaTeX$$)">
        <select class="form-select part-answer-type">
          ${['text', 'numeric', 'select', 'sign'].map(t => `<option value="${t}" ${part.answerType === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
        <input class="form-input part-correct" value="${this.esc(part.correctAnswer || '')}" placeholder="Correct answer">
        <input class="form-input part-points" value="${part.points ?? 1}" placeholder="Pts" type="number" step="0.1" min="0" max="${QUESTION_LIMITS.pointsMax}" style="width:60px">
        <button type="button" class="btn btn-ghost btn-sm" onclick="this.closest('.part-editor-row').remove()">✕</button>
      </div>
    `;
  },

  collectTableConfig() {
    const columns = Array.from(document.querySelectorAll('.table-col-item')).map(item => ({
      header: item.querySelector('.table-col-header').value.trim(),
      type: item.querySelector('.table-col-type').value
    }));
    const correct = this.parseJsonObjectField('table-correct-data', 'Correct answers');
    const prefill = this.parseJsonObjectField('table-prefill-data', 'Pre-filled values');
    return {
      columns,
      rowCount: Number(value('table-rows') || 3),
      prefill: prefill.value,
      correctData: correct.value,
      _jsonErrors: [correct.error, prefill.error].filter(Boolean)
    };
  },

  collectMultiParts() {
    return Array.from(document.querySelectorAll('.part-editor-row')).map(row => ({
      partLabel: row.querySelector('.part-label')?.value || '',
      partText: row.querySelector('.part-text')?.value || '',
      answerType: row.querySelector('.part-answer-type')?.value || 'text',
      correctAnswer: row.querySelector('.part-correct')?.value || '',
      points: row.querySelector('.part-points')?.value === '' ? NaN : Number(row.querySelector('.part-points')?.value || 1)
    }));
  },

  renderLatex(container) {
    if (window.renderMathInElement) {
      window.renderMathInElement(container, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false
      });
    }
  },

  async deleteCategory(id) {
    if (!confirm('Delete this category and its questions?')) return;
    try {
      await API.deleteCategory(id);
      this.renderQuestionBank();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  showShareCategoryForm(id) {
    this.openAccessManager('category', id, 'Category shared access');
  },

  showShareQuestionForm(id) {
    this.openAccessManager('question', id, 'Question shared access');
  },

  accessResourceConfig(type) {
    const configs = {
      category: {
        get: id => API.getCategoryAccess(id),
        share: (id, payload) => API.shareCategory(id, payload),
        remove: (id, teacherId) => API.removeCategoryAccess(id, teacherId)
      },
      question: {
        get: id => API.getQuestionAccess(id),
        share: (id, payload) => API.shareQuestion(id, payload),
        remove: (id, teacherId) => API.removeQuestionAccess(id, teacherId)
      },
      quiz: {
        get: id => API.getQuizAccess(id),
        share: (id, payload) => API.shareQuiz(id, payload),
        remove: (id, teacherId) => API.removeQuizAccess(id, teacherId)
      }
    };
    return configs[type];
  },

  async openAccessManager(type, id, title) {
    const config = this.accessResourceConfig(type);
    if (!config) return;

    this.openModal(title, '<div id="access-manager-root" class="access-manager"></div>');
    const root = document.getElementById('access-manager-root');

    const refresh = async () => {
      root.innerHTML = this.loading('Loading access');
      try {
        const data = await config.get(id);
        root.innerHTML = this.accessManagerHtml(data);
        this.bindAccessManager(root, { id, config, refresh });
      } catch (err) {
        root.innerHTML = `<p class="empty-state">${this.esc(err.message)}</p>`;
      }
    };

    await refresh();
  },

  accessManagerHtml(data) {
    const grants = data.grants || [];
    const history = data.history || [];
    return `
      <form id="share-resource-form" class="access-share-form">
        ${this.input('share-teacher-email', 'Teacher email', '', 'email')}
        <label class="form-field"><span>Shared access</span><select class="form-select" id="share-access-level">
          <option value="read">Read only</option>
          <option value="write">Full access</option>
        </select></label>
        <button class="btn btn-primary">Add or update</button>
      </form>

      <section class="access-section">
        <h3>Current shared access</h3>
        <div class="access-list">
          ${grants.map(grant => `
            <div class="access-row" data-teacher-id="${grant.teacherUserId}">
              <div class="access-person">
                <strong>${this.esc(grant.teacherName || 'Teacher')}</strong>
                <small>${this.esc(grant.teacherEmail || '')}</small>
              </div>
              <select class="form-select access-level-select" data-teacher-email="${this.esc(grant.teacherEmail || '')}">
                <option value="read" ${grant.accessLevel === 'read' ? 'selected' : ''}>Read only</option>
                <option value="write" ${grant.accessLevel === 'write' ? 'selected' : ''}>Full access</option>
              </select>
              <button type="button" class="btn btn-ghost btn-sm access-remove">Remove</button>
            </div>
          `).join('') || '<p class="empty-state">No teachers have access yet.</p>'}
        </div>
      </section>

      <section class="access-section">
        <h3>Shared access history</h3>
        <div class="access-history-list">
          ${history.map(log => `
            <div class="access-history-row">
              <strong>${this.esc(this.accessHistoryText(log))}</strong>
              <small>${this.esc(log.actorName || 'System')} - ${this.esc(this.formatDate(log.createdAt))}</small>
            </div>
          `).join('') || '<p class="empty-state">No access changes recorded yet.</p>'}
        </div>
      </section>
    `;
  },

  bindAccessManager(root, { id, config, refresh }) {
    root.querySelector('#share-resource-form')?.addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await config.share(id, {
          teacherEmail: value('share-teacher-email'),
          accessLevel: value('share-access-level')
        });
        this.toast('Access updated.', 'success');
        await refresh();
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });

    root.querySelectorAll('.access-level-select').forEach(select => {
      select.addEventListener('change', async () => {
        try {
          await config.share(id, {
            teacherEmail: select.dataset.teacherEmail,
            accessLevel: select.value
          });
          this.toast('Access level updated.', 'success');
          await refresh();
        } catch (err) {
          this.toast(err.message, 'error');
          await refresh();
        }
      });
    });

    root.querySelectorAll('.access-remove').forEach(button => {
      button.addEventListener('click', async () => {
        const row = button.closest('.access-row');
        const teacherId = row?.dataset.teacherId;
        if (!teacherId || !confirm('Remove this teacher access?')) return;
        try {
          await config.remove(id, teacherId);
          this.toast('Access removed.', 'success');
          await refresh();
        } catch (err) {
          this.toast(err.message, 'error');
        }
      });
    });
  },

  accessHistoryText(log) {
    const details = log.details || {};
    const teacher = details.teacherEmail || (details.teacherUserId ? `teacher #${details.teacherUserId}` : 'teacher');
    if (log.action.endsWith('_ACCESS_REMOVED')) {
      return `Removed ${teacher}${details.previousAccessLevel ? ` (${details.previousAccessLevel})` : ''}`;
    }
    if (log.action.endsWith('_ACCESS_UPDATED')) {
      const previous = details.previousAccessLevel ? `${details.previousAccessLevel} to ` : '';
      return `Changed ${teacher} from ${previous}${details.accessLevel || 'access'}`;
    }
    return `Shared with ${teacher} as ${details.accessLevel || 'access'}`;
  },

  async deleteQuestion(id) {
    if (!confirm('Delete this question?')) return;
    try {
      await API.deleteQuestion(id);
      this.renderQuestionBank();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async duplicateQuestion(id) {
    try {
      await API.duplicateQuestion(id);
      this.renderQuestionBank();
      this.toast('Question duplicated.', 'success');
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  questionCard(question) {
    const typeColor = TYPE_COLORS[question.type] || '#64748b';
    const typeLabel = TYPE_LABELS[question.type] || question.type;
    const gradingBadge = question.gradingType === 'negative'
      ? '<span class="grading-badge grading-negative" title="Negative marking">➖ Negative</span>'
      : question.gradingType === 'manual'
        ? '<span class="grading-badge grading-manual" title="Manual grading">📝 Manual</span>'
        : '';
    const truncText = question.text.length > 120 ? question.text.slice(0, 120) + '…' : question.text;
    const readOnly = question.accessLevel === 'read';
    const canDelete = this.user.role === 'admin' || Number(question.createdBy) === Number(this.user.id);
    const attribution = [
      question.createdByName ? `Created by ${this.esc(question.createdByName)}` : '',
      question.updatedByName ? `Edited by ${this.esc(question.updatedByName)}` : '',
      question.accessLevel ? `${question.accessLevel === 'write' ? 'Full access' : 'Read only'}` : ''
    ].filter(Boolean).join(' - ');
    return `
      <div class="qb-card" data-qid="${question.id}">
        <div class="qb-card-top">
          <span class="type-badge" style="--type-color: ${typeColor}" title="${this.esc(typeLabel)}">${question.type}</span>
          <span class="diff-badge diff-${question.difficulty.toLowerCase()}">${this.esc(question.difficulty)}</span>
          ${gradingBadge}
          <div class="qb-card-pts-wrap">
            <span class="qb-card-pts-label">pts</span>
            <input type="number" class="qb-card-pts-input" min="0" max="100" step="any"
              value="${question.points}" data-qid="${question.id}" data-original="${question.points}"
              title="Points (max 100)" ${readOnly ? 'disabled' : ''}>
          </div>
        </div>
        <div class="qb-card-body">
          <p class="qb-card-text">${this.esc(truncText)}</p>
          <div class="qb-card-meta">
            <span class="qb-card-category">📂 ${this.esc(question.categoryName || 'Uncategorized')}</span>
            ${question.mediaUrl ? '<span class="badge badge-tiny">📷 Image</span>' : ''}
            ${question.hintText ? '<span class="badge badge-tiny">💡 Hint</span>' : ''}
          </div>
          ${attribution ? `<small class="qb-card-owner">${attribution}</small>` : ''}
        </div>
        <div class="qb-card-actions">
          ${readOnly ? '' : `<button class="btn btn-ghost btn-sm qb-action-edit" onclick="App.showQuestionForm(${question.id}, ${question.courseId})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>`}
          ${readOnly ? '' : `<button class="btn btn-ghost btn-sm" onclick="App.showShareQuestionForm(${question.id})">Shared Access</button>`}
          <button class="btn btn-ghost btn-sm" onclick="App.duplicateQuestion(${question.id})" title="Duplicate">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy
          </button>
          ${!canDelete ? '' : `<button class="btn btn-ghost btn-sm qb-action-delete" onclick="App.deleteQuestion(${question.id})" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Delete
          </button>`}
        </div>
      </div>
    `;
  },

  // Bind change/blur events on inline point inputs in Question Bank cards
  bindPointsInputs() {
    document.querySelectorAll('.qb-card-pts-input').forEach(inp => {
      if (inp.disabled) return;
      inp.addEventListener('keydown', (e) => {
        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
          e.preventDefault();
        }
      });

      // Mark as edited when user manually changes the value
      inp.addEventListener('input', () => {
        inp.dataset.edited = 'true';
        let val = Number(inp.value);
        if (val > 100) inp.value = 100;
        if (val < 0 && inp.value !== '') inp.value = Math.abs(val);
        if (this._qbUpdateTotal) this._qbUpdateTotal();
      });

      // Save on blur if changed
      inp.addEventListener('change', async () => {
        let pts = Number(inp.value) || 0;
        if (pts > 100) { pts = 100; inp.value = 100; }
        if (pts < 0.1) { pts = 0.1; inp.value = 0.1; }
        const qId = Number(inp.dataset.qid);
        const original = Number(inp.dataset.original);
        if (pts === original) return;

        try {
          await API.updateQuestion(qId, { points: pts });
          inp.dataset.original = pts;
          this.toast('Points updated.', 'success');
        } catch (err) {
          this.toast(err.message, 'error');
          inp.value = original;
        }
        if (this._qbUpdateTotal) this._qbUpdateTotal();
      });
    });
  },

  questionTableRow(question) {
    const typeColor = TYPE_COLORS[question.type] || '#64748b';
    const gradingBadge = question.gradingType === 'negative'
      ? '<span class="grading-badge grading-negative" title="Negative marking">➖ Negative</span>'
      : question.gradingType === 'manual'
        ? '<span class="grading-badge grading-manual" title="Manual grading">📝 Manual</span>'
        : '';
    return `
      <tr>
        <td>
          <div class="question-text-cell">${this.esc(question.text.length > 80 ? question.text.slice(0, 80) + '...' : question.text)}</div>
          ${question.mediaUrl ? '<span class="badge badge-tiny">📷</span>' : ''}
          ${question.hintText ? '<span class="badge badge-tiny">💡</span>' : ''}
        </td>
        <td><span class="type-badge" style="--type-color: ${typeColor}">${question.type}</span></td>
        <td>${this.esc(question.categoryName || '-')}</td>
        <td><span class="diff-badge diff-${question.difficulty.toLowerCase()}">${this.esc(question.difficulty)}</span></td>
        <td>${question.points}</td>
        <td>${gradingBadge}</td>
        <td class="table-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.showQuestionForm(${question.id}, ${question.courseId})">Edit</button>
          <button class="btn btn-ghost btn-sm" onclick="App.duplicateQuestion(${question.id})" title="Duplicate">⧉</button>
          <button class="btn btn-danger btn-sm" onclick="App.deleteQuestion(${question.id})">Delete</button>
        </td>
      </tr>
    `;
  }
};
