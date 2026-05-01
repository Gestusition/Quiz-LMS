/**
 * Categories UI module — Handles rendering and interactions for the Categories page.
 */
const CategoriesPage = {

  /**
   * Render the categories page.
   */
  async render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page-header">
        <div>
          <h1>📁 Categories</h1>
          <p>Organize your questions into categories</p>
        </div>
        <button class="btn btn-primary" id="btn-add-category">+ New Category</button>
      </div>
      <div class="cards-grid" id="categories-grid">
        <div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-text">Loading...</div></div>
      </div>
    `;

    document.getElementById('btn-add-category').addEventListener('click', () => this.showForm());
    await this.loadCategories();
  },

  /**
   * Load and render categories from the API.
   */
  async loadCategories() {
    const grid = document.getElementById('categories-grid');
    try {
      const categories = await API.getCategories();
      if (categories.length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📁</div>
            <div class="empty-state-text">No categories yet. Create one to get started!</div>
          </div>
        `;
        return;
      }

      grid.innerHTML = categories.map(cat => `
        <div class="category-card" data-id="${cat.id}">
          <div class="category-card-name">${this.escapeHtml(cat.name)}</div>
          <div class="category-card-desc">${this.escapeHtml(cat.description || 'No description')}</div>
          <div class="category-card-meta">
            <span class="category-card-count">${cat.questionCount} question${cat.questionCount !== 1 ? 's' : ''}</span>
            <div class="category-card-actions">
              <button class="btn btn-ghost btn-icon btn-sm" title="Edit" onclick="CategoriesPage.showForm(${cat.id})">✏️</button>
              <button class="btn btn-ghost btn-icon btn-sm" title="Delete" onclick="CategoriesPage.confirmDelete(${cat.id}, '${this.escapeHtml(cat.name)}')">🗑️</button>
            </div>
          </div>
        </div>
      `).join('');
    } catch (err) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-text">${err.message}</div></div>`;
    }
  },

  /**
   * Show the category create/edit modal form.
   * @param {number} [id] - Category ID for editing.
   */
  async showForm(id) {
    let category = { name: '', description: '' };
    const isEdit = !!id;

    if (isEdit) {
      try { category = await API.getCategory(id); } catch (err) { App.toast(err.message, 'error'); return; }
    }

    App.openModal(isEdit ? 'Edit Category' : 'New Category', `
      <form id="category-form">
        <div class="form-group">
          <label class="form-label" for="cat-name">Name *</label>
          <input type="text" class="form-input" id="cat-name" value="${this.escapeHtml(category.name)}" maxlength="100" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="cat-desc">Description</label>
          <textarea class="form-textarea" id="cat-desc" maxlength="500">${this.escapeHtml(category.description || '')}</textarea>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:1rem">
          <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'}</button>
        </div>
      </form>
    `);

    document.getElementById('category-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('cat-name').value.trim();
      const description = document.getElementById('cat-desc').value.trim();

      if (!name) { App.toast('Category name is required.', 'error'); return; }

      try {
        if (isEdit) {
          await API.updateCategory(id, { name, description });
          App.toast('Category updated!', 'success');
        } else {
          await API.createCategory({ name, description });
          App.toast('Category created!', 'success');
        }
        App.closeModal();
        await this.loadCategories();
      } catch (err) { App.toast(err.message, 'error'); }
    });
  },

  /**
   * Show a confirmation dialog before deleting a category.
   * @param {number} id - Category ID.
   * @param {string} name - Category name.
   */
  confirmDelete(id, name) {
    App.openModal('Delete Category', `
      <p style="margin-bottom:1rem">Are you sure you want to delete <strong>"${name}"</strong>? All questions in this category will also be deleted.</p>
      <div style="display:flex;justify-content:flex-end;gap:0.5rem">
        <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
        <button class="btn btn-danger" id="btn-confirm-delete">Delete</button>
      </div>
    `);

    document.getElementById('btn-confirm-delete').addEventListener('click', async () => {
      try {
        await API.deleteCategory(id);
        App.toast('Category deleted!', 'success');
        App.closeModal();
        await this.loadCategories();
      } catch (err) { App.toast(err.message, 'error'); }
    });
  },

  /**
   * Escape HTML special characters to prevent XSS.
   * @param {string} str - The string to escape.
   * @returns {string} Escaped string.
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
