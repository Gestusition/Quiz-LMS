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
        timeLimitMinutes: 0,
        attemptsAllowed: 1,
        shuffleQuestions: false,
        showCorrectAnswers: true
      })
    ]);

    this.openModal(id ? 'Edit quiz' : 'New quiz', `
      <form id="quiz-form" class="stack">
        <label class="form-field"><span>Course</span><select class="form-select" id="quiz-course" ${fixedCourseId ? 'disabled' : ''}>
          ${courses.map(course => `<option value="${course.id}" ${Number(quiz.courseId) === Number(course.id) ? 'selected' : ''}>${this.esc(course.code)} - ${this.esc(course.title)}</option>`).join('')}
        </select></label>
        ${this.input('quiz-title', 'Title', quiz.title)}
        ${this.textarea('quiz-description', 'Description', quiz.description)}
        <div class="form-grid">
          <label class="form-field"><span>Status</span><select class="form-select" id="quiz-status">
            ${['draft', 'published', 'closed'].map(status => `<option value="${status}" ${quiz.status === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select></label>
          ${this.input('quiz-attempts', 'Attempts', quiz.attemptsAllowed, 'number')}
          ${this.input('quiz-time', 'Time limit minutes', quiz.timeLimitMinutes, 'number')}
        </div>
        <label class="check-field"><input type="checkbox" id="quiz-shuffle" ${quiz.shuffleQuestions ? 'checked' : ''}> Shuffle questions</label>
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
        attemptsAllowed: Number(value('quiz-attempts')),
        timeLimitMinutes: Number(value('quiz-time')),
        shuffleQuestions: document.getElementById('quiz-shuffle').checked,
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
          <small>${showCourse ? `${this.esc(quiz.courseCode || '')} - ` : ''}${quiz.questionCount || 0} questions, ${quiz.maxScore || 0} points</small>
        </div>
        <div class="row-actions">
          <span class="status ${quiz.status}">${this.esc(quiz.status)}</span>
          ${actions}
        </div>
      </div>
    `;
  }
};
