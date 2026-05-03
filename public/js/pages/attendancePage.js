import { API } from '../api.js';
import { value } from '../components/form.js';

export const AttendancePage = {
  async renderAttendance() {
    this.setApp(this.loading('Loading attendance'));
    try {
      if (this.user.role === 'student') {
        const records = await API.getMyAttendance();
        this.setApp(`
          <header class="page-header"><div><h1>Attendance</h1><p>${records.length} record${records.length === 1 ? '' : 's'}</p></div></header>
          <section class="panel">
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
          <small>${this.esc(session.sessionDate)}${session.topic ? ` - ${this.esc(session.topic)}` : ''} - ${session.recordCount || 0} records</small>
        </div>
        <div class="row-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.showAttendanceSummary(${session.courseOfferingId})">Summary</button>
          <button class="btn btn-primary btn-sm" onclick="App.showMarkAttendanceForm(${session.id}, ${session.courseOfferingId})">Mark</button>
        </div>
      </div>
    `;
  },

  studentAttendanceRow(record) {
    return `
      <div class="list-row">
        <div>
          <strong>${this.esc(record.courseCode)} - ${this.esc(record.courseTitle)}</strong>
          <small>${this.esc(record.sessionDate)}${record.topic ? ` - ${this.esc(record.topic)}` : ''}</small>
          ${record.note ? `<small>${this.esc(record.note)}</small>` : ''}
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
        ${this.input('attendance-date', 'Session date', new Date().toISOString().slice(0, 10), 'date')}
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
      const enrollments = await API.getOfferingEnrollments(courseOfferingId);
      this.openModal('Mark attendance', `
        <form id="mark-attendance-form" class="stack">
          <div class="assign-list">
            ${enrollments.map(item => `
              <div class="attendance-row" data-student-id="${item.studentId}">
                <div><strong>${this.esc(item.studentName)}</strong><small>${this.esc(item.studentNumber || item.studentEmail)}</small></div>
                <select class="form-select attendance-status">
                  ${['present', 'absent', 'late', 'excused'].map(status => `<option value="${status}">${status}</option>`).join('')}
                </select>
                <input class="form-input attendance-note" placeholder="Note">
              </div>
            `).join('') || this.emptyLine('No active students are enrolled in this offering.')}
          </div>
          <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary" ${enrollments.length ? '' : 'disabled'}>Save</button></div>
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
  }
};
