import { API } from '../api.js';

export const AnalyticsPage = {
  async renderAnalytics() {
    if (this.user.role !== 'admin') return this.setApp(this.emptyBlock('Admin access is required.'));
    this.setApp(this.loading('Loading analytics'));
    try {
      const [data, importBatches] = await Promise.all([
        API.getAdminAnalytics(),
        API.getImportBatches({ limit: 10 }).catch(() => ({ items: [] }))
      ]);
      const totals = data.totals || {};
      const health = data.systemHealth || {};
      const recentAudit = data.recentAuditLogs || [];
      const batches = importBatches.items || [];
      this.setApp(`
        <header class="page-header">
          <div><h1>Admin Analytics</h1><p>${data.activeTerm ? `Active term: ${this.esc(data.activeTerm.name)}` : 'No active term'}</p></div>
        </header>
        <section class="stats-grid analytics-grid">
          ${this.stat('Users', totals.users || 0)}
          ${this.stat('Students', totals.students || 0)}
          ${this.stat('Instructors', totals.instructors || 0)}
          ${this.stat('Admins', totals.admins || 0)}
          ${this.stat('Faculties', totals.faculties || 0)}
          ${this.stat('Departments', totals.departments || 0)}
          ${this.stat('Class Years', totals.classYears || 0)}
          ${this.stat('Courses', totals.courses || 0)}
          ${this.stat('Offerings', totals.courseOfferings || 0)}
          ${this.stat('Enrollments', totals.enrollments || 0)}
          ${this.stat('Assignments', totals.assignments || 0)}
          ${this.stat('Submissions', totals.submissions || 0)}
          ${this.stat('Open Issues', health.openValidationIssues || 0)}
          ${this.stat('Import Errors', health.openImportErrors || 0)}
          ${this.stat('Restricted Users', health.restrictedUsers || 0)}
        </section>
        <section class="content-grid">
          <div class="panel">
            <div class="panel-header"><h2>Course Enrollment Summary</h2><span>${data.courseEnrollmentSummary.length}</span></div>
            <div class="list">${data.courseEnrollmentSummary.map(item => `
              <div class="list-row">
                <div><strong>${this.esc(item.courseCode)} - ${this.esc(item.courseTitle)}</strong><small>${this.esc(item.termName)}</small></div>
                <span class="role-badge">${item.enrollmentCount} students</span>
              </div>
            `).join('') || this.emptyLine('No course offering enrollments yet.')}</div>
          </div>
          <div class="panel">
            <div class="panel-header"><h2>Attendance Summary</h2><span>${totals.attendanceRecords || 0} records</span></div>
            <div class="list">${['present', 'absent', 'late', 'excused'].map(status => {
              const row = data.attendanceSummary.find(item => item.status === status);
              return `
                <div class="list-row">
                  <div><strong>${this.esc(status)}</strong><small>All attendance sessions</small></div>
                  <span class="status ${status}">${row ? row.count : 0}</span>
                </div>
              `;
            }).join('')}</div>
          </div>
          <div class="panel">
            <div class="panel-header"><h2>Recent Audit Logs</h2><span>${recentAudit.length}</span></div>
            <div class="list compact">${recentAudit.map(log => `
              <div class="list-row">
                <div><strong>${this.esc(log.action)}</strong><small>${this.esc(log.actorName || 'System')} - ${this.esc(log.entityType)} #${this.esc(log.entityId || '-')}</small></div>
                <small>${this.esc(this.formatDate(log.createdAt))}</small>
              </div>
            `).join('') || this.emptyLine('No audit activity yet.')}</div>
          </div>
          <div class="panel">
            <div class="panel-header"><h2>Import Batches</h2><span>${batches.length}</span></div>
            <div class="list compact">${batches.map(batch => `
              <div class="list-row">
                <div><strong>${this.esc(batch.type)} - ${this.esc(batch.fileName)}</strong><small>${this.esc(batch.status)} | ${batch.successCount}/${batch.totalRows} success</small></div>
                <button class="btn btn-ghost btn-sm" onclick="App.showImportBatchErrors(${batch.id})">Errors</button>
              </div>
            `).join('') || this.emptyLine('No import batches yet.')}</div>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><h2>Department Summaries</h2><span>${data.departmentSummary.length}</span></div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Department</th><th>Faculty</th><th>Students</th><th>Instructors</th><th>Courses</th><th>Offerings</th></tr></thead>
              <tbody>${data.departmentSummary.map(item => `
                <tr>
                  <td><strong>${this.esc(item.code)} - ${this.esc(item.name)}</strong></td>
                  <td>${this.esc(item.facultyName)}</td>
                  <td>${item.studentCount}</td>
                  <td>${item.instructorCount}</td>
                  <td>${item.courseCount}</td>
                  <td>${item.offeringCount}</td>
                </tr>
              `).join('') || '<tr><td colspan="6">No department data yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      `);
    } catch (err) {
      this.renderError(err);
    }
  },

  async showImportBatchErrors(batchId) {
    try {
      const result = await API.getImportErrors(batchId, { limit: 100 });
      const errors = result.items || [];
      this.openModal(`Import batch #${batchId} errors`, `
        <div class="stack">
          <div class="list compact">
            ${errors.map(item => `
              <div class="list-row">
                <div>
                  <strong>Row ${item.rowNumber} - ${this.esc(item.errorField || 'general')}</strong>
                  <small>${this.esc(item.errorMessage)} | ${this.esc(item.status)}</small>
                </div>
                ${item.status === 'unresolved' ? `<button class="btn btn-ghost btn-sm" onclick="App.resolveImportError(${item.id})">Mark fixed</button>` : ''}
              </div>
            `).join('') || this.emptyLine('No import errors in this batch.')}
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-primary" onclick="App.closeModal()">Close</button>
          </div>
        </div>
      `);
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async resolveImportError(errorId) {
    try {
      await API.resolveImportError(errorId, { status: 'fixed' });
      this.toast('Import error marked as fixed.', 'success');
      this.closeModal();
      this.renderAnalytics();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  }
};
