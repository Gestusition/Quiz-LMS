import { API } from '../api.js';

export const AiQuizPage = {
  async renderAiQuizAssistant() {
    if (!this.canManageLearning()) return this.renderForbidden();
    this.setApp(this.loading('Loading AI Quiz Assistant'));
    try {
      const [settings, courses] = await Promise.all([API.getAiSettingsStatus(), API.getCourses()]);
      this._aiSettings = settings;
      this._aiCourses = courses;
      const selectedCourseId = Number(this._aiSelectedCourseId || courses[0]?.id || 0);
      this._aiSelectedCourseId = selectedCourseId;
      const [materials, drafts] = selectedCourseId
        ? await Promise.all([API.getAiMaterials(selectedCourseId), API.getAiDrafts(selectedCourseId)])
        : [[], []];
      this._aiMaterials = materials;
      this._aiDrafts = drafts;
      this.renderAiWorkspace();
    } catch (error) {
      this.renderError(error);
    }
  },

  renderAiWorkspace() {
    const settings = this._aiSettings || {};
    const courses = this._aiCourses || [];
    this.setApp(`
      <header class="page-header ai-page-header">
        <div><span class="eyebrow">Teacher workspace</span><h1>AI Quiz Assistant</h1><p>Generate a private draft, review every answer, then publish when it is ready.</p></div>
        <span class="ai-config-pill ${settings.configured ? 'ready' : 'missing'}">${settings.configured ? `Configured ${this.esc(settings.maskedApiKey || '')}` : 'Setup required'}</span>
      </header>

      ${!settings.enabled ? '<div class="alert alert-danger">AI Quiz Assistant is disabled by the server.</div>' : ''}
      <section class="ai-layout">
        <aside class="ai-sidebar stack">
          ${this.aiSettingsPanel(settings)}
          ${this.aiMaterialPanel(courses)}
          ${this.aiDraftHistory()}
        </aside>
        <main class="ai-main stack">
          ${this.aiGeneratorPanel(courses)}
          <section id="ai-preview-region">${this._aiDraftRecord ? this.aiDraftPreview(this._aiDraftRecord) : this.aiEmptyPreview()}</section>
        </main>
      </section>
    `);
    this.bindAiWorkspace();
  },

  aiSettingsPanel(settings) {
    const hasSavedUserKey = settings.source === 'user';
    return `
      <section class="panel ai-panel">
        <div class="panel-header"><div><h2>Private Azure settings</h2><p>${settings.configured ? `Using ${this.esc(settings.source || 'user')} configuration` : this.esc(settings.message || 'Add your credentials')}</p></div></div>
        <form id="ai-settings-form" class="stack compact-stack" autocomplete="off">
          <label class="form-field"><span>Azure endpoint</span><input class="form-input" id="ai-endpoint" type="url" required value="${this.esc(settings.endpoint || '')}" placeholder="https://your-resource.openai.azure.com"></label>
          <label class="form-field"><span>API key ${settings.maskedApiKey ? `<small>${hasSavedUserKey ? 'saved' : 'environment'} ${this.esc(settings.maskedApiKey)}</small>` : ''}</span><input class="form-input" id="ai-api-key" type="password" ${hasSavedUserKey ? '' : 'required'} autocomplete="new-password" placeholder="${hasSavedUserKey ? 'Leave blank to keep saved key' : 'Enter your own key'}"></label>
          <label class="form-field"><span>Chat deployment</span><input class="form-input" id="ai-chat-deployment" required value="${this.esc(settings.chatDeployment || '')}"></label>
          <label class="form-field"><span>Embedding deployment</span><input class="form-input" id="ai-embedding-deployment" value="${this.esc(settings.embeddingDeployment || '')}" placeholder="Required for course material"></label>
          <label class="form-field"><span>API version</span><input class="form-input" id="ai-api-version" required value="${this.esc(settings.apiVersion || '')}" placeholder="2024-10-21"></label>
          <button class="btn btn-secondary" type="submit">Save private settings</button>
          <small class="security-note">The browser never receives the saved key. Azure requests run on this server.</small>
        </form>
      </section>`;
  },

  aiMaterialPanel(courses) {
    const materials = this._aiMaterials || [];
    return `
      <section class="panel ai-panel">
        <div class="panel-header"><div><h2>Course material</h2><p>PDF, TXT, Markdown, or DOCX · max 10 MB</p></div></div>
        ${courses.length ? `<form id="ai-material-form" class="stack compact-stack">
          <input class="form-input" id="ai-material-file" type="file" accept=".pdf,.txt,.md,.docx" required>
          <button class="btn btn-ghost" type="submit">Upload & index</button>
        </form>` : '<p class="muted">Create or join a manageable course first.</p>'}
        <div class="ai-material-list">
          ${materials.map(material => `<div class="ai-material-row"><span>${this.esc(material.originalName)}</span><small>${material.chunkCount} chunks · ${this.aiFileSize(material.byteSize)}</small></div>`).join('') || '<small class="muted">No indexed material for this course.</small>'}
        </div>
      </section>`;
  },

  aiDraftHistory() {
    const drafts = this._aiDrafts || [];
    return `
      <section class="panel ai-panel">
        <div class="panel-header"><div><h2>Recent AI drafts</h2><p>Private until manually published</p></div></div>
        <div class="ai-draft-list">
          ${drafts.map(draft => `<button class="ai-draft-row" data-ai-draft-id="${draft.id}" type="button"><span><strong>${this.esc(draft.title || 'Untitled')}</strong><small>${draft.questionCount} questions</small></span><span class="status ${draft.status === 'draft' ? 'draft' : 'published'}">${this.esc(draft.status)}</span></button>`).join('') || '<small class="muted">No AI drafts yet.</small>'}
        </div>
      </section>`;
  },

  aiGeneratorPanel(courses) {
    return `
      <section class="panel ai-generator-panel">
        <div class="panel-header"><div><span class="eyebrow">Step 1</span><h2>Build a new draft</h2><p>The result is validated and saved as draft automatically.</p></div></div>
        <form id="ai-generate-form" class="stack">
          <div class="form-grid two-col">
            <label class="form-field"><span>Course</span><select class="form-select" id="ai-course" required>${courses.map(course => `<option value="${course.id}" ${Number(course.id) === Number(this._aiSelectedCourseId) ? 'selected' : ''}>${this.esc(course.code)} — ${this.esc(course.title)}</option>`).join('')}</select></label>
            <label class="form-field"><span>Topic</span><input class="form-input" id="ai-topic" maxlength="500" required placeholder="e.g. Binary search trees"></label>
            <label class="form-field"><span>Difficulty</span><select class="form-select" id="ai-difficulty"><option value="easy">Easy</option><option value="medium" selected>Medium</option><option value="hard">Hard</option></select></label>
            <label class="form-field"><span>Question type</span><select class="form-select" id="ai-question-type"><option value="mixed">Mixed</option><option value="multiple_choice">Multiple choice</option><option value="true_false">True / false</option><option value="short_answer">Short answer</option></select></label>
            <label class="form-field"><span>Question count</span><input class="form-input" id="ai-question-count" type="number" min="1" max="20" value="5" required></label>
            <label class="form-field"><span>Language</span><input class="form-input" id="ai-language" maxlength="60" value="English" required></label>
          </div>
          <div class="ai-check-row">
            <label><input id="ai-use-material" type="checkbox"> Use only indexed course material</label>
            <label><input id="ai-explanations" type="checkbox" checked> Include explanations</label>
          </div>
          <button class="btn btn-primary ai-generate-btn" type="submit" ${courses.length && this._aiSettings?.configured ? '' : 'disabled'}><span>Generate quiz draft</span></button>
          ${!this._aiSettings?.configured ? '<small class="muted">Save your Azure settings before generating.</small>' : ''}
        </form>
      </section>`;
  },

  aiEmptyPreview() {
    return '<section class="panel ai-empty-preview"><div class="ai-spark">✦</div><h2>Your review desk is ready</h2><p>Generate a draft or open one from the sidebar. Nothing is published automatically.</p></section>';
  },

  aiDraftPreview(record) {
    const draft = record.draft;
    const editable = record.status === 'draft';
    return `
      <section class="panel ai-preview-panel">
        <div class="ai-preview-toolbar"><div><span class="eyebrow">Step 2 · Review</span><h2>Quiz draft #${record.id}</h2><p>${draft.questions.length} validated questions · ${this.esc(draft.difficulty)}</p></div><span class="status ${editable ? 'draft' : 'published'}">${this.esc(record.status)}</span></div>
        <div class="stack">
          <label class="form-field"><span>Quiz title</span><input class="form-input" id="ai-draft-title" maxlength="160" value="${this.esc(draft.title)}" ${editable ? '' : 'disabled'}></label>
          <label class="form-field"><span>Description</span><textarea class="form-textarea" id="ai-draft-description" maxlength="2000" ${editable ? '' : 'disabled'}>${this.esc(draft.description || '')}</textarea></label>
        </div>
        <div class="ai-question-stack">
          ${draft.questions.map((question, index) => this.aiQuestionEditor(question, index, editable)).join('')}
        </div>
        ${editable ? `<div class="ai-review-actions"><button class="btn btn-secondary" id="ai-save-draft" type="button">Save as Draft</button><button class="btn btn-primary" id="ai-publish-draft" type="button">Publish reviewed quiz</button></div>` : `<div class="alert alert-success">This draft was converted to quiz #${record.quizId || '—'}.</div>`}
      </section>`;
  },

  aiQuestionEditor(question, index, editable) {
    const disabled = editable ? '' : 'disabled';
    const answerField = question.type === 'multiple_choice'
      ? `<select class="form-select ai-q-answer" ${disabled}>${question.options.map(option => `<option value="${this.esc(option)}" ${option === question.correctAnswer ? 'selected' : ''}>${this.esc(option)}</option>`).join('')}</select>`
      : question.type === 'true_false'
        ? `<select class="form-select ai-q-answer" ${disabled}><option value="true" ${question.correctAnswer === 'true' ? 'selected' : ''}>True</option><option value="false" ${question.correctAnswer === 'false' ? 'selected' : ''}>False</option></select>`
        : `<input class="form-input ai-q-answer" maxlength="1000" value="${this.esc(question.correctAnswer)}" ${disabled}>`;
    return `
      <article class="ai-question-card" data-ai-question="${index}" data-ai-type="${question.type}">
        <div class="ai-question-number"><span>${index + 1}</span><small>${this.esc(question.type.replaceAll('_', ' '))}</small></div>
        <div class="stack compact-stack">
          <label class="form-field"><span>Question</span><textarea class="form-textarea ai-q-text" maxlength="4000" ${disabled}>${this.esc(question.text)}</textarea></label>
          ${question.type === 'multiple_choice' ? `<label class="form-field"><span>Options — one per line</span><textarea class="form-textarea ai-q-options" ${disabled}>${this.esc(question.options.join('\n'))}</textarea></label>` : ''}
          <label class="form-field"><span>Correct answer</span>${answerField}</label>
          <label class="form-field"><span>Explanation</span><textarea class="form-textarea ai-q-explanation" maxlength="4000" ${disabled}>${this.esc(question.explanation || '')}</textarea></label>
          ${question.sourceHint ? `<small class="ai-source-hint">Source: ${this.esc(question.sourceHint)}</small>` : ''}
          ${editable ? `<div class="card-actions"><button class="btn btn-ghost btn-sm ai-regenerate-question" data-index="${index}" type="button">Regenerate question</button><button class="btn btn-ghost btn-sm ai-generate-explanation" data-index="${index}" type="button">Generate explanation</button></div>` : ''}
        </div>
      </article>`;
  },

  bindAiWorkspace() {
    document.getElementById('ai-settings-form')?.addEventListener('submit', event => this.saveAiSettings(event));
    document.getElementById('ai-material-form')?.addEventListener('submit', event => this.uploadAiMaterial(event));
    document.getElementById('ai-generate-form')?.addEventListener('submit', event => this.generateAiDraft(event));
    document.getElementById('ai-course')?.addEventListener('change', event => this.changeAiCourse(Number(event.target.value)));
    document.querySelectorAll('[data-ai-draft-id]').forEach(button => button.addEventListener('click', () => this.loadAiDraft(Number(button.dataset.aiDraftId))));
    this.bindAiPreviewActions();
  },

  bindAiPreviewActions() {
    document.getElementById('ai-save-draft')?.addEventListener('click', () => this.saveAiDraft());
    document.getElementById('ai-publish-draft')?.addEventListener('click', () => this.publishAiDraft());
    document.querySelectorAll('.ai-regenerate-question').forEach(button => button.addEventListener('click', () => this.regenerateAiQuestion(Number(button.dataset.index), button)));
    document.querySelectorAll('.ai-generate-explanation').forEach(button => button.addEventListener('click', () => this.generateAiQuestionExplanation(Number(button.dataset.index), button)));
    document.querySelectorAll('.ai-q-options').forEach(textarea => textarea.addEventListener('input', event => {
      const card = event.currentTarget.closest('[data-ai-question]');
      const select = card.querySelector('.ai-q-answer');
      const previous = select.value;
      const options = event.currentTarget.value.split('\n').map(value => value.trim()).filter(Boolean);
      select.replaceChildren(...options.map(option => new Option(option, option, false, option === previous)));
    }));
  },

  async saveAiSettings(event) {
    event.preventDefault();
    const payload = {
      endpoint: document.getElementById('ai-endpoint').value.trim(),
      apiKey: document.getElementById('ai-api-key').value.trim(),
      chatDeployment: document.getElementById('ai-chat-deployment').value.trim(),
      embeddingDeployment: document.getElementById('ai-embedding-deployment').value.trim(),
      apiVersion: document.getElementById('ai-api-version').value.trim()
    };
    try {
      this._aiSettings = await API.saveAiSettings(payload);
      this.toast('Private Azure settings saved.', 'success');
      this.renderAiWorkspace();
    } catch (error) { this.toast(error.message, 'error'); }
  },

  async changeAiCourse(courseId) {
    this._aiSelectedCourseId = courseId;
    this._aiDraftRecord = null;
    try {
      [this._aiMaterials, this._aiDrafts] = await Promise.all([API.getAiMaterials(courseId), API.getAiDrafts(courseId)]);
      this.renderAiWorkspace();
    } catch (error) { this.toast(error.message, 'error'); }
  },

  async uploadAiMaterial(event) {
    event.preventDefault();
    const file = document.getElementById('ai-material-file').files[0];
    if (!file) return this.toast('Choose a course material file.', 'error');
    const button = event.currentTarget.querySelector('button');
    this.aiBusy(button, true, 'Indexing…');
    try {
      await API.uploadAiMaterial(this._aiSelectedCourseId, file);
      this._aiMaterials = await API.getAiMaterials(this._aiSelectedCourseId);
      this.toast('Course material indexed.', 'success');
      this.renderAiWorkspace();
    } catch (error) { this.toast(error.message, 'error'); this.aiBusy(button, false); }
  },

  async generateAiDraft(event) {
    event.preventDefault();
    const courseId = Number(document.getElementById('ai-course').value);
    const payload = {
      topic: document.getElementById('ai-topic').value.trim(),
      difficulty: document.getElementById('ai-difficulty').value,
      questionType: document.getElementById('ai-question-type').value,
      questionCount: Number(document.getElementById('ai-question-count').value),
      language: document.getElementById('ai-language').value.trim(),
      useCourseMaterial: document.getElementById('ai-use-material').checked,
      includeExplanations: document.getElementById('ai-explanations').checked
    };
    const button = event.currentTarget.querySelector('button[type="submit"]');
    this.aiBusy(button, true, 'Generating & validating…');
    try {
      this._aiSelectedCourseId = courseId;
      this._aiDraftRecord = await API.generateAiQuiz(courseId, payload);
      this._aiDrafts = await API.getAiDrafts(courseId);
      this.toast('AI draft generated. Review it before publishing.', 'success');
      this.renderAiWorkspace();
      document.getElementById('ai-preview-region')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) { this.toast(error.message, 'error'); this.aiBusy(button, false); }
  },

  async loadAiDraft(draftId) {
    try {
      this._aiDraftRecord = await API.getAiDraft(this._aiSelectedCourseId, draftId);
      this.renderAiWorkspace();
      document.getElementById('ai-preview-region')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) { this.toast(error.message, 'error'); }
  },

  collectAiDraft() {
    const original = this._aiDraftRecord.draft;
    return {
      title: document.getElementById('ai-draft-title').value.trim(),
      description: document.getElementById('ai-draft-description').value.trim(),
      difficulty: original.difficulty,
      questions: [...document.querySelectorAll('[data-ai-question]')].map((card, index) => {
        const type = card.dataset.aiType;
        const options = type === 'multiple_choice' ? card.querySelector('.ai-q-options').value.split('\n').map(value => value.trim()).filter(Boolean) : (type === 'true_false' ? ['true', 'false'] : []);
        return {
          type,
          text: card.querySelector('.ai-q-text').value.trim(),
          options,
          correctAnswer: card.querySelector('.ai-q-answer').value.trim(),
          explanation: card.querySelector('.ai-q-explanation').value.trim(),
          sourceHint: original.questions[index]?.sourceHint || ''
        };
      })
    };
  },

  async saveAiDraft(showToast = true) {
    try {
      this._aiDraftRecord = await API.updateAiDraft(this._aiSelectedCourseId, this._aiDraftRecord.id, this.collectAiDraft());
      this._aiDrafts = await API.getAiDrafts(this._aiSelectedCourseId);
      if (showToast) this.toast('Draft changes saved.', 'success');
      this.renderAiWorkspace();
      return true;
    } catch (error) { this.toast(error.message, 'error'); return false; }
  },

  async publishAiDraft() {
    if (!window.confirm('Publish this reviewed quiz now? Students may see it according to course access rules.')) return;
    if (!await this.saveAiDraft(false)) return;
    try {
      const quiz = await API.publishAiDraft(this._aiSelectedCourseId, this._aiDraftRecord.id);
      this.toast(`Quiz “${quiz.title}” published.`, 'success');
      location.hash = '#/quizzes';
    } catch (error) { this.toast(error.message, 'error'); }
  },

  async regenerateAiQuestion(index, button) {
    const draft = this.collectAiDraft();
    this.aiBusy(button, true, 'Regenerating…');
    try {
      const replacement = await API.regenerateAiQuestion(this._aiSelectedCourseId, {
        question: draft.questions[index],
        topic: this._aiDraftRecord.draft.generation?.topic || draft.title,
        difficulty: draft.difficulty,
        language: this._aiDraftRecord.draft.generation?.language || 'English',
        useCourseMaterial: !!this._aiDraftRecord.draft.generation?.usedCourseMaterial
      });
      this._aiDraftRecord.draft.questions[index] = replacement;
      document.getElementById('ai-preview-region').innerHTML = this.aiDraftPreview(this._aiDraftRecord);
      this.bindAiPreviewActions();
      this.toast('Question regenerated. Review and save the draft.', 'success');
    } catch (error) { this.toast(error.message, 'error'); this.aiBusy(button, false); }
  },

  async generateAiQuestionExplanation(index, button) {
    const draft = this.collectAiDraft();
    this.aiBusy(button, true, 'Writing…');
    try {
      const result = await API.generateAiExplanation(this._aiSelectedCourseId, { question: draft.questions[index] });
      document.querySelector(`[data-ai-question="${index}"] .ai-q-explanation`).value = result.explanation;
      this.toast('Explanation generated. Review and save it.', 'success');
      this.aiBusy(button, false);
    } catch (error) { this.toast(error.message, 'error'); this.aiBusy(button, false); }
  },

  aiBusy(button, busy, label = '') {
    if (!button) return;
    if (!button.dataset.originalLabel) button.dataset.originalLabel = button.textContent;
    button.disabled = busy;
    button.textContent = busy ? label : button.dataset.originalLabel;
  },

  aiFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
};
