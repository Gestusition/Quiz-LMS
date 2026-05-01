/**
 * Questions UI module — Handles rendering and interactions for the Questions page.
 */
const QuestionsPage = {

  currentFilters: {},

  async render() {
    const app = document.getElementById('app');
    let categoriesOptions = '<option value="">All Categories</option>';
    try {
      const cats = await API.getCategories();
      categoriesOptions += cats.map(c => `<option value="${c.id}">${this.esc(c.name)}</option>`).join('');
    } catch (e) { /* ignore */ }

    app.innerHTML = `
      <div class="page-header">
        <div>
          <h1>❓ Questions</h1>
          <p>Manage your quiz question bank</p>
        </div>
        <button class="btn btn-primary" id="btn-add-question">+ New Question</button>
      </div>
      <div class="toolbar">
        <div class="search-box">
          <input type="text" class="form-input" id="search-input" placeholder="Search questions...">
        </div>
        <select class="form-select filter-select" id="filter-category">${categoriesOptions}</select>
        <select class="form-select filter-select" id="filter-difficulty">
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select class="form-select filter-select" id="filter-type">
          <option value="">All Types</option>
          <option value="MC">Multiple Choice</option>
          <option value="TF">True/False</option>
          <option value="FB">Fill Blank</option>
        </select>
      </div>
      <div id="questions-table-container">
        <div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-text">Loading...</div></div>
      </div>
    `;

    document.getElementById('btn-add-question').addEventListener('click', () => this.showForm());
    document.getElementById('search-input').addEventListener('input', () => this.applyFilters());
    document.getElementById('filter-category').addEventListener('change', () => this.applyFilters());
    document.getElementById('filter-difficulty').addEventListener('change', () => this.applyFilters());
    document.getElementById('filter-type').addEventListener('change', () => this.applyFilters());

    await this.loadQuestions();
  },

  applyFilters() {
    this.currentFilters = {
      search: document.getElementById('search-input').value,
      categoryId: document.getElementById('filter-category').value,
      difficulty: document.getElementById('filter-difficulty').value,
      type: document.getElementById('filter-type').value,
    };
    this.loadQuestions();
  },

  async loadQuestions() {
    const container = document.getElementById('questions-table-container');
    try {
      const questions = await API.getQuestions(this.currentFilters);
      if (questions.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❓</div><div class="empty-state-text">No questions found. Create one or adjust filters!</div></div>`;
        return;
      }
      container.innerHTML = `
        <div class="table-container">
          <table class="table">
            <thead><tr>
              <th>Question</th><th>Category</th><th>Type</th><th>Difficulty</th><th>Actions</th>
            </tr></thead>
            <tbody>${questions.map(q => `
              <tr>
                <td style="max-width:350px">${this.esc(q.text.length > 80 ? q.text.slice(0, 80) + '...' : q.text)}</td>
                <td>${this.esc(q.categoryName || '-')}</td>
                <td><span class="badge badge-${q.type.toLowerCase()}">${this.typeName(q.type)}</span></td>
                <td><span class="badge badge-${q.difficulty.toLowerCase()}">${q.difficulty}</span></td>
                <td>
                  <div style="display:flex;gap:0.3rem">
                    <button class="btn btn-ghost btn-icon btn-sm" title="Edit" onclick="QuestionsPage.showForm(${q.id})">✏️</button>
                    <button class="btn btn-ghost btn-icon btn-sm" title="Delete" onclick="QuestionsPage.confirmDelete(${q.id})">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}</tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-text">${err.message}</div></div>`;
    }
  },

  async showForm(id) {
    const isEdit = !!id;
    let question = { categoryId: '', text: '', type: 'MC', options: ['', '', '', ''], correctAnswer: '0', difficulty: 'MEDIUM' };

    let categories = [];
    try { categories = await API.getCategories(); } catch (e) { /* ignore */ }
    if (isEdit) {
      try { question = await API.getQuestion(id); } catch (err) { App.toast(err.message, 'error'); return; }
    }

    const catOptions = categories.map(c =>
      `<option value="${c.id}" ${c.id === question.categoryId ? 'selected' : ''}>${this.esc(c.name)}</option>`
    ).join('');

    App.openModal(isEdit ? 'Edit Question' : 'New Question', `
      <form id="question-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select class="form-select" id="q-category" required><option value="">Select...</option>${catOptions}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Difficulty *</label>
            <select class="form-select" id="q-difficulty">
              <option value="EASY" ${question.difficulty === 'EASY' ? 'selected' : ''}>Easy</option>
              <option value="MEDIUM" ${question.difficulty === 'MEDIUM' ? 'selected' : ''}>Medium</option>
              <option value="HARD" ${question.difficulty === 'HARD' ? 'selected' : ''}>Hard</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Type *</label>
          <select class="form-select" id="q-type">
            <option value="MC" ${question.type === 'MC' ? 'selected' : ''}>Multiple Choice</option>
            <option value="TF" ${question.type === 'TF' ? 'selected' : ''}>True/False</option>
            <option value="FB" ${question.type === 'FB' ? 'selected' : ''}>Fill in the Blank</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Question Text *</label>
          <textarea class="form-textarea" id="q-text" required maxlength="500">${this.esc(question.text)}</textarea>
        </div>
        <div id="q-type-fields"></div>
        <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:1rem">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'}</button>
        </div>
      </form>
    `);

    const renderTypeFields = () => {
      const type = document.getElementById('q-type').value;
      const container = document.getElementById('q-type-fields');

      if (type === 'MC') {
        const opts = question.type === 'MC' ? question.options : ['', '', '', ''];
        const correctIdx = question.type === 'MC' ? question.correctAnswer : '0';
        container.innerHTML = `
          <div class="form-group"><label class="form-label">Options *</label>
            ${opts.map((o, i) => `
              <div style="display:flex;gap:0.5rem;margin-bottom:0.4rem;align-items:center">
                <input type="radio" name="q-correct" value="${i}" ${String(i) === String(correctIdx) ? 'checked' : ''}>
                <input type="text" class="form-input q-option" value="${this.esc(o)}" placeholder="Option ${i + 1}" required>
              </div>
            `).join('')}
            <button type="button" class="btn btn-ghost btn-sm" id="btn-add-option" style="margin-top:0.3rem">+ Add Option</button>
          </div>`;
        document.getElementById('btn-add-option').addEventListener('click', () => {
          const optionsContainer = container.querySelector('.form-group');
          const count = container.querySelectorAll('.q-option').length;
          const div = document.createElement('div');
          div.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:0.4rem;align-items:center';
          div.innerHTML = `<input type="radio" name="q-correct" value="${count}"><input type="text" class="form-input q-option" placeholder="Option ${count + 1}" required>`;
          optionsContainer.insertBefore(div, document.getElementById('btn-add-option'));
        });
      } else if (type === 'TF') {
        const ans = question.type === 'TF' ? question.correctAnswer : 'true';
        container.innerHTML = `
          <div class="form-group"><label class="form-label">Correct Answer *</label>
            <select class="form-select" id="q-tf-answer">
              <option value="true" ${ans === 'true' ? 'selected' : ''}>True</option>
              <option value="false" ${ans === 'false' ? 'selected' : ''}>False</option>
            </select>
          </div>`;
      } else {
        const ans = question.type === 'FB' ? question.correctAnswer : '';
        container.innerHTML = `
          <div class="form-group"><label class="form-label">Correct Answer *</label>
            <input type="text" class="form-input" id="q-fb-answer" value="${this.esc(ans)}" placeholder="The expected answer" required>
          </div>`;
      }
    };

    renderTypeFields();
    document.getElementById('q-type').addEventListener('change', renderTypeFields);

    document.getElementById('question-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = document.getElementById('q-type').value;
      const data = {
        categoryId: parseInt(document.getElementById('q-category').value),
        text: document.getElementById('q-text').value.trim(),
        type,
        difficulty: document.getElementById('q-difficulty').value,
        options: [],
        correctAnswer: '',
      };

      if (!data.categoryId) { App.toast('Please select a category.', 'error'); return; }
      if (!data.text) { App.toast('Question text is required.', 'error'); return; }

      if (type === 'MC') {
        data.options = Array.from(document.querySelectorAll('.q-option')).map(i => i.value.trim());
        const selected = document.querySelector('input[name="q-correct"]:checked');
        if (!selected) { App.toast('Select the correct answer.', 'error'); return; }
        data.correctAnswer = selected.value;
        if (data.options.some(o => !o)) { App.toast('All options are required.', 'error'); return; }
      } else if (type === 'TF') {
        data.correctAnswer = document.getElementById('q-tf-answer').value;
      } else {
        data.correctAnswer = document.getElementById('q-fb-answer').value.trim();
        if (!data.correctAnswer) { App.toast('Correct answer is required.', 'error'); return; }
      }

      try {
        if (isEdit) {
          await API.updateQuestion(id, data);
          App.toast('Question updated!', 'success');
        } else {
          await API.createQuestion(data);
          App.toast('Question created!', 'success');
        }
        App.closeModal();
        await this.loadQuestions();
      } catch (err) { App.toast(err.message, 'error'); }
    });
  },

  confirmDelete(id) {
    App.openModal('Delete Question', `
      <p style="margin-bottom:1rem">Are you sure you want to delete this question?</p>
      <div style="display:flex;justify-content:flex-end;gap:0.5rem">
        <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
        <button class="btn btn-danger" id="btn-confirm-del-q">Delete</button>
      </div>
    `);
    document.getElementById('btn-confirm-del-q').addEventListener('click', async () => {
      try {
        await API.deleteQuestion(id);
        App.toast('Question deleted!', 'success');
        App.closeModal();
        await this.loadQuestions();
      } catch (err) { App.toast(err.message, 'error'); }
    });
  },

  typeName(t) { return { MC: 'Multiple Choice', TF: 'True/False', FB: 'Fill Blank' }[t] || t; },
  esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; }
};
