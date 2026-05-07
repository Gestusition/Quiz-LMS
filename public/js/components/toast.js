export const toastMethods = {
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('leaving'), 2600);
    setTimeout(() => toast.remove(), 3100);
  }
};
