import { API } from '../api.js';
import { value } from '../components/form.js';

export const AuthPage = {
  renderLogin() {
    document.body.classList.add('login-page');
    this.setApp(`
      <section class="login-shell">
        <div class="login-panel">
          <div class="login-brand">
            <span class="brand-mark">QL</span>
            <div>
              <h1>Quiz LMS</h1>
              <p>Secure course quizzes and grade tracking</p>
            </div>
          </div>
          <form id="login-form" class="stack">
            <label class="form-field">
              <span>Email or Academic ID</span>
              <input class="form-input" id="login-identifier" type="text" autocomplete="username" placeholder="STU-0001 or teacher@example.edu" required>
            </label>
            <label class="form-field">
              <span>Password</span>
              <input class="form-input" id="login-password" type="password" autocomplete="current-password" required>
            </label>
            <p class="muted">Students must sign in with student number. Teachers must sign in with email.</p>
            <button class="btn btn-primary full" type="submit">Sign in</button>
          </form>
          <div class="login-actions">
            <button class="link-button" id="btn-forgot-password" type="button">Forgot password?</button>
            <button class="link-button" id="btn-use-reset-code" type="button">Use reset code</button>
          </div>
        </div>
      </section>
    `);

    document.getElementById('login-form').addEventListener('submit', event => this.login(event));
    document.getElementById('btn-forgot-password').addEventListener('click', () => this.showPasswordResetRequest());
    document.getElementById('btn-use-reset-code').addEventListener('click', () => this.showPasswordResetComplete());
  },

  async login(event) {
    event.preventDefault();
    try {
      const session = await API.login(
        document.getElementById('login-identifier').value,
        document.getElementById('login-password').value
      );
      this.user = session.user;
      document.body.classList.remove('login-page');
      this.renderShell();
      if (this.user.mustChangeCredentials) {
        this.renderCredentialChange();
      } else {
        location.hash = '#/';
        await this.renderDashboard();
      }
      this.toast('Signed in successfully.', 'success');
    } catch (err) {
      this.toast(err.message, 'error');
    }
  },

  async logout() {
    try { await API.logout(); } catch (e) { await API.clearSession(); }
    this.user = null;
    this.renderShell();
    location.hash = '#/';
    this.renderLogin();
  },

  showPasswordResetRequest() {
    const currentIdentifier = document.getElementById('login-identifier')?.value || '';
    this.openModal('Request password reset', `
      <form id="reset-request-form" class="stack">
        ${this.input('reset-request-username', 'Email or Academic ID', currentIdentifier, 'text', 'student@example.edu')}
        <p class="muted">The request will appear for an admin. Admins can issue a one-time code for teacher and student accounts.</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button class="btn btn-primary" type="submit">Send request</button>
        </div>
      </form>
    `);

    document.getElementById('reset-request-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        const result = await API.requestPasswordReset(value('reset-request-username'));
        this.closeModal();
        this.toast(result.message, 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  showPasswordResetComplete() {
    const currentIdentifier = document.getElementById('login-identifier')?.value || '';
    this.openModal('Use reset code', `
      <form id="reset-complete-form" class="stack">
        ${this.input('reset-username', 'Email or Academic ID', currentIdentifier, 'text', 'student@example.edu')}
        ${this.input('reset-code', 'One-time code', '', 'text', 'A1B2C3D4')}
        ${this.input('reset-new-password', 'New password', '', 'password')}
        ${this.input('reset-confirm-password', 'Confirm new password', '', 'password')}
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button class="btn btn-primary" type="submit">Update password</button>
        </div>
      </form>
    `);

    document.getElementById('reset-complete-form').addEventListener('submit', async event => {
      event.preventDefault();
        const username = value('reset-username');
      const newPassword = value('reset-new-password');
      if (newPassword !== value('reset-confirm-password')) {
        this.toast('New password confirmation does not match.', 'error');
        return;
      }

      try {
        const result = await API.completePasswordReset({
          identifier: username,
          code: value('reset-code'),
          newPassword
        });
        this.closeModal();
        const loginIdentifier = document.getElementById('login-identifier');
        if (loginIdentifier) loginIdentifier.value = username;
        this.toast(result.message, 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  renderCredentialChange() {
    document.body.classList.remove('login-page');
    this.setApp(`
      <section class="panel credential-panel">
        <header class="panel-header">
          <div>
            <h2>Change default admin credentials</h2>
            <p>The default username and password must be replaced before this account can continue.</p>
          </div>
        </header>
        <form id="credential-form" class="stack">
          <label class="form-field">
            <span>Current username</span>
            <input class="form-input" value="${this.esc(this.user.username || '')}" disabled>
          </label>
          ${this.input('new-username', 'New username', '', 'text', 'e.g. school-admin')}
          ${this.input('current-password', 'Current password', '', 'password')}
          ${this.input('new-password', 'New password', '', 'password')}
          ${this.input('confirm-password', 'Confirm new password', '', 'password')}
          <button class="btn btn-primary full" type="submit">Update credentials</button>
        </form>
      </section>
    `);

    document.getElementById('credential-form').addEventListener('submit', async event => {
      event.preventDefault();
      const newPassword = value('new-password');
      if (newPassword !== value('confirm-password')) {
        this.toast('New password confirmation does not match.', 'error');
        return;
      }

      try {
        const user = await API.changeCredentials({
          username: value('new-username'),
          currentPassword: value('current-password'),
          newPassword
        });
        this.user = user;
        this.renderShell();
        location.hash = '#/';
        await this.renderDashboard();
        this.toast('Credentials updated.', 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  }
};
