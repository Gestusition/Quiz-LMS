import { API } from '../api.js';
import { value } from '../components/form.js';

export const CourseDetailPage = {
  async renderCourseDetail(courseId) {
    this.setApp(this.loading('Loading course'));
    try {
      const [course, participants, announcements, resources, quizzes] = await Promise.all([
        API.getCourse(courseId),
        API.getParticipants(courseId),
        API.getAnnouncements(courseId),
        API.getResources(courseId),
        API.getQuizzes({ courseId })
      ]);
      const manager = this.isCourseManager(participants);
      const gradebook = manager ? await API.getGradebook(courseId) : null;

      this.setApp(`
        <header class="page-header">
          <div>
            <a class="back-link" href="#/courses">Courses</a>
            <h1>${this.esc(course.title)}</h1>
            <p>${this.esc(course.code)} - ${this.esc(course.visibility)}</p>
          </div>
          <div class="header-actions">
            ${manager ? `<button class="btn btn-ghost" onclick="App.showEnrollmentForm(${course.id})">Enroll</button>
            <button class="btn btn-primary" onclick="App.showQuizForm(null, ${course.id})">New Quiz</button>` : ''}
          </div>
        </header>
        <section class="course-layout">
          <div class="course-main">
            <div class="panel">
              <div class="panel-header">
                <h2>Announcements</h2>
                ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.showAnnouncementForm(${course.id})">Add</button>` : ''}
              </div>
              <div class="list">${announcements.map(item => this.announcementRow(item, manager)).join('') || this.emptyLine('No announcements.')}</div>
            </div>
            <div class="panel">
              <div class="panel-header">
                <h2>Quizzes</h2>
                ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.showQuizForm(null, ${course.id})">Add</button>` : ''}
              </div>
              <div class="list">${quizzes.map(quiz => this.quizRow(quiz, true, manager)).join('') || this.emptyLine('No quizzes.')}</div>
            </div>
            ${manager ? this.gradebookPanel(gradebook) : ''}
          </div>
          <aside class="course-side">
            <div class="panel">
              <div class="panel-header">
                <h2>Resources</h2>
                ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.showResourceForm(${course.id})">Add</button>` : ''}
              </div>
              <div class="list">${resources.map(item => this.resourceRow(item, manager)).join('') || this.emptyLine('No resources.')}</div>
            </div>
            <div class="panel">
              <div class="panel-header"><h2>Participants</h2><span>${participants.length}</span></div>
              <div class="list compact">${participants.map(item => this.participantRow(item, manager)).join('') || this.emptyLine('No participants.')}</div>
            </div>
          </aside>
        </section>
      `);
    } catch (err) {
      this.renderError(err);
    }
  },

  async showEnrollmentForm(courseId) {
    let users = [];
    try {
      users = this.user.role === 'admin' ? await API.getUsers() : [];
    } catch (e) {
      users = [];
    }

    this.openModal('Enroll user', `
      <form id="enrollment-form" class="stack">
        ${users.length ? `<label class="form-field"><span>User</span><select class="form-select" id="enroll-user">
          ${users.filter(user => user.role !== 'admin').map(user => `<option value="${user.id}" data-role="${user.role}">${this.esc(user.name)} - ${this.esc(user.email)} (${this.esc(user.role)})</option>`).join('')}
        </select></label>` : this.input('enroll-user', 'User ID', '', 'number')}
        <label class="form-field"><span>Course role</span><select class="form-select" id="enroll-role">
          <option value="student">student</option>
          <option value="teacher">teacher</option>
        </select></label>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Enroll</button>
        </div>
      </form>
    `);

    document.getElementById('enrollment-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.enroll(courseId, { userId: Number(value('enroll-user')), role: value('enroll-role') });
        this.closeModal();
        this.renderCourseDetail(courseId);
        this.toast('Enrollment saved.', 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  showAnnouncementForm(courseId) {
    this.openModal('New announcement', `
      <form id="announcement-form" class="stack">
        ${this.input('announcement-title', 'Title')}
        ${this.textarea('announcement-body', 'Body')}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Publish</button></div>
      </form>
    `);
    document.getElementById('announcement-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.createAnnouncement(courseId, { title: value('announcement-title'), body: value('announcement-body') });
        this.closeModal();
        this.renderCourseDetail(courseId);
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  showResourceForm(courseId) {
    this.openModal('New resource', `
      <form id="resource-form" class="stack">
        ${this.input('resource-title', 'Title')}
        <label class="form-field"><span>Type</span><select class="form-select" id="resource-type"><option value="link">link</option><option value="page">page</option><option value="file">file</option></select></label>
        ${this.input('resource-url', 'URL')}
        ${this.textarea('resource-description', 'Description')}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);
    document.getElementById('resource-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.createResource(courseId, {
          title: value('resource-title'),
          type: value('resource-type'),
          url: value('resource-url'),
          description: value('resource-description')
        });
        this.closeModal();
        this.renderCourseDetail(courseId);
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  async deleteAnnouncement(id) {
    if (!confirm('Delete this announcement?')) return;
    try {
      await API.deleteAnnouncement(id);
      this.route();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async deleteResource(id) {
    if (!confirm('Delete this resource?')) return;
    try {
      await API.deleteResource(id);
      this.route();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  announcementRow(item, manager) {
    return `
      <div class="list-row">
        <div><strong>${this.esc(item.title)}</strong><small>${this.esc(item.body)}</small></div>
        ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.deleteAnnouncement(${item.id})">Delete</button>` : ''}
      </div>
    `;
  },

  resourceRow(item, manager) {
    const title = item.url ? `<a href="${this.esc(item.url)}" target="_blank">${this.esc(item.title)}</a>` : this.esc(item.title);
    return `
      <div class="list-row">
        <div><strong>${title}</strong><small>${this.esc(item.type)} - ${this.esc(item.description || '')}</small></div>
        ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.deleteResource(${item.id})">Delete</button>` : ''}
      </div>
    `;
  },

  participantRow(item, manager) {
    const detail = item.courseRole === 'student'
      ? `${item.studentNumber || '-'} - ${item.email}`
      : `${item.department || '-'} - ${item.email}`;
    return `
      <div class="list-row">
        <div><strong>${this.esc(item.name)}</strong><small>${this.esc(detail)}</small></div>
        <span class="role-badge">${this.esc(item.courseRole)}</span>
      </div>
    `;
  },

  gradebookPanel(gradebook) {
    if (!gradebook) return '';
    return `
      <div class="panel">
        <div class="panel-header"><h2>Gradebook</h2><span>${gradebook.students.length} students</span></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Student</th>${gradebook.quizzes.map(quiz => `<th>${this.esc(quiz.title)}</th>`).join('')}<th>Average</th></tr></thead>
            <tbody>${gradebook.students.map(student => `
              <tr>
                <td>
                  <strong>${this.esc(student.name)}</strong>
                  <small>Student No: ${this.esc(student.studentNumber || '-')}</small>
                  ${student.cohort ? `<small>${this.esc(student.cohort)}</small>` : ''}
                </td>
                ${student.quizzes.map(item => `<td>${item.percentage === null ? '-' : `${item.percentage}%`}</td>`).join('')}
                <td>${student.average === null ? '-' : `${student.average}%`}</td>
              </tr>
            `).join('') || '<tr><td>No students.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  isCourseManager(participants) {
    if (this.user.role === 'admin') return true;
    return participants.some(item => item.id === this.user.id && item.courseRole === 'teacher' && item.enrollmentStatus === 'active');
  }
};
