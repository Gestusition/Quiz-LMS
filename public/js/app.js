import { API } from './api.js';
import { state } from './state.js';
import { routeTo } from './router.js';
import { esc } from './utils/escape.js';
import { dateInputValue, formatDate, formatDateOnly } from './utils/date.js';
import { setHtml } from './utils/dom.js';
import { value, formMethods } from './components/form.js';
import { modalMethods } from './components/modal.js';
import { toastMethods } from './components/toast.js';
import { emptyStateMethods } from './components/emptyState.js';
import { AuthPage } from './pages/authPage.js';
import { DashboardPage } from './pages/dashboardPage.js';
import { CoursesPage } from './pages/coursesPage.js';
import { CourseDetailPage } from './pages/courseDetailPage.js';
import { QuizzesPage } from './pages/quizzesPage.js';
import { QuestionsPage } from './pages/questionsPage.js';
import { UsersPage } from './pages/usersPage.js';
import { AttemptPage } from './pages/attemptPage.js';
import { ProfilePage } from './pages/profilePage.js';
import { AcademicPage } from './pages/academicPage.js';
import { AssignmentsPage } from './pages/assignmentsPage.js';
import { AttendancePage } from './pages/attendancePage.js';
import { AnalyticsPage } from './pages/analyticsPage.js';

const App = {
  ...state,
  ...formMethods,
  ...modalMethods,
  ...toastMethods,
  ...emptyStateMethods,
  ...AuthPage,
  ...DashboardPage,
  ...CoursesPage,
  ...CourseDetailPage,
  ...QuizzesPage,
  ...QuestionsPage,
  ...UsersPage,
  ...AttemptPage,
  ...ProfilePage,
  ...AcademicPage,
  ...AssignmentsPage,
  ...AttendancePage,
  ...AnalyticsPage,

  async init() {
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay').addEventListener('click', event => {
      if (event.target === event.currentTarget) this.closeModal();
    });
    window.addEventListener('hashchange', () => this.route());

    try {
      this.user = await API.me();
    } catch (e) {
      this.user = null;
    }

    this.renderShell();
    this.startSessionWatchdog();
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
      ['#/profile', 'Profile'],
      ['#/courses', 'Courses'],
      ['#/quizzes', 'Quizzes'],
      ['#/assignments', 'Assignments'],
      ['#/attendance', 'Attendance']
    ];
    if (this.user.role !== 'student') items.splice(3, 0, ['#/academic', 'Academic']);
    if (this.canManageLearning()) items.push(['#/questions', 'Question Bank']);
    if (this.user.role === 'admin') items.push(['#/users', 'Users'], ['#/analytics', 'Analytics'], ['#/maintenance', 'Maintenance']);

    const adminLinks = this.user.role === 'admin'
      ? '<a class="nav-link" href="/api" target="_blank">API</a><a class="nav-link" href="/api-docs" target="_blank">API Docs</a>'
      : '';

    links.innerHTML = items.map(([href, label]) =>
      `<a class="nav-link" href="${href}" data-href="${href}">${label}</a>`
    ).join('') + adminLinks;

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
    return routeTo(this);
  },

  setApp(html) {
    setHtml('app', html);
  },

  esc,

  formatDate,
  formatDateOnly,
  dateInputValue,

  canManageLearning() {
    return this.user && ['admin', 'teacher'].includes(this.user.role);
  },

  startSessionWatchdog() {
    this.stopSessionWatchdog();
    if (!this.user || this.user.role === 'admin') return;

    this._sessionWatchdog = window.setInterval(async () => {
      if (!this.user || this.user.role === 'admin') return;
      try {
        await API.me();
      } catch (e) {
        // API.request handles revoked sessions and routes the user back to sign-in.
      }
    }, 10000);
  },

  stopSessionWatchdog() {
    if (!this._sessionWatchdog) return;
    window.clearInterval(this._sessionWatchdog);
    this._sessionWatchdog = null;
  },

  renderForbidden() {
    this.setApp('<div class="empty-state"><h2>Access denied</h2><p>You do not have permission to open this page.</p><a class="btn btn-primary" href="#/">Dashboard</a></div>');
  }
};

window.App = App;
window.value = value;

document.addEventListener('DOMContentLoaded', () => App.init());

export { App };
