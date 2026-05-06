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

export const QuestionsPage = {
  async renderQuestionBank() {
    if (!this.canManageLearning()) return this.setApp(this.emptyBlock('Question bank access is restricted.'));
    this.setApp(this.loading('Loading question bank'));

    try {
      const courses = await API.getCourses();
      const selectedCourseId = this.activeCourseId || (courses[0] ? String(courses[0].id) : '');
      this.activeCourseId = selectedCourseId;
      const [categories, questions] = selectedCourseId
        ? await Promise.all([API.getCategories({ courseId: selectedCourseId }), API.getQuestions({ courseId: selectedCourseId })])
        : [[], []];

      this.setApp(`
        <header class="page-header">
          <div><h1>Question Bank</h1><p>${questions.length} question${questions.length === 1 ? '' : 's'} across ${categories.length} categories</p></div>
          <div class="header-actions">
            <button class="btn btn-ghost" id="btn-new-category">New Category</button>
            <button class="btn btn-primary" id="btn-new-question">New Question</button>
          </div>
        </header>
        <div class="toolbar">
          <select class="form-select" id="question-course-filter">
            ${courses.map(course => `<option value="${course.id}" ${String(course.id) === selectedCourseId ? 'selected' : ''}>${this.esc(course.code)} - ${this.esc(course.title)}</option>`).join('')}
          </select>
          <select class="form-select" id="question-type-filter">
            <option value="">All types</option>
            ${Object.entries(TYPE_LABELS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
          </select>
          <input class="form-input" id="question-search" placeholder="Search questions...">
        </div>
        <section class="content-grid">
          <div class="panel">
            <div class="panel-header"><h2>Categories</h2><span>${categories.length}</span></div>
            <div class="list">${categories.map(category => `
              <div class="list-row">
                <div><strong>${this.esc(category.name)}</strong><small>${category.questionCount} questions</small></div>
                <button class="btn btn-ghost btn-sm" onclick="App.deleteCategory(${category.id})">Delete</button>
              </div>
            `).join('') || this.emptyLine('No categories.')}</div>
          </div>
          <div class="panel wide">
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th>Question</th><th>Type</th><th>Category</th><th>Difficulty</th><th>Pts</th><th></th></tr></thead>
                <tbody id="question-rows">${questions.map(question => this.questionTableRow(question)).join('') || '<tr><td colspan="6">No questions.</td></tr>'}</tbody>
              </table>
            </div>
          </div>
        </section>
      `);

      document.getElementById('question-course-filter').addEventListener('change', event => {
        this.activeCourseId = event.target.value;
        this.renderQuestionBank();
      });
      const filterQuestions = async () => {
        const filtered = await API.getQuestions({
          courseId: this.activeCourseId,
          search: document.getElementById('question-search').value,
          type: document.getElementById('question-type-filter').value
        });
        document.getElementById('question-rows').innerHTML =
          filtered.map(question => this.questionTableRow(question)).join('') || '<tr><td colspan="6">No questions.</td></tr>';
      };
      document.getElementById('question-search').addEventListener('input', filterQuestions);
      document.getElementById('question-type-filter').addEventListener('change', filterQuestions);
      document.getElementById('btn-new-category').addEventListener('click', () => this.showCategoryForm(Number(this.activeCourseId)));
      document.getElementById('btn-new-question').addEventListener('click', () => this.showQuestionForm(null, Number(this.activeCourseId)));
    } catch (err) {
      this.renderError(err);
    }
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
          ${this.input('question-points', 'Points', question.points || 1, 'number')}
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
            ${options.map((option, index) => `
              <label class="option-field">
                <input type="radio" name="question-correct" value="${index}" ${String(question.correctAnswer) === String(index) ? 'checked' : ''}>
                <input class="form-input question-option" value="${this.esc(option)}" placeholder="Option ${index + 1}">
              </label>
            `).join('')}
            <button type="button" class="btn btn-ghost btn-sm" id="btn-add-option">+ Add option</button>
          </div>`;
        document.getElementById('btn-add-option')?.addEventListener('click', () => {
          const opts = document.querySelectorAll('.question-option');
          if (opts.length >= 6) return;
          const newIndex = opts.length;
          const wrapper = document.createElement('label');
          wrapper.className = 'option-field';
          wrapper.innerHTML = `<input type="radio" name="question-correct" value="${newIndex}"><input class="form-input question-option" placeholder="Option ${newIndex + 1}">`;
          document.getElementById('btn-add-option').before(wrapper);
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
            ${options.map((option, index) => `
              <label class="option-field">
                <input type="checkbox" name="question-correct-mr" value="${index}" ${correctSet.has(String(index)) ? 'checked' : ''}>
                <input class="form-input question-option" value="${this.esc(option)}" placeholder="Option ${index + 1}">
              </label>
            `).join('')}
            <button type="button" class="btn btn-ghost btn-sm" id="btn-add-mr-option">+ Add option</button>
          </div>`;
        document.getElementById('btn-add-mr-option')?.addEventListener('click', () => {
          const opts = document.querySelectorAll('.question-option');
          if (opts.length >= 10) return;
          const newIndex = opts.length;
          const wrapper = document.createElement('label');
          wrapper.className = 'option-field';
          wrapper.innerHTML = `<input type="checkbox" name="question-correct-mr" value="${newIndex}"><input class="form-input question-option" placeholder="Option ${newIndex + 1}">`;
          document.getElementById('btn-add-mr-option').before(wrapper);
        });
      } else if (type === 'OR') {
        const options = question.type === 'OR' ? question.options : ['Step 1', 'Step 2', 'Step 3'];
        container.innerHTML = `
          <div class="stack"><label class="form-field"><span>Items in correct order (drag to reorder)</span></label>
            <div id="ordering-items">
              ${options.map((item, index) => `
                <div class="ordering-item" draggable="true" data-index="${index}">
                  <span class="ordering-handle">☰</span>
                  <input class="form-input question-option" value="${this.esc(item)}" placeholder="Item ${index + 1}">
                </div>
              `).join('')}
            </div>
            <button type="button" class="btn btn-ghost btn-sm" id="btn-add-order-item">+ Add item</button>
          </div>`;
        document.getElementById('btn-add-order-item')?.addEventListener('click', () => {
          const items = document.querySelectorAll('.ordering-item');
          if (items.length >= 20) return;
          const wrapper = document.createElement('div');
          wrapper.className = 'ordering-item';
          wrapper.draggable = true;
          wrapper.dataset.index = items.length;
          wrapper.innerHTML = `<span class="ordering-handle">☰</span><input class="form-input question-option" placeholder="Item ${items.length + 1}">`;
          document.getElementById('btn-add-order-item').before(wrapper);
        });
      } else if (type === 'ES') {
        container.innerHTML = `<p class="form-hint">Essay questions require manual grading. Students will see a large text area.</p>`;
      } else if (type === 'MT') {
        this.renderMathTableBuilder(container, question);
      } else if (type === 'MP') {
        this.renderMultiPartBuilder(container, question);
      }
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
      const text = value('question-text');
      const richText = value('question-richtext');
      const mediaUrl = value('question-media-url');
      previewArea.innerHTML = `
        <div class="question-preview-card">
          <h3>Preview</h3>
          <div class="preview-body">${this.esc(text)}</div>
          ${richText ? `<div class="preview-rich">${this.esc(richText)}</div>` : ''}
          ${mediaUrl ? `<img src="${this.esc(mediaUrl)}" class="preview-media" alt="Question image">` : ''}
        </div>
      `;
      this.renderLatex(previewArea);
    });

    document.getElementById('question-form').addEventListener('submit', async event => {
      event.preventDefault();
      const type = value('question-type');
      const data = {
        categoryId: Number(value('question-category')),
        text: value('question-text'),
        type,
        difficulty: value('question-difficulty'),
        points: Number(value('question-points')),
        options: [],
        correctAnswer: '',
        richText: value('question-richtext') || '',
        explanationText: value('question-explanation') || '',
        hintText: value('question-hint') || '',
        mediaUrl: value('question-media-url') || ''
      };

      if (type === 'MC') {
        data.options = Array.from(document.querySelectorAll('.question-option')).map(input => input.value.trim());
        const selected = document.querySelector('input[name="question-correct"]:checked');
        data.correctAnswer = selected ? selected.value : '0';
      } else if (type === 'MR') {
        data.options = Array.from(document.querySelectorAll('.question-option')).map(input => input.value.trim());
        const checked = Array.from(document.querySelectorAll('input[name="question-correct-mr"]:checked'));
        data.correctAnswer = checked.map(c => c.value).join(',');
      } else if (type === 'OR') {
        data.options = Array.from(document.querySelectorAll('.question-option')).map(input => input.value.trim());
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

      try {
        if (id) await API.updateQuestion(id, data);
        else await API.createQuestion(data);
        this.closeModal();
        this.renderQuestionBank();
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  renderMathTableBuilder(container, question) {
    const config = question.tableConfig || { columns: [{ header: 'n', type: 'label' }, { header: 'Value', type: 'input' }], rowCount: 3, prefill: {}, correctData: {} };
    container.innerHTML = `
      <div class="stack table-builder">
        <label class="form-field"><span>Table Configuration</span></label>
        <div class="form-grid">
          ${this.input('table-rows', 'Number of rows', config.rowCount, 'number')}
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
        <input class="form-input part-points" value="${part.points || 1}" placeholder="Pts" type="number" style="width:60px">
        <button type="button" class="btn btn-ghost btn-sm" onclick="this.closest('.part-editor-row').remove()">✕</button>
      </div>
    `;
  },

  collectTableConfig() {
    const columns = Array.from(document.querySelectorAll('.table-col-item')).map(item => ({
      header: item.querySelector('.table-col-header').value.trim(),
      type: item.querySelector('.table-col-type').value
    }));
    let correctData = {}, prefill = {};
    try { correctData = JSON.parse(document.getElementById('table-correct-data')?.value || '{}'); } catch (e) { /* empty */ }
    try { prefill = JSON.parse(document.getElementById('table-prefill-data')?.value || '{}'); } catch (e) { /* empty */ }
    return {
      columns,
      rowCount: Number(value('table-rows') || 3),
      prefill,
      correctData
    };
  },

  collectMultiParts() {
    return Array.from(document.querySelectorAll('.part-editor-row')).map(row => ({
      partLabel: row.querySelector('.part-label')?.value || '',
      partText: row.querySelector('.part-text')?.value || '',
      answerType: row.querySelector('.part-answer-type')?.value || 'text',
      correctAnswer: row.querySelector('.part-correct')?.value || '',
      points: Number(row.querySelector('.part-points')?.value || 1)
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

  questionTableRow(question) {
    const typeColor = TYPE_COLORS[question.type] || '#64748b';
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
        <td class="table-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.showQuestionForm(${question.id}, ${question.courseId})">Edit</button>
          <button class="btn btn-ghost btn-sm" onclick="App.duplicateQuestion(${question.id})" title="Duplicate">⧉</button>
          <button class="btn btn-danger btn-sm" onclick="App.deleteQuestion(${question.id})">Delete</button>
        </td>
      </tr>
    `;
  }
};
