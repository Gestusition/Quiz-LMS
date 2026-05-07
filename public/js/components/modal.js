export const modalMethods = {
  openModal(title, html) {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    const wasOpen = overlay.classList.contains('active');

    if (!wasOpen) {
      this._lastFocusedElement = document.activeElement;
    }

    document.getElementById('modal-title').textContent = title;
    body.innerHTML = html;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    if (!this._modalKeyHandler) {
      this._modalKeyHandler = event => this.handleModalKeydown(event);
    }
    document.addEventListener('keydown', this._modalKeyHandler);

    requestAnimationFrame(() => {
      const focusTarget = getFocusable(modal)[0] || modal;
      focusTarget.focus();
    });
  },

  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.getElementById('modal-body').innerHTML = '';
    document.body.classList.remove('modal-open');

    if (this._modalKeyHandler) {
      document.removeEventListener('keydown', this._modalKeyHandler);
    }

    const previous = this._lastFocusedElement;
    this._lastFocusedElement = null;
    if (previous && typeof previous.focus === 'function' && document.contains(previous)) {
      previous.focus();
    }
  },

  handleModalKeydown(event) {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay.classList.contains('active')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeModal();
      return;
    }
    if (event.key !== 'Tab') return;

    const modal = document.getElementById('modal');
    const focusable = getFocusable(modal);
    if (!focusable.length) {
      event.preventDefault();
      modal.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
};

function getFocusable(container) {
  return Array.from(container.querySelectorAll([
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(','))).filter(element => element.offsetParent !== null || element === document.activeElement);
}
