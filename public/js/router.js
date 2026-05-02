export function routeTo(app) {
  app.markActiveNav();
  if (!app.user) {
    app.renderLogin();
    return;
  }
  if (app.user.mustChangeCredentials) {
    app.renderCredentialChange();
    return;
  }

  const hash = location.hash || '#/';
  const parts = hash.replace('#/', '').split('/').filter(Boolean);
  const root = parts[0] || '';

  if (!root) return app.renderDashboard();
  if (root === 'courses' && parts[1]) return app.renderCourseDetail(Number(parts[1]));
  if (root === 'courses') return app.renderCourses();
  if (root === 'quizzes') return app.renderQuizzes();
  if (root === 'questions') return app.renderQuestionBank();
  if (root === 'users') return app.renderUsers();
  if (root === 'attempt' && parts[1]) return app.renderAttempt(Number(parts[1]));

  app.setApp(`<div class="empty-state"><h2>Page not found</h2><a class="btn btn-primary" href="#/">Dashboard</a></div>`);
}
