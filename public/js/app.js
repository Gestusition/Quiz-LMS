const App = {
  user: null,
  activeCourseId: '',

  async init() {
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay').addEventListener('click', event => {
      if (event.target === event.currentTarget) this.closeModal();
    });
    window.addEventListener('hashchange', () => this.route());

    if (API.token()) {
      try {
        this.user = await API.me();
        localStorage.setItem('quiz_lms_user', JSON.stringify(this.user));
      } catch (e) {
        this.user = null;
      }
    } else {
      this.user = API.cachedUser();
    }

    this.renderShell();
    this.route();
  },

  renderShell() {
    const links = document.getElementById('nav-links');
    const navUser = document.getElementById('nav-user');

    if (!this.user) {
      links.innerHTML = '';
      navUser.innerHTML = '';
      return;
    }

    if (this.user.mustChangeCredentials) {
      links.innerHTML = '<span class="nav-link active">Credential update required</span>';
      navUser.innerHTML = `
        <div class="user-chip">
          <span>${this.esc(this.user.username || this.user.name)}</span>
          <small>${this.esc(this.user.role)}</small>
        </div>
        <button class="btn btn-ghost btn-sm" id="btn-logout">Logout</button>
      `;
      document.getElementById('btn-logout').addEventListener('click', () => this.logout());
      return;
    }

    const items = [
      ['#/', 'Dashboard'],
      ['#/courses', 'Courses'],
      ['#/quizzes', 'Quizzes']
    ];
    if (this.canManageLearning()) items.push(['#/questions', 'Question Bank']);
    if (this.user.role === 'admin') items.push(['#/users', 'Users']);

    links.innerHTML = items.map(([href, label]) =>
      `<a class="nav-link" href="${href}" data-href="${href}">${label}</a>`
    ).join('') + '<a class="nav-link" href="/api-docs" target="_blank">API Docs</a>';

    navUser.innerHTML = `
      <div class="user-chip">
        <span>${this.esc(this.user.name)}</span>
        <small>${this.esc(this.user.role)}</small>
      </div>
      <button class="btn btn-ghost btn-sm" id="btn-logout">Logout</button>
    `;
    document.getElementById('btn-logout').addEventListener('click', () => this.logout());
    this.markActiveNav();
  },

  markActiveNav() {
    const hash = location.hash || '#/';
    document.querySelectorAll('.nav-link[data-href]').forEach(link => {
      const href = link.dataset.href;
      link.classList.toggle('active', href === '#/' ? hash === '#/' || hash === '' : hash.startsWith(href));
    });
  },

  route() {
    this.markActiveNav();
    if (!this.user) {
      this.renderLogin();
      return;
    }
    if (this.user.mustChangeCredentials) {
      this.renderCredentialChange();
      return;
    }

    const hash = location.hash || '#/';
    const parts = hash.replace('#/', '').split('/').filter(Boolean);
    const root = parts[0] || '';

    if (!root) return this.renderDashboard();
    if (root === 'courses' && parts[1]) return this.renderCourseDetail(Number(parts[1]));
    if (root === 'courses') return this.renderCourses();
    if (root === 'quizzes') return this.renderQuizzes();
    if (root === 'questions') return this.renderQuestionBank();
    if (root === 'users') return this.renderUsers();
    if (root === 'attempt' && parts[1]) return this.renderAttempt(Number(parts[1]));

    this.setApp(`<div class="empty-state"><h2>Page not found</h2><a class="btn btn-primary" href="#/">Dashboard</a></div>`);
  },

  renderLogin() {
    document.body.classList.add('login-page');
    this.setApp(`
      <section class="login-shell">
        <div class="login-panel">
          <div class="login-brand">
            <span class="brand-mark">QL</span>
            <div>
              <h1>Quiz LMS</h1>
              <p>Secure course quizzes and grade tracking</p>
            </div>
          </div>
          <form id="login-form" class="stack">
            <label class="form-field">
              <span>Username or email</span>
              <input class="form-input" id="login-identifier" type="text" autocomplete="username" required>
            </label>
            <label class="form-field">
              <span>Password</span>
              <input class="form-input" id="login-password" type="password" autocomplete="current-password" required>
            </label>
            <button class="btn btn-primary full" type="submit">Sign in</button>
          </form>
          <div class="login-actions">
            <button class="link-button" id="btn-forgot-password" type="button">Forgot password?</button>
            <button class="link-button" id="btn-use-reset-code" type="button">Use reset code</button>
          </div>
        </div>
      </section>
    `);

    document.getElementById('login-form').addEventListener('submit', event => this.login(event));
    document.getElementById('btn-forgot-password').addEventListener('click', () => this.showPasswordResetRequest());
    document.getElementById('btn-use-reset-code').addEventListener('click', () => this.showPasswordResetComplete());
  },

  async login(event) {
    event.preventDefault();
    try {
      const session = await API.login(
        document.getElementById('login-identifier').value,
        document.getElementById('login-password').value
      );
      API.setSession(session);
      this.user = session.user;
      document.body.classList.remove('login-page');
      this.renderShell();
      if (this.user.mustChangeCredentials) {
        this.renderCredentialChange();
      } else {
        location.hash = '#/';
        await this.renderDashboard();
      }
      this.toast('Signed in successfully.', 'success');
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async logout() {
    try { await API.logout(); } catch (e) { /* session may already be gone */ }
    API.clearSession();
    this.user = null;
    this.renderShell();
    location.hash = '#/';
    this.renderLogin();
  },

  showPasswordResetRequest() {
    const currentIdentifier = document.getElementById('login-identifier')?.value || '';
    this.openModal('Request password reset', `
      <form id="reset-request-form" class="stack">
        ${this.input('reset-request-username', 'Username', currentIdentifier, 'text', 'student.username')}
        <p class="muted">The request will appear for an admin. Admins can issue a one-time code for teacher and student accounts.</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button class="btn btn-primary" type="submit">Send request</button>
        </div>
      </form>
    `);

    document.getElementById('reset-request-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        const result = await API.requestPasswordReset(value('reset-request-username'));
        this.closeModal();
        this.toast(result.message, 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  showPasswordResetComplete() {
    const currentIdentifier = document.getElementById('login-identifier')?.value || '';
    this.openModal('Use reset code', `
      <form id="reset-complete-form" class="stack">
        ${this.input('reset-username', 'Username', currentIdentifier, 'text', 'student.username')}
        ${this.input('reset-code', 'One-time code', '', 'text', 'A1B2C3D4')}
        ${this.input('reset-new-password', 'New password', '', 'password')}
        ${this.input('reset-confirm-password', 'Confirm new password', '', 'password')}
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button class="btn btn-primary" type="submit">Update password</button>
        </div>
      </form>
    `);

    document.getElementById('reset-complete-form').addEventListener('submit', async event => {
      event.preventDefault();
      const username = value('reset-username');
      const newPassword = value('reset-new-password');
      if (newPassword !== value('reset-confirm-password')) {
        this.toast('New password confirmation does not match.', 'error');
        return;
      }

      try {
        const result = await API.completePasswordReset({
          username,
          code: value('reset-code'),
          newPassword
        });
        this.closeModal();
        const loginIdentifier = document.getElementById('login-identifier');
        if (loginIdentifier) loginIdentifier.value = username;
        this.toast(result.message, 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  renderCredentialChange() {
    document.body.classList.remove('login-page');
    this.setApp(`
      <section class="panel credential-panel">
        <header class="panel-header">
          <div>
            <h2>Change default admin credentials</h2>
            <p>The default username and password must be replaced before this account can continue.</p>
          </div>
        </header>
        <form id="credential-form" class="stack">
          <label class="form-field">
            <span>Current username</span>
            <input class="form-input" value="${this.esc(this.user.username || '')}" disabled>
          </label>
          ${this.input('new-username', 'New username', '', 'text', 'e.g. school-admin')}
          ${this.input('current-password', 'Current password', '', 'password')}
          ${this.input('new-password', 'New password', '', 'password')}
          ${this.input('confirm-password', 'Confirm new password', '', 'password')}
          <button class="btn btn-primary full" type="submit">Update credentials</button>
        </form>
      </section>
    `);

    document.getElementById('credential-form').addEventListener('submit', async event => {
      event.preventDefault();
      const newPassword = value('new-password');
      if (newPassword !== value('confirm-password')) {
        this.toast('New password confirmation does not match.', 'error');
        return;
      }

      try {
        const user = await API.changeCredentials({
          username: value('new-username'),
          currentPassword: value('current-password'),
          newPassword
        });
        this.user = user;
        localStorage.setItem('quiz_lms_user', JSON.stringify(user));
        this.renderShell();
        location.hash = '#/';
        await this.renderDashboard();
        this.toast('Credentials updated.', 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  async renderDashboard() {
    document.body.classList.remove('login-page');
    this.setApp(this.loading('Loading dashboard'));
    try {
      const [courses, quizzes, users] = await Promise.all([
        API.getCourses(),
        API.getQuizzes(),
        this.user.role === 'admin' ? API.getUsers() : Promise.resolve([])
      ]);

      const openQuizzes = quizzes.filter(quiz => quiz.isOpen).length;
      const draftQuizzes = quizzes.filter(quiz => quiz.status === 'draft').length;
      const studentCount = users.filter(user => user.role === 'student').length;

      this.setApp(`
        <header class="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>${this.esc(this.user.name)} - ${this.esc(this.user.role)}</p>
          </div>
          <div class="header-actions">
            ${this.canManageLearning() ? '<button class="btn btn-primary" id="btn-quick-course">New Course</button>' : ''}
            ${this.user.role === 'student' ? '<a class="btn btn-primary" href="#/quizzes">Open Quizzes</a>' : ''}
          </div>
        </header>
        <section class="stats-grid">
          ${this.stat('Courses', courses.length)}
          ${this.stat('Quizzes', quizzes.length)}
          ${this.stat('Open now', openQuizzes)}
          ${this.user.role === 'admin' ? this.stat('Students', studentCount) : this.stat('Drafts', draftQuizzes)}
        </section>
        <section class="content-grid">
          <div class="panel">
            <div class="panel-header"><h2>Courses</h2><a href="#/courses">View all</a></div>
            <div class="list">${courses.slice(0, 6).map(course => this.courseRow(course)).join('') || this.emptyLine('No courses yet.')}</div>
          </div>
          <div class="panel">
            <div class="panel-header"><h2>${this.user.role === 'student' ? 'Available quizzes' : 'Recent quizzes'}</h2><a href="#/quizzes">View all</a></div>
            <div class="list">${quizzes.slice(0, 6).map(quiz => this.quizRow(quiz)).join('') || this.emptyLine('No quizzes yet.')}</div>
          </div>
        </section>
      `);

      const quickCourse = document.getElementById('btn-quick-course');
      if (quickCourse) quickCourse.addEventListener('click', () => this.showCourseForm());
    } catch (err) {
      this.renderError(err);
    }
  },

  async renderCourses() {
    this.setApp(this.loading('Loading courses'));
    try {
      const courses = await API.getCourses();
      this.setApp(`
        <header class="page-header">
          <div><h1>Courses</h1><p>${courses.length} course${courses.length === 1 ? '' : 's'}</p></div>
          ${this.canManageLearning() ? '<button class="btn btn-primary" id="btn-new-course">New Course</button>' : ''}
        </header>
        <section class="cards-grid">
          ${courses.map(course => `
            <article class="item-card">
              <div class="card-topline"><span>${this.esc(course.code)}</span><span class="status ${course.visibility}">${this.esc(course.visibility)}</span></div>
              <h2>${this.esc(course.title)}</h2>
              <p>${this.esc(course.description || 'No description')}</p>
              <div class="metric-strip">
                <span>${course.teacherCount} teachers</span>
                <span>${course.studentCount} students</span>
                <span>${course.quizCount} quizzes</span>
              </div>
              <div class="card-actions">
                <a class="btn btn-primary btn-sm" href="#/courses/${course.id}">Open</a>
                ${this.canManageLearning() ? `<button class="btn btn-ghost btn-sm" onclick="App.showCourseForm(${course.id})">Edit</button>` : ''}
              </div>
            </article>
          `).join('') || this.emptyBlock('No courses found.')}
        </section>
      `);

      const button = document.getElementById('btn-new-course');
      if (button) button.addEventListener('click', () => this.showCourseForm());
    } catch (err) {
      this.renderError(err);
    }
  },

  async renderCourseDetail(courseId) {
    this.setApp(this.loading('Loading course'));
    try {
      const [course, participants, announcements, resources, quizzes] = await Promise.all([
        API.getCourse(courseId),
        API.getParticipants(courseId),
        API.getAnnouncements(courseId),
        API.getResources(courseId),
        API.getQuizzes({ courseId })
      ]);
      const manager = this.isCourseManager(participants);
      const gradebook = manager ? await API.getGradebook(courseId) : null;

      this.setApp(`
        <header class="page-header">
          <div>
            <a class="back-link" href="#/courses">Courses</a>
            <h1>${this.esc(course.title)}</h1>
            <p>${this.esc(course.code)} - ${this.esc(course.visibility)}</p>
          </div>
          <div class="header-actions">
            ${manager ? `<button class="btn btn-ghost" onclick="App.showEnrollmentForm(${course.id})">Enroll</button>
            <button class="btn btn-primary" onclick="App.showQuizForm(null, ${course.id})">New Quiz</button>` : ''}
          </div>
        </header>
        <section class="course-layout">
          <div class="course-main">
            <div class="panel">
              <div class="panel-header">
                <h2>Announcements</h2>
                ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.showAnnouncementForm(${course.id})">Add</button>` : ''}
              </div>
              <div class="list">${announcements.map(item => this.announcementRow(item, manager)).join('') || this.emptyLine('No announcements.')}</div>
            </div>
            <div class="panel">
              <div class="panel-header">
                <h2>Quizzes</h2>
                ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.showQuizForm(null, ${course.id})">Add</button>` : ''}
              </div>
              <div class="list">${quizzes.map(quiz => this.quizRow(quiz, true, manager)).join('') || this.emptyLine('No quizzes.')}</div>
            </div>
            ${manager ? this.gradebookPanel(gradebook) : ''}
          </div>
          <aside class="course-side">
            <div class="panel">
              <div class="panel-header">
                <h2>Resources</h2>
                ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.showResourceForm(${course.id})">Add</button>` : ''}
              </div>
              <div class="list">${resources.map(item => this.resourceRow(item, manager)).join('') || this.emptyLine('No resources.')}</div>
            </div>
            <div class="panel">
              <div class="panel-header"><h2>Participants</h2><span>${participants.length}</span></div>
              <div class="list compact">${participants.map(item => this.participantRow(item, manager)).join('') || this.emptyLine('No participants.')}</div>
            </div>
          </aside>
        </section>
      `);
    } catch (err) {
      this.renderError(err);
    }
  },

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

  async renderUsers(filters = {}) {
    if (this.user.role !== 'admin') return this.setApp(this.emptyBlock('Admin access is required.'));
    this.setApp(this.loading('Loading users'));
    try {
      const [users, resetRequests] = await Promise.all([
        API.getUsers(filters),
        API.getPasswordResetRequests()
      ]);
      this.setApp(`
        <header class="page-header">
          <div><h1>Users</h1><p>${users.length} accounts</p></div>
          <button class="btn btn-primary" id="btn-new-user">New User</button>
        </header>
        <section class="panel">
          <div class="toolbar user-toolbar">
            <input class="form-input" id="user-search" value="${this.esc(filters.search || '')}" placeholder="Search users">
            <select class="form-select" id="user-role-filter">
              ${['', 'admin', 'teacher', 'student'].map(role =>
                `<option value="${role}" ${filters.role === role ? 'selected' : ''}>${role || 'all roles'}</option>`
              ).join('')}
            </select>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
              <tbody>${users.map(user => this.userTableRow(user)).join('') || '<tr><td colspan="6">No users found.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header">
            <h2>Password reset requests</h2>
            <span>${resetRequests.length} active</span>
          </div>
          <div class="list">
            ${resetRequests.map(request => this.resetRequestRow(request)).join('') || this.emptyLine('No active reset requests.')}
          </div>
        </section>
      `);
      document.getElementById('btn-new-user').addEventListener('click', () => this.showUserForm());
      let searchTimer;
      const refresh = () => this.renderUsers({
        search: value('user-search'),
        role: value('user-role-filter')
      });
      document.getElementById('user-search').addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(refresh, 250);
      });
      document.getElementById('user-role-filter').addEventListener('change', refresh);
    } catch (err) {
      this.renderError(err);
    }
  },

  async renderAttempt(attemptId) {
    this.setApp(this.loading('Loading attempt'));
    try {
      const attempt = await API.getAttempt(attemptId);
      if (attempt.status === 'submitted') return this.renderAttemptResult(attempt);

      this.setApp(`
        <header class="page-header">
          <div><h1>${this.esc(attempt.quizTitle)}</h1><p>Attempt ${attempt.attemptNumber}</p></div>
          <button class="btn btn-primary" id="btn-submit-attempt">Submit</button>
        </header>
        <form id="attempt-form" class="attempt-stack">
          ${attempt.questions.map((question, index) => this.attemptQuestion(question, index)).join('')}
        </form>
      `);

      document.getElementById('btn-submit-attempt').addEventListener('click', async () => {
        const answers = this.collectAttemptAnswers(attempt.questions);
        try {
          const submitted = await API.submitAttempt(attempt.id, answers);
          this.renderAttemptResult(submitted);
          this.toast('Quiz submitted.', 'success');
        } catch (err) {
          this.toast(err.message, 'error');
        }
      });
    } catch (err) {
      this.renderError(err);
    }
  },

  renderAttemptResult(attempt) {
    this.setApp(`
      <header class="page-header">
        <div><h1>${this.esc(attempt.quizTitle)}</h1><p>Submitted result</p></div>
        <a class="btn btn-primary" href="#/quizzes">Back to quizzes</a>
      </header>
      <section class="result-panel">
        <div class="score-ring">${attempt.percentage}%</div>
        <div>
          <h2>${attempt.score} / ${attempt.maxScore} points</h2>
          <p>Attempt ${attempt.attemptNumber} submitted at ${this.formatDate(attempt.submittedAt)}</p>
        </div>
      </section>
      <section class="panel">
        <div class="list">
          ${(attempt.answers || []).map(answer => `
            <div class="list-row">
              <div><strong>Question #${answer.questionId}</strong><small>Your answer: ${this.esc(answer.answer || '-')}</small></div>
              <span class="status ${answer.isCorrect ? 'published' : 'closed'}">${answer.isCorrect ? 'Correct' : 'Wrong'}</span>
            </div>
          `).join('') || this.emptyLine('Detailed answers are hidden.')}
        </div>
      </section>
    `);
  },

  async showCourseForm(id) {
    const isEdit = !!id;
    const course = isEdit ? await API.getCourse(id) : {
      code: '', title: '', description: '', visibility: 'private', startDate: '', endDate: ''
    };

    this.openModal(isEdit ? 'Edit course' : 'New course', `
      <form id="course-form" class="stack">
        ${this.input('course-code', 'Code', course.code, 'text', 'WEB101')}
        ${this.input('course-title', 'Title', course.title)}
        ${this.textarea('course-description', 'Description', course.description)}
        <label class="form-field"><span>Visibility</span><select class="form-select" id="course-visibility">
          ${['private', 'published', 'archived'].map(value => `<option value="${value}" ${course.visibility === value ? 'selected' : ''}>${value}</option>`).join('')}
        </select></label>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'}</button>
        </div>
      </form>
    `);

    document.getElementById('course-form').addEventListener('submit', async event => {
      event.preventDefault();
      const data = {
        code: value('course-code'),
        title: value('course-title'),
        description: value('course-description'),
        visibility: value('course-visibility')
      };
      try {
        if (isEdit) await API.updateCourse(id, data);
        else await API.createCourse(data);
        this.closeModal();
        this.route();
        this.toast('Course saved.', 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  async showEnrollmentForm(courseId) {
    let users = [];
    try {
      users = this.user.role === 'admin' ? await API.getUsers() : [];
    } catch (e) {
      users = [];
    }

    this.openModal('Enroll user', `
      <form id="enrollment-form" class="stack">
        ${users.length ? `<label class="form-field"><span>User</span><select class="form-select" id="enroll-user">
          ${users.filter(user => user.role !== 'admin').map(user => `<option value="${user.id}" data-role="${user.role}">${this.esc(user.name)} - ${this.esc(user.email)} (${this.esc(user.role)})</option>`).join('')}
        </select></label>` : this.input('enroll-user', 'User ID', '', 'number')}
        <label class="form-field"><span>Course role</span><select class="form-select" id="enroll-role">
          <option value="student">student</option>
          <option value="teacher">teacher</option>
        </select></label>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Enroll</button>
        </div>
      </form>
    `);

    document.getElementById('enrollment-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.enroll(courseId, { userId: Number(value('enroll-user')), role: value('enroll-role') });
        this.closeModal();
        this.renderCourseDetail(courseId);
        this.toast('Enrollment saved.', 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  showAnnouncementForm(courseId) {
    this.openModal('New announcement', `
      <form id="announcement-form" class="stack">
        ${this.input('announcement-title', 'Title')}
        ${this.textarea('announcement-body', 'Body')}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Publish</button></div>
      </form>
    `);
    document.getElementById('announcement-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.createAnnouncement(courseId, { title: value('announcement-title'), body: value('announcement-body') });
        this.closeModal();
        this.renderCourseDetail(courseId);
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  showResourceForm(courseId) {
    this.openModal('New resource', `
      <form id="resource-form" class="stack">
        ${this.input('resource-title', 'Title')}
        <label class="form-field"><span>Type</span><select class="form-select" id="resource-type"><option value="link">link</option><option value="page">page</option><option value="file">file</option></select></label>
        ${this.input('resource-url', 'URL')}
        ${this.textarea('resource-description', 'Description')}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);
    document.getElementById('resource-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.createResource(courseId, {
          title: value('resource-title'),
          type: value('resource-type'),
          url: value('resource-url'),
          description: value('resource-description')
        });
        this.closeModal();
        this.renderCourseDetail(courseId);
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
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

  async showUserForm(id) {
    const user = id ? (await API.getUsers()).find(item => item.id === id) : {
      name: '', username: '', email: '', role: 'student', status: 'active'
    };
    this.openModal(id ? 'Edit user' : 'New user', `
      <form id="user-form" class="stack">
        ${this.input('user-name', 'Name', user.name)}
        ${this.input('user-username', 'Username', user.username)}
        ${this.input('user-email', 'Email', user.email, 'email')}
        <label class="form-field"><span>Role</span><select class="form-select" id="user-role">${['admin', 'teacher', 'student'].map(role => `<option value="${role}" ${user.role === role ? 'selected' : ''}>${role}</option>`).join('')}</select></label>
        <label class="form-field"><span>Status</span><select class="form-select" id="user-status">${['active', 'disabled'].map(status => `<option value="${status}" ${user.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></label>
        ${this.input('user-password', id ? 'New password' : 'Password', '', 'password')}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);
    document.getElementById('user-form').addEventListener('submit', async event => {
      event.preventDefault();
      const data = {
        name: value('user-name'),
        username: value('user-username'),
        email: value('user-email'),
        role: value('user-role'),
        status: value('user-status')
      };
      if (value('user-password')) data.password = value('user-password');
      try {
        if (id) await API.updateUser(id, data);
        else await API.createUser(data);
        this.closeModal();
        this.renderUsers();
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

  async deleteUser(id) {
    if (!confirm('Delete this user?')) return;
    try {
      await API.deleteUser(id);
      this.renderUsers();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async issuePasswordResetCode(id) {
    try {
      const reset = await API.issuePasswordResetCode(id);
      this.openModal('One-time reset code', `
        <div class="stack">
          <p class="muted">Give this code to ${this.esc(reset.name)}. It is shown only once and expires at ${this.esc(this.formatDate(reset.expiresAt))}.</p>
          <div class="reset-code">${this.esc(reset.code)}</div>
          <div class="modal-actions">
            <button type="button" class="btn btn-primary" onclick="App.closeModal(); App.renderUsers()">Done</button>
          </div>
        </div>
      `);
    } catch (err) {
      this.toast(err.message, 'error');
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

  async deleteAnnouncement(id) {
    if (!confirm('Delete this announcement?')) return;
    try {
      await API.deleteAnnouncement(id);
      this.route();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async deleteResource(id) {
    if (!confirm('Delete this resource?')) return;
    try {
      await API.deleteResource(id);
      this.route();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  collectAttemptAnswers(questions) {
    return questions.map(question => {
      let answer = '';
      const fieldName = `answer-${question.id}`;
      if (question.type === 'MC' || question.type === 'TF') {
        const selected = document.querySelector(`input[name="${fieldName}"]:checked`);
        answer = selected ? selected.value : '';
      } else {
        answer = value(fieldName);
      }
      return { questionId: question.id, answer };
    });
  },

  attemptQuestion(question, index) {
    const answerName = `answer-${question.id}`;
    let answerHtml = '';
    if (question.type === 'MC') {
      answerHtml = question.options.map((option, optionIndex) => `
        <label class="answer-option">
          <input type="radio" name="${answerName}" value="${optionIndex}">
          <span>${this.esc(option)}</span>
        </label>
      `).join('');
    } else if (question.type === 'TF') {
      answerHtml = ['true', 'false'].map(option => `
        <label class="answer-option">
          <input type="radio" name="${answerName}" value="${option}">
          <span>${option}</span>
        </label>
      `).join('');
    } else {
      answerHtml = `<input class="form-input" id="${answerName}" placeholder="Answer">`;
    }

    return `
      <article class="attempt-question">
        <div class="card-topline"><span>Question ${index + 1}</span><span>${question.points} point${Number(question.points) === 1 ? '' : 's'}</span></div>
        <h2>${this.esc(question.text)}</h2>
        <div class="answer-list">${answerHtml}</div>
      </article>
    `;
  },

  stat(label, valueText) {
    return `<div class="stat-card"><span>${this.esc(label)}</span><strong>${valueText}</strong></div>`;
  },

  courseRow(course) {
    return `
      <a class="list-row link-row" href="#/courses/${course.id}">
        <div><strong>${this.esc(course.code)} - ${this.esc(course.title)}</strong><small>${course.studentCount} students, ${course.quizCount} quizzes</small></div>
        <span class="status ${course.visibility}">${this.esc(course.visibility)}</span>
      </a>
    `;
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
  },

  announcementRow(item, manager) {
    return `
      <div class="list-row">
        <div><strong>${this.esc(item.title)}</strong><small>${this.esc(item.body)}</small></div>
        ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.deleteAnnouncement(${item.id})">Delete</button>` : ''}
      </div>
    `;
  },

  resourceRow(item, manager) {
    const title = item.url ? `<a href="${this.esc(item.url)}" target="_blank">${this.esc(item.title)}</a>` : this.esc(item.title);
    return `
      <div class="list-row">
        <div><strong>${title}</strong><small>${this.esc(item.type)} - ${this.esc(item.description || '')}</small></div>
        ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.deleteResource(${item.id})">Delete</button>` : ''}
      </div>
    `;
  },

  userTableRow(user) {
    const canIssueReset = ['teacher', 'student'].includes(user.role) && user.status === 'active';
    return `
      <tr>
        <td>${this.esc(user.name)}</td>
        <td>${this.esc(user.username)}</td>
        <td>${this.esc(user.email)}</td>
        <td><span class="role-badge">${this.esc(user.role)}</span></td>
        <td>${this.esc(user.status)}</td>
        <td class="table-actions">
          ${canIssueReset ? `<button class="btn btn-ghost btn-sm" onclick="App.issuePasswordResetCode(${user.id})">Reset code</button>` : ''}
          <button class="btn btn-ghost btn-sm" onclick="App.showUserForm(${user.id})">Edit</button>
          ${user.id !== this.user.id ? `<button class="btn btn-danger btn-sm" onclick="App.deleteUser(${user.id})">Delete</button>` : ''}
        </td>
      </tr>
    `;
  },

  resetRequestRow(request) {
    const detail = `${request.username} - ${request.email} (${request.role})`;
    const status = request.status === 'issued' && request.expiresAt
      ? `issued, expires ${this.formatDate(request.expiresAt)}`
      : request.status;

    return `
      <div class="list-row">
        <div>
          <strong>${this.esc(request.name)}</strong>
          <small>${this.esc(detail)} - ${this.esc(status)}</small>
        </div>
        <button class="btn btn-primary btn-sm" onclick="App.issuePasswordResetCode(${request.userId})">Issue code</button>
      </div>
    `;
  },

  participantRow(item, manager) {
    return `
      <div class="list-row">
        <div><strong>${this.esc(item.name)}</strong><small>${this.esc(item.email)}</small></div>
        <span class="role-badge">${this.esc(item.courseRole)}</span>
      </div>
    `;
  },

  gradebookPanel(gradebook) {
    if (!gradebook) return '';
    return `
      <div class="panel">
        <div class="panel-header"><h2>Gradebook</h2><span>${gradebook.students.length} students</span></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Student</th>${gradebook.quizzes.map(quiz => `<th>${this.esc(quiz.title)}</th>`).join('')}<th>Average</th></tr></thead>
            <tbody>${gradebook.students.map(student => `
              <tr>
                <td>${this.esc(student.name)}</td>
                ${student.quizzes.map(item => `<td>${item.percentage === null ? '-' : `${item.percentage}%`}</td>`).join('')}
                <td>${student.average === null ? '-' : `${student.average}%`}</td>
              </tr>
            `).join('') || '<tr><td>No students.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    `;
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
  },

  isCourseManager(participants) {
    if (this.user.role === 'admin') return true;
    return participants.some(item => item.id === this.user.id && item.courseRole === 'teacher' && item.enrollmentStatus === 'active');
  },

  canManageLearning() {
    return this.user && ['admin', 'teacher'].includes(this.user.role);
  },

  openModal(title, html) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-overlay').classList.add('active');
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
  },

  setApp(html) {
    document.getElementById('app').innerHTML = html;
  },

  loading(text) {
    return `<div class="empty-state"><h2>${this.esc(text)}</h2></div>`;
  },

  renderError(err) {
    this.setApp(`<div class="empty-state"><h2>${this.esc(err.message)}</h2><button class="btn btn-primary" onclick="App.route()">Retry</button></div>`);
  },

  emptyLine(text) {
    return `<div class="empty-line">${this.esc(text)}</div>`;
  },

  emptyBlock(text) {
    return `<div class="empty-state"><h2>${this.esc(text)}</h2></div>`;
  },

  input(id, label, inputValue = '', type = 'text', placeholder = '') {
    return `<label class="form-field"><span>${this.esc(label)}</span><input class="form-input" id="${id}" type="${type}" value="${this.esc(inputValue)}" placeholder="${this.esc(placeholder)}"></label>`;
  },

  textarea(id, label, inputValue = '') {
    return `<label class="form-field"><span>${this.esc(label)}</span><textarea class="form-textarea" id="${id}">${this.esc(inputValue)}</textarea></label>`;
  },

  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('leaving'), 2600);
    setTimeout(() => toast.remove(), 3100);
  },

  formatDate(dateText) {
    if (!dateText) return '-';
    return new Date(dateText).toLocaleString();
  },

  esc(valueText) {
    const div = document.createElement('div');
    div.textContent = valueText === undefined || valueText === null ? '' : String(valueText);
    return div.innerHTML;
  }
};

function value(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : '';
}

document.addEventListener('DOMContentLoaded', () => App.init());
