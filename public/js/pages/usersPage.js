import { API } from '../api.js';
import { value } from '../components/form.js';

export const UsersPage = {
  async renderUsers(filters = {}) {
    if (this.user.role !== 'admin') return this.setApp(this.emptyBlock('Admin access is required.'));

    const activeFilters = {
      search: filters.search !== undefined ? filters.search : (this.userFilters?.search || ''),
      role: filters.role !== undefined ? filters.role : (this.userFilters?.role || ''),
      status: filters.status !== undefined ? filters.status : (this.userFilters?.status || ''),
      departmentId: filters.departmentId !== undefined ? filters.departmentId : (this.userFilters?.departmentId || ''),
      classYearId: filters.classYearId !== undefined ? filters.classYearId : (this.userFilters?.classYearId || ''),
      sectionId: filters.sectionId !== undefined ? filters.sectionId : (this.userFilters?.sectionId || ''),
      page: filters.page !== undefined ? filters.page : (this.userFilters?.page || 1),
      limit: filters.limit !== undefined ? filters.limit : (this.userFilters?.limit || 20)
    };
    this.userFilters = activeFilters;

    this.setApp(this.loading('Loading users'));
    try {
      const [result, resetRequests, departments, classYears, sections] = await Promise.all([
        API.getUsers(activeFilters),
        API.getPasswordResetRequests(),
        API.getDepartments().catch(() => []),
        API.getClassYears().catch(() => []),
        API.getSections().catch(() => [])
      ]);

      const users = result.items || [];
      const pagination = result.pagination || { page: 1, limit: users.length, total: users.length, totalPages: 1 };

      this.setApp(`
        <header class="page-header">
          <div>
            <h1>Users</h1>
            <p>${pagination.total} total accounts</p>
          </div>
          <button class="btn btn-primary" id="btn-new-user">New User</button>
        </header>

        <section class="stats-grid">
          ${this.stat('Total users', pagination.total)}
          ${this.stat('Students', users.filter(user => user.role === 'student').length)}
          ${this.stat('Teachers', users.filter(user => user.role === 'teacher').length)}
          ${this.stat('Reset requests', resetRequests.length)}
        </section>

        <section class="panel">
          <div class="toolbar user-toolbar">
            <input class="form-input" id="user-search" value="${this.esc(activeFilters.search || '')}" placeholder="Search by name, email, student/employee number">
            <select class="form-select" id="user-role-filter">
              ${['', 'admin', 'teacher', 'student'].map(role =>
                `<option value="${role}" ${activeFilters.role === role ? 'selected' : ''}>${role || 'all roles'}</option>`
              ).join('')}
            </select>
            <select class="form-select" id="user-status-filter">
              ${['', 'active', 'disabled'].map(status =>
                `<option value="${status}" ${activeFilters.status === status ? 'selected' : ''}>${status || 'all status'}</option>`
              ).join('')}
            </select>
            <select class="form-select" id="user-department-filter">
              <option value="">all departments</option>
              ${departments.map(dept => `<option value="${dept.id}" ${String(activeFilters.departmentId || '') === String(dept.id) ? 'selected' : ''}>${this.esc(dept.code)} - ${this.esc(dept.name)}</option>`).join('')}
            </select>
            <select class="form-select" id="user-class-year-filter">
              <option value="">all class years</option>
              ${classYears.map(year => `<option value="${year.id}" ${String(activeFilters.classYearId || '') === String(year.id) ? 'selected' : ''}>${this.esc(year.departmentCode || '')} - ${this.esc(year.name)}</option>`).join('')}
            </select>
            <select class="form-select" id="user-section-filter">
              <option value="">all sections</option>
              ${sections.map(section => `<option value="${section.id}" ${String(activeFilters.sectionId || '') === String(section.id) ? 'selected' : ''}>${this.esc(section.classYearName || '')} - ${this.esc(section.name)}</option>`).join('')}
            </select>
          </div>

          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Academic identity</th><th>Status</th><th></th></tr></thead>
              <tbody>${users.map(user => this.userTableRow(user)).join('') || '<tr><td colspan="6">No users found for this filter set.</td></tr>'}</tbody>
            </table>
          </div>

          ${this.paginationRow(pagination)}
        </section>

        <section class="panel">
          <div class="panel-header">
            <h2>Password reset requests</h2>
            <span>${resetRequests.length} active</span>
          </div>
          <div class="list">
            ${resetRequests.map(request => this.resetRequestRow(request)).join('') || this.emptyLine('No active reset requests.')}
          </div>
        </section>
      `);

      document.getElementById('btn-new-user').addEventListener('click', () => this.showUserForm());
      this.bindUserFilters(pagination);
    } catch (err) {
      this.renderError(err);
    }
  },

  bindUserFilters(pagination) {
    let searchTimer;
    const refresh = (extra = {}) => this.renderUsers({
      search: value('user-search'),
      role: value('user-role-filter'),
      status: value('user-status-filter'),
      departmentId: value('user-department-filter'),
      classYearId: value('user-class-year-filter'),
      sectionId: value('user-section-filter'),
      page: extra.page || 1,
      limit: pagination.limit
    });

    document.getElementById('user-search').addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => refresh({ page: 1 }), 250);
    });

    ['user-role-filter', 'user-status-filter', 'user-department-filter', 'user-class-year-filter', 'user-section-filter']
      .forEach(id => document.getElementById(id).addEventListener('change', () => refresh({ page: 1 })));

    const prev = document.getElementById('users-page-prev');
    if (prev) prev.addEventListener('click', () => {
      if (pagination.page > 1) refresh({ page: pagination.page - 1 });
    });

    const next = document.getElementById('users-page-next');
    if (next) next.addEventListener('click', () => {
      if (pagination.page < pagination.totalPages) refresh({ page: pagination.page + 1 });
    });
  },

  paginationRow(pagination) {
    if (!pagination || pagination.totalPages <= 1) return '';
    return `
      <div class="toolbar">
        <span class="muted">Page ${pagination.page} of ${pagination.totalPages}</span>
        <div class="table-actions">
          <button class="btn btn-ghost btn-sm" id="users-page-prev" ${pagination.page <= 1 ? 'disabled' : ''}>Previous</button>
          <button class="btn btn-ghost btn-sm" id="users-page-next" ${pagination.page >= pagination.totalPages ? 'disabled' : ''}>Next</button>
        </div>
      </div>
    `;
  },

  async showUserDetails(id) {
    try {
      const [user, restrictionsResult, issuesResult] = await Promise.all([
        API.request(`/users/${id}`),
        API.getRestrictions({ userId: id, activeOnly: true, limit: 10 }),
        API.getValidationIssues({ relatedUserId: id, status: 'open', limit: 10 })
      ]);

      const restrictions = restrictionsResult.items || [];
      const issues = issuesResult.items || [];

      this.openModal('User details', `
        <div class="stack">
          <div>
            <h3>${this.esc(user.name)}</h3>
            <p class="muted">${this.esc(user.email)} - ${this.esc(user.role)}</p>
          </div>
          <div class="panel">
            <h4>Restrictions (${restrictions.length})</h4>
            <div class="list compact">
              ${restrictions.map(item => `
                <div class="list-row">
                  <div>
                    <strong>${this.esc(item.restrictionType)}</strong>
                    <small>${this.esc(item.scopeType)}${item.scopeId ? ` #${item.scopeId}` : ''} - ${this.esc(item.reason || 'No reason')}</small>
                  </div>
                  <button class="btn btn-ghost btn-sm" onclick="App.deactivateRestriction(${item.id})">Deactivate</button>
                </div>
              `).join('') || this.emptyLine('No active restrictions.')}
            </div>
          </div>
          <div class="panel">
            <h4>Open validation issues (${issues.length})</h4>
            <div class="list compact">
              ${issues.map(item => `
                <div class="list-row">
                  <div>
                    <strong>${this.esc(item.entityType)} #${this.esc(item.entityId || '-')}</strong>
                    <small>${this.esc(item.severity)} - ${this.esc(item.message)}</small>
                  </div>
                </div>
              `).join('') || this.emptyLine('No open validation issues.')}
            </div>
          </div>
          <form id="restriction-form" class="stack">
            <h4>Add restriction</h4>
            <label class="form-field"><span>Type</span><select class="form-select" id="restriction-type">
              ${['account_suspended','quiz_blocked','assignment_blocked','chat_muted','course_access_blocked','manual_review_required'].map(type => `<option value="${type}">${type}</option>`).join('')}
            </select></label>
            <label class="form-field"><span>Scope</span><select class="form-select" id="restriction-scope-type">
              ${['global','course','quiz','assignment'].map(type => `<option value="${type}">${type}</option>`).join('')}
            </select></label>
            ${this.input('restriction-scope-id', 'Scope ID (optional for global)', '', 'number')}
            ${this.input('restriction-reason', 'Reason', '', 'text', 'Manual review required')}
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Close</button>
              <button type="submit" class="btn btn-primary">Save restriction</button>
            </div>
          </form>
        </div>
      `);

      document.getElementById('restriction-form').addEventListener('submit', async event => {
        event.preventDefault();

        if (!value('restriction-type')) return this.toast('Restriction type is required.', 'error');
        if (!value('restriction-scope-type')) return this.toast('Restriction scope type is required.', 'error');
        if (value('restriction-scope-type') !== 'global' && !value('restriction-scope-id')) return this.toast('Scope ID is required for non-global restrictions.', 'error');
        if (!value('restriction-reason').trim()) return this.toast('Reason is required.', 'error');

        try {
          await API.createRestriction({
            userId: id,
            restrictionType: value('restriction-type'),
            scopeType: value('restriction-scope-type'),
            scopeId: value('restriction-scope-id') ? Number(value('restriction-scope-id')) : null,
            reason: value('restriction-reason')
          });
          this.toast('Restriction saved.', 'success');
          this.closeModal();
          this.renderUsers(this.userFilters || {});
        } catch (err) {
          this.toast(err.message, 'error');
        }
      });
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async deactivateRestriction(id) {
    try {
      await API.deactivateRestriction(id);
      this.toast('Restriction deactivated.', 'success');
      this.closeModal();
      this.renderUsers(this.userFilters || {});
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async showUserForm(id) {
    const defaultUser = {
      name: '', username: '', email: '', role: 'student', status: 'active', studentNumber: '', cohort: ''
    };
    const [user, faculties, departments, classYears, sections] = await Promise.all([
      id ? API.request(`/users/${id}`) : Promise.resolve(defaultUser),
      API.getFaculties().catch(() => []),
      API.getDepartments().catch(() => []),
      API.getClassYears().catch(() => []),
      API.getSections().catch(() => [])
    ]);
    this.openModal(id ? 'Edit user' : 'New user', `
      <form id="user-form" class="stack">
        ${this.input('user-name', 'Name', user.name)}
        ${this.input('user-username', 'Username', user.username)}
        ${this.input('user-email', 'Email', user.email, 'email')}
        <label class="form-field"><span>Role</span><select class="form-select" id="user-role">${['admin', 'teacher', 'student'].map(role => `<option value="${role}" ${user.role === role ? 'selected' : ''}>${role}</option>`).join('')}</select></label>
        <label class="form-field"><span>Status</span><select class="form-select" id="user-status">${['active', 'disabled'].map(status => `<option value="${status}" ${user.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></label>
        <div id="user-profile-fields"></div>
        <label class="form-field">
          <span>${id ? 'Set new password' : 'Password'}</span>
          <input class="form-input" id="user-password" type="password" autocomplete="new-password" placeholder="${id ? 'Leave blank to keep current password' : ''}">
        </label>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div>
      </form>
    `);

    const renderProfileFields = () => {
      const role = value('user-role');
      const container = document.getElementById('user-profile-fields');
      if (role === 'student') {
        container.innerHTML = `
          ${this.input('user-student-number', 'Student number', user.studentNumber || '', 'text', 'STU-0001')}
          ${this.selectField('user-faculty-id', 'Faculty', faculties, user.facultyId, row => row.name, true)}
          ${this.selectField('user-department-id', 'Department', departments, user.departmentId, row => `${row.code} - ${row.name}`, true)}
          ${this.selectField('user-class-year-id', 'Class year', classYears, user.classYearId, row => `${row.departmentCode} - ${row.name}`, true)}
          ${this.selectField('user-section-id', 'Section', sections, user.sectionId, row => `${row.classYearName} - ${row.name}`, true)}
          ${this.input('user-cohort', 'Cohort', user.cohort || '', 'text', '2026')}
        `;
      } else if (role === 'teacher') {
        container.innerHTML = `
          ${this.input('user-academic-title', 'Academic title', user.academicTitle || '', 'text', 'Instructor')}
          ${this.input('user-staff-number', 'Employee number', user.staffNumber || '', 'text', 'EMP-1001')}
          ${this.selectField('user-faculty-id', 'Faculty', faculties, user.facultyId, row => row.name, true)}
          ${this.selectField('user-department-id', 'Department', departments, user.departmentId, row => `${row.code} - ${row.name}`, true)}
          ${this.input('user-department', 'Legacy department label', user.department || user.departmentName || '')}
          ${this.input('user-office-hours', 'Office hours', user.officeHours || '')}
        `;
      } else {
        container.innerHTML = `
          ${this.input('user-display-name', 'Display name', user.displayName || '')}
          ${this.input('user-admin-title', 'Admin title', user.adminTitle || '', 'text', 'System Administrator')}
          ${this.selectField('user-faculty-id', 'Faculty', faculties, user.facultyId, row => row.name, true)}
          ${this.selectField('user-department-id', 'Department', departments, user.departmentId, row => `${row.code} - ${row.name}`, true)}
        `;
      }
    };

    renderProfileFields();
    document.getElementById('user-role').addEventListener('change', renderProfileFields);
    document.getElementById('user-form').addEventListener('submit', async event => {
      event.preventDefault();
      const data = {
        name: value('user-name'),
        username: value('user-username'),
        email: value('user-email'),
        role: value('user-role'),
        status: value('user-status')
      };

      if (!data.name.trim()) return this.toast('Name is required.', 'error');
      if (!data.email.trim() || !data.email.includes('@')) return this.toast('Valid email is required.', 'error');
      if (!data.role) return this.toast('Role is required.', 'error');

      const newPassword = value('user-password');
      if (!id && !newPassword) return this.toast('Password is required for new users.', 'error');

      if (newPassword) {
        data.password = newPassword;
      }
      if (data.role === 'student') {
        data.studentNumber = value('user-student-number');
        data.cohort = value('user-cohort');
        data.facultyId = value('user-faculty-id') ? Number(value('user-faculty-id')) : null;
        data.departmentId = value('user-department-id') ? Number(value('user-department-id')) : null;
        data.classYearId = value('user-class-year-id') ? Number(value('user-class-year-id')) : null;
        data.sectionId = value('user-section-id') ? Number(value('user-section-id')) : null;
      } else if (data.role === 'teacher') {
        data.department = value('user-department');
        data.officeHours = value('user-office-hours');
        data.academicTitle = value('user-academic-title');
        data.staffNumber = value('user-staff-number');
        data.facultyId = value('user-faculty-id') ? Number(value('user-faculty-id')) : null;
        data.departmentId = value('user-department-id') ? Number(value('user-department-id')) : null;
      } else {
        data.displayName = value('user-display-name');
        data.adminTitle = value('user-admin-title');
        data.facultyId = value('user-faculty-id') ? Number(value('user-faculty-id')) : null;
        data.departmentId = value('user-department-id') ? Number(value('user-department-id')) : null;
      }
      try {
        if (id) {
          await API.updateUser(id, data);
        } else {
          await API.createUser(data);
        }
        this.closeModal();
        this.renderUsers(this.userFilters || {});
        this.toast(id && newPassword ? 'User and password saved.' : 'User saved.', 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  async deleteUser(id) {
    if (!confirm('Delete this user?')) return;
    try {
      await API.deleteUser(id);
      this.renderUsers(this.userFilters || {});
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async issuePasswordResetCode(id) {
    try {
      const reset = await API.issuePasswordResetCode(id);
      this.openModal('One-time reset code', `
        <div class="stack">
          <p class="muted">Give this code to ${this.esc(reset.name)}. It is shown only once and expires at ${this.esc(this.formatDate(reset.expiresAt))}.</p>
          <div class="reset-code">${this.esc(reset.code)}</div>
          <div class="modal-actions">
            <button type="button" class="btn btn-primary" onclick="App.closeModal(); App.renderUsers(App.userFilters || {})">Done</button>
          </div>
        </div>
      `);
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  userTableRow(user) {
    const canIssueReset = ['teacher', 'student'].includes(user.role) && user.status === 'active';
    return `
      <tr>
        <td>${this.esc(user.name)}</td>
        <td>${this.esc(user.email)}</td>
        <td><span class="role-badge">${this.esc(user.role)}</span></td>
        <td>${this.academicIdentity(user)}</td>
        <td><span class="status-chip ${this.esc(user.status)}">${this.esc(user.status)}</span></td>
        <td class="table-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.showUserDetails(${user.id})">Details</button>
          ${canIssueReset ? `<button class="btn btn-ghost btn-sm" onclick="App.issuePasswordResetCode(${user.id})">Reset code</button>` : ''}
          <button class="btn btn-ghost btn-sm" onclick="App.showUserForm(${user.id})">Edit</button>
          ${user.id !== this.user.id ? `<button class="btn btn-danger btn-sm" onclick="App.deleteUser(${user.id})">Delete</button>` : ''}
        </td>
      </tr>
    `;
  },

  academicIdentity(user) {
    if (user.role === 'student') {
      const academic = [user.departmentName, user.classYearName, user.sectionName].filter(Boolean).join(' / ');
      return `<small>${this.esc(user.studentNumber || '-')} ${academic ? `- ${this.esc(academic)}` : ''}</small>`;
    }
    if (user.role === 'teacher') {
      return `<small>${this.esc(user.academicTitle || 'Instructor')} - ${this.esc(user.departmentName || user.department || '-')} - ${this.esc(user.staffNumber || '-')}</small>`;
    }
    return `<small>${this.esc(user.adminTitle || user.displayName || 'Admin')}</small>`;
  },

  resetRequestRow(request) {
    const detail = `${request.username} - ${request.email} (${request.role})`;
    const status = request.status === 'issued' && request.expiresAt
      ? `issued, expires ${this.formatDate(request.expiresAt)}`
      : request.status;

    return `
      <div class="list-row">
        <div>
          <strong>${this.esc(request.name)}</strong>
          <small>${this.esc(detail)} - ${this.esc(status)}</small>
        </div>
        <button class="btn btn-primary btn-sm" onclick="App.issuePasswordResetCode(${request.userId})">Issue code</button>
      </div>
    `;
  }
};
