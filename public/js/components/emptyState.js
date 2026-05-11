export const emptyStateMethods = {
  loading(text) {
    return `<div class="empty-state"><h2>${this.esc(text)}</h2></div>`;
  },

  renderError(err) {
    if (err && err.sessionHandled) return;
    this.setApp(`<div class="empty-state"><h2>${this.esc(err.message)}</h2><button class="btn btn-primary" onclick="App.route()">Retry</button></div>`);
  },

  emptyLine(text) {
    return `<div class="empty-line">${this.esc(text)}</div>`;
  },

  emptyBlock(text) {
    return `<div class="empty-state"><h2>${this.esc(text)}</h2></div>`;
  }
};
