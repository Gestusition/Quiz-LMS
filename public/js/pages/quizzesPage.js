import { API } from '../api.js';
import { value } from '../components/form.js';

export const QuizzesPage = {
  async renderQuizzes() {
    this.setApp(this.loading('Loading quizzes'));
    try {
      const [courses, quizzes] = await Promise.all([API.getCourses(), API.getQuizzes()]);
      this.setApp(`
        <header class="page-header">
          <div><h1>Quizzes</h1><p>${quizzes.length} quiz${quizzes.length === 1 ? '' : 'zes'}</p></div>
          ${this.canManageLearning() ? '<button class="btn btn-primary" id="btn-new-quiz">New Quiz</button>' : ''}
        </header>
        <div class="toolbar">
          <select class="form-select" id="quiz-course-filter">
            <option value="">All courses</option>
            ${courses.map(course => `<option value="${course.id}">${this.esc(course.code)} - ${this.esc(course.title)}</option>`).join('')}
          </select>
        </div>
        <section class="panel">
          <div class="list" id="quiz-list">${quizzes.map(quiz => this.quizRow(quiz, true, this.canManageLearning())).join('') || this.emptyLine('No quizzes found.')}</div>
        </section>
      `);

      document.getElementById('quiz-course-filter').addEventListener('change', async event => {
        const filtered = await API.getQuizzes({ courseId: event.target.value });
        document.getElementById('quiz-list').innerHTML =
          filtered.map(quiz => this.quizRow(quiz, true, this.canManageLearning())).join('') || this.emptyLine('No quizzes found.');
      });
      const newQuiz = document.getElementById('btn-new-quiz');
      if (newQuiz) newQuiz.addEventListener('click', () => this.showQuizForm());
    } catch (err) {
      this.renderError(err);
    }
  },

  async showQuizForm(id, fixedCourseId) {
    const [courses, quiz] = await Promise.all([
      API.getCourses(),
      id ? API.getQuiz(id) : Promise.resolve({
        courseId: fixedCourseId || '',
        title: '',
        description: '',
        status: 'draft',
        durationMinutes: 30,
        maxAttempts: 1,
        startAt: '',
        endAt: '',
        shuffleQuestions: false,
        shuffleOptions: false,
        gradingMode: 'standard',
        showResultPolicy: 'immediately',
        penaltyEnabled: false,
        penaltyPerWrong: 0,
        requiresSeb: false,
        sebConfigName: '',
        showCorrectAnswers: true
      })
    ]);
    const templates = this.canManageLearning() ? await API.request('/quizzes/templates').catch(() => []) : [];

    this.openModal(id ? 'Edit quiz' : 'New quiz', `
      <form id="quiz-form" class="stack">
        <label class="form-field"><span>Template</span><select class="form-select" id="quiz-template">
          <option value="">Custom</option>
          ${(templates || []).map(template => `<option value="${this.esc(template.name)}">${this.esc(template.name)}</option>`).join('')}
        </select></label>
        <label class="form-field"><span>Course</span><select class="form-select" id="quiz-course" ${fixedCourseId ? 'disabled' : ''}>
          ${courses.map(course => `<option value="${course.id}" ${Number(quiz.courseId) === Number(course.id) ? 'selected' : ''}>${this.esc(course.code)} - ${this.esc(course.title)}</option>`).join('')}
        </select></label>
        ${this.input('quiz-title', 'Title', quiz.title)}
        ${this.textarea('quiz-description', 'Description', quiz.description)}
        <div class="form-grid">
          <label class="form-field"><span>Status</span><select class="form-select" id="quiz-status">
            ${['draft', 'published', 'closed'].map(status => `<option value="${status}" ${quiz.status === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select></label>
          ${this.input('quiz-attempts', 'Attempts', quiz.maxAttempts || quiz.attemptsAllowed || 1, 'number')}
          ${this.input('quiz-time', 'Duration minutes', quiz.durationMinutes || quiz.timeLimitMinutes || 30, 'number')}
          ${this.input('quiz-start', 'Start at', this.toDateTimeLocal(quiz.startAt || quiz.openAt), 'datetime-local')}
          ${this.input('quiz-end', 'End at', this.toDateTimeLocal(quiz.endAt || quiz.closeAt), 'datetime-local')}
          <label class="form-field"><span>Result visibility</span><select class="form-select" id="quiz-result-policy">
            ${['immediately', 'after_close', 'after_manual_release', 'never'].map(policy => `<option value="${policy}" ${(quiz.showResultPolicy || 'immediately') === policy ? 'selected' : ''}>${policy}</option>`).join('')}
          </select></label>
          <label class="form-field"><span>Grading mode</span><select class="form-select" id="quiz-grading-mode">
            ${['standard', 'negative_marking', 'manual_review'].map(mode => `<option value="${mode}" ${(quiz.gradingMode || 'standard') === mode ? 'selected' : ''}>${mode}</option>`).join('')}
          </select></label>
          ${this.input('quiz-penalty', 'Penalty per wrong', quiz.penaltyPerWrong || 0, 'number')}
        </div>
        <label class="check-field"><input type="checkbox" id="quiz-shuffle" ${quiz.shuffleQuestions ? 'checked' : ''}> Shuffle questions</label>
        <label class="check-field"><input type="checkbox" id="quiz-shuffle-options" ${quiz.shuffleOptions ? 'checked' : ''}> Shuffle options</label>
        <label class="check-field"><input type="checkbox" id="quiz-penalty-enabled" ${quiz.penaltyEnabled ? 'checked' : ''}> Enable negative marking</label>
        <label class="check-field"><input type="checkbox" id="quiz-requires-seb" ${quiz.requiresSeb ? 'checked' : ''}> Requires Safe Exam Browser compatible mode</label>
        ${this.input('quiz-seb-name', 'SEB config name', quiz.sebConfigName || '')}
        <label class="check-field"><input type="checkbox" id="quiz-show-correct" ${quiz.showCorrectAnswers ? 'checked' : ''}> Show correct answers after submit</label>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);

    document.getElementById('quiz-form').addEventListener('submit', async event => {
      event.preventDefault();
      const data = {
        courseId: fixedCourseId || Number(value('quiz-course')),
        title: value('quiz-title'),
        description: value('quiz-description'),
        status: value('quiz-status'),
        maxAttempts: Number(value('quiz-attempts')),
        durationMinutes: Number(value('quiz-time')),
        startAt: value('quiz-start') ? new Date(value('quiz-start')).toISOString() : '',
        endAt: value('quiz-end') ? new Date(value('quiz-end')).toISOString() : '',
        showResultPolicy: value('quiz-result-policy'),
        gradingMode: value('quiz-grading-mode'),
        penaltyEnabled: document.getElementById('quiz-penalty-enabled').checked,
        penaltyPerWrong: Number(value('quiz-penalty') || 0),
        shuffleQuestions: document.getElementById('quiz-shuffle').checked,
        shuffleOptions: document.getElementById('quiz-shuffle-options').checked,
        requiresSeb: document.getElementById('quiz-requires-seb').checked,
        sebConfigName: value('quiz-seb-name'),
        templateName: value('quiz-template'),
        showCorrectAnswers: document.getElementById('quiz-show-correct').checked
      };
      try {
        const saved = id ? await API.updateQuiz(id, data) : await API.createQuiz(data);
        this.closeModal();
        await this.showAssignQuestions(saved.id);
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  async showAssignQuestions(quizId) {
    const quiz = await API.getQuiz(quizId);
    const questions = await API.getQuestions({ courseId: quiz.courseId });
    const assigned = new Set((quiz.questions || []).map(question => Number(question.id)));

    this.openModal('Quiz questions', `
      <form id="assign-form" class="stack">
        <div class="assign-list">
          ${questions.map(question => `
            <label class="assign-row">
              <input type="checkbox" value="${question.id}" ${assigned.has(Number(question.id)) ? 'checked' : ''}>
              <span>${this.esc(question.text)}</span>
              <small>${this.esc(question.categoryName || '')} - ${this.esc(question.difficulty)}</small>
            </label>
          `).join('') || this.emptyLine('Create questions before assigning them.')}
        </div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save questions</button></div>
      </form>
    `);

    document.getElementById('assign-form').addEventListener('submit', async event => {
      event.preventDefault();
      const ids = Array.from(document.querySelectorAll('#assign-form input[type="checkbox"]:checked')).map(input => Number(input.value));
      try {
        await API.setQuizQuestions(quizId, ids);
        this.closeModal();
        this.route();
        this.toast('Quiz questions saved.', 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  async startQuiz(quizId) {
    try {
      const attempt = await API.startAttempt(quizId);
      location.hash = `#/attempt/${attempt.id}`;
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  quizRow(quiz, showCourse = false, manager = false) {
    const actions = this.user.role === 'student'
      ? `<button class="btn btn-primary btn-sm" onclick="App.startQuiz(${quiz.id})" ${quiz.isOpen ? '' : 'disabled'}>${quiz.isOpen ? 'Start' : 'Closed'}</button>`
      : `${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.showQuizForm(${quiz.id})">Edit</button><button class="btn btn-primary btn-sm" onclick="App.showAssignQuestions(${quiz.id})">Questions</button>` : ''}`;

    return `
      <div class="list-row">
        <div>
          <strong>${this.esc(quiz.title)}</strong>
          <small>${showCourse ? `${this.esc(quiz.courseCode || '')} - ` : ''}${quiz.questionCount || 0} questions, ${quiz.maxScore || 0} points | ${this.esc(quiz.showResultPolicy || 'immediately')} results | ${this.esc(quiz.durationMinutes || quiz.timeLimitMinutes || 0)} min</small>
        </div>
        <div class="row-actions">
          <span class="status ${quiz.status}">${this.esc(quiz.status)}</span>
          ${actions}
        </div>
      </div>
    `;
  },

  toDateTimeLocal(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = number => String(number).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }
};
