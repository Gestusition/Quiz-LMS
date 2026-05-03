import { API } from '../api.js';
import { value } from '../components/form.js';

export const CoursesPage = {
  async renderCourses() {
    this.setApp(this.loading('Loading courses'));
    try {
      const courses = await API.getCourses();
      this.setApp(`
        <header class="page-header">
          <div><h1>Courses</h1><p>${courses.length} course${courses.length === 1 ? '' : 's'}</p></div>
          ${this.canManageLearning() ? '<button class="btn btn-primary" id="btn-new-course">New Course</button>' : ''}
        </header>
        <section class="cards-grid">
          ${courses.map(course => `
            <article class="item-card">
              <div class="card-topline"><span>${this.esc(course.code)}</span><span class="status ${course.visibility}">${this.esc(course.visibility)}</span></div>
              <h2>${this.esc(course.title)}</h2>
              <p>${this.esc(course.description || 'No description')}</p>
              <div class="metric-strip">
                <span>${this.esc(course.departmentCode || course.departmentName || 'No dept')}</span>
                <span>${course.credits || 0} credits</span>
                <span>${course.teacherCount} teachers</span>
                <span>${course.studentCount} students</span>
                <span>${course.quizCount} quizzes</span>
                <span>${course.offeringCount || 0} offerings</span>
              </div>
              <div class="card-actions">
                <a class="btn btn-primary btn-sm" href="#/courses/${course.id}">Open</a>
                ${this.canManageLearning() ? `<button class="btn btn-ghost btn-sm" onclick="App.showCourseForm(${course.id})">Edit</button>` : ''}
              </div>
            </article>
          `).join('') || this.emptyBlock('No courses found.')}
        </section>
      `);

      const button = document.getElementById('btn-new-course');
      if (button) button.addEventListener('click', () => this.showCourseForm());
    } catch (err) {
      this.renderError(err);
    }
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
        visibility: value('course-visibility')
      };
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

  courseRow(course) {
    return `
      <a class="list-row link-row" href="#/courses/${course.id}">
        <div><strong>${this.esc(course.code)} - ${this.esc(course.title)}</strong><small>${course.studentCount} students, ${course.quizCount} quizzes</small></div>
        <span class="status ${course.visibility}">${this.esc(course.visibility)}</span>
      </a>
    `;
  }
};
