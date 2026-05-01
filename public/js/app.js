/**
 * App — Main SPA router & utility functions.
 * Uses hash-based routing (#/categories, #/questions, etc.)
 */
const App = {

  /**
   * Initialize the application and set up routing.
   */
  init() {
    window.addEventListener('hashchange', () => this.route());
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeModal();
    });
    this.route();
  },

  /**
   * Hash-based router — reads location.hash and renders the appropriate page.
   */
  route() {
    const hash = location.hash || '#/';
    const path = hash.replace('#', '') || '/';

    // Update active nav link
    document.querySelectorAll('.nav-link[data-route]').forEach(link => {
      link.classList.toggle('active', link.dataset.route === path);
    });

    // Render the correct page
    const app = document.getElementById('app');
    app.style.animation = 'none';
    app.offsetHeight; // trigger reflow
    app.style.animation = 'fadeIn 0.3s ease';

    switch (path) {
      case '/':
        this.renderDashboard();
        break;
      case '/categories':
        CategoriesPage.render();
        break;
      case '/questions':
        QuestionsPage.render();
        break;
      case '/quiz':
        this.renderQuizSetup();
        break;
      default:
        app.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Page not found</div><a href="#/" class="btn btn-primary" style="margin-top:1rem">Go Home</a></div>`;
    }
  },

  // ========== Dashboard ==========
  async renderDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page-header"><div><h1>📊 Dashboard</h1><p>Overview of your quiz database</p></div></div>
      <div class="stats-grid" id="stats-grid">
        <div class="stat-card"><div class="stat-icon purple">📁</div><div><div class="stat-value" id="stat-categories">-</div><div class="stat-label">Categories</div></div></div>
        <div class="stat-card"><div class="stat-icon blue">❓</div><div><div class="stat-value" id="stat-questions">-</div><div class="stat-label">Questions</div></div></div>
        <div class="stat-card"><div class="stat-icon green">✅</div><div><div class="stat-value" id="stat-easy">-</div><div class="stat-label">Easy</div></div></div>
        <div class="stat-card"><div class="stat-icon yellow">🔥</div><div><div class="stat-value" id="stat-hard">-</div><div class="stat-label">Hard</div></div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem" id="dashboard-details">
        <div class="card" id="dashboard-chart" style="padding:1.5rem"><h3 style="margin-bottom:1rem;font-size:1rem">Difficulty Breakdown</h3><div id="difficulty-chart"></div></div>
        <div class="card" id="dashboard-cats" style="padding:1.5rem"><h3 style="margin-bottom:1rem;font-size:1rem">Categories</h3><div id="categories-list"></div></div>
      </div>
    `;

    try {
      const [categories, questions] = await Promise.all([API.getCategories(), API.getQuestions()]);

      document.getElementById('stat-categories').textContent = categories.length;
      document.getElementById('stat-questions').textContent = questions.length;

      const easy = questions.filter(q => q.difficulty === 'EASY').length;
      const medium = questions.filter(q => q.difficulty === 'MEDIUM').length;
      const hard = questions.filter(q => q.difficulty === 'HARD').length;
      document.getElementById('stat-easy').textContent = easy;
      document.getElementById('stat-hard').textContent = hard;

      // Difficulty chart
      const total = questions.length || 1;
      document.getElementById('difficulty-chart').innerHTML = `
        <div class="chart-bar-group"><div class="chart-bar-label"><span>Easy</span><span>${easy}</span></div><div class="chart-bar-track"><div class="chart-bar-fill easy" style="width:${(easy/total)*100}%"></div></div></div>
        <div class="chart-bar-group"><div class="chart-bar-label"><span>Medium</span><span>${medium}</span></div><div class="chart-bar-track"><div class="chart-bar-fill medium" style="width:${(medium/total)*100}%"></div></div></div>
        <div class="chart-bar-group"><div class="chart-bar-label"><span>Hard</span><span>${hard}</span></div><div class="chart-bar-track"><div class="chart-bar-fill hard" style="width:${(hard/total)*100}%"></div></div></div>
      `;

      // Categories list
      if (categories.length === 0) {
        document.getElementById('categories-list').innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem">No categories yet.</p>';
      } else {
        document.getElementById('categories-list').innerHTML = categories.map(c => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid var(--border)">
            <span style="font-weight:500">${this.esc(c.name)}</span>
            <span class="badge badge-mc">${c.questionCount} Q</span>
          </div>
        `).join('');
      }
    } catch (err) {
      document.getElementById('stats-grid').innerHTML = `<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-text">${err.message}</div></div>`;
    }
  },

  // ========== Quiz Setup ==========
  async renderQuizSetup() {
    const app = document.getElementById('app');
    let catOptions = '<option value="">All Categories</option>';
    try {
      const cats = await API.getCategories();
      catOptions += cats.map(c => `<option value="${c.id}">${this.esc(c.name)}</option>`).join('');
    } catch (e) { /* ignore */ }

    app.innerHTML = `
      <div class="page-header"><div><h1>🎮 Take a Quiz</h1><p>Test your knowledge!</p></div></div>
      <div class="quiz-setup card">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-select" id="quiz-category">${catOptions}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Difficulty</label>
          <select class="form-select" id="quiz-difficulty">
            <option value="">Any Difficulty</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Number of Questions</label>
          <input type="number" class="form-input" id="quiz-limit" value="10" min="1" max="50">
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:0.5rem" id="btn-start-quiz">🚀 Start Quiz</button>
      </div>
    `;

    document.getElementById('btn-start-quiz').addEventListener('click', () => this.startQuiz());
  },

  // ========== Quiz Game ==========
  quizState: { questions: [], current: 0, answers: [], score: 0 },

  async startQuiz() {
    const opts = {
      categoryId: document.getElementById('quiz-category').value,
      difficulty: document.getElementById('quiz-difficulty').value,
      limit: document.getElementById('quiz-limit').value,
    };

    try {
      const questions = await API.getRandomQuestions(opts);
      if (questions.length === 0) { this.toast('No questions found with these filters.', 'error'); return; }
      this.quizState = { questions, current: 0, answers: new Array(questions.length).fill(null), score: 0 };
      this.renderQuizQuestion();
    } catch (err) { this.toast(err.message, 'error'); }
  },

  renderQuizQuestion() {
    const { questions, current } = this.quizState;
    const q = questions[current];
    const total = questions.length;
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-progress">
          <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${((current+1)/total)*100}%"></div></div>
          <span class="quiz-progress-text">${current + 1} / ${total}</span>
        </div>
        <div class="quiz-question-card">
          <div style="display:flex;gap:0.5rem;margin-bottom:1rem">
            <span class="badge badge-${q.type.toLowerCase()}">${{MC:'Multiple Choice',TF:'True/False',FB:'Fill Blank'}[q.type]}</span>
            <span class="badge badge-${q.difficulty.toLowerCase()}">${q.difficulty}</span>
          </div>
          <div class="quiz-question-text">${this.esc(q.text)}</div>
          <div id="quiz-answer-area"></div>
        </div>
        <div class="quiz-actions">
          ${current > 0 ? '<button class="btn btn-ghost" id="btn-quiz-prev">← Previous</button>' : ''}
          <button class="btn btn-primary" id="btn-quiz-next">${current === total - 1 ? '🏁 Finish' : 'Next →'}</button>
        </div>
      </div>
    `;

    const area = document.getElementById('quiz-answer-area');
    const saved = this.quizState.answers[current];

    if (q.type === 'MC') {
      area.innerHTML = q.options.map((opt, i) =>
        `<button class="quiz-option ${saved === String(i) ? 'selected' : ''}" data-idx="${i}">${this.esc(opt)}</button>`
      ).join('');
      area.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
          area.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.quizState.answers[current] = btn.dataset.idx;
        });
      });
    } else if (q.type === 'TF') {
      area.innerHTML = `<div class="quiz-tf-group">
        <button class="quiz-option ${saved === 'true' ? 'selected' : ''}" data-val="true">✅ True</button>
        <button class="quiz-option ${saved === 'false' ? 'selected' : ''}" data-val="false">❌ False</button>
      </div>`;
      area.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
          area.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.quizState.answers[current] = btn.dataset.val;
        });
      });
    } else {
      area.innerHTML = `<input type="text" class="quiz-fb-input" id="quiz-fb-input" placeholder="Type your answer..." value="${this.esc(saved || '')}">`;
      document.getElementById('quiz-fb-input').addEventListener('input', (e) => {
        this.quizState.answers[current] = e.target.value;
      });
    }

    if (current > 0) document.getElementById('btn-quiz-prev').addEventListener('click', () => { this.quizState.current--; this.renderQuizQuestion(); });
    document.getElementById('btn-quiz-next').addEventListener('click', () => {
      if (this.quizState.answers[current] === null || this.quizState.answers[current] === '') {
        this.toast('Please answer the question.', 'error');
        return;
      }
      if (current === total - 1) { this.finishQuiz(); }
      else { this.quizState.current++; this.renderQuizQuestion(); }
    });
  },

  finishQuiz() {
    const { questions, answers } = this.quizState;
    let correct = 0;

    questions.forEach((q, i) => {
      const userAnswer = (answers[i] || '').trim().toLowerCase();
      const correctAnswer = q.correctAnswer.trim().toLowerCase();
      if (userAnswer === correctAnswer) correct++;
    });

    const pct = Math.round((correct / questions.length) * 100);
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="quiz-results">
        <div style="font-size:4rem;margin-bottom:0.5rem">${pct >= 70 ? '🎉' : pct >= 50 ? '😊' : '😅'}</div>
        <div class="results-score">${pct}%</div>
        <div class="results-subtitle">You got ${correct} out of ${questions.length} correct</div>
        <div style="display:flex;gap:0.75rem;justify-content:center">
          <button class="btn btn-primary" onclick="location.hash='#/quiz'">Try Again</button>
          <button class="btn btn-ghost" onclick="location.hash='#/'">Dashboard</button>
        </div>
      </div>
    `;
  },

  // ========== Modal Helpers ==========
  openModal(title, bodyHtml) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-overlay').classList.add('active');
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
  },

  // ========== Toast ==========
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = '0.3s ease'; }, 2500);
    setTimeout(() => toast.remove(), 3000);
  },

  // ========== Utility ==========
  esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; }
};

// Boot the app
document.addEventListener('DOMContentLoaded', () => App.init());
