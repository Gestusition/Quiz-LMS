import { API } from '../api.js';
import { value } from '../components/form.js';

export const AcademicPage = {
  async renderAcademic() {
    this.setApp(this.loading('Loading academic structure'));
    try {
      const [faculties, departments, classYears, sections, terms, courses, offerings] = await Promise.all([
        API.getFaculties(),
        API.getDepartments(),
        API.getClassYears(),
        API.getSections(),
        API.getTerms(),
        API.getCourses(),
        API.getCourseOfferings()
      ]);
      const admin = this.user.role === 'admin';

      this.setApp(`
        <header class="page-header">
          <div><h1>Academic Structure</h1><p>${offerings.length} course offering${offerings.length === 1 ? '' : 's'}</p></div>
          <div class="header-actions">
            ${admin ? '<button class="btn btn-ghost" id="btn-new-term">New Term</button><button class="btn btn-primary" id="btn-new-offering">New Offering</button>' : ''}
          </div>
        </header>
        <section class="content-grid">
          <div class="panel">
            <div class="panel-header"><h2>Faculties</h2>${admin ? '<button class="btn btn-ghost btn-sm" id="btn-new-faculty">Add</button>' : `<span>${faculties.length}</span>`}</div>
            <div class="list">${faculties.map(item => this.facultyRow(item, admin)).join('') || this.emptyLine('No faculties yet.')}</div>
          </div>
          <div class="panel">
            <div class="panel-header"><h2>Departments</h2>${admin ? '<button class="btn btn-ghost btn-sm" id="btn-new-department">Add</button>' : `<span>${departments.length}</span>`}</div>
            <div class="list">${departments.map(item => this.departmentRow(item, admin)).join('') || this.emptyLine('No departments yet.')}</div>
          </div>
          <div class="panel">
            <div class="panel-header"><h2>Class Years</h2>${admin ? '<button class="btn btn-ghost btn-sm" id="btn-new-class-year">Add</button>' : `<span>${classYears.length}</span>`}</div>
            <div class="list">${classYears.map(item => this.classYearRow(item, admin)).join('') || this.emptyLine('No class years yet.')}</div>
          </div>
          <div class="panel">
            <div class="panel-header"><h2>Sections</h2>${admin ? '<button class="btn btn-ghost btn-sm" id="btn-new-section">Add</button>' : `<span>${sections.length}</span>`}</div>
            <div class="list">${sections.map(item => this.sectionRow(item, admin)).join('') || this.emptyLine('No sections yet.')}</div>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><h2>Terms / Semesters</h2>${admin ? '<button class="btn btn-ghost btn-sm" onclick="App.showTermForm()">Add</button>' : `<span>${terms.length}</span>`}</div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Name</th><th>Academic Year</th><th>Semester</th><th>Dates</th><th>Status</th><th></th></tr></thead>
              <tbody>${terms.map(term => this.termRow(term, admin)).join('') || '<tr><td colspan="6">No terms yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><h2>Course Offerings</h2>${admin ? '<button class="btn btn-ghost btn-sm" onclick="App.showOfferingForm()">Add</button>' : `<span>${offerings.length}</span>`}</div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Course</th><th>Term</th><th>Instructor</th><th>Group</th><th>Students</th><th>Status</th><th></th></tr></thead>
              <tbody>${offerings.map(offering => this.offeringRow(offering, admin)).join('') || '<tr><td colspan="7">No offerings yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      `);

      if (admin) {
        document.getElementById('btn-new-faculty').addEventListener('click', () => this.showFacultyForm());
        document.getElementById('btn-new-department').addEventListener('click', () => this.showDepartmentForm());
        document.getElementById('btn-new-class-year').addEventListener('click', () => this.showClassYearForm());
        document.getElementById('btn-new-section').addEventListener('click', () => this.showSectionForm());
        document.getElementById('btn-new-term').addEventListener('click', () => this.showTermForm());
        document.getElementById('btn-new-offering').addEventListener('click', () => this.showOfferingForm());
      }
    } catch (err) {
      this.renderError(err);
    }
  },

  facultyRow(item, admin) {
    return `
      <div class="list-row">
        <div><strong>${this.esc(item.name)}</strong><small>${this.esc(item.code)} - ${item.departmentCount || 0} departments</small></div>
        ${admin ? `<div class="row-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.showFacultyForm(${item.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="App.deleteFaculty(${item.id})">Delete</button>
        </div>` : ''}
      </div>
    `;
  },

  departmentRow(item, admin) {
    return `
      <div class="list-row">
        <div><strong>${this.esc(item.name)}</strong><small>${this.esc(item.facultyName || '')} - ${this.esc(item.code)}</small></div>
        ${admin ? `<div class="row-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.showDepartmentForm(${item.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="App.deleteDepartment(${item.id})">Delete</button>
        </div>` : ''}
      </div>
    `;
  },

  classYearRow(item, admin) {
    return `
      <div class="list-row">
        <div><strong>${this.esc(item.name)}</strong><small>${this.esc(item.departmentName || '')} - year ${item.yearNumber}</small></div>
        ${admin ? `<div class="row-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.showClassYearForm(${item.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="App.deleteClassYear(${item.id})">Delete</button>
        </div>` : ''}
      </div>
    `;
  },

  sectionRow(item, admin) {
    return `
      <div class="list-row">
        <div><strong>${this.esc(item.name)}</strong><small>${this.esc(item.departmentName || '')} - ${this.esc(item.classYearName || '')}</small></div>
        ${admin ? `<div class="row-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.showSectionForm(${item.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="App.deleteSection(${item.id})">Delete</button>
        </div>` : ''}
      </div>
    `;
  },

  termRow(term, admin) {
    return `
      <tr>
        <td><strong>${this.esc(term.name)}</strong></td>
        <td>${this.esc(term.academicYear)}</td>
        <td>${this.esc(term.semesterType)}</td>
        <td>${this.esc(term.startDate || '-')} to ${this.esc(term.endDate || '-')}</td>
        <td><span class="status ${term.isActive ? 'active' : 'archived'}">${term.isActive ? 'active' : 'inactive'}</span></td>
        <td class="table-actions">
          ${admin ? `<button class="btn btn-ghost btn-sm" onclick="App.showTermForm(${term.id})">Edit</button>
          ${term.isActive ? '' : `<button class="btn btn-primary btn-sm" onclick="App.activateTerm(${term.id})">Set active</button>`}
          <button class="btn btn-danger btn-sm" onclick="App.deleteTerm(${term.id})">Delete</button>` : ''}
        </td>
      </tr>
    `;
  },

  offeringRow(offering, admin) {
    const group = [offering.departmentCode, offering.classYearName, offering.sectionName].filter(Boolean).join(' / ') || '-';
    return `
      <tr>
        <td><strong>${this.esc(offering.courseCode)} - ${this.esc(offering.courseTitle)}</strong></td>
        <td>${this.esc(offering.termName)}</td>
        <td>${this.esc(offering.instructorName || 'Unassigned')}</td>
        <td>${this.esc(group)}</td>
        <td>${offering.studentCount || 0}</td>
        <td><span class="status ${offering.status}">${this.esc(offering.status)}</span></td>
        <td class="table-actions">
          ${admin ? `<button class="btn btn-ghost btn-sm" onclick="App.showOfferingEnrollmentForm(${offering.id})">Enroll</button><button class="btn btn-ghost btn-sm" onclick="App.showOfferingForm(${offering.id})">Edit</button><button class="btn btn-danger btn-sm" onclick="App.deleteCourseOffering(${offering.id})">Delete</button>` : ''}
        </td>
      </tr>
    `;
  },

  async showFacultyForm(id) {
    const faculties = await API.getFaculties();
    const item = id ? faculties.find(row => row.id === id) : { name: '', code: '' };
    this.openModal(id ? 'Edit faculty' : 'New faculty', `
      <form id="faculty-form" class="stack">
        ${this.input('faculty-name', 'Name', item.name)}
        ${this.input('faculty-code', 'Code', item.code, 'text', 'ENG')}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);
    document.getElementById('faculty-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        const data = { name: value('faculty-name'), code: value('faculty-code') };
        id ? await API.updateFaculty(id, data) : await API.createFaculty(data);
        this.closeModal();
        this.renderAcademic();
      } catch (err) { this.toast(err.message, 'error'); }
    });
  },

  async showDepartmentForm(id) {
    const [faculties, departments] = await Promise.all([API.getFaculties(), API.getDepartments()]);
    const item = id ? departments.find(row => row.id === id) : { facultyId: faculties[0]?.id || '', name: '', code: '' };
    this.openModal(id ? 'Edit department' : 'New department', `
      <form id="department-form" class="stack">
        ${this.selectField('department-faculty', 'Faculty', faculties, item.facultyId, row => row.name)}
        ${this.input('department-name', 'Name', item.name)}
        ${this.input('department-code', 'Code', item.code, 'text', 'CENG')}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);
    document.getElementById('department-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        const data = { facultyId: Number(value('department-faculty')), name: value('department-name'), code: value('department-code') };
        id ? await API.updateDepartment(id, data) : await API.createDepartment(data);
        this.closeModal();
        this.renderAcademic();
      } catch (err) { this.toast(err.message, 'error'); }
    });
  },

  async showClassYearForm(id) {
    const [departments, classYears] = await Promise.all([API.getDepartments(), API.getClassYears()]);
    const item = id ? classYears.find(row => row.id === id) : { departmentId: departments[0]?.id || '', yearNumber: 1, name: 'First Year' };
    this.openModal(id ? 'Edit class year' : 'New class year', `
      <form id="class-year-form" class="stack">
        ${this.selectField('class-year-department', 'Department', departments, item.departmentId, row => `${row.code} - ${row.name}`)}
        ${this.input('class-year-number', 'Year number', item.yearNumber, 'number')}
        ${this.input('class-year-name', 'Name', item.name)}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);
    document.getElementById('class-year-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        const data = {
          departmentId: Number(value('class-year-department')),
          yearNumber: Number(value('class-year-number')),
          name: value('class-year-name')
        };
        id ? await API.updateClassYear(id, data) : await API.createClassYear(data);
        this.closeModal();
        this.renderAcademic();
      } catch (err) { this.toast(err.message, 'error'); }
    });
  },

  async showSectionForm(id) {
    const [classYears, sections] = await Promise.all([API.getClassYears(), API.getSections()]);
    const item = id ? sections.find(row => row.id === id) : { classYearId: classYears[0]?.id || '', name: 'A' };
    this.openModal(id ? 'Edit section' : 'New section', `
      <form id="section-form" class="stack">
        ${this.selectField('section-class-year', 'Class year', classYears, item.classYearId, row => `${row.departmentCode} - ${row.name}`)}
        ${this.input('section-name', 'Section', item.name)}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);
    document.getElementById('section-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        const data = { classYearId: Number(value('section-class-year')), name: value('section-name') };
        id ? await API.updateSection(id, data) : await API.createSection(data);
        this.closeModal();
        this.renderAcademic();
      } catch (err) { this.toast(err.message, 'error'); }
    });
  },

  async showTermForm(id) {
    const terms = await API.getTerms();
    const item = id ? terms.find(row => row.id === id) : {
      name: '', academicYear: '2025-2026', semesterType: 'spring', startDate: '', endDate: '', isActive: 0
    };
    this.openModal(id ? 'Edit term' : 'New term', `
      <form id="term-form" class="stack">
        ${this.input('term-name', 'Name', item.name, 'text', '2025-2026 Spring')}
        ${this.input('term-year', 'Academic year', item.academicYear, 'text', '2025-2026')}
        <label class="form-field"><span>Semester</span><select class="form-select" id="term-semester">
          ${['fall', 'spring', 'summer', 'winter', 'full-year', 'other'].map(option => `<option value="${option}" ${item.semesterType === option ? 'selected' : ''}>${option}</option>`).join('')}
        </select></label>
        <div class="form-grid">${this.input('term-start', 'Start date', item.startDate, 'date')}${this.input('term-end', 'End date', item.endDate, 'date')}</div>
        <label class="check-field"><input type="checkbox" id="term-active" ${item.isActive ? 'checked' : ''}> Active term</label>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);
    document.getElementById('term-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        const data = {
          name: value('term-name'),
          academicYear: value('term-year'),
          semesterType: value('term-semester'),
          startDate: value('term-start'),
          endDate: value('term-end'),
          isActive: document.getElementById('term-active').checked
        };
        id ? await API.updateTerm(id, data) : await API.createTerm(data);
        this.closeModal();
        this.renderAcademic();
      } catch (err) { this.toast(err.message, 'error'); }
    });
  },

  async activateTerm(id) {
    try {
      await API.setActiveTerm(id);
      this.renderAcademic();
      this.toast('Active term updated.', 'success');
    } catch (err) { this.toast(err.message, 'error'); }
  },

  async deleteFaculty(id) {
    if (!confirm('Delete this faculty and its related departments, class years, and sections?')) return;
    try {
      await API.deleteFaculty(id);
      this.toast('Faculty deleted.', 'success');
      this.renderAcademic();
    } catch (err) { this.toast(err.message, 'error'); }
  },

  async deleteDepartment(id) {
    if (!confirm('Delete this department and its related class years and sections?')) return;
    try {
      await API.deleteDepartment(id);
      this.toast('Department deleted.', 'success');
      this.renderAcademic();
    } catch (err) { this.toast(err.message, 'error'); }
  },

  async deleteClassYear(id) {
    if (!confirm('Delete this class year and its related sections?')) return;
    try {
      await API.deleteClassYear(id);
      this.toast('Class year deleted.', 'success');
      this.renderAcademic();
    } catch (err) { this.toast(err.message, 'error'); }
  },

  async deleteSection(id) {
    if (!confirm('Delete this section?')) return;
    try {
      await API.deleteSection(id);
      this.toast('Section deleted.', 'success');
      this.renderAcademic();
    } catch (err) { this.toast(err.message, 'error'); }
  },

  async deleteTerm(id) {
    if (!confirm('Delete this term and its related offerings, assignments, and attendance records?')) return;
    try {
      await API.deleteTerm(id);
      this.toast('Term deleted.', 'success');
      this.renderAcademic();
    } catch (err) { this.toast(err.message, 'error'); }
  },

  async deleteCourseOffering(id) {
    if (!confirm('Delete this offering and its enrollments, assignments, and attendance records?')) return;
    try {
      await API.deleteCourseOffering(id);
      this.toast('Course offering deleted.', 'success');
      this.renderAcademic();
    } catch (err) { this.toast(err.message, 'error'); }
  },

  async showOfferingForm(id) {
    const [offerings, courses, terms, departments, classYears, sections, users] = await Promise.all([
      API.getCourseOfferings(),
      API.getCourses(),
      API.getTerms(),
      API.getDepartments(),
      API.getClassYears(),
      API.getSections(),
      API.getUsers()
    ]);
    const allUsers = users.items || users;
    const activeTerm = terms.find(term => term.isActive) || terms[0] || {};
    const item = id ? offerings.find(row => row.id === id) : {
      courseId: courses[0]?.id || '',
      termId: activeTerm.id || '',
      instructorId: '',
      departmentId: departments[0]?.id || '',
      classYearId: classYears[0]?.id || '',
      sectionId: sections[0]?.id || '',
      capacity: 40,
      status: 'active'
    };
    const teachers = allUsers.filter(user => user.role === 'teacher' && user.status === 'active');
    this.openModal(id ? 'Edit course offering' : 'New course offering', `
      <form id="offering-form" class="stack">
        ${this.selectField('offering-course', 'Course', courses, item.courseId, row => `${row.code} - ${row.title}`)}
        ${this.selectField('offering-term', 'Term', terms, item.termId, row => row.name)}
        ${this.selectField('offering-instructor', 'Instructor', teachers, item.instructorId, row => row.name, true)}
        ${this.selectField('offering-department', 'Department', departments, item.departmentId, row => `${row.code} - ${row.name}`, true)}
        <div class="form-grid">
          ${this.selectField('offering-class-year', 'Class year', classYears, item.classYearId, row => row.name, true)}
          ${this.selectField('offering-section', 'Section', sections, item.sectionId, row => row.name, true)}
          ${this.input('offering-capacity', 'Capacity', item.capacity, 'number')}
        </div>
        <label class="form-field"><span>Status</span><select class="form-select" id="offering-status">
          ${['planned', 'active', 'completed', 'cancelled'].map(option => `<option value="${option}" ${item.status === option ? 'selected' : ''}>${option}</option>`).join('')}
        </select></label>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);
    document.getElementById('offering-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        const data = {
          courseId: Number(value('offering-course')),
          termId: Number(value('offering-term')),
          instructorId: value('offering-instructor') ? Number(value('offering-instructor')) : null,
          departmentId: value('offering-department') ? Number(value('offering-department')) : null,
          classYearId: value('offering-class-year') ? Number(value('offering-class-year')) : null,
          sectionId: value('offering-section') ? Number(value('offering-section')) : null,
          capacity: Number(value('offering-capacity')),
          status: value('offering-status')
        };
        id ? await API.updateCourseOffering(id, data) : await API.createCourseOffering(data);
        this.closeModal();
        this.renderAcademic();
      } catch (err) { this.toast(err.message, 'error'); }
    });
  },

  async showOfferingEnrollmentForm(courseOfferingId) {
    const [enrollments, users] = await Promise.all([
      API.getOfferingEnrollments(courseOfferingId),
      API.getUsers({ role: 'student' })
    ]);
    const userList = users.items || users;
    const enrolledIds = new Set(enrollments.map(item => Number(item.studentId)));
    const students = userList.filter(user => user.role === 'student' && !enrolledIds.has(Number(user.id)));
    this.openModal('Offering enrollments', `
      <form id="offering-enrollment-form" class="stack">
        <div class="list">${enrollments.map(item => `
          <div class="list-row">
            <div><strong>${this.esc(item.studentName)}</strong><small>${this.esc(item.studentNumber || '')} - ${this.esc(item.status)}</small></div>
            <button type="button" class="btn btn-danger btn-sm" onclick="App.deleteOfferingEnrollment(${item.id}, ${courseOfferingId})">Remove</button>
          </div>
        `).join('') || this.emptyLine('No students enrolled yet.')}</div>
        ${this.selectField('offering-student', 'Add student', students, '', row => `${row.name} - ${row.studentNumber || row.email}`)}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Close</button><button class="btn btn-primary" ${students.length ? '' : 'disabled'}>Enroll</button></div>
      </form>
    `);
    document.getElementById('offering-enrollment-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await API.enrollOffering({ courseOfferingId, studentId: Number(value('offering-student')), status: 'active' });
        this.showOfferingEnrollmentForm(courseOfferingId);
        this.toast('Student enrolled.', 'success');
      } catch (err) { this.toast(err.message, 'error'); }
    });
  },

  async deleteOfferingEnrollment(id, courseOfferingId) {
    if (!confirm('Remove this enrollment?')) return;
    try {
      await API.deleteOfferingEnrollment(id);
      this.showOfferingEnrollmentForm(courseOfferingId);
    } catch (err) { this.toast(err.message, 'error'); }
  },

  selectField(id, label, rows, selectedId, labelFn, includeEmpty = false) {
    return `
      <label class="form-field"><span>${this.esc(label)}</span><select class="form-select" id="${id}">
        ${includeEmpty ? '<option value="">None</option>' : ''}
        ${rows.map(row => `<option value="${row.id}" ${Number(selectedId) === Number(row.id) ? 'selected' : ''}>${this.esc(labelFn(row))}</option>`).join('')}
      </select></label>
    `;
  }
};
