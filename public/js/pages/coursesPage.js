import { API } from '../api.js';
import { value } from '../components/form.js';

export const CoursesPage = {
  async renderCourses(view = 'current') {
    const activeView = view === 'previous' ? 'previous' : 'current';
    this.setApp(this.loading('Loading courses'));
    try {
      const allCourses = await API.getCourses();
      const previousCourses = allCourses.filter(course => this.isPreviousCourse(course));
      const currentCourses = allCourses.filter(course => !this.isPreviousCourse(course));
      const courses = activeView === 'previous' ? previousCourses : currentCourses;
      const viewLabel = activeView === 'previous' ? 'previous' : 'current';
      this.setApp(`
        <header class="page-header">
          <div><h1>Courses</h1><p>${courses.length} ${viewLabel} course${courses.length === 1 ? '' : 's'}</p></div>
          ${this.canManageLearning() ? '<button class="btn btn-primary" id="btn-new-course">New Course</button>' : ''}
        </header>
        ${this.courseViewTabs(activeView, currentCourses.length, previousCourses.length)}
        <section class="cards-grid">
          ${courses.map(course => this.courseCard(course)).join('') || this.emptyBlock(`No ${viewLabel} courses found.`)}
        </section>
      `);

      const button = document.getElementById('btn-new-course');
      if (button) button.addEventListener('click', () => this.showCourseForm());
    } catch (err) {
      this.renderError(err);
    }
  },

  courseViewTabs(activeView, currentCount, previousCount) {
    return `
      <nav class="view-tabs" aria-label="Course views">
        <a class="view-tab ${activeView === 'current' ? 'active' : ''}" href="#/courses">
          <span>Current</span><strong>${currentCount}</strong>
        </a>
        <a class="view-tab ${activeView === 'previous' ? 'active' : ''}" href="#/courses/previous">
          <span>Previous</span><strong>${previousCount}</strong>
        </a>
      </nav>
    `;
  },

  courseCard(course) {
    const isPrevious = this.isPreviousCourse(course);
    const schedule = this.courseScheduleMetric(course, isPrevious);
    return `
      <article class="item-card">
        <div class="card-topline">
          <span>${this.esc(course.code)}</span>
          <span class="course-card-statuses">
            <span class="status ${this.esc(course.visibility)}">${this.esc(course.visibility)}</span>
            ${isPrevious ? '<span class="status closed">Previous</span>' : ''}
          </span>
        </div>
        <h2>${this.esc(course.title)}</h2>
        <p>${this.esc(course.description || 'No description')}</p>
        <div class="metric-strip">
          <span>${this.esc(course.departmentCode || course.departmentName || 'No dept')}</span>
          <span>${course.credits || 0} credits</span>
          <span>${course.teacherCount} teachers</span>
          <span>${course.studentCount} students</span>
          <span>${course.quizCount} quizzes</span>
          <span>${course.offeringCount || 0} offerings</span>
          ${schedule ? `<span>${this.esc(schedule)}</span>` : ''}
        </div>
        <div class="card-actions">
          <a class="btn btn-primary btn-sm" href="#/courses/${course.id}">Open</a>
          ${this.canManageLearning() ? `<button class="btn btn-ghost btn-sm" onclick="App.showCourseForm(${course.id})">Edit</button><button class="btn btn-danger btn-sm" onclick="App.deleteCourse(${course.id})">Delete</button>` : ''}
        </div>
      </article>
    `;
  },

  isPreviousCourse(course) {
    if (course?.lifecycle) return course.lifecycle === 'previous';
    if (course?.isPrevious !== undefined) return Boolean(course.isPrevious);
    const endDate = course?.effectiveEndDate || course?.endDate || course?.lastWeekEndsAt || '';
    const endTime = this.courseEndTime(endDate);
    return Number.isFinite(endTime) && endTime < Date.now();
  },

  courseScheduleMetric(course, isPrevious = this.isPreviousCourse(course)) {
    const endDate = course?.effectiveEndDate || course?.endDate || course?.lastWeekEndsAt || '';
    if (!Number.isFinite(this.courseEndTime(endDate))) return '';
    return `${isPrevious ? 'Ended' : 'Ends'} ${this.formatDate(endDate)}`;
  },

  courseEndTime(value) {
    const text = String(value || '').trim();
    if (!text) return null;
    const time = /^\d{4}-\d{2}-\d{2}$/.test(text)
      ? Date.parse(`${text}T23:59:59.999Z`)
      : Date.parse(text);
    return Number.isFinite(time) ? time : null;
  },

  async showCourseForm(id) {
    const isEdit = !!id;
    const [course, departments] = await Promise.all([
      isEdit ? API.getCourse(id) : Promise.resolve({
        code: '', title: '', description: '', visibility: 'private', startDate: '', endDate: '', credits: 3, departmentId: ''
      }),
      API.getDepartments().catch(() => [])
    ]);

    this.openModal(isEdit ? 'Edit course' : 'New course', `
      <form id="course-form" class="stack">
        ${this.input('course-code', 'Code', course.code, 'text', 'WEB101')}
        ${this.input('course-title', 'Title', course.title)}
        ${this.textarea('course-description', 'Description', course.description)}
        <div class="form-grid">
          <label class="form-field"><span>Department</span><select class="form-select" id="course-department">
            <option value="">None</option>
            ${departments.map(department => `<option value="${department.id}" ${Number(course.departmentId) === Number(department.id) ? 'selected' : ''}>${this.esc(department.code)} - ${this.esc(department.name)}</option>`).join('')}
          </select></label>
          ${this.input('course-credits', 'Credits', course.credits || 3, 'number')}
        </div>
        <div class="form-grid two-col">
          ${this.input('course-start-date', 'Start date', this.dateInputValue(course.startDate), 'date')}
          ${this.input('course-end-date', 'End date', this.dateInputValue(course.endDate), 'date')}
        </div>
        <label class="form-field"><span>Visibility</span><select class="form-select" id="course-visibility">
          ${['private', 'published', 'archived'].map(option => `<option value="${option}" ${course.visibility === option ? 'selected' : ''}>${option}</option>`).join('')}
        </select></label>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'}</button>
        </div>
      </form>
    `);

    document.getElementById('course-form').addEventListener('submit', async event => {
      event.preventDefault();
      const data = {
        code: value('course-code'),
        title: value('course-title'),
        description: value('course-description'),
        departmentId: value('course-department') ? Number(value('course-department')) : null,
        credits: Number(value('course-credits')),
        visibility: value('course-visibility'),
        startDate: value('course-start-date'),
        endDate: value('course-end-date')
      };

      if (!data.code.trim()) return this.toast('Course code is required.', 'error');
      if (!data.title.trim()) return this.toast('Course title is required.', 'error');
      if (data.credits < 0) return this.toast('Credits cannot be negative.', 'error');
      if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate))
        return this.toast('End date must be after start date.', 'error');

      try {
        if (isEdit) await API.updateCourse(id, data);
        else await API.createCourse(data);
        this.closeModal();
        this.route();
        this.toast('Course saved.', 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  async deleteCourse(id) {
    try {
      const course = await API.getCourse(id);
      const expectedCode = String(course.code || '').trim();
      this.openModal('Delete course', `
        <form id="delete-course-form" class="stack">
          <div class="danger-confirmation">
            <strong>${this.esc(course.code)} - ${this.esc(course.title)}</strong>
            <p>Deleting this course also removes enrollments, quizzes, resources, weeks, discussions, offerings, and grade settings.</p>
          </div>
          <label class="form-field">
            <span>Type course code to delete</span>
            <input class="form-input" id="delete-course-code" autocomplete="off" placeholder="${this.esc(expectedCode)}">
          </label>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-danger" id="delete-course-submit" disabled>Delete course</button>
          </div>
        </form>
      `);

      const codeInput = document.getElementById('delete-course-code');
      const deleteButton = document.getElementById('delete-course-submit');
      codeInput.addEventListener('input', () => {
        deleteButton.disabled = codeInput.value.trim() !== expectedCode;
      });
      document.getElementById('delete-course-form').addEventListener('submit', async event => {
        event.preventDefault();
        if (codeInput.value.trim() !== expectedCode) {
          this.toast('Course code does not match.', 'error');
          return;
        }
        try {
          await API.deleteCourse(id);
          this.closeModal();
          this.toast('Course deleted.', 'success');
          if ((location.hash || '').startsWith(`#/courses/${id}`)) {
            location.hash = '#/courses';
          } else {
            this.route();
          }
        } catch (err) {
          this.toast(err.message, 'error');
        }
      });
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  courseRow(course) {
    return `
      <a class="list-row link-row" href="#/courses/${course.id}">
        <div><strong>${this.esc(course.code)} - ${this.esc(course.title)}</strong><small>${course.studentCount} students, ${course.quizCount} quizzes</small></div>
        <span class="status ${course.visibility}">${this.esc(course.visibility)}</span>
      </a>
    `;
  }
};
