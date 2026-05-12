import { API } from '../api.js';
import { value } from '../components/form.js';

export const CourseDetailPage = {
  async renderCourseDetail(courseId) {
    this.setApp(this.loading('Loading course'));
    try {
      const [course, participants, announcements, resources, quizzes, weeksResult, threadsResult, assignments, attendanceSessions] = await Promise.all([
        API.getCourse(courseId),
        API.getParticipants(courseId),
        API.getAnnouncements(courseId),
        API.getResources(courseId),
        API.getQuizzes({ courseId }),
        API.getCourseWeeks(courseId).catch(() => ({ items: [] })),
        API.getThreads(courseId).catch(() => ({ items: [] })),
        API.getAssignments().catch(() => []),
        API.getAttendanceSessions().catch(() => [])
      ]);
      const manager = this.isCourseManager(participants);
      const gradebook = manager ? await API.getGradebook(courseId) : null;
      const issues = manager ? await API.getValidationIssues({ relatedCourseId: courseId, status: 'open', limit: 20 }).catch(() => ({ items: [] })) : { items: [] };

      const weeks = weeksResult.items || [];
      const threads = threadsResult.items || [];
      this.threadCache = new Map(threads.map(thread => [Number(thread.id), thread]));
      const weekResourcesById = {};
      await Promise.all(weeks.map(async week => {
        const result = await API.getWeekResources(week.id).catch(() => ({ items: [] }));
        weekResourcesById[week.id] = result.items || [];
      }));
      const courseAssignments = assignments.filter(item => Number(item.courseId) === Number(courseId));
      const courseAttendance = attendanceSessions.filter(item => Number(item.courseId) === Number(courseId));
      const gradeSchemes = manager ? await API.getGradeSchemes(courseId).catch(() => []) : [];

      this.setApp(`
        <header class="page-header">
          <div>
            <a class="back-link" href="#/courses">Courses</a>
            <h1>${this.esc(course.title)}</h1>
            <p>${this.esc(course.code)} - <span class="status-chip ${this.esc(course.visibility)}">${this.esc(course.visibility)}</span></p>
          </div>
          <div class="header-actions">
            ${manager ? `<button class="btn btn-ghost" onclick="App.showCourseForm(${course.id})">Edit</button>
            <button class="btn btn-ghost" onclick="App.showEnrollmentForm(${course.id})">Enroll</button>
            <button class="btn btn-ghost" onclick="App.showWeekForm(${course.id})">Add week</button>
            <button class="btn btn-primary" onclick="App.showQuizForm(null, ${course.id})">New Quiz</button>
            <button class="btn btn-danger" onclick="App.deleteCourse(${course.id})">Delete</button>` : ''}
          </div>
        </header>

        <section class="course-layout">
          <div class="course-main">
            <div class="panel">
              <div class="panel-header">
                <h2>Overview</h2>
                <span>${participants.length} participants</span>
              </div>
              <p>${this.esc(course.description || 'No course overview provided yet.')}</p>
            </div>

            <div class="panel">
              <div class="panel-header">
                <h2>Weekly Materials</h2>
                ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.showWeekForm(${course.id})">Add week</button>` : ''}
              </div>
              <div class="list">
                ${weeks.map(week => this.weekRow(week, manager, weekResourcesById[week.id] || [])).join('') || this.emptyLine('No weekly materials published.')}
              </div>
            </div>

            <div class="panel">
              <div class="panel-header">
                <h2>Announcements</h2>
                ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.showAnnouncementForm(${course.id})">Add</button>` : ''}
              </div>
              <div class="list">${announcements.map(item => this.announcementRow(item, manager)).join('') || this.emptyLine('No announcements yet.')}</div>
            </div>

            <div class="panel">
              <div class="panel-header">
                <h2>Quizzes / Exams</h2>
                ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.showQuizForm(null, ${course.id})">Add</button>` : ''}
              </div>
              <div class="list">${quizzes.map(quiz => this.quizRow(quiz, true, manager)).join('') || this.emptyLine('No quizzes yet.')}</div>
            </div>

            <div class="panel">
              <div class="panel-header"><h2>Assignments</h2><a href="#/assignments">Open all</a></div>
              <div class="list compact">
                ${courseAssignments.map(item => this.assignmentRow(item)).join('') || this.emptyLine('No assignments yet')}
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><h2>Discussion</h2>${manager || this.user.role === 'student' ? `<button class="btn btn-ghost btn-sm" onclick="App.showThreadForm(${course.id})">New thread</button>` : ''}</div>
              <div class="list compact">
                ${threads.map(thread => this.threadRow(thread, manager)).join('') || this.emptyLine('No discussions yet')}
              </div>
            </div>

            ${manager ? this.gradeSettingsPanel(course.id, gradeSchemes) : ''}

            ${manager ? this.gradebookPanel(gradebook) : ''}

            ${manager ? `
              <div class="panel">
                <div class="panel-header"><h2>Course Issues</h2><span>${(issues.items || []).length}</span></div>
                <div class="list compact">
                  ${(issues.items || []).map(item => `
                    <div class="list-row">
                      <div>
                        <strong>${this.esc(item.entityType)} #${this.esc(item.entityId || '-')}</strong>
                        <small>${this.esc(item.severity)} - ${this.esc(item.message)}</small>
                      </div>
                    </div>
                  `).join('') || this.emptyLine('No open issues for this course.')}
                </div>
              </div>
            ` : ''}
          </div>

          <aside class="course-side">
            <div class="panel">
              <div class="panel-header">
                <h2>Resources</h2>
                ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.showResourceForm(${course.id})">Add</button>` : ''}
              </div>
              <div class="list">${resources.map(item => this.resourceRow(item, manager)).join('') || this.emptyLine('No resources yet.')}</div>
            </div>

            <div class="panel">
              <div class="panel-header"><h2>Attendance</h2><a href="#/attendance">Open module</a></div>
              <div class="list compact">
                ${courseAttendance.map(item => `
                  <div class="list-row">
                    <div><strong>${this.esc(item.topic || 'Attendance session')}</strong><small>${this.esc(this.formatDate(item.sessionDate))} - ${this.esc(item.status || 'open')} - ${this.esc(item.recordCount || 0)} records</small></div>
                    ${this.attendanceAction(item, manager)}
                  </div>
                `).join('') || this.emptyLine('No attendance sessions yet')}
              </div>
            </div>

            <div class="panel">
              <div class="panel-header">
                <h2>Participants</h2>
                <div class="header-actions">
                  <span>${participants.length}</span>
                </div>
              </div>
              <div class="list compact">${participants.map(item => this.participantRow(item, manager)).join('') || this.emptyLine('No participants.')}</div>
            </div>
          </aside>
        </section>
      `);
      
      if (manager && gradebook) {
        this.initGradebookChart(gradebook);
      }
    } catch (err) {
      this.renderError(err);
    }
  },

  initGradebookChart(gradebook) {
    if (!gradebook || !gradebook.quizzes || !gradebook.quizzes.length || !document.getElementById('gradebook-chart')) return;
    
    const quizAverages = gradebook.quizzes.map((quiz, index) => {
      let sum = 0;
      let count = 0;
      gradebook.students.forEach(student => {
        const val = student.quizzes[index]?.percentage;
        if (val !== null && val !== undefined) {
          sum += val;
          count++;
        }
      });
      return count > 0 ? (sum / count).toFixed(1) : 0;
    });

    const ctx = document.getElementById('gradebook-chart').getContext('2d');
    if (window.gradebookChartInstance) {
      window.gradebookChartInstance.destroy();
    }
    window.gradebookChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: gradebook.quizzes.map(q => q.title),
        datasets: [{
          label: 'Class Average (%)',
          data: quizAverages,
          backgroundColor: 'rgba(79, 70, 229, 0.6)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });
  },

  async showWeekForm(courseId) {
    this.openModal('Course week', `
      <form id="week-form" class="stack">
        ${this.input('week-number', 'Week number', '', 'number')}
        ${this.input('week-title', 'Title')}
        ${this.textarea('week-description', 'Description')}
        ${this.input('week-starts-at', 'Starts at', '', 'datetime-local')}
        ${this.input('week-ends-at', 'Ends at', '', 'datetime-local')}
        <label class="form-field"><span>Visible</span><select class="form-select" id="week-visible"><option value="true">Yes</option><option value="false">No</option></select></label>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);

    document.getElementById('week-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.createCourseWeek(courseId, {
          weekNumber: Number(value('week-number')),
          title: value('week-title'),
          description: value('week-description'),
          startsAt: value('week-starts-at'),
          endsAt: value('week-ends-at'),
          visible: value('week-visible') === 'true'
        });
        this.closeModal();
        this.renderCourseDetail(courseId);
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  async showWeekResourceForm(weekId, courseId) {
    this.openModal('Week resource', `
      <form id="week-resource-form" class="stack">
        ${this.input('week-resource-title', 'Title')}
        <label class="form-field"><span>Type</span><select class="form-select" id="week-resource-type"><option value="link">link</option><option value="file">file</option></select></label>
        <div id="week-resource-link-field">${this.input('week-resource-content', 'URL', '', 'url')}</div>
        <label class="form-field" id="week-resource-file-field" style="display:none"><span>File</span><input class="form-input" id="week-resource-file" type="file" accept="${this.resourceFileAccept()}"></label>
        ${this.input('week-resource-visible-from', 'Visible from', '', 'datetime-local')}
        ${this.input('week-resource-visible-until', 'Visible until', '', 'datetime-local')}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);
    this.bindResourceTypeFields('week-resource-type', 'week-resource-link-field', 'week-resource-file-field');

    document.getElementById('week-resource-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.createWeekResource(weekId, this.weekResourcePayload());
        this.closeModal();
        this.renderCourseDetail(courseId);
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  async showThreadForm(courseId) {
    this.openModal('New discussion thread', `
      <form id="thread-form" class="stack">
        ${this.input('thread-title', 'Title')}
        ${this.textarea('thread-body', 'Message')}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Post</button></div>
      </form>
    `);

    document.getElementById('thread-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.createThread(courseId, {
          title: value('thread-title'),
          body: value('thread-body')
        });
        this.closeModal();
        this.renderCourseDetail(courseId);
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  async openThread(threadId, courseId) {
    try {
      let thread = this.threadCache?.get(Number(threadId));
      const repliesPromise = API.getThreadReplies(threadId, { limit: 100 });
      if (!thread) {
        const threadsResult = await API.getThreads(courseId, { limit: 100 });
        thread = (threadsResult.items || []).find(item => Number(item.id) === Number(threadId));
      }
      if (!thread) throw new Error('Discussion thread not found.');

      const repliesResult = await repliesPromise;
      const replies = repliesResult.items || [];
      const canReply = thread.status === 'open';

      this.openModal(thread.title || 'Discussion', `
        <div class="stack">
          <article class="discussion-thread">
            <div class="discussion-thread-header">
              <div>
                <strong>${this.esc(thread.createdByName || 'Unknown user')}</strong>
                <small>${this.esc(thread.createdByRole || 'participant')} - ${this.esc(this.formatDate(thread.createdAt))}</small>
              </div>
              <span class="status-chip ${this.esc(thread.status)}">${this.esc(thread.status)}</span>
            </div>
            <p class="discussion-body">${this.esc(thread.body)}</p>
          </article>
          <div class="list compact">
            ${replies.map(reply => `
              <div class="list-row reply-row">
                <div>
                  <strong>${this.esc(reply.createdByName || 'User')}</strong>
                  <small>${this.esc(reply.createdByRole || 'participant')} - ${this.esc(this.formatDate(reply.createdAt))}</small>
                  <p class="discussion-body">${this.esc(reply.body)}</p>
                </div>
              </div>
            `).join('') || this.emptyLine('No replies yet')}
          </div>
          ${canReply ? `<form id="thread-reply-form" class="stack">
            ${this.textarea('thread-reply-body', 'Reply')}
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Close</button>
              <button class="btn btn-primary">Reply</button>
            </div>
          </form>` : `
            <div class="empty-line">This thread is locked. Replies are closed.</div>
            <div class="modal-actions"><button type="button" class="btn btn-primary" onclick="App.closeModal()">Done</button></div>
          `}
        </div>
      `);

      if (canReply) {
        document.getElementById('thread-reply-form').addEventListener('submit', async event => {
          event.preventDefault();
          try {
            await API.createThreadReply(threadId, { body: value('thread-reply-body') });
            this.closeModal();
            this.renderCourseDetail(courseId);
          } catch (err) {
            this.toast(err.message, 'error');
          }
        });
      }
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async updateThreadStatus(threadId, status, courseId) {
    try {
      await API.updateThreadStatus(threadId, status);
      this.renderCourseDetail(courseId);
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async showEnrollmentForm(courseId) {
    let users = [];
    try {
      users = this.user.role === 'admin' ? (await API.getUsers({ page: 1, limit: 100 })).items || [] : [];
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
        <label class="form-field"><span>Type</span><select class="form-select" id="resource-type"><option value="link">link</option><option value="file">file</option></select></label>
        <div id="resource-link-field">${this.input('resource-url', 'URL', '', 'url')}</div>
        <label class="form-field" id="resource-file-field" style="display:none"><span>File</span><input class="form-input" id="resource-file" type="file" accept="${this.resourceFileAccept()}"></label>
        ${this.textarea('resource-description', 'Description')}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);
    this.bindResourceTypeFields('resource-type', 'resource-link-field', 'resource-file-field');
    document.getElementById('resource-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.createResource(courseId, this.resourcePayload());
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
    const url = item.downloadUrl || item.url || '';
    const title = url ? `<a href="${this.esc(url)}" target="_blank" rel="noopener noreferrer">${this.esc(item.title)}</a>` : this.esc(item.title);
    const detail = item.type === 'file'
      ? `${this.esc(item.fileName || 'file')} - ${this.esc(this.formatFileSize(item.fileSizeBytes))}`
      : this.esc(item.description || '');
    return `
      <div class="list-row">
        <div><strong>${title}</strong><small>${this.esc(item.type)}${detail ? ` - ${detail}` : ''}</small></div>
        ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.deleteResource(${item.id})">Delete</button>` : ''}
      </div>
    `;
  },

  participantRow(item) {
    const isTeacher = item.courseRole === 'teacher';
    const detail = item.courseRole === 'student'
      ? `${item.studentNumber || '-'} - ${item.email}`
      : `${item.department || item.departmentName || '-'} - ${item.email}`;
    const officeHours = isTeacher ? (item.officeHours || 'Not set') : '';
    return `
      <div class="list-row">
        <div>
          <strong>${this.esc(item.name)}</strong>
          <small>${this.esc(detail)}</small>
          ${isTeacher ? `<small><strong>Office hours:</strong> ${this.esc(officeHours)}</small>` : ''}
        </div>
        <div class="table-actions">
          <span class="role-badge">${this.esc(item.courseRole)}</span>
        </div>
      </div>
    `;
  },

  weekRow(week, manager, resources = []) {
    return `
      <div class="list-row">
        <div>
          <strong>Week ${this.esc(week.weekNumber)} - ${this.esc(week.title)}</strong>
          <small>${this.esc(week.description || 'No description')}</small>
          <div class="meta-line">
            <small>${this.esc(this.formatWeekAvailability(week))}</small>
            <small>${this.esc(week.resourceCount || 0)} resource${Number(week.resourceCount || 0) === 1 ? '' : 's'}</small>
          </div>
          ${resources.length ? `<div class="resource-inline-list">
            ${resources.map(resource => this.weekResourceChip(resource, manager)).join('')}
          </div>` : ''}
        </div>
        ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.showWeekResourceForm(${week.id}, ${week.courseId})">Add resource</button>` : ''}
      </div>
    `;
  },

  formatWeekAvailability(week) {
    const starts = week.startsAt ? this.formatDate(week.startsAt) : '';
    const ends = week.endsAt ? this.formatDate(week.endsAt) : '';
    if (starts && ends) return `${starts} to ${ends}`;
    if (starts) return `Starts ${starts}`;
    if (ends) return `Ends ${ends}`;
    return 'No schedule set';
  },

  weekResourceChip(resource, manager) {
    const content = resource.downloadUrl || resource.content || '';
    const label = this.esc(resource.title);
    const body = content
      ? `<a href="${this.esc(content)}" target="_blank" rel="noopener noreferrer">${label}</a>`
      : `<span>${label}</span>`;
    const meta = resource.type === 'file' && resource.fileSizeBytes ? ` <small>${this.esc(this.formatFileSize(resource.fileSizeBytes))}</small>` : '';
    return `<span class="resource-chip">${body}${meta}${manager ? ` <button class="chip-delete" onclick="App.deleteWeekResource(${resource.id})" aria-label="Delete ${label}">x</button>` : ''}</span>`;
  },

  bindResourceTypeFields(typeId, linkFieldId, fileFieldId) {
    const type = document.getElementById(typeId);
    const linkField = document.getElementById(linkFieldId);
    const fileField = document.getElementById(fileFieldId);
    const sync = () => {
      const isFile = type.value === 'file';
      linkField.style.display = isFile ? 'none' : '';
      fileField.style.display = isFile ? '' : 'none';
    };
    type.addEventListener('change', sync);
    sync();
  },

  resourcePayload() {
    const type = value('resource-type');
    if (type === 'file') {
      const formData = new FormData();
      formData.append('title', value('resource-title'));
      formData.append('type', type);
      formData.append('description', value('resource-description'));
      const file = document.getElementById('resource-file').files[0];
      if (file) formData.append('file', file);
      return formData;
    }
    return {
      title: value('resource-title'),
      type,
      url: value('resource-url'),
      description: value('resource-description')
    };
  },

  weekResourcePayload() {
    const type = value('week-resource-type');
    if (type === 'file') {
      const formData = new FormData();
      formData.append('title', value('week-resource-title'));
      formData.append('type', type);
      formData.append('visibleFrom', value('week-resource-visible-from'));
      formData.append('visibleUntil', value('week-resource-visible-until'));
      const file = document.getElementById('week-resource-file').files[0];
      if (file) formData.append('file', file);
      return formData;
    }
    return {
      title: value('week-resource-title'),
      type,
      content: value('week-resource-content'),
      visibleFrom: value('week-resource-visible-from'),
      visibleUntil: value('week-resource-visible-until')
    };
  },

  resourceFileAccept() {
    return '.pdf,.txt,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.md,.html,.htm,.rtf,.zip';
  },

  formatFileSize(bytes) {
    const size = Number(bytes || 0);
    if (!Number.isFinite(size) || size <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = size;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index += 1;
    }
    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
  },

  async deleteWeekResource(id) {
    if (!confirm('Delete this week resource?')) return;
    try {
      await API.deleteWeekResource(id);
      this.route();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  threadRow(thread, manager = false) {
    const nextStatus = thread.status === 'open' ? 'locked' : 'open';
    const createdBy = thread.createdByName || 'Unknown user';
    const createdAt = this.formatDate(thread.createdAt);
    const replyInfo = `${thread.replyCount || 0} repl${Number(thread.replyCount || 0) === 1 ? 'y' : 'ies'}`;
    const lastReply = thread.lastReplyAt ? ` - last reply ${this.formatDate(thread.lastReplyAt)}` : '';
    return `
      <div class="list-row discussion-row">
        <div class="discussion-content">
          <strong>${this.esc(thread.title)}</strong>
          <p class="discussion-body">${this.esc(thread.body)}</p>
          <div class="meta-line">
            <small>By ${this.esc(createdBy)}</small>
            <small>${this.esc(createdAt)}</small>
            <small>${this.esc(thread.status)} | ${this.esc(replyInfo)}${this.esc(lastReply)}</small>
          </div>
        </div>
        <div class="table-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.openThread(${thread.id}, ${thread.courseId})">Open</button>
          ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.updateThreadStatus(${thread.id}, '${nextStatus}', ${thread.courseId})">${nextStatus}</button>` : ''}
        </div>
      </div>
    `;
  },

  assignmentRow(item) {
    const status = item.ownSubmissionStatus || 'not_submitted';
    return `
      <div class="list-row">
        <div>
          <strong>${this.esc(item.title)}</strong>
          <small>Due ${this.esc(item.dueDate ? this.formatDate(item.dueDate) : 'N/A')} - ${this.esc(item.status)}</small>
        </div>
        <span class="status-chip ${this.esc(status)}">${this.esc(status)}</span>
      </div>
    `;
  },

  gradebookPanel(gradebook) {
    if (!gradebook) return '';
    return `
      <div class="panel">
        <div class="panel-header"><h2>Gradebook</h2><span>${gradebook.students.length} students</span></div>
        <div style="height: 250px; margin-bottom: 20px;">
          <canvas id="gradebook-chart"></canvas>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Student</th><th>Student Number</th>${gradebook.quizzes.map(quiz => `<th>${this.esc(quiz.title)}</th>`).join('')}<th>Weighted Average</th><th>Final Letter Grade</th></tr></thead>
            <tbody>${gradebook.students.map(student => `
              <tr>
                <td>
                  <strong>${this.esc(student.name)}</strong>
                  ${student.cohort ? `<small>${this.esc(student.cohort)}</small>` : ''}
                </td>
                <td>${this.esc(student.studentNumber || '-')}</td>
                ${student.quizzes.map(item => `<td>${item.percentage === null ? '-' : `${item.percentage}%`}<small>${item.score === null ? 'Missing' : `${item.score}/${item.maxScore}`}</small></td>`).join('')}
                <td>${student.weightedAverage === null ? '-' : `${student.weightedAverage}%`}<small>${this.esc(student.completedQuizCount || 0)}/${this.esc(student.totalQuizCount || 0)} submitted</small></td>
                <td><strong>${this.esc(student.finalLetterGrade || '-')}</strong>${student.gradeStatus && student.gradeStatus !== 'ready' ? `<small>${this.esc(student.gradeMessage || student.gradeStatus)}</small>` : ''}</td>
              </tr>
            `).join('') || '<tr><td>No students.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  gradeSettingsPanel(courseId, schemes = []) {
    const scheme = schemes[0];
    const thresholds = scheme?.thresholds || [
      { letterGrade: 'AA', minScore: 90 }, { letterGrade: 'BA', minScore: 85 }, { letterGrade: 'BB', minScore: 80 },
      { letterGrade: 'CB', minScore: 75 }, { letterGrade: 'CC', minScore: 70 }, { letterGrade: 'DC', minScore: 60 },
      { letterGrade: 'DD', minScore: 50 }, { letterGrade: 'FD', minScore: 40 }, { letterGrade: 'FF', minScore: 0 }
    ];
    if (!scheme) {
      return `<div class="panel"><div class="panel-header"><h2>Grade Settings</h2></div>${this.emptyLine('Grade scale is not available yet.')}</div>`;
    }
    return `
      <div class="panel">
        <div class="panel-header"><h2>Grade Settings</h2><span>${this.esc(scheme.name || 'Grade scale')}</span></div>
        <div class="table-wrap">
          <table class="table grade-scale-table">
            <thead><tr><th>Letter Grade</th><th>Minimum Score</th></tr></thead>
            <tbody>
              ${thresholds.map(item => `
                <tr>
                  <td><strong>${this.esc(item.letterGrade)}</strong></td>
                  <td><input class="form-input grade-threshold-input" data-grade="${this.esc(item.letterGrade)}" value="${this.esc(item.minScore)}" type="number" min="0" max="100" step="0.01"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.resetGradeThresholds(${scheme.id}, ${courseId})">Reset to default</button>
          <button class="btn btn-primary btn-sm" onclick="App.saveGradeThresholds(${scheme.id}, ${courseId})">Save</button>
        </div>
      </div>
    `;
  },

  collectGradeThresholds() {
    return Array.from(document.querySelectorAll('.grade-threshold-input')).map(input => ({
      letterGrade: input.dataset.grade,
      minScore: input.value
    }));
  },

  validateGradeThresholds(thresholds) {
    const order = ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF'];
    const values = new Map(thresholds.map(item => [item.letterGrade, Number(item.minScore)]));
    for (const grade of order) {
      const value = values.get(grade);
      if (!Number.isFinite(value) || value < 0 || value > 100) return 'Thresholds must be numbers between 0 and 100.';
    }
    for (let i = 0; i < order.length - 1; i += 1) {
      if (values.get(order[i]) <= values.get(order[i + 1])) return `${order[i]} must be greater than ${order[i + 1]}.`;
    }
    if (values.get('FF') !== 0) return 'FF threshold must be 0.';
    return '';
  },

  async saveGradeThresholds(schemeId, courseId) {
    const thresholds = this.collectGradeThresholds();
    const error = this.validateGradeThresholds(thresholds);
    if (error) return this.toast(error, 'error');
    try {
      await API.updateGradeSchemeThresholds(schemeId, thresholds);
      this.toast('Grade thresholds saved.', 'success');
      this.renderCourseDetail(courseId);
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async resetGradeThresholds(schemeId, courseId) {
    const thresholds = [
      ['AA', 90], ['BA', 85], ['BB', 80], ['CB', 75], ['CC', 70], ['DC', 60], ['DD', 50], ['FD', 40], ['FF', 0]
    ].map(([letterGrade, minScore]) => ({ letterGrade, minScore }));
    try {
      await API.updateGradeSchemeThresholds(schemeId, thresholds);
      this.toast('Default grade scale restored.', 'success');
      this.renderCourseDetail(courseId);
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  attendanceAction(session, manager) {
    if (manager) {
      return session.status === 'open'
        ? `<button class="btn btn-ghost btn-sm" onclick="App.closeAttendanceSession(${session.id})">Close</button>`
        : `<span class="status-chip closed">closed</span>`;
    }
    if (this.user.role !== 'student') return '';
    if (session.ownAttendanceStatus && session.ownAttendanceStatus !== 'removed') {
      return `<span class="status-chip present">Attendance marked</span>`;
    }
    if (session.status !== 'open') return `<span class="status-chip closed">closed</span>`;
    return `<button class="btn btn-primary btn-sm" onclick="App.markSelfAttendance(${session.id})">Mark Attendance</button>`;
  },

  async markSelfAttendance(sessionId) {
    try {
      await API.markSelfAttendance(sessionId);
      this.toast('Attendance marked.', 'success');
      this.route();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async closeAttendanceSession(sessionId) {
    try {
      await API.closeAttendanceSession(sessionId);
      this.toast('Attendance session closed.', 'success');
      this.route();
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  isCourseManager(participants) {
    if (this.user.role === 'admin') return true;
    return participants.some(item => item.id === this.user.id && item.courseRole === 'teacher' && item.enrollmentStatus === 'active');
  }
};
