import { API } from '../api.js';
import { value } from '../components/form.js';

export const UsersPage = {
  async renderUsers(filters = {}) {
    if (this.user.role !== 'admin') return this.setApp(this.emptyBlock('Admin access is required.'));
    this.setApp(this.loading('Loading users'));
    try {
      const [users, resetRequests] = await Promise.all([
        API.getUsers(filters),
        API.getPasswordResetRequests()
      ]);
      this.setApp(`
        <header class="page-header">
          <div><h1>Users</h1><p>${users.length} accounts</p></div>
          <button class="btn btn-primary" id="btn-new-user">New User</button>
        </header>
        <section class="panel">
          <div class="toolbar user-toolbar">
            <input class="form-input" id="user-search" value="${this.esc(filters.search || '')}" placeholder="Search users">
            <select class="form-select" id="user-role-filter">
              ${['', 'admin', 'teacher', 'student'].map(role =>
                `<option value="${role}" ${filters.role === role ? 'selected' : ''}>${role || 'all roles'}</option>`
              ).join('')}
            </select>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Academic identity</th><th>Status</th><th></th></tr></thead>
              <tbody>${users.map(user => this.userTableRow(user)).join('') || '<tr><td colspan="7">No users found.</td></tr>'}</tbody>
            </table>
          </div>
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
      let searchTimer;
      const refresh = () => this.renderUsers({
        search: value('user-search'),
        role: value('user-role-filter')
      });
      document.getElementById('user-search').addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(refresh, 250);
      });
      document.getElementById('user-role-filter').addEventListener('change', refresh);
    } catch (err) {
      this.renderError(err);
    }
  },

  async showUserForm(id) {
    const user = id ? (await API.getUsers()).find(item => item.id === id) : {
      name: '', username: '', email: '', role: 'student', status: 'active', studentNumber: '', cohort: ''
    };
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
          ${this.input('user-cohort', 'Cohort', user.cohort || '', 'text', '2026')}
        `;
      } else if (role === 'teacher') {
        container.innerHTML = `
          ${this.input('user-department', 'Department', user.department || '')}
          ${this.input('user-office-hours', 'Office hours', user.officeHours || '')}
        `;
      } else {
        container.innerHTML = this.input('user-display-name', 'Display name', user.displayName || '');
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
      const newPassword = value('user-password');
      if (newPassword) {
        data.password = newPassword;
      }
      if (data.role === 'student') {
        data.studentNumber = value('user-student-number');
        data.cohort = value('user-cohort');
      } else if (data.role === 'teacher') {
        data.department = value('user-department');
        data.officeHours = value('user-office-hours');
      } else {
        data.displayName = value('user-display-name');
      }
      try {
        if (id) {
          await API.updateUser(id, data);
        } else {
          await API.createUser(data);
        }
        this.closeModal();
        this.renderUsers();
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
      this.renderUsers();
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
            <button type="button" class="btn btn-primary" onclick="App.closeModal(); App.renderUsers()">Done</button>
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
        <td>${this.esc(user.username)}</td>
        <td>${this.esc(user.email)}</td>
        <td><span class="role-badge">${this.esc(user.role)}</span></td>
        <td>${this.academicIdentity(user)}</td>
        <td>${this.esc(user.status)}</td>
        <td class="table-actions">
          ${canIssueReset ? `<button class="btn btn-ghost btn-sm" onclick="App.issuePasswordResetCode(${user.id})">Reset code</button>` : ''}
          <button class="btn btn-ghost btn-sm" onclick="App.showUserForm(${user.id})">Edit</button>
          ${user.id !== this.user.id ? `<button class="btn btn-danger btn-sm" onclick="App.deleteUser(${user.id})">Delete</button>` : ''}
        </td>
      </tr>
    `;
  },

  academicIdentity(user) {
    if (user.role === 'student') {
      return `<small>${this.esc(user.studentNumber || '-')} ${user.cohort ? `- ${this.esc(user.cohort)}` : ''}</small>`;
    }
    if (user.role === 'teacher') {
      return `<small>${this.esc(user.department || '-')}</small>`;
    }
    return `<small>${this.esc(user.displayName || 'Admin')}</small>`;
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
