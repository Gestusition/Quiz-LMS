import { API } from '../api.js';

const AUDIT_LOG_LIMIT = 15;
const IMPORT_BATCH_LIMIT = 10;

export const AnalyticsPage = {
  async renderAnalytics() {
    if (this.user.role !== 'admin') return this.setApp(this.emptyBlock('Admin access is required.'));
    this.setApp(this.loading('Loading analytics'));
    try {
      const [data, importBatches] = await Promise.all([
        API.getAdminAnalytics(),
        API.getImportBatches({ limit: IMPORT_BATCH_LIMIT }).catch(() => ({ items: [] }))
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
        <section class="content-grid analytics-dashboard-grid">
          <div class="analytics-dashboard-column">
            <div class="panel analytics-enrollment-panel">
              <div class="panel-header"><h2>Course Enrollment Summary</h2><span>${data.courseEnrollmentSummary.length}</span></div>
              <div class="list compact scroll-list course-enrollment-scroll-list">${data.courseEnrollmentSummary.map(item => `
                <div class="list-row">
                  <div><strong>${this.esc(item.courseCode)} - ${this.esc(item.courseTitle)}</strong><small>${this.esc(item.termName)}</small></div>
                  <span class="role-badge">${item.enrollmentCount} students</span>
                </div>
              `).join('') || this.emptyLine('No course offering enrollments yet.')}</div>
            </div>

            <div class="panel analytics-audit-panel">
              <div class="panel-header"><h2>Recent Audit Logs</h2><span id="audit-log-total">${recentAudit.length}</span></div>
              <div class="toolbar compact-toolbar analytics-filter-toolbar">
                <label class="form-field inline-field"><span>Date</span><input class="form-input" id="audit-log-date" type="date"></label>
                <button class="btn btn-ghost btn-sm" id="audit-log-clear" type="button">Clear</button>
              </div>
              <div class="list compact scroll-list analytics-scroll-list" id="audit-log-list">${this.auditLogRows(recentAudit)}</div>
            </div>
          </div>

          <div class="analytics-dashboard-column">
            <div class="panel analytics-attendance-panel">
              <div class="panel-header"><h2>Attendance Summary</h2><span id="attendance-summary-total">${totals.attendanceRecords || 0} records</span></div>
              <div class="toolbar compact-toolbar analytics-filter-toolbar">
                <label class="form-field inline-field"><span>Date</span><input class="form-input" id="attendance-summary-date" type="date"></label>
                <button class="btn btn-ghost btn-sm" id="attendance-summary-clear" type="button">Clear</button>
              </div>
              <div class="list compact" id="attendance-summary-list">${this.attendanceSummaryRows(data.attendanceSummary || [])}</div>
            </div>

            <div class="panel analytics-import-panel">
              <div class="panel-header"><h2>Import Batches</h2><span id="import-batch-total">${batches.length}</span></div>
              <form class="toolbar compact-toolbar analytics-import-upload-form" id="import-upload-form">
                <label class="form-field inline-field"><span>Type</span><select class="form-input" id="import-upload-type">
                  <option value="users">Users</option>
                  <option value="courses">Courses</option>
                  <option value="enrollments">Enrollments</option>
                </select></label>
                <label class="form-field inline-field"><span>CSV</span><input class="form-input" id="import-upload-file" type="file" accept=".csv,text/csv"></label>
                <button class="btn btn-primary btn-sm" type="submit">Import</button>
              </form>
              <div class="toolbar compact-toolbar analytics-filter-toolbar">
                <label class="form-field inline-field"><span>Date</span><input class="form-input" id="import-batch-date" type="date"></label>
                <button class="btn btn-ghost btn-sm" id="import-batch-clear" type="button">Clear</button>
              </div>
              <div class="list compact scroll-list analytics-scroll-list" id="import-batch-list">${this.importBatchRows(batches)}</div>
            </div>
          </div>
        </section>
        <section class="panel analytics-department-panel">
          <div class="panel-header"><h2>Department Summaries</h2><span>${data.departmentSummary.length}</span></div>
          <div class="table-wrap scroll-table analytics-table-scroll">
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
      this.initAttendanceSummary(data.attendanceSummary || [], totals.attendanceRecords || 0);
      this.initAuditLogFilter(recentAudit);
      this.initImportBatchFilter(batches);
    } catch (err) {
      this.renderError(err);
    }
  },

  auditLogRows(logs = []) {
    return logs.map(log => this.auditLogRow(log)).join('') || this.emptyLine('No audit activity yet.');
  },

  auditLogRow(log) {
    return `
      <div class="list-row">
        <div><strong>${this.esc(log.action)}</strong><small>${this.esc(log.actorName || 'System')} - ${this.esc(log.entityType)} #${this.esc(log.entityId || '-')}</small></div>
        <small>${this.esc(this.formatDate(log.createdAt))}</small>
      </div>
    `;
  },

  importBatchRows(batches = []) {
    return batches.map(batch => this.importBatchRow(batch)).join('') || this.emptyLine('No import batches yet.');
  },

  importBatchCounts(batch = {}) {
    const created = batch.createdCount ?? batch.createdRows ?? batch.successRows ?? batch.successCount ?? 0;
    const updated = batch.updatedCount ?? batch.updatedRows ?? 0;
    const skipped = batch.skippedCount ?? batch.skippedRows ?? 0;
    const failed = batch.failedCount ?? batch.failedRows ?? 0;
    const validationErrors = batch.validationErrorCount ?? batch.validationErrors ?? (Number(failed) + Number(skipped));
    return { created, updated, skipped, failed, validationErrors };
  },

  importBatchSummary(batch = {}) {
    const counts = this.importBatchCounts(batch);
    return [
      `${counts.created} created`,
      `${counts.updated} updated`,
      `${counts.skipped} skipped`,
      `${counts.failed} failed`,
      `${counts.validationErrors} errors`
    ].join(' | ');
  },

  importBatchRow(batch) {
    const createdAt = batch.createdAt ? this.formatDate(batch.createdAt) : '';
    const importer = batch.importerName || batch.uploadedByName || 'System';
    const fileType = batch.fileType ? `.${batch.fileType}` : 'CSV';
    return `
      <div class="list-row">
        <div>
          <strong>${this.esc(batch.batchNumber || `Batch #${batch.id}`)} - ${this.esc(batch.type)} - ${this.esc(batch.fileName)}</strong>
          <small>${this.esc(batch.status)} | ${this.importBatchSummary(batch)} | ${this.esc(batch.totalRows || 0)} rows</small>
          <small>${this.esc(importer)}${createdAt ? ` | ${this.esc(createdAt)}` : ''} | ${this.esc(fileType)}</small>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="App.showImportBatchErrors(${batch.id})">Details</button>
      </div>
    `;
  },

  initAuditLogFilter(logs) {
    this.auditLogBase = logs;
    const dateInput = document.getElementById('audit-log-date');
    const clearButton = document.getElementById('audit-log-clear');
    if (dateInput) {
      dateInput.addEventListener('change', () => this.updateAuditLogsForDate());
    }
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        if (dateInput) dateInput.value = '';
        this.renderAuditLogs(logs);
      });
    }
  },

  renderAuditLogs(logs = []) {
    const list = document.getElementById('audit-log-list');
    const totalLabel = document.getElementById('audit-log-total');
    if (list) list.innerHTML = this.auditLogRows(logs);
    if (totalLabel) totalLabel.textContent = logs.length;
  },

  async updateAuditLogsForDate() {
    const date = document.getElementById('audit-log-date')?.value || '';
    if (!date) {
      this.renderAuditLogs(this.auditLogBase || []);
      return;
    }

    try {
      const logs = await API.getAuditLogs({ limit: AUDIT_LOG_LIMIT, date });
      this.renderAuditLogs(logs || []);
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  initImportBatchFilter(batches) {
    this.importBatchBase = batches;
    const dateInput = document.getElementById('import-batch-date');
    const clearButton = document.getElementById('import-batch-clear');
    if (dateInput) {
      dateInput.addEventListener('change', () => this.updateImportBatchesForDate());
    }
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        if (dateInput) dateInput.value = '';
        this.renderImportBatches(batches);
      });
    }
    const uploadForm = document.getElementById('import-upload-form');
    if (uploadForm) {
      uploadForm.addEventListener('submit', event => this.submitImportBatch(event));
    }
  },

  renderImportBatches(batches = []) {
    const list = document.getElementById('import-batch-list');
    const totalLabel = document.getElementById('import-batch-total');
    if (list) list.innerHTML = this.importBatchRows(batches);
    if (totalLabel) totalLabel.textContent = batches.length;
  },

  async updateImportBatchesForDate() {
    const date = document.getElementById('import-batch-date')?.value || '';
    if (!date) {
      this.renderImportBatches(this.importBatchBase || []);
      return;
    }

    try {
      const result = await API.getImportBatches({ limit: IMPORT_BATCH_LIMIT, date });
      this.renderImportBatches(result.items || []);
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  attendanceStatuses() {
    return ['present', 'absent', 'late', 'excused'];
  },

  attendanceSummaryRows(summary = []) {
    const counts = new Map(summary.map(item => [item.status, Number(item.count || 0)]));
    return this.attendanceStatuses().map(status => this.attendanceSummaryRow(status, counts.get(status) || 0)).join('');
  },

  attendanceSummaryRow(status, count) {
    return `
      <button class="list-row attendance-summary-row" type="button" data-status="${this.esc(status)}">
        <div>
          <strong>${this.esc(status)}</strong>
          <small>All courses</small>
        </div>
        <span class="status ${this.esc(status)}">${this.esc(count)}</span>
      </button>
    `;
  },

  initAttendanceSummary(summary, total) {
    this.attendanceSummaryBase = { summary, total };
    this.attendanceRecordDetailsCache = null;
    this.bindAttendanceSummaryRows();

    const dateInput = document.getElementById('attendance-summary-date');
    const clearButton = document.getElementById('attendance-summary-clear');
    if (dateInput) {
      dateInput.addEventListener('change', () => this.updateAttendanceSummaryForDate());
    }
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        if (dateInput) dateInput.value = '';
        this.renderAttendanceSummary(summary, total);
      });
    }
  },

  bindAttendanceSummaryRows() {
    document.querySelectorAll('.attendance-summary-row').forEach(row => {
      row.addEventListener('click', () => this.showAttendanceRecordsForStatus(row.dataset.status));
    });
  },

  renderAttendanceSummary(summary, total) {
    const list = document.getElementById('attendance-summary-list');
    const totalLabel = document.getElementById('attendance-summary-total');
    if (list) list.innerHTML = this.attendanceSummaryRows(summary);
    if (totalLabel) totalLabel.textContent = `${total} record${Number(total) === 1 ? '' : 's'}`;
    this.bindAttendanceSummaryRows();
  },

  async updateAttendanceSummaryForDate() {
    const date = document.getElementById('attendance-summary-date')?.value || '';
    if (!date) {
      this.renderAttendanceSummary(this.attendanceSummaryBase.summary, this.attendanceSummaryBase.total);
      return;
    }

    try {
      const records = await this.getAttendanceRecordDetails();
      const filtered = this.filterAttendanceRecordsByDate(records, date);
      const summary = this.attendanceStatuses().map(status => ({
        status,
        count: filtered.filter(record => record.status === status).length
      }));
      this.renderAttendanceSummary(summary, filtered.length);
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async getAttendanceRecordDetails(filters = {}) {
    if (!filters.status && this.attendanceRecordDetailsCache) return this.attendanceRecordDetailsCache;
    const records = await API.getAttendanceRecordDetails(filters);
    if (!filters.status) this.attendanceRecordDetailsCache = records;
    return records;
  },

  async showAttendanceRecordsForStatus(status) {
    try {
      const records = await this.getAttendanceRecordDetails({ status });
      const selectedDate = document.getElementById('attendance-summary-date')?.value || '';
      this.openAttendanceRecordsModal(status, records, selectedDate);
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  openAttendanceRecordsModal(status, records, selectedDate = '') {
    const filtered = this.filterAttendanceRecordsByDate(records, selectedDate);
    this.openModal(`${status} attendance`, `
      <div class="stack">
        <div class="toolbar compact-toolbar">
          <label class="form-field inline-field"><span>Date</span><input class="form-input" id="attendance-record-date-filter" type="date" value="${this.esc(selectedDate)}"></label>
          <button class="btn btn-ghost btn-sm" id="attendance-record-clear" type="button">Clear</button>
          <span class="muted" id="attendance-record-count">${filtered.length} record${filtered.length === 1 ? '' : 's'}</span>
        </div>
        <div class="list compact scroll-list attendance-record-list" id="attendance-record-list">
          ${this.attendanceRecordRows(filtered)}
        </div>
        <div class="modal-actions"><button type="button" class="btn btn-primary" onclick="App.closeModal()">Done</button></div>
      </div>
    `);

    const dateInput = document.getElementById('attendance-record-date-filter');
    const clearButton = document.getElementById('attendance-record-clear');
    const update = () => {
      const nextDate = dateInput?.value || '';
      const nextRecords = this.filterAttendanceRecordsByDate(records, nextDate);
      document.getElementById('attendance-record-list').innerHTML = this.attendanceRecordRows(nextRecords);
      document.getElementById('attendance-record-count').textContent = `${nextRecords.length} record${nextRecords.length === 1 ? '' : 's'}`;
    };
    if (dateInput) dateInput.addEventListener('change', update);
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        if (dateInput) dateInput.value = '';
        update();
      });
    }
  },

  attendanceRecordRows(records) {
    return records.map(record => this.attendanceRecordRow(record)).join('') ||
      this.emptyLine('No attendance records match this filter.');
  },

  attendanceRecordRow(record) {
    const marker = record.markedByName || record.sessionCreatedByName || record.instructorName || 'Unknown user';
    const studentId = record.studentNumber || record.studentEmail || `User #${record.studentId}`;
    return `
      <div class="list-row attendance-record-row">
        <div>
          <strong>${this.esc(record.courseCode)} - ${this.esc(record.courseTitle)}</strong>
          <small>${this.esc(record.termName || '')}${record.topic ? ` - ${this.esc(record.topic)}` : ''}</small>
          <small>Student: ${this.esc(record.studentName || 'Unknown student')} (${this.esc(studentId)})</small>
          <small>Session: ${this.esc(this.formatDate(record.sessionDate))}</small>
          <small>Marked by: ${this.esc(marker)}${record.updatedAt ? ` - ${this.esc(this.formatDate(record.updatedAt))}` : ''}</small>
          ${record.note ? `<small>Note: ${this.esc(record.note)}</small>` : ''}
        </div>
        <span class="status ${this.esc(record.status)}">${this.esc(record.status)}</span>
      </div>
    `;
  },

  filterAttendanceRecordsByDate(records, date) {
    if (!date) return records;
    return records.filter(record => this.localDateValue(record.sessionDate) === date);
  },

  localDateValue(dateText) {
    if (!dateText) return '';
    const date = new Date(dateText);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  async showImportBatchErrors(batchId) {
    try {
      const detail = await API.getImportBatch(batchId);
      const errors = detail.errors || [];
      const counts = this.importBatchCounts(detail);
      this.openModal(`${detail.batchNumber || `Batch #${batchId}`} details`, `
        <div class="stack">
          <div class="list compact">
            <div class="list-row">
              <div>
                <strong>${this.esc(detail.type)} - ${this.esc(detail.fileName)}</strong>
                <small>${this.esc(detail.status)} | ${this.esc(detail.totalRows || 0)} rows | ${this.esc(detail.importerName || detail.uploadedByName || 'System')}</small>
                <small>${this.esc(detail.createdAt ? this.formatDate(detail.createdAt) : '')} | ${this.esc(detail.mimeType || detail.fileType || 'text/csv')}</small>
              </div>
            </div>
            <div class="list-row">
              <div>
                <strong>${this.esc(counts.created)} created | ${this.esc(counts.updated)} updated | ${this.esc(counts.skipped)} skipped</strong>
                <small>${this.esc(counts.failed)} failed | ${this.esc(counts.validationErrors)} validation errors</small>
              </div>
            </div>
          </div>
          <div class="list compact">
            ${errors.map(item => `
              <div class="list-row">
                <div>
                  <strong>Row ${item.rowNumber} - ${this.esc(item.errorField || 'general')}</strong>
                  <small>${this.esc(item.errorMessage)} | ${this.esc(item.status)}</small>
                  ${this.importErrorRawData(item)}
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

  importErrorRawData(item = {}) {
    const raw = item.rawData || this.safeJsonParse(item.rawDataJson);
    if (!raw || Object.keys(raw).length === 0) return '';
    return `<small>${this.esc(JSON.stringify(raw))}</small>`;
  },

  safeJsonParse(value) {
    try {
      return value ? JSON.parse(value) : null;
    } catch (err) {
      return null;
    }
  },

  async submitImportBatch(event) {
    event.preventDefault();
    const type = document.getElementById('import-upload-type')?.value || 'users';
    const file = document.getElementById('import-upload-file')?.files?.[0];
    if (!file) {
      this.toast('Choose a CSV file.', 'error');
      return;
    }
    try {
      await API.runImportBatch(type, file);
      this.toast('Import completed.', 'success');
      await this.renderAnalytics();
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
