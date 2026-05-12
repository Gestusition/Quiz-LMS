import { API } from '../api.js';
import { value } from '../components/form.js';

export const ProfilePage = {
  async renderProfile() {
    this.setApp(this.loading('Loading profile'));
    try {
      const user = await API.me();
      this.user = user;

      const academicRows = this.profileAcademicRows(user);
      this.setApp(`
        <header class="page-header">
          <div>
            <h1>Profile</h1>
            <p>${this.esc(user.name)} - ${this.roleLabel(user.role)}</p>
          </div>
        </header>
        <section class="content-grid">
          <div class="panel">
            <div class="panel-header"><h2>Account</h2><span>${this.esc(user.status || 'active')}</span></div>
            <div class="profile-list">
              ${this.profileRow('Name', user.name)}
              ${this.profileRow('Username', user.username)}
              ${this.profileRow('Email', user.email)}
              ${this.profileRow('Role', this.roleLabel(user.role))}
              ${this.profileRow('Created', this.formatDate(user.createdAt))}
            </div>
          </div>
          <div class="panel">
            <div class="panel-header">
              <h2>Academic Identity</h2>
              ${this.isTeacherUser(user)
                ? '<button class="btn btn-primary btn-sm" id="btn-set-office-hours">Set office hours</button>'
                : `<span>${this.esc(this.roleLabel(user.role))}</span>`}
            </div>
            <div class="profile-list">
              ${academicRows || this.emptyLine('No academic profile fields are set yet.')}
            </div>
          </div>
        </section>
      `);
      document.getElementById('btn-set-office-hours')?.addEventListener('click', () => this.showTeacherProfileForm(user));
    } catch (err) {
      this.renderError(err);
    }
  },

  showTeacherProfileForm(user = this.user) {
    this.openModal('Set office hours', `
      <form id="teacher-profile-form" class="stack">
        ${this.input('teacher-academic-title', 'Academic title', user.academicTitle || '', 'text', 'Instructor')}
        ${this.input('teacher-department', 'Department label', user.department || user.departmentName || '')}
        ${this.textarea('teacher-office-hours', 'Office hours students will see', user.officeHours || '')}
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button class="btn btn-primary">Save</button>
        </div>
      </form>
    `);

    document.getElementById('teacher-profile-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        const updated = await API.updateOwnProfile({
          academicTitle: value('teacher-academic-title'),
          department: value('teacher-department'),
          officeHours: value('teacher-office-hours')
        });
        this.user = updated;
        this.renderShell();
        this.closeModal();
        this.toast('Office hours saved.', 'success');
        this.route();
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  profileAcademicRows(user) {
    if (this.isStudentUser(user)) {
      return [
        this.profileRow('Student number', user.studentNumber),
        this.profileRow('Faculty', user.facultyName),
        this.profileRow('Department', user.departmentName),
        this.profileRow('Class year', user.classYearName || (user.yearNumber ? `Year ${user.yearNumber}` : '')),
        this.profileRow('Section', user.sectionName),
        this.profileRow('Cohort', user.cohort)
      ].join('');
    }
    if (this.isTeacherUser(user)) {
      return [
        this.profileRow('Academic title', user.academicTitle),
        this.profileRow('Staff number', user.staffNumber),
        this.profileRow('Faculty', user.facultyName),
        this.profileRow('Department', user.departmentName || user.department),
        this.profileRow('Office hours', user.officeHours)
      ].join('');
    }
    return [
      this.profileRow('Display name', user.displayName),
      this.profileRow('Admin title', user.adminTitle),
      this.profileRow('Faculty', user.facultyName),
      this.profileRow('Department', user.departmentName)
    ].join('');
  },

  profileRow(label, rawValue) {
    const value = rawValue === undefined || rawValue === null || rawValue === '' ? 'Not set' : rawValue;
    return `
      <div class="profile-row">
        <span>${this.esc(label)}</span>
        <strong>${this.esc(value)}</strong>
      </div>
    `;
  },

  roleLabel(role) {
    const labels = { admin: 'Administrator', teacher: 'Instructor', student: 'Student' };
    return labels[role] || role || 'User';
  },

  normalizedRole(userOrRole) {
    const raw = typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
    const value = String(raw || '').trim().toLowerCase();
    if (['teacher', 'instructor'].includes(value)) return 'teacher';
    if (['student', 'learner'].includes(value)) return 'student';
    if (['admin', 'administrator'].includes(value)) return 'admin';
    return value;
  },

  isTeacherUser(user) {
    return this.normalizedRole(user) === 'teacher';
  },

  isStudentUser(user) {
    return this.normalizedRole(user) === 'student';
  }
};
