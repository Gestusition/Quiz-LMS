import { API } from '../api.js';

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
            <div class="panel-header"><h2>Academic Identity</h2><span>${this.esc(this.roleLabel(user.role))}</span></div>
            <div class="profile-list">
              ${academicRows || this.emptyLine('No academic profile fields are set yet.')}
            </div>
          </div>
        </section>
      `);
    } catch (err) {
      this.renderError(err);
    }
  },

  profileAcademicRows(user) {
    if (user.role === 'student') {
      return [
        this.profileRow('Student number', user.studentNumber),
        this.profileRow('Faculty', user.facultyName),
        this.profileRow('Department', user.departmentName),
        this.profileRow('Class year', user.classYearName || (user.yearNumber ? `Year ${user.yearNumber}` : '')),
        this.profileRow('Section', user.sectionName),
        this.profileRow('Cohort', user.cohort)
      ].join('');
    }
    if (user.role === 'teacher') {
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
  }
};
