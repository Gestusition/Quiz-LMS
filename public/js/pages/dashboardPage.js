import { API } from '../api.js';

export const DashboardPage = {
  async renderDashboard() {
    document.body.classList.remove('login-page');
    this.setApp(this.loading('Loading dashboard'));

    try {
      if (this.user.role === 'admin') {
        await this.renderAdminDashboard();
        return;
      }
      if (this.user.role === 'teacher') {
        await this.renderTeacherDashboard();
        return;
      }
      await this.renderStudentDashboard();
    } catch (err) {
      this.renderError(err);
    }
  },

  async renderAdminDashboard() {
    const [usersResult, courses, terms, analytics, issuesResult, importsResult, auditLogs, maintenance] = await Promise.all([
      API.getUsers({ page: 1, limit: 100 }),
      API.getCourses(),
      API.getTerms().catch(() => []),
      API.getAdminAnalytics(),
      API.getValidationIssues({ status: 'open', limit: 20 }).catch(() => ({ items: [] })),
      API.getImportBatches({ limit: 20 }).catch(() => ({ items: [] })),
      API.getAuditLogs(40).catch(() => []),
      API.getMaintenanceMode().catch(() => ({ enabled: false }))
    ]);

    const users = usersResult.items || [];
    const totals = analytics.totals || {};
    const systemHealth = analytics.systemHealth || {};
    const openIssues = issuesResult.items || [];
    const importBatches = importsResult.items || [];

    this.setApp(`
      <header class="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>${this.esc(this.user.name)} - institutional overview</p>
        </div>
        <div class="header-actions">
          <a class="btn btn-ghost" href="#/users">Manage users</a>
          <a class="btn btn-primary" href="#/academic">Academic setup</a>
        </div>
      </header>

      ${this.maintenanceNotice(maintenance)}

      <section class="stats-grid">
        ${this.stat('Total users', totals.users || users.length)}
        ${this.stat('Students', totals.students || users.filter(user => user.role === 'student').length)}
        ${this.stat('Teachers', totals.instructors || users.filter(user => user.role === 'teacher').length)}
        ${this.stat('Courses', totals.courses || courses.length)}
        ${this.stat('Active terms', terms.filter(term => term.isActive).length)}
        ${this.stat('Open issues', systemHealth.openValidationIssues || openIssues.length)}
        ${this.stat('Import errors', systemHealth.openImportErrors || 0)}
        ${this.stat('Restricted users', systemHealth.restrictedUsers || 0)}
      </section>

      <section class="content-grid admin-dashboard-grid">
        <div class="panel">
          <div class="panel-header"><h2>Recent Audit Logs</h2><a href="#/analytics">Open analytics</a></div>
          <div class="list compact scroll-list dashboard-scroll-list">
            ${(auditLogs || []).map(log => `
              <div class="list-row">
                <div>
                  <strong>${this.esc(log.action)}</strong>
                  <small>${this.esc(log.actorName || 'System')} - ${this.esc(log.entityType)} #${this.esc(log.entityId || '-')}</small>
                </div>
                <small>${this.esc(this.formatDate(log.createdAt))}</small>
              </div>
            `).join('') || this.emptyLine('No recent audit logs.')}
          </div>
        </div>

        <div class="admin-dashboard-column">
          <div class="panel admin-dashboard-validation">
            <div class="panel-header"><h2>Open Validation Issues</h2><a href="#/analytics">System health</a></div>
            <div class="list compact scroll-list dashboard-scroll-list">
              ${openIssues.map(item => `
                <div class="list-row">
                  <div>
                    <strong>${this.esc(item.entityType)} #${this.esc(item.entityId || '-')}</strong>
                    <small>${this.esc(item.severity)} - ${this.esc(item.message)}</small>
                  </div>
                </div>
              `).join('') || this.emptyLine('No open validation issues.')}
            </div>
          </div>

          <div class="panel admin-dashboard-imports">
            <div class="panel-header"><h2>Import Batches</h2><a href="#/analytics">View reports</a></div>
            <div class="list compact scroll-list dashboard-scroll-list">
              ${importBatches.map(batch => `
                <div class="list-row">
                  <div>
                    <strong>${this.esc(batch.batchNumber || `Batch #${batch.id}`)} - ${this.esc(batch.type)} - ${this.esc(batch.fileName)}</strong>
                    <small>${this.esc(batch.status)} | ${batch.createdCount ?? batch.successRows ?? batch.successCount ?? 0} created | ${batch.skippedCount ?? 0} skipped | ${batch.failedCount ?? batch.failedRows ?? 0} failed</small>
                  </div>
                </div>
              `).join('') || this.emptyLine('No import batches yet.')}
            </div>
          </div>
        </div>
      </section>
    `);
  },

  async renderMaintenance() {
    document.body.classList.remove('login-page');
    this.setApp(this.loading('Loading maintenance mode'));

    try {
      const maintenance = await API.getMaintenanceMode();
      const statusLabel = maintenance.enabled ? 'On' : 'Off';
      const actionLabel = maintenance.enabled ? 'Turn off maintenance mode' : 'Turn on maintenance mode';
      const actionEnabled = maintenance.enabled ? 'false' : 'true';

      this.setApp(`
        <header class="page-header">
          <div>
            <a class="back-link" href="#/">Back to dashboard</a>
            <h1>Maintenance Mode</h1>
            <p>Control whether teachers and students can access Quiz LMS.</p>
          </div>
        </header>

        <section class="panel maintenance-panel">
          <div class="maintenance-status-row">
            <div>
              <span class="status-chip ${maintenance.enabled ? 'restricted' : 'active'}">Maintenance ${statusLabel}</span>
              <h2>${maintenance.enabled ? 'Teachers and students are locked out' : 'Quiz LMS is open'}</h2>
              <p class="muted">${maintenance.enabled
                ? 'Teachers and students cannot sign in. Active teacher and student sessions are ended by the server.'
                : 'Teachers and students can sign in and continue normal coursework.'}</p>
            </div>
            <button class="btn ${maintenance.enabled ? 'btn-primary' : 'btn-danger'}" id="btn-toggle-maintenance" data-enabled="${actionEnabled}">
              ${actionLabel}
            </button>
          </div>
          <div class="maintenance-meta">
            <span>Default on for fresh installs</span>
            <span>Last updated: ${this.esc(maintenance.updatedAt ? this.formatDate(maintenance.updatedAt) : 'Never')}</span>
          </div>
        </section>
      `);

      document.getElementById('btn-toggle-maintenance').addEventListener('click', event => {
        const enabled = event.currentTarget.dataset.enabled === 'true';
        this.toggleMaintenanceMode(enabled);
      });
    } catch (err) {
      this.renderError(err);
    }
  },

  async toggleMaintenanceMode(enabled) {
    if (enabled && !confirm('Turn on maintenance mode? Teachers and students will be signed out.')) return;

    try {
      const result = await API.updateMaintenanceMode(enabled);
      const revoked = Number(result.revokedSessions || 0);
      this.toast(enabled
        ? `Maintenance mode is on. ${revoked} teacher/student session${revoked === 1 ? '' : 's'} ended.`
        : 'Maintenance mode is off. Teachers and students can sign in.',
      'success');
      await this.renderMaintenance();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async renderTeacherDashboard() {
    const [courses, quizzes, assignments, offerings, sessions, issuesResult] = await Promise.all([
      API.getCourses(),
      API.getQuizzes(),
      API.getAssignments(),
      API.getCourseOfferings({ activeTerm: true }).catch(() => []),
      API.getAttendanceSessions().catch(() => []),
      API.getValidationIssues({ status: 'open', relatedUserId: this.user.id, limit: 8 }).catch(() => ({ items: [] }))
    ]);

    const pendingAssignments = assignments.filter(item => item.status === 'published' && Number(item.submissionCount || 0) > 0);
    const activeQuizzes = quizzes.filter(item => item.status === 'published');

    this.setApp(`
      <header class="page-header">
        <div>
          <h1>Teacher Dashboard</h1>
          <p>${this.esc(this.user.name)} - manage your courses and assessments</p>
        </div>
        <div class="header-actions">
          <a class="btn btn-ghost" href="#/courses">My courses</a>
          <a class="btn btn-primary" href="#/quizzes">Manage quizzes</a>
        </div>
      </header>

      <section class="stats-grid">
        ${this.stat('My courses', courses.length)}
        ${this.stat('Active offerings', offerings.length)}
        ${this.stat('Published quizzes', activeQuizzes.length)}
        ${this.stat('Pending submissions', pendingAssignments.length)}
        ${this.stat('Attendance sessions', sessions.length)}
        ${this.stat('Open issues', (issuesResult.items || []).length)}
      </section>

      <section class="content-grid teacher-dashboard-grid">
        <div class="teacher-dashboard-column">
          <div class="panel teacher-dashboard-activity">
            <div class="panel-header"><h2>Course Activity</h2><a href="#/courses">Open courses</a></div>
            <div class="list">${courses.slice(0, 6).map(course => this.courseRow(course)).join('') || this.emptyLine('No courses assigned.')}</div>
          </div>
          <div class="panel teacher-dashboard-issues">
            <div class="panel-header"><h2>Course Issues</h2><span>${(issuesResult.items || []).length} open</span></div>
            <div class="list compact">
              ${(issuesResult.items || []).map(item => `
                <div class="list-row">
                  <div><strong>${this.esc(item.entityType)} #${this.esc(item.entityId || '-')}</strong><small>${this.esc(item.severity)} - ${this.esc(item.message)}</small></div>
                </div>
              `).join('') || this.emptyLine('No open course issues.')}
            </div>
          </div>
        </div>
        <div class="panel teacher-dashboard-quizzes">
          <div class="panel-header"><h2>Upcoming/Active Quizzes</h2><a href="#/quizzes">Open quizzes</a></div>
          <div class="list">${activeQuizzes.slice(0, 6).map(quiz => this.quizRow(quiz)).join('') || this.emptyLine('No active quizzes.')}</div>
        </div>
      </section>
    `);
  },

  async renderStudentDashboard() {
    const [courses, quizzes, assignments, attendance] = await Promise.all([
      API.getCourses(),
      API.getQuizzes(),
      API.getAssignments(),
      API.getMyAttendance().catch(() => [])
    ]);

    const upcomingQuizzes = quizzes.filter(quiz => quiz.status === 'published').slice(0, 8);
    const dueAssignments = assignments.filter(item => item.status === 'published').slice(0, 8);
    const recentAttendance = attendance.slice(0, 8);

    this.setApp(`
      <header class="page-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>${this.esc(this.user.name)} - your current academic life</p>
        </div>
        <div class="header-actions">
          <a class="btn btn-ghost" href="#/courses">My courses</a>
          <a class="btn btn-primary" href="#/quizzes">Open quizzes</a>
        </div>
      </header>

      <section class="stats-grid">
        ${this.stat('Enrolled courses', courses.length)}
        ${this.stat('Upcoming quizzes', upcomingQuizzes.length)}
        ${this.stat('Assignments due', dueAssignments.length)}
        ${this.stat('Attendance records', attendance.length)}
      </section>

      <section class="content-grid student-dashboard-grid">
        <div class="student-dashboard-column">
          <div class="panel student-dashboard-courses">
            <div class="panel-header"><h2>Courses</h2><a href="#/courses">View all</a></div>
            <div class="list">${courses.map(course => this.courseRow(course)).join('') || this.emptyLine('No courses enrolled yet.')}</div>
          </div>

          <div class="panel student-dashboard-assignments">
            <div class="panel-header"><h2>Assignments due</h2><a href="#/assignments">View all</a></div>
            <div class="list compact">
              ${dueAssignments.map(item => `
                <div class="list-row">
                  <div>
                    <strong>${this.esc(item.title)}</strong>
                    <small>${this.esc(item.courseCode || '')} - due ${this.esc(item.dueDate ? this.formatDate(item.dueDate) : 'N/A')}</small>
                  </div>
                  <span class="status-chip ${this.esc(item.ownSubmissionStatus || 'pending')}">${this.esc(item.ownSubmissionStatus || 'not submitted')}</span>
                </div>
              `).join('') || this.emptyLine('No assignments due.')}
            </div>
          </div>

          <div class="panel student-dashboard-attendance">
            <div class="panel-header"><h2>Attendance summary</h2><a href="#/attendance">View all</a></div>
            <div class="list compact">
              ${recentAttendance.map(item => `
                <div class="list-row">
                  <div>
                    <strong>${this.esc(item.courseCode)}</strong>
                    <small>${this.esc(item.status)} - ${this.esc(this.formatDate(item.sessionDate))}</small>
                  </div>
                </div>
              `).join('') || this.emptyLine('No attendance records yet.')}
            </div>
          </div>
        </div>

        <div class="student-dashboard-column">
          <div class="panel student-dashboard-quizzes">
            <div class="panel-header"><h2>Upcoming quizzes/exams</h2><a href="#/quizzes">View all</a></div>
            <div class="list">${upcomingQuizzes.map(quiz => this.quizRow(quiz)).join('') || this.emptyLine('No quizzes available.')}</div>
          </div>
        </div>
      </section>
    `);
  },

  stat(label, valueText) {
    return `<div class="stat-card"><span>${this.esc(label)}</span><strong>${valueText}</strong></div>`;
  },

  maintenanceNotice(maintenance) {
    if (!maintenance || !maintenance.enabled) return '';

    return `
      <section class="maintenance-banner" role="status">
        <div>
          <strong>Maintenance mode is on</strong>
          <p>Teachers and students cannot sign in. Turn it off when setup is complete.</p>
        </div>
        <a class="btn btn-primary" href="#/maintenance">Open maintenance page</a>
      </section>
    `;
  }
};
