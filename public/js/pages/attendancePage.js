import { API } from '../api.js';
import { value } from '../components/form.js';

export const AttendancePage = {
  async renderAttendance() {
    this.setApp(this.loading('Loading attendance'));
    try {
      if (this.user.role === 'student') {
        const [records, sessions] = await Promise.all([
          API.getMyAttendance(),
          API.getAttendanceSessions().catch(() => [])
        ]);
        this.setApp(`
          <header class="page-header"><div><h1>Attendance</h1><p>${records.length} record${records.length === 1 ? '' : 's'}</p></div></header>
          <section class="panel">
            <div class="panel-header"><h2>Active Sessions</h2></div>
            <div class="list">${sessions.map(session => this.studentSessionRow(session)).join('') || this.emptyLine('No active attendance session is available.')}</div>
          </section>
          <section class="panel">
            <div class="panel-header"><h2>My Records</h2></div>
            <div class="list">${records.map(record => this.studentAttendanceRow(record)).join('') || this.emptyLine('No attendance records yet.')}</div>
          </section>
        `);
        return;
      }

      const [sessions, offerings] = await Promise.all([
        API.getAttendanceSessions(),
        API.getCourseOfferings()
      ]);
      this.setApp(`
        <header class="page-header">
          <div><h1>Attendance</h1><p>${sessions.length} session${sessions.length === 1 ? '' : 's'}</p></div>
          <button class="btn btn-primary" id="btn-new-attendance">New Session</button>
        </header>
        <section class="panel">
          <div class="toolbar">
            <select class="form-select" id="attendance-offering-filter">
              <option value="">All offerings</option>
              ${offerings.map(offering => `<option value="${offering.id}">${this.esc(offering.courseCode)} - ${this.esc(offering.termName)}</option>`).join('')}
            </select>
          </div>
          <div class="list" id="attendance-list">${sessions.map(session => this.attendanceSessionRow(session)).join('') || this.emptyLine('No attendance sessions yet.')}</div>
        </section>
      `);
      document.getElementById('btn-new-attendance').addEventListener('click', () => this.showAttendanceSessionForm());
      document.getElementById('attendance-offering-filter').addEventListener('change', async event => {
        const filtered = await API.getAttendanceSessions({ courseOfferingId: event.target.value });
        document.getElementById('attendance-list').innerHTML =
          filtered.map(session => this.attendanceSessionRow(session)).join('') || this.emptyLine('No attendance sessions yet.');
      });
    } catch (err) {
      this.renderError(err);
    }
  },

  attendanceSessionRow(session) {
    return `
      <div class="list-row">
        <div>
          <strong>${this.esc(session.courseCode)} - ${this.esc(session.courseTitle)}</strong>
          <small>${this.esc(this.formatDate(session.sessionDate))}${session.topic ? ` - ${this.esc(session.topic)}` : ''} - ${session.recordCount || 0} records</small>
        </div>
        <div class="row-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.showAttendanceSummary(${session.courseOfferingId})">Summary</button>
          <button class="btn btn-ghost btn-sm" onclick="App.showAttendanceRecords(${session.id})">Attendees</button>
          <button class="btn btn-primary btn-sm" onclick="App.showMarkAttendanceForm(${session.id}, ${session.courseOfferingId})">Mark</button>
          ${session.status === 'open' ? `<button class="btn btn-ghost btn-sm" onclick="App.closeAttendanceSession(${session.id})">Close</button>` : ''}
        </div>
      </div>
    `;
  },

  studentSessionRow(session) {
    const marked = session.ownAttendanceStatus && session.ownAttendanceStatus !== 'removed';
    return `
      <div class="list-row">
        <div>
          <strong>${this.esc(session.courseCode)} - ${this.esc(session.courseTitle)}</strong>
          <small>${this.esc(this.formatDate(session.sessionDate))}${session.topic ? ` - ${this.esc(session.topic)}` : ''} - ${this.esc(session.status || 'open')}</small>
        </div>
        ${marked
          ? `<span class="status present">Attendance marked</span>`
          : session.status === 'open'
            ? `<button class="btn btn-primary btn-sm" onclick="App.markSelfAttendance(${session.id})">Mark Attendance</button>`
            : `<span class="status closed">Session closed</span>`}
      </div>
    `;
  },

  studentAttendanceRow(record) {
    const note = record.removalNote || record.note;
    const performer = record.removedByName || record.markedByName;
    return `
      <div class="list-row">
        <div>
          <strong>${this.esc(record.courseCode)} - ${this.esc(record.courseTitle)}</strong>
          <small>${this.esc(this.formatDate(record.sessionDate))}${record.topic ? ` - ${this.esc(record.topic)}` : ''}</small>
          ${note ? `<small>${this.esc(note)}${performer ? ` (by ${this.esc(performer)})` : ''}</small>` : ''}
        </div>
        <span class="status ${this.esc(record.status)}">${this.esc(record.status)}</span>
      </div>
    `;
  },

  async showAttendanceSessionForm() {
    const offerings = await API.getCourseOfferings();
    this.openModal('New attendance session', `
      <form id="attendance-session-form" class="stack">
        <label class="form-field"><span>Course offering</span><select class="form-select" id="attendance-offering">
          ${offerings.map(offering => `<option value="${offering.id}">${this.esc(offering.courseCode)} - ${this.esc(offering.termName)}</option>`).join('')}
        </select></label>
        ${this.input('attendance-date', 'Session date and time', this.dateTimeInputValue(), 'datetime-local')}
        ${this.input('attendance-topic', 'Topic')}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Create</button></div>
      </form>
    `);
    document.getElementById('attendance-session-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.createAttendanceSession({
          courseOfferingId: Number(value('attendance-offering')),
          sessionDate: value('attendance-date'),
          topic: value('attendance-topic')
        });
        this.closeModal();
        this.renderAttendance();
        this.toast('Attendance session created.', 'success');
      } catch (err) { this.toast(err.message, 'error'); }
    });
  },

  async showMarkAttendanceForm(sessionId, courseOfferingId) {
    try {
      const [enrollments, existingRecords] = await Promise.all([
        API.getOfferingEnrollments(courseOfferingId),
        API.getAttendanceRecords(sessionId).catch(() => [])
      ]);
      const activeEnrollments = enrollments.filter(item => item.status === 'active');
      const recordsByStudent = new Map(existingRecords.map(record => [Number(record.studentId), record]));
      this.openModal('Mark attendance', `
        <form id="mark-attendance-form" class="stack">
          <div class="assign-list">
            ${activeEnrollments.map(item => {
              const existing = recordsByStudent.get(Number(item.studentId)) || {};
              return `
              <div class="attendance-row" data-student-id="${item.studentId}">
                <div><strong>${this.esc(item.studentName)}</strong><small>${this.esc(item.studentNumber || item.studentEmail)}</small></div>
                <select class="form-select attendance-status">
                  ${['present', 'absent', 'late', 'excused'].map(status => `<option value="${status}" ${existing.status === status ? 'selected' : ''}>${status}</option>`).join('')}
                </select>
                <input class="form-input attendance-note" placeholder="Note" value="${this.esc(existing.note || '')}">
              </div>
            `; }).join('') || this.emptyLine('No active students are enrolled in this offering.')}
          </div>
          <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary" ${activeEnrollments.length ? '' : 'disabled'}>Save</button></div>
        </form>
      `);
      document.getElementById('mark-attendance-form').addEventListener('submit', async event => {
        event.preventDefault();
        const records = Array.from(document.querySelectorAll('.attendance-row')).map(row => ({
          studentId: Number(row.dataset.studentId),
          status: row.querySelector('.attendance-status').value,
          note: row.querySelector('.attendance-note').value.trim()
        }));
        try {
          await API.markAttendance(sessionId, records);
          this.closeModal();
          this.renderAttendance();
          this.toast('Attendance saved.', 'success');
        } catch (err) { this.toast(err.message, 'error'); }
      });
    } catch (err) { this.toast(err.message, 'error'); }
  },

  async showAttendanceRecords(sessionId) {
    try {
      const records = await API.getAttendanceRecords(sessionId);
      this.openModal('Attendees', `
        <div class="stack">
          <div class="list">
            ${records.map(record => `
              <div class="list-row">
                <div>
                  <strong>${this.esc(record.studentName)}</strong>
                  <small>${this.esc(record.studentNumber || record.studentEmail)} - ${this.esc(record.status)}</small>
                  ${record.removalNote ? `<small>Removed: ${this.esc(record.removalNote)}</small>` : ''}
                </div>
                ${record.status !== 'removed' ? `<button class="btn btn-danger btn-sm" onclick="App.showRemoveAttendanceForm(${record.id}, ${sessionId})">Remove</button>` : ''}
              </div>
            `).join('') || this.emptyLine('No attendees yet.')}
          </div>
          <div class="modal-actions"><button type="button" class="btn btn-primary" onclick="App.closeModal()">Done</button></div>
        </div>
      `);
    } catch (err) { this.toast(err.message, 'error'); }
  },

  showRemoveAttendanceForm(recordId, sessionId) {
    this.openModal('Remove attendance', `
      <form id="remove-attendance-form" class="stack">
        ${this.textarea('attendance-removal-note', 'Reason / note')}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.showAttendanceRecords(${sessionId})">Back</button><button class="btn btn-danger">Remove</button></div>
      </form>
    `);
    document.getElementById('remove-attendance-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.removeAttendanceRecord(recordId, value('attendance-removal-note'));
        this.toast('Attendance removed.', 'success');
        this.showAttendanceRecords(sessionId);
      } catch (err) { this.toast(err.message, 'error'); }
    });
  },

  async markSelfAttendance(sessionId) {
    try {
      await API.markSelfAttendance(sessionId);
      this.toast('Attendance marked.', 'success');
      this.renderAttendance();
    } catch (err) { this.toast(err.message, 'error'); }
  },

  async closeAttendanceSession(sessionId) {
    try {
      await API.closeAttendanceSession(sessionId);
      this.toast('Attendance session closed.', 'success');
      this.renderAttendance();
    } catch (err) { this.toast(err.message, 'error'); }
  },

  async showAttendanceSummary(courseOfferingId) {
    try {
      const result = await API.getAttendanceSummary(courseOfferingId);
      this.openModal('Attendance summary', `
        <div class="stack">
          <p class="muted">${this.esc(result.courseOffering.courseCode)} - ${this.esc(result.courseOffering.courseTitle)}</p>
          <section class="stats-grid compact-stats">
            ${['present', 'absent', 'late', 'excused'].map(status => {
              const row = result.summary.find(item => item.status === status);
              return this.stat(status, row ? row.count : 0);
            }).join('')}
          </section>
          <div class="modal-actions"><button type="button" class="btn btn-primary" onclick="App.closeModal()">Done</button></div>
        </div>
      `);
    } catch (err) { this.toast(err.message, 'error'); }
  },

  dateTimeInputValue(date = new Date()) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }
};
