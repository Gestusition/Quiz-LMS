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
  if (root === 'profile') return app.renderProfile();
  if (root === 'courses' && parts[1]) return app.renderCourseDetail(Number(parts[1]));
  if (root === 'courses') return app.renderCourses();
  if (root === 'academic' && app.user.role === 'student') return app.renderForbidden();
  if (root === 'academic') return app.renderAcademic();
  if (root === 'quizzes') return app.renderQuizzes();
  if (root === 'assignments' && parts[1]) return app.renderAssignmentDetail(Number(parts[1]));
  if (root === 'assignments') return app.renderAssignments();
  if (root === 'attendance') return app.renderAttendance();
  if (root === 'questions' && !app.canManageLearning()) return app.renderForbidden();
  if (root === 'questions') return app.renderQuestionBank();
  if (root === 'users' && app.user.role !== 'admin') return app.renderForbidden();
  if (root === 'users') return app.renderUsers();
  if (root === 'analytics' && app.user.role !== 'admin') return app.renderForbidden();
  if (root === 'analytics') return app.renderAnalytics();
  if (root === 'attempt' && parts[1]) return app.renderAttempt(Number(parts[1]));

  app.setApp(`<div class="empty-state"><h2>Page not found</h2><a class="btn btn-primary" href="#/">Dashboard</a></div>`);
}
