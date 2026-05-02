import { API } from '../api.js';

export const DashboardPage = {
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

  stat(label, valueText) {
    return `<div class="stat-card"><span>${this.esc(label)}</span><strong>${valueText}</strong></div>`;
  }
};
