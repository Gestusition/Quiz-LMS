import { API } from '../api.js';
import { value } from '../components/form.js';

export const AttemptPage = {
  async renderAttempt(attemptId) {
    this.setApp(this.loading('Loading attempt'));
    try {
      const attempt = await API.getAttempt(attemptId);
      if (attempt.status === 'submitted') return this.renderAttemptResult(attempt);

      const timerBlock = attempt.expiresAt
        ? `<span class="status-chip planned" id="attempt-timer">Time remaining: --:--</span>`
        : '<span class="status-chip active">No time limit</span>';

      this.setApp(`
        <header class="page-header">
          <div><h1>${this.esc(attempt.quizTitle)}</h1><p>Attempt ${attempt.attemptNumber} - ${this.esc(attempt.lifecycleStatus || attempt.status)}</p></div>
          <div class="header-actions">${timerBlock}
          <button class="btn btn-primary" id="btn-submit-attempt">Submit</button>
          </div>
        </header>
        <form id="attempt-form" class="attempt-stack">
          ${attempt.questions.map((question, index) => this.attemptQuestion(question, index)).join('')}
        </form>
      `);

      if (attempt.expiresAt) this.startAttemptTimer(attempt);

      document.getElementById('btn-submit-attempt').addEventListener('click', async () => {
        const answers = this.collectAttemptAnswers(attempt.questions);
        try {
          const submitted = await API.submitAttempt(attempt.id, answers);
          this.renderAttemptResult(submitted);
          this.toast('Quiz submitted.', 'success');
        } catch (err) {
          this.toast(err.message, 'error');
        }
      });
    } catch (err) {
      this.renderError(err);
    }
  },

  renderAttemptResult(attempt) {
    const policyMessage = attempt.hiddenByPolicy ? `<p class="muted">${this.esc(attempt.policyMessage || 'Result visibility is restricted by policy.')}</p>` : '';
    const gradeMessage = attempt.gradeStatus === 'pending_review'
      ? `<p class="muted">${this.esc(attempt.gradeMessage || 'Your numeric score has been saved, but letter grade is pending instructor/admin review.')}</p>`
      : '';
    const score = attempt.score === null || attempt.score === undefined ? '-' : attempt.score;
    const maxScore = attempt.maxScore === null || attempt.maxScore === undefined ? '-' : attempt.maxScore;
    const percentage = attempt.percentage === null || attempt.percentage === undefined ? '-' : `${attempt.percentage}%`;

    this.setApp(`
      <header class="page-header">
        <div><h1>${this.esc(attempt.quizTitle)}</h1><p>Submitted result</p></div>
        <a class="btn btn-primary" href="#/quizzes">Back to quizzes</a>
      </header>
      <section class="result-panel">
        <div class="score-ring">${percentage}</div>
        <div>
          <h2>${score} / ${maxScore} points</h2>
          <p>Attempt ${attempt.attemptNumber} - ${this.esc(attempt.lifecycleStatus || attempt.status)} - submitted at ${this.formatDate(attempt.submittedAt)}</p>
          ${attempt.letterGrade ? `<p>Letter grade: <strong>${this.esc(attempt.letterGrade)}</strong></p>` : ''}
          ${gradeMessage}
          ${policyMessage}
        </div>
      </section>
      <section class="panel">
        <div class="list">
          ${(attempt.answers || []).map(answer => `
            <div class="list-row">
              <div><strong>Question #${answer.questionId}</strong><small>Your answer: ${this.esc(answer.answer || '-')}</small></div>
              <span class="status ${answer.isCorrect ? 'published' : 'closed'}">${answer.isCorrect ? 'Correct' : 'Wrong'}</span>
            </div>
          `).join('') || this.emptyLine('Detailed answers are hidden.')}
        </div>
      </section>
    `);
  },

  startAttemptTimer(attempt) {
    const target = document.getElementById('attempt-timer');
    if (!target) return;
    const expiresAt = new Date(attempt.expiresAt).getTime();
    if (!Number.isFinite(expiresAt)) return;

    let interval = null;
    const tick = async () => {
      const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
      const seconds = String(remaining % 60).padStart(2, '0');
      target.textContent = `Time remaining: ${minutes}:${seconds}`;
      if (remaining <= 0) {
        clearInterval(interval);
        target.textContent = 'Time expired';
        const answers = this.collectAttemptAnswers(attempt.questions);
        try {
          const submitted = await API.submitAttempt(attempt.id, answers);
          this.renderAttemptResult(submitted);
          this.toast('Time expired. Attempt submitted.', 'error');
        } catch (err) {
          this.toast(err.message, 'error');
        }
      }
    };

    tick();
    interval = setInterval(tick, 1000);
  },

  collectAttemptAnswers(questions) {
    return questions.map(question => {
      let answer = '';
      const fieldName = `answer-${question.id}`;
      if (question.type === 'MC' || question.type === 'TF') {
        const selected = document.querySelector(`input[name="${fieldName}"]:checked`);
        answer = selected ? selected.value : '';
      } else {
        answer = value(fieldName);
      }
      return { questionId: question.id, answer };
    });
  },

  attemptQuestion(question, index) {
    const answerName = `answer-${question.id}`;
    let answerHtml = '';
    if (question.type === 'MC') {
      answerHtml = question.options.map((option, optionIndex) => `
        <label class="answer-option">
          <input type="radio" name="${answerName}" value="${optionIndex}">
          <span>${this.esc(option)}</span>
        </label>
      `).join('');
    } else if (question.type === 'TF') {
      answerHtml = ['true', 'false'].map(option => `
        <label class="answer-option">
          <input type="radio" name="${answerName}" value="${option}">
          <span>${option}</span>
        </label>
      `).join('');
    } else {
      answerHtml = `<input class="form-input" id="${answerName}" placeholder="Answer">`;
    }

    return `
      <article class="attempt-question">
        <div class="card-topline"><span>Question ${index + 1}</span><span>${question.points} point${Number(question.points) === 1 ? '' : 's'}</span></div>
        <h2>${this.esc(question.text)}</h2>
        <div class="answer-list">${answerHtml}</div>
      </article>
    `;
  }
};
