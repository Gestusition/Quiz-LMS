import { API } from '../api.js';
import { value } from '../components/form.js';

export const AssignmentsPage = {
  async renderAssignments() {
    this.setApp(this.loading('Loading assignments'));
    try {
      const [assignments, offerings] = await Promise.all([
        API.getAssignments(),
        API.getCourseOfferings()
      ]);
      const manager = this.canManageLearning();
      this.setApp(`
        <header class="page-header">
          <div><h1>Assignments</h1><p>${assignments.length} assignment${assignments.length === 1 ? '' : 's'}</p></div>
          ${manager ? '<button class="btn btn-primary" id="btn-new-assignment">New Assignment</button>' : ''}
        </header>
        <section class="panel">
          <div class="toolbar">
            <select class="form-select" id="assignment-offering-filter">
              <option value="">All offerings</option>
              ${offerings.map(offering => `<option value="${offering.id}">${this.esc(offering.courseCode)} - ${this.esc(offering.termName)}</option>`).join('')}
            </select>
          </div>
          <div class="list" id="assignment-list">${assignments.map(item => this.assignmentRow(item, manager)).join('') || this.emptyLine('No assignments found.')}</div>
        </section>
      `);

      document.getElementById('assignment-offering-filter').addEventListener('change', async event => {
        const filtered = await API.getAssignments({ courseOfferingId: event.target.value });
        document.getElementById('assignment-list').innerHTML =
          filtered.map(item => this.assignmentRow(item, manager)).join('') || this.emptyLine('No assignments found.');
      });
      const button = document.getElementById('btn-new-assignment');
      if (button) button.addEventListener('click', () => this.showAssignmentForm());
    } catch (err) {
      this.renderError(err);
    }
  },

  async renderAssignmentDetail(assignmentId) {
    this.setApp(this.loading('Loading assignment'));
    try {
      const assignment = await API.getAssignment(assignmentId);
      const manager = this.canManageLearning();
      const [submissions, assignmentRows] = await Promise.all([
        manager ? API.getAssignmentSubmissions(assignmentId) : Promise.resolve([]),
        this.user.role === 'student' ? API.getAssignments({ courseOfferingId: assignment.courseOfferingId }) : Promise.resolve([])
      ]);
      const own = assignmentRows.find(item => Number(item.id) === Number(assignmentId)) || {};
      const canSubmit = this.user.role === 'student' && assignment.status === 'published';

      this.setApp(`
        <header class="page-header">
          <div>
            <a class="back-link" href="#/assignments">Assignments</a>
            <h1>${this.esc(assignment.title)}</h1>
            <p>${this.esc(assignment.courseCode)} - ${this.esc(assignment.termName)} - ${this.esc(assignment.status)}</p>
          </div>
          <div class="header-actions">
            ${this.user.role === 'student' ? `<button class="btn btn-primary" ${canSubmit ? `onclick="App.showSubmissionForm(${assignment.id})"` : 'disabled'}>${assignment.status === 'closed' ? 'Closed' : (own.ownSubmissionId ? 'Resubmit' : 'Submit')}</button>` : ''}
            ${manager ? `<button class="btn btn-ghost" onclick="App.showAssignmentForm(${assignment.id})">Edit</button><button class="btn btn-danger" onclick="App.deleteAssignment(${assignment.id})">Delete</button><button class="btn btn-primary" onclick="App.showSubmissions(${assignment.id})">Submissions</button>` : ''}
          </div>
        </header>
        <section class="content-grid">
          <div class="panel">
            <div class="panel-header"><h2>Assignment</h2><span>${assignment.dueDate ? `Due ${this.esc(this.formatDate(assignment.dueDate))}` : 'No due date'}</span></div>
            <div class="profile-list">
              ${this.profileRow('Course', `${assignment.courseCode} - ${assignment.courseTitle}`)}
              ${this.profileRow('Term', assignment.termName)}
              ${this.profileRow('Status', assignment.status)}
              ${this.profileRow('Due date', assignment.dueDate ? this.formatDate(assignment.dueDate) : '')}
            </div>
            <p class="detail-copy">${this.esc(assignment.description || 'No description provided.')}</p>
          </div>
          ${this.user.role === 'student' ? `
            <div class="panel">
              <div class="panel-header"><h2>Your Submission</h2><span>${this.esc(own.ownSubmissionStatus || 'not submitted')}</span></div>
              <div class="profile-list">
                ${this.profileRow('Submitted at', own.ownSubmittedAt ? this.formatDate(own.ownSubmittedAt) : '')}
                ${this.submissionInfoRow('Submitted work', this.submissionLinkHtml({
                  submissionUrl: own.ownSubmissionUrl,
                  downloadUrl: own.ownSubmissionDownloadUrl,
                  fileName: own.ownFileName,
                  fileSizeBytes: own.ownFileSizeBytes
                }))}
                ${own.ownSubmissionText ? this.submissionInfoRow('Submission text', this.esc(own.ownSubmissionText)) : ''}
                ${this.profileRow('Late', own.ownLate ? 'Yes' : '')}
                ${this.profileRow('Grade', own.ownGrade || '')}
                ${this.profileRow('Feedback', own.ownFeedback || '')}
              </div>
            </div>
          ` : `
            <div class="panel">
              <div class="panel-header"><h2>Submissions</h2><span>${submissions.length}</span></div>
              <div class="list">${submissions.slice(0, 6).map(item => `
                <div class="list-row">
                  <div><strong>${this.esc(item.studentName)}</strong><small>${this.esc(item.status)}${item.grade ? ` - ${this.esc(item.grade)}` : ''}</small></div>
                  <button class="btn btn-primary btn-sm" onclick="App.showGradeSubmissionForm(${item.id}, ${assignment.id})">Grade</button>
                </div>
              `).join('') || this.emptyLine('No submissions yet.')}</div>
            </div>
          `}
        </section>
      `);
    } catch (err) {
      this.renderError(err);
    }
  },

  assignmentRow(item, manager) {
    const detail = `${item.courseCode || ''} - ${item.termName || ''}${item.dueDate ? ` - due ${this.formatDate(item.dueDate)}` : ''}`;
    const canSubmit = item.status === 'published';
    const studentActions = this.user.role === 'student'
      ? `<button class="btn btn-primary btn-sm" ${canSubmit ? `onclick="App.showSubmissionForm(${item.id})"` : 'disabled'}>${item.status === 'closed' ? 'Closed' : (item.ownSubmissionId ? 'Resubmit' : 'Submit')}</button>`
      : '';
    const managerActions = manager
      ? `<button class="btn btn-ghost btn-sm" onclick="App.showAssignmentForm(${item.id})">Edit</button><button class="btn btn-danger btn-sm" onclick="App.deleteAssignment(${item.id})">Delete</button><button class="btn btn-primary btn-sm" onclick="App.showSubmissions(${item.id})">Submissions</button>`
      : '';
    return `
      <div class="list-row">
        <div>
          <strong><a href="#/assignments/${item.id}">${this.esc(item.title)}</a></strong>
          <small>${this.esc(detail)}</small>
          ${item.ownSubmissionStatus ? `<small>Submission: ${this.esc(item.ownSubmissionStatus)}${item.ownLate ? ' - late' : ''}${item.ownGrade ? ` - Grade: ${this.esc(item.ownGrade)}` : ''}</small>` : ''}
        </div>
        <div class="row-actions">
          <span class="status ${item.status}">${this.esc(item.status)}</span>
          ${studentActions}${managerActions}
        </div>
      </div>
    `;
  },

  async showAssignmentForm(id) {
    const [offerings, assignments] = await Promise.all([
      API.getCourseOfferings(),
      id ? API.getAssignments() : Promise.resolve([])
    ]);
    const item = id ? assignments.find(row => row.id === id) : {
      courseOfferingId: offerings[0]?.id || '', title: '', description: '', dueDate: '', status: 'published'
    };
    this.openModal(id ? 'Edit assignment' : 'New assignment', `
      <form id="assignment-form" class="stack">
        <label class="form-field"><span>Course offering</span><select class="form-select" id="assignment-offering">
          ${offerings.map(offering => `<option value="${offering.id}" ${Number(item.courseOfferingId) === Number(offering.id) ? 'selected' : ''}>${this.esc(offering.courseCode)} - ${this.esc(offering.termName)}</option>`).join('')}
        </select></label>
        ${this.input('assignment-title', 'Title', item.title)}
        ${this.textarea('assignment-description', 'Description', item.description)}
        <div class="form-grid">
          ${this.input('assignment-due', 'Due date', this.dateInputValue(item.dueDate), 'date')}
          <label class="form-field"><span>Status</span><select class="form-select" id="assignment-status">
            ${['draft', 'published', 'closed'].map(status => `<option value="${status}" ${item.status === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select></label>
        </div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);
    document.getElementById('assignment-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        const data = {
          courseOfferingId: Number(value('assignment-offering')),
          title: value('assignment-title'),
          description: value('assignment-description'),
          dueDate: value('assignment-due'),
          status: value('assignment-status')
        };
        id ? await API.updateAssignment(id, data) : await API.createAssignment(data);
        this.closeModal();
        this.renderAssignments();
        this.toast('Assignment saved.', 'success');
      } catch (err) { this.toast(err.message, 'error'); }
    });
  },

  async showSubmissionForm(assignmentId) {
    this.openModal('Submit assignment', `
      <form id="submission-form" class="stack">
        ${this.textarea('submission-text', 'Submission text')}
        <label class="form-field"><span>Submission type</span><select class="form-select" id="submission-type">
          <option value="link">link</option>
          <option value="file">file</option>
        </select></label>
        <div id="submission-link-field">${this.input('submission-url', 'Submission URL', '', 'url', 'https://...')}</div>
        <label class="form-field" id="submission-file-field" style="display:none"><span>Submission file</span><input class="form-input" id="submission-file" type="file" accept="${this.submissionFileAccept()}"></label>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Submit</button></div>
      </form>
    `);
    this.bindSubmissionTypeFields();
    document.getElementById('submission-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.submitAssignment(assignmentId, this.submissionPayload());
        this.closeModal();
        this.route();
        this.toast('Submission saved.', 'success');
      } catch (err) { this.toast(err.message, 'error'); }
    });
  },

  async deleteAssignment(id) {
    if (!confirm('Delete this assignment? Existing submissions will also be removed.')) return;
    try {
      await API.deleteAssignment(id);
      this.toast('Assignment deleted.', 'success');
      this.renderAssignments();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async showSubmissions(assignmentId) {
    try {
      const submissions = await API.getAssignmentSubmissions(assignmentId);
      this.openModal('Submissions', `
        <div class="stack">
          <div class="list">${submissions.map(item => `
            <div class="list-row">
              <div>
                <strong>${this.esc(item.studentName)}</strong>
                <small>${this.esc(item.studentNumber || item.studentEmail)} - ${this.esc(item.status)}</small>
                ${item.submittedAt ? `<small>Submitted ${this.esc(this.formatDate(item.submittedAt))}${item.late ? ' - late' : ''}</small>` : ''}
                ${item.submissionUrl ? `<small>${this.submissionLinkHtml(item)}</small>` : ''}
                ${item.submissionText ? `<small>${this.esc(item.submissionText)}</small>` : ''}
                ${item.grade ? `<small>Grade: ${this.esc(item.grade)} - ${this.esc(item.feedback || '')}</small>` : ''}
              </div>
              <button class="btn btn-primary btn-sm" onclick="App.showGradeSubmissionForm(${item.id}, ${assignmentId})">Grade</button>
            </div>
          `).join('') || this.emptyLine('No submissions yet.')}</div>
          <div class="modal-actions"><button type="button" class="btn btn-primary" onclick="App.closeModal()">Done</button></div>
        </div>
      `);
    } catch (err) { this.toast(err.message, 'error'); }
  },

  showGradeSubmissionForm(submissionId, assignmentId) {
    this.openModal('Grade submission', `
      <form id="grade-form" class="stack">
        ${this.input('submission-grade', 'Grade', '', 'text', '92')}
        ${this.textarea('submission-feedback', 'Feedback')}
        <label class="form-field"><span>Status</span><select class="form-select" id="submission-status">
          <option value="graded">graded</option>
          <option value="returned">returned</option>
        </select></label>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.showSubmissions(${assignmentId})">Back</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);
    document.getElementById('grade-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.gradeSubmission(submissionId, {
          grade: value('submission-grade'),
          feedback: value('submission-feedback'),
          status: value('submission-status')
        });
        this.showSubmissions(assignmentId);
        this.toast('Submission graded.', 'success');
      } catch (err) { this.toast(err.message, 'error'); }
    });
  },

  bindSubmissionTypeFields() {
    const type = document.getElementById('submission-type');
    const linkField = document.getElementById('submission-link-field');
    const fileField = document.getElementById('submission-file-field');
    if (!type || !linkField || !fileField) return;
    const sync = () => {
      const isFile = type.value === 'file';
      linkField.style.display = isFile ? 'none' : '';
      fileField.style.display = isFile ? '' : 'none';
    };
    type.addEventListener('change', sync);
    sync();
  },

  submissionPayload() {
    const submissionText = value('submission-text');
    if (value('submission-type') === 'file') {
      const formData = new FormData();
      formData.append('submissionText', submissionText);
      const file = document.getElementById('submission-file')?.files[0];
      if (file) formData.append('file', file);
      return formData;
    }
    return {
      submissionText,
      submissionUrl: value('submission-url')
    };
  },

  submissionFileAccept() {
    return this.resourceFileAccept ? this.resourceFileAccept() : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.md,.html,.htm,.rtf,.zip';
  },

  submissionInfoRow(label, html) {
    if (!html) return '';
    return `
      <div class="profile-row">
        <span>${this.esc(label)}</span>
        <strong>${html}</strong>
      </div>
    `;
  },

  submissionLinkHtml(item) {
    const url = item?.downloadUrl || item?.submissionUrl || '';
    if (!url) return '';
    const fileName = item.fileName || '';
    const label = fileName || url;
    const size = fileName && item.fileSizeBytes ? ` (${this.formatFileSize(item.fileSizeBytes)})` : '';
    return `<a href="${this.esc(url)}" target="_blank" rel="noopener noreferrer">${this.esc(label)}</a>${this.esc(size)}`;
  }
};
