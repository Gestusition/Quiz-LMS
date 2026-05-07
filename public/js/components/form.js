import { esc } from '../utils/escape.js';

export function value(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : '';
}

function inputAttributes(attributes = {}, escapeFn = esc) {
  return Object.entries(attributes)
    .filter(([, attrValue]) => attrValue !== undefined && attrValue !== null && attrValue !== false)
    .map(([name, attrValue]) => {
      if (attrValue === true) return ` ${name}`;
      return ` ${name}="${escapeFn(attrValue)}"`;
    })
    .join('');
}

export const formMethods = {
  input(id, label, inputValue = '', type = 'text', placeholder = '', attributes = {}) {
    const attrs = inputAttributes(attributes, this.esc.bind(this));
    return `<label class="form-field"><span>${this.esc(label)}</span><input class="form-input" id="${id}" type="${type}" value="${this.esc(inputValue)}" placeholder="${this.esc(placeholder)}"${attrs}></label>`;
  },

  textarea(id, label, inputValue = '') {
    return `<label class="form-field"><span>${this.esc(label)}</span><textarea class="form-textarea" id="${id}">${this.esc(inputValue)}</textarea></label>`;
  }
};

export function input(id, label, inputValue = '', type = 'text', placeholder = '', attributes = {}) {
  const attrs = inputAttributes(attributes);
  return `<label class="form-field"><span>${esc(label)}</span><input class="form-input" id="${id}" type="${type}" value="${esc(inputValue)}" placeholder="${esc(placeholder)}"${attrs}></label>`;
}
