import { API } from '../api.js';
import { AiQuizPage } from './aiQuizPage.js';

const AI_BUNDLE_URL = '/ai-assistant/ai-assistant.js';
const AI_STYLES_URL = '/ai-assistant/ai-assistant.css';

function ensureAiStylesheet() {
  if (document.querySelector(`link[href="${AI_STYLES_URL}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = AI_STYLES_URL;
  link.dataset.aiAssistantBundle = 'true';
  document.head.appendChild(link);
}

export const AiQuizReactPage = {
  async renderAiQuizAssistantReact() {
    if (!this.canManageLearning()) return this.renderForbidden();

    this.setApp(`
      <div id="ai-assistant-react-root">
        <div class="loading-state" role="status" aria-live="polite">
          Loading conversational AI Quiz Assistant…
        </div>
      </div>
    `);

    const mountElement = document.getElementById('ai-assistant-react-root');
    if (!mountElement) return this.renderAiQuizAssistantLegacy();

    let cancelled = false;
    let mounted = null;
    this.registerPageCleanup(() => {
      cancelled = true;
      mounted?.unmount?.();
      mounted = null;
    });

    try {
      ensureAiStylesheet();
      const module = await import(AI_BUNDLE_URL);
      if (cancelled || !mountElement.isConnected) return;
      if (typeof module.mountAiAssistant !== 'function') {
        throw new Error('AI Assistant bundle is missing its mount function.');
      }
      mounted = module.mountAiAssistant(mountElement, {
        api: API,
        user: this.user,
        onToast: (message, type = 'info') => this.toast(message, type),
        onNavigate: hash => {
          location.hash = hash;
        },
        onFallback: () => this.renderAiQuizAssistantLegacy()
      });
    } catch (error) {
      if (cancelled) return;
      const reason = error instanceof Error
        ? `${error.name}: ${error.message}`.slice(0, 300)
        : 'Unknown bundle error.';
      console.warn('Conversational AI Assistant bundle unavailable; opening the legacy assistant.', reason);
      this.cleanupActivePage();
      this.toast('The conversational workspace is unavailable. The existing AI Assistant was opened instead.', 'error');
      return AiQuizPage.renderAiQuizAssistant.call(this);
    }
  },

  renderAiQuizAssistantLegacy() {
    this.cleanupActivePage();
    return AiQuizPage.renderAiQuizAssistant.call(this);
  }
};
