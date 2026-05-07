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
      const weekResourcesById = {};
      await Promise.all(weeks.map(async week => {
        const result = await API.getWeekResources(week.id).catch(() => ({ items: [] }));
        weekResourcesById[week.id] = result.items || [];
      }));
      const courseAssignments = assignments.filter(item => Number(item.courseId) === Number(courseId));
      const courseAttendance = attendanceSessions.filter(item => Number(item.courseId) === Number(courseId));

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
                    <div><strong>${this.esc(item.topic || 'Attendance session')}</strong><small>${this.esc(item.sessionDate)} - ${this.esc(item.recordCount || 0)} records</small></div>
                  </div>
                `).join('') || this.emptyLine('No attendance sessions yet')}
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><h2>Participants</h2><span>${participants.length}</span></div>
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
        <label class="form-field"><span>Type</span><select class="form-select" id="week-resource-type"><option value="link">link</option><option value="file">file</option><option value="page">page</option></select></label>
        ${this.input('week-resource-content', 'URL / Content')}
        ${this.input('week-resource-visible-from', 'Visible from', '', 'datetime-local')}
        ${this.input('week-resource-visible-until', 'Visible until', '', 'datetime-local')}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);

    document.getElementById('week-resource-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.createWeekResource(weekId, {
          title: value('week-resource-title'),
          type: value('week-resource-type'),
          content: value('week-resource-content'),
          visibleFrom: value('week-resource-visible-from'),
          visibleUntil: value('week-resource-visible-until')
        });
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
      const repliesResult = await API.getThreadReplies(threadId, { limit: 100 });
      const replies = repliesResult.items || [];

      this.openModal('Discussion replies', `
        <div class="stack">
          <div class="list compact">
            ${replies.map(reply => `
              <div class="list-row">
                <div>
                  <strong>${this.esc(reply.createdByName || 'User')}</strong>
                  <small>${this.esc(reply.body)}</small>
                </div>
              </div>
            `).join('') || this.emptyLine('No replies yet')}
          </div>
          <form id="thread-reply-form" class="stack">
            ${this.textarea('thread-reply-body', 'Reply')}
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Close</button>
              <button class="btn btn-primary">Reply</button>
            </div>
          </form>
        </div>
      `);

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
    const title = item.url ? `<a href="${this.esc(item.url)}" target="_blank" rel="noopener noreferrer">${this.esc(item.title)}</a>` : this.esc(item.title);
    return `
      <div class="list-row">
        <div><strong>${title}</strong><small>${this.esc(item.type)} - ${this.esc(item.description || '')}</small></div>
        ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.deleteResource(${item.id})">Delete</button>` : ''}
      </div>
    `;
  },

  participantRow(item) {
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

  weekRow(week, manager, resources = []) {
    return `
      <div class="list-row">
        <div>
          <strong>Week ${this.esc(week.weekNumber)} - ${this.esc(week.title)}</strong>
          <small>${this.esc(week.description || 'No description')} | ${this.esc(week.startsAt || '-')} to ${this.esc(week.endsAt || '-')} | ${this.esc(week.resourceCount || 0)} resources</small>
          ${resources.length ? `<div class="resource-inline-list">
            ${resources.map(resource => this.weekResourceChip(resource, manager)).join('')}
          </div>` : ''}
        </div>
        ${manager ? `<button class="btn btn-ghost btn-sm" onclick="App.showWeekResourceForm(${week.id}, ${week.courseId})">Add resource</button>` : ''}
      </div>
    `;
  },

  weekResourceChip(resource, manager) {
    const content = resource.content || '';
    const label = this.esc(resource.title);
    const body = resource.type === 'page' || !content
      ? `<span>${label}</span>`
      : `<a href="${this.esc(content)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    return `<span class="resource-chip">${body}${manager ? ` <button class="chip-delete" onclick="App.deleteWeekResource(${resource.id})" aria-label="Delete ${label}">x</button>` : ''}</span>`;
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
    return `
      <div class="list-row">
        <div>
          <strong>${this.esc(thread.title)}</strong>
          <small>${this.esc(thread.status)} | ${this.esc(thread.replyCount || 0)} replies</small>
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
          <small>Due ${this.esc(item.dueDate || 'N/A')} - ${this.esc(item.status)}</small>
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
