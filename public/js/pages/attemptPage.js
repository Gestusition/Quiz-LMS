import { API } from '../api.js';
import { value } from '../components/form.js';

export const AttemptPage = {
  async renderAttempt(attemptId) {
    this.setApp(this.loading('Loading attempt'));
    try {
      const attempt = await API.getAttempt(attemptId);
      if (attempt.status === 'submitted') return this.renderAttemptResult(attempt);

      this.setApp(`
        <header class="page-header">
          <div><h1>${this.esc(attempt.quizTitle)}</h1><p>Attempt ${attempt.attemptNumber}</p></div>
          <button class="btn btn-primary" id="btn-submit-attempt">Submit</button>
        </header>
        <form id="attempt-form" class="attempt-stack">
          ${attempt.questions.map((question, index) => this.attemptQuestion(question, index)).join('')}
        </form>
      `);

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
    this.setApp(`
      <header class="page-header">
        <div><h1>${this.esc(attempt.quizTitle)}</h1><p>Submitted result</p></div>
        <a class="btn btn-primary" href="#/quizzes">Back to quizzes</a>
      </header>
      <section class="result-panel">
        <div class="score-ring">${attempt.percentage}%</div>
        <div>
          <h2>${attempt.score} / ${attempt.maxScore} points</h2>
          <p>Attempt ${attempt.attemptNumber} submitted at ${this.formatDate(attempt.submittedAt)}</p>
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
