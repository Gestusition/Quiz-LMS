import { API } from '../api.js';
import { value } from '../components/form.js';

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
          <div><h1>Question Bank</h1><p>${questions.length} question${questions.length === 1 ? '' : 's'}</p></div>
          <div class="header-actions">
            <button class="btn btn-ghost" id="btn-new-category">New Category</button>
            <button class="btn btn-primary" id="btn-new-question">New Question</button>
          </div>
        </header>
        <div class="toolbar">
          <select class="form-select" id="question-course-filter">
            ${courses.map(course => `<option value="${course.id}" ${String(course.id) === selectedCourseId ? 'selected' : ''}>${this.esc(course.code)} - ${this.esc(course.title)}</option>`).join('')}
          </select>
          <input class="form-input" id="question-search" placeholder="Search questions">
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
                <thead><tr><th>Question</th><th>Category</th><th>Type</th><th>Difficulty</th><th></th></tr></thead>
                <tbody id="question-rows">${questions.map(question => this.questionTableRow(question)).join('') || '<tr><td colspan="5">No questions.</td></tr>'}</tbody>
              </table>
            </div>
          </div>
        </section>
      `);

      document.getElementById('question-course-filter').addEventListener('change', event => {
        this.activeCourseId = event.target.value;
        this.renderQuestionBank();
      });
      document.getElementById('question-search').addEventListener('input', async event => {
        const filtered = await API.getQuestions({ courseId: this.activeCourseId, search: event.target.value });
        document.getElementById('question-rows').innerHTML =
          filtered.map(question => this.questionTableRow(question)).join('') || '<tr><td colspan="5">No questions.</td></tr>';
      });
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
        categoryId: '',
        text: '',
        type: 'MC',
        options: ['', '', '', ''],
        correctAnswer: '0',
        difficulty: 'MEDIUM',
        points: 1
      })
    ]);

    this.openModal(id ? 'Edit question' : 'New question', `
      <form id="question-form" class="stack">
        <label class="form-field"><span>Category</span><select class="form-select" id="question-category">
          ${categories.map(category => `<option value="${category.id}" ${Number(question.categoryId) === Number(category.id) ? 'selected' : ''}>${this.esc(category.name)}</option>`).join('')}
        </select></label>
        <div class="form-grid">
          <label class="form-field"><span>Type</span><select class="form-select" id="question-type">
            ${[['MC', 'Multiple choice'], ['TF', 'True/false'], ['FB', 'Fill blank']].map(([valueText, label]) => `<option value="${valueText}" ${question.type === valueText ? 'selected' : ''}>${label}</option>`).join('')}
          </select></label>
          <label class="form-field"><span>Difficulty</span><select class="form-select" id="question-difficulty">
            ${['EASY', 'MEDIUM', 'HARD'].map(level => `<option value="${level}" ${question.difficulty === level ? 'selected' : ''}>${level}</option>`).join('')}
          </select></label>
          ${this.input('question-points', 'Points', question.points || 1, 'number')}
        </div>
        ${this.textarea('question-text', 'Question text', question.text)}
        <div id="question-answer-fields"></div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);

    const renderAnswerFields = () => {
      const type = value('question-type');
      const container = document.getElementById('question-answer-fields');
      if (type === 'MC') {
        const options = question.type === 'MC' ? question.options : ['', '', '', ''];
        container.innerHTML = `
          <div class="stack">
            ${options.map((option, index) => `
              <label class="option-field">
                <input type="radio" name="question-correct" value="${index}" ${String(question.correctAnswer) === String(index) ? 'checked' : ''}>
                <input class="form-input question-option" value="${this.esc(option)}" placeholder="Option ${index + 1}">
              </label>
            `).join('')}
          </div>
        `;
      } else if (type === 'TF') {
        container.innerHTML = `<label class="form-field"><span>Correct answer</span><select class="form-select" id="question-answer"><option value="true">true</option><option value="false" ${question.correctAnswer === 'false' ? 'selected' : ''}>false</option></select></label>`;
      } else {
        container.innerHTML = this.input('question-answer', 'Correct answer', question.type === 'FB' ? question.correctAnswer : '');
      }
    };

    renderAnswerFields();
    document.getElementById('question-type').addEventListener('change', renderAnswerFields);
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
        correctAnswer: ''
      };
      if (type === 'MC') {
        data.options = Array.from(document.querySelectorAll('.question-option')).map(input => input.value.trim());
        const selected = document.querySelector('input[name="question-correct"]:checked');
        data.correctAnswer = selected ? selected.value : '0';
      } else {
        data.correctAnswer = value('question-answer');
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

  questionTableRow(question) {
    return `
      <tr>
        <td>${this.esc(question.text)}</td>
        <td>${this.esc(question.categoryName || '-')}</td>
        <td>${this.esc(question.type)}</td>
        <td>${this.esc(question.difficulty)}</td>
        <td class="table-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.showQuestionForm(${question.id}, ${question.courseId})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="App.deleteQuestion(${question.id})">Delete</button>
        </td>
      </tr>
    `;
  }
};
