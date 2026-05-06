import { API } from '../api.js';

const TYPE_LABELS = {
  MC: 'Multiple Choice', TF: 'True / False', FB: 'Fill Blank',
  MT: 'Math Table', MP: 'Multi-Part', SA: 'Numeric',
  ES: 'Essay', OR: 'Ordering', MR: 'Multiple Response'
};

export const AttemptPage = {
  async renderAttempt(attemptId) {
    this.setApp(this.loading('Loading attempt'));
    try {
      const attempt = await API.getAttempt(attemptId);
      const isInProgress = attempt.status === 'in_progress';
      const questions = attempt.questions || [];
      const savedAnswers = {};
      (attempt.answers || []).forEach(answer => { savedAnswers[answer.questionId] = answer; });

      if (!this._attemptAnswers || this._attemptId !== attemptId) {
        this._attemptAnswers = {};
        this._attemptId = attemptId;
        this._attemptStart = Date.now();
        Object.entries(savedAnswers).forEach(([qId, answer]) => {
          this._attemptAnswers[qId] = answer.answer || '';
        });
      }

      this.setApp(`
        <div class="attempt-layout">
          <aside class="attempt-sidebar">
            <div class="attempt-info-card">
              <h3>${this.esc(attempt.quizTitle)}</h3>
              <div class="attempt-meta">
                <span>Attempt #${attempt.attemptNumber}</span>
                ${isInProgress ? `<div class="timer" id="attempt-timer"></div>` : `<span class="status-badge status-${attempt.status}">${attempt.status}</span>`}
              </div>
              ${attempt.status === 'submitted' ? `
                <div class="attempt-results-mini">
                  <span class="score-display">${attempt.score}/${attempt.maxScore}</span>
                  <span class="percentage-display">${attempt.percentage}%</span>
                  ${attempt.letterGrade ? `<span class="grade-display">${this.esc(attempt.letterGrade)}</span>` : ''}
                </div>
              ` : ''}
            </div>
            <div class="question-nav" id="question-nav">
              <h4>Questions</h4>
              ${questions.map((q, i) => {
                const answered = !!this._attemptAnswers[q.id];
                const result = savedAnswers[q.id];
                let dotClass = 'nav-dot';
                if (attempt.status === 'submitted') {
                  dotClass += result?.isCorrect ? ' dot-correct' : ' dot-wrong';
                } else if (answered) {
                  dotClass += ' dot-answered';
                }
                return `<button class="${dotClass}" data-index="${i}" title="Q${i + 1}">${i + 1}</button>`;
              }).join('')}
            </div>
            ${isInProgress ? `<button class="btn btn-primary btn-block" id="btn-submit-attempt">Submit Exam</button>` : ''}
          </aside>
          <main class="attempt-main" id="attempt-questions">
            ${questions.map((question, index) => this.renderQuestionCard(question, index, isInProgress, savedAnswers, attempt)).join('')}
          </main>
        </div>
      `);

      this.renderLatexAll();

      if (isInProgress) {
        this.setupTimer(attempt);
        this.setupAnswerListeners(questions);
        document.getElementById('btn-submit-attempt')?.addEventListener('click', () => this.submitCurrentAttempt(attemptId, questions));
      }

      document.querySelectorAll('.nav-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          const index = dot.dataset.index;
          document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    } catch (err) {
      this.renderError(err);
    }
  },

  renderQuestionCard(question, index, isInProgress, savedAnswers, attempt) {
    const saved = savedAnswers[question.id];
    const showResult = attempt.status === 'submitted' && attempt.showCorrectAnswers;

    return `
      <div class="question-card" id="question-${index}">
        <div class="question-header">
          <span class="question-number">Q${index + 1}</span>
          <span class="type-badge-sm">${question.type}</span>
          <span class="question-points">${question.points} pts</span>
          ${showResult ? `<span class="result-badge ${saved?.isCorrect ? 'correct' : 'wrong'}">${saved?.isCorrect ? '✓' : '✗'} ${saved?.pointsAwarded || 0} pts</span>` : ''}
        </div>
        <div class="question-body">
          <div class="question-text">${this.esc(question.text)}</div>
          ${question.richText ? `<div class="question-rich-text">${this.esc(question.richText)}</div>` : ''}
          ${question.mediaUrl ? `<div class="question-media"><img src="${this.esc(question.mediaUrl)}" alt="Question image"></div>` : ''}
        </div>
        ${question.hintText && isInProgress ? `<details class="hint-details"><summary>💡 Show hint</summary><div class="hint-text">${this.esc(question.hintText)}</div></details>` : ''}
        <div class="answer-area" data-question-id="${question.id}" data-question-type="${question.type}">
          ${this.renderAnswerInput(question, index, isInProgress, saved, showResult)}
        </div>
        ${showResult && question.explanationText ? `<div class="explanation-box"><strong>Explanation:</strong> ${this.esc(question.explanationText)}</div>` : ''}
        ${showResult && saved && !saved.isCorrect && question.correctAnswer ? `<div class="correct-answer-box"><strong>Correct answer:</strong> ${this.esc(question.correctAnswer)}</div>` : ''}
      </div>
    `;
  },

  renderAnswerInput(question, index, isInProgress, saved, showResult) {
    const answeredValue = this._attemptAnswers?.[question.id] || saved?.answer || '';
    const disabled = !isInProgress;

    switch (question.type) {
      case 'MC':
        return (question.options || []).map((option, i) => `
          <label class="answer-option ${showResult && String(question.correctAnswer) === String(i) ? 'correct-option' : ''} ${showResult && answeredValue === String(i) && !saved?.isCorrect ? 'wrong-option' : ''}">
            <input type="radio" name="answer-${question.id}" value="${i}" ${answeredValue === String(i) ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
            <span>${this.esc(option)}</span>
          </label>
        `).join('');

      case 'TF':
        return ['true', 'false'].map(val => `
          <label class="answer-option ${showResult && question.correctAnswer === val ? 'correct-option' : ''}">
            <input type="radio" name="answer-${question.id}" value="${val}" ${answeredValue === val ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
            <span>${val.charAt(0).toUpperCase() + val.slice(1)}</span>
          </label>
        `).join('');

      case 'FB':
      case 'SA':
        return `<input class="form-input answer-input" data-qid="${question.id}" value="${this.esc(answeredValue)}" placeholder="${question.type === 'SA' ? 'Enter numeric answer...' : 'Type your answer...'}" ${disabled ? 'disabled' : ''}>
          ${question.type === 'SA' ? '<small class="form-hint">Supports scientific notation (e.g. 1.23456E+00)</small>' : ''}`;

      case 'ES':
        return `<textarea class="form-input answer-textarea" data-qid="${question.id}" rows="8" placeholder="Write your essay response..." ${disabled ? 'disabled' : ''}>${this.esc(answeredValue)}</textarea>`;

      case 'MR': {
        const checkedSet = new Set(String(answeredValue).split(',').filter(Boolean));
        return (question.options || []).map((option, i) => `
          <label class="answer-option">
            <input type="checkbox" name="answer-${question.id}" value="${i}" ${checkedSet.has(String(i)) ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
            <span>${this.esc(option)}</span>
          </label>
        `).join('');
      }

      case 'OR': {
        const items = question.options || [];
        const currentOrder = answeredValue ? answeredValue.split(',') : items.map((_, i) => String(i));
        return `
          <div class="ordering-answer" data-qid="${question.id}">
            ${currentOrder.map((idx, pos) => `
              <div class="order-item" data-value="${idx}" draggable="${isInProgress}">
                <span class="order-pos">${pos + 1}</span>
                <span>${this.esc(items[Number(idx)] || `Item ${idx}`)}</span>
                ${isInProgress ? `<span class="order-controls">
                  <button type="button" class="btn-order-up" onclick="App.moveOrderItem(${question.id}, ${pos}, -1)">▲</button>
                  <button type="button" class="btn-order-down" onclick="App.moveOrderItem(${question.id}, ${pos}, 1)">▼</button>
                </span>` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }

      case 'MT': {
        const config = question.tableConfig || {};
        const columns = config.columns || [];
        const rowCount = config.rowCount || 1;
        const prefill = config.prefill || {};
        let parsedAnswer = {};
        try { parsedAnswer = typeof answeredValue === 'string' ? JSON.parse(answeredValue || '{}') : answeredValue; } catch (e) { /* empty */ }

        return `
          <div class="table-answer" data-qid="${question.id}">
            <table class="table math-table">
              <thead><tr>${columns.map(col => `<th>${this.esc(col.header)}</th>`).join('')}</tr></thead>
              <tbody>
                ${Array.from({ length: rowCount }, (_, row) => `
                  <tr>${columns.map((col, colIdx) => {
                    const cellKey = `r${row}_c${colIdx}`;
                    const prefillVal = prefill[cellKey] || '';
                    const answerVal = parsedAnswer[cellKey] || prefillVal;
                    if (col.type === 'label') {
                      return `<td class="cell-label">${prefillVal || row}</td>`;
                    }
                    if (col.type === 'prefill') {
                      return `<td class="cell-prefill">${this.esc(prefillVal)}</td>`;
                    }
                    if (col.type === 'sign') {
                      return `<td><select class="cell-input cell-sign" data-cell="${cellKey}" ${disabled ? 'disabled' : ''}>
                        <option value="">-</option>
                        <option value="+" ${answerVal === '+' ? 'selected' : ''}>+</option>
                        <option value="-" ${answerVal === '-' ? 'selected' : ''}>−</option>
                      </select></td>`;
                    }
                    return `<td><input class="cell-input" data-cell="${cellKey}" value="${this.esc(answerVal)}" ${disabled ? 'disabled' : ''} placeholder="..."></td>`;
                  }).join('')}</tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      case 'MP': {
        const parts = question.parts || [];
        let parsedAnswer = {};
        try { parsedAnswer = typeof answeredValue === 'string' ? JSON.parse(answeredValue || '{}') : answeredValue; } catch (e) { /* empty */ }

        return `
          <div class="multipart-answer" data-qid="${question.id}">
            ${parts.map((part, pi) => `
              <div class="part-answer-row">
                <span class="part-label">${this.esc(part.partLabel)}</span>
                <div class="part-body">
                  ${part.partText ? `<div class="part-text">${this.esc(part.partText)}</div>` : ''}
                  ${part.answerType === 'sign' ? `
                    <select class="form-select part-input" data-part-key="part_${pi}" ${disabled ? 'disabled' : ''}>
                      <option value="">Select</option>
                      <option value="+" ${parsedAnswer[`part_${pi}`] === '+' ? 'selected' : ''}>+</option>
                      <option value="-" ${parsedAnswer[`part_${pi}`] === '-' ? 'selected' : ''}>−</option>
                    </select>
                  ` : `
                    <input class="form-input part-input" data-part-key="part_${pi}"
                      value="${this.esc(parsedAnswer[`part_${pi}`] || '')}"
                      placeholder="${part.placeholder || 'Your answer...'}"
                      ${disabled ? 'disabled' : ''}>
                  `}
                  <span class="part-points">${part.points} pts</span>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }

      default:
        return `<input class="form-input answer-input" data-qid="${question.id}" value="${this.esc(answeredValue)}" ${disabled ? 'disabled' : ''}>`;
    }
  },

  renderLatexAll() {
    if (window.renderMathInElement) {
      const container = document.getElementById('attempt-questions');
      if (container) {
        window.renderMathInElement(container, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      }
    }
  },

  setupTimer(attempt) {
    if (!attempt.expiresAt) return;
    const expiresAt = new Date(attempt.expiresAt).getTime();
    const timerEl = document.getElementById('attempt-timer');
    if (!timerEl) return;

    const updateTimer = () => {
      const remaining = Math.max(0, expiresAt - Date.now());
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      timerEl.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
      timerEl.classList.toggle('timer-warning', remaining < 300000);
      timerEl.classList.toggle('timer-danger', remaining < 60000);
      if (remaining <= 0) {
        clearInterval(this._timerInterval);
        timerEl.textContent = 'Time\'s up!';
      }
    };
    updateTimer();
    this._timerInterval = setInterval(updateTimer, 1000);
  },

  setupAnswerListeners(questions) {
    // Radio (MC, TF)
    document.querySelectorAll('input[type="radio"][name^="answer-"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const qId = radio.name.replace('answer-', '');
        this._attemptAnswers[qId] = radio.value;
        this.updateNavDot(qId, questions);
      });
    });
    // Checkbox (MR)
    document.querySelectorAll('input[type="checkbox"][name^="answer-"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const qId = cb.name.replace('answer-', '');
        const checked = Array.from(document.querySelectorAll(`input[name="answer-${qId}"]:checked`));
        this._attemptAnswers[qId] = checked.map(c => c.value).join(',');
        this.updateNavDot(qId, questions);
      });
    });
    // Text inputs
    document.querySelectorAll('.answer-input, .answer-textarea').forEach(input => {
      input.addEventListener('input', () => {
        const qId = input.dataset.qid;
        this._attemptAnswers[qId] = input.value;
        this.updateNavDot(qId, questions);
      });
    });
    // Table cells
    document.querySelectorAll('.table-answer').forEach(tableEl => {
      const qId = tableEl.dataset.qid;
      tableEl.querySelectorAll('.cell-input').forEach(cell => {
        cell.addEventListener('input', () => this.collectTableAnswer(qId, questions));
        cell.addEventListener('change', () => this.collectTableAnswer(qId, questions));
      });
    });
    // Multi-part inputs
    document.querySelectorAll('.multipart-answer').forEach(mpEl => {
      const qId = mpEl.dataset.qid;
      mpEl.querySelectorAll('.part-input').forEach(input => {
        const handler = () => this.collectPartAnswer(qId, questions);
        input.addEventListener('input', handler);
        input.addEventListener('change', handler);
      });
    });
  },

  collectTableAnswer(qId, questions) {
    const tableEl = document.querySelector(`.table-answer[data-qid="${qId}"]`);
    if (!tableEl) return;
    const answer = {};
    tableEl.querySelectorAll('.cell-input').forEach(cell => {
      answer[cell.dataset.cell] = cell.value;
    });
    this._attemptAnswers[qId] = JSON.stringify(answer);
    this.updateNavDot(qId, questions);
  },

  collectPartAnswer(qId, questions) {
    const mpEl = document.querySelector(`.multipart-answer[data-qid="${qId}"]`);
    if (!mpEl) return;
    const answer = {};
    mpEl.querySelectorAll('.part-input').forEach(input => {
      answer[input.dataset.partKey] = input.value;
    });
    this._attemptAnswers[qId] = JSON.stringify(answer);
    this.updateNavDot(qId, questions);
  },

  moveOrderItem(questionId, position, direction) {
    const container = document.querySelector(`.ordering-answer[data-qid="${questionId}"]`);
    if (!container) return;
    const items = Array.from(container.querySelectorAll('.order-item'));
    const newPos = position + direction;
    if (newPos < 0 || newPos >= items.length) return;

    const values = items.map(item => item.dataset.value);
    [values[position], values[newPos]] = [values[newPos], values[position]];
    this._attemptAnswers[questionId] = values.join(',');

    // Re-render the ordering
    const questions = []; // Will update nav dot
    this.renderAttempt(this._attemptId);
  },

  updateNavDot(qId, questions) {
    const index = questions.findIndex(q => String(q.id) === String(qId));
    if (index === -1) return;
    const dot = document.querySelector(`.nav-dot[data-index="${index}"]`);
    if (dot) {
      const answered = !!this._attemptAnswers[qId];
      dot.classList.toggle('dot-answered', answered);
    }
  },

  async submitCurrentAttempt(attemptId, questions) {
    if (!confirm('Submit this attempt? You cannot change your answers after submission.')) return;
    clearInterval(this._timerInterval);

    const answers = {};
    questions.forEach(q => {
      if (this._attemptAnswers[q.id] !== undefined) {
        answers[q.id] = this._attemptAnswers[q.id];
      }
    });
    const timeSpentSeconds = Math.round((Date.now() - this._attemptStart) / 1000);

    try {
      await API.submitAttempt(attemptId, answers, timeSpentSeconds);
      this._attemptAnswers = {};
      this.renderAttempt(attemptId);
    } catch (err) {
      this.toast(err.message, 'error');
    }
  }
};
