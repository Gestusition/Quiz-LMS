import { esc } from '../utils/escape.js';

export function value(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : '';
}

export const formMethods = {
  input(id, label, inputValue = '', type = 'text', placeholder = '') {
    return `<label class="form-field"><span>${this.esc(label)}</span><input class="form-input" id="${id}" type="${type}" value="${this.esc(inputValue)}" placeholder="${this.esc(placeholder)}"></label>`;
  },

  textarea(id, label, inputValue = '') {
    return `<label class="form-field"><span>${this.esc(label)}</span><textarea class="form-textarea" id="${id}">${this.esc(inputValue)}</textarea></label>`;
  }
};

export function input(id, label, inputValue = '', type = 'text', placeholder = '') {
  return `<label class="form-field"><span>${esc(label)}</span><input class="form-input" id="${id}" type="${type}" value="${esc(inputValue)}" placeholder="${esc(placeholder)}"></label>`;
}
