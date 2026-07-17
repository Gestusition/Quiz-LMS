import { createRoot, Root } from 'react-dom/client';
import { AiAssistantApp } from './App';
import { AiAssistantUser, LegacyAiApi } from './types';
import './styles.css';

export interface MountAiAssistantOptions {
  api: LegacyAiApi;
  user: AiAssistantUser;
  onToast?: (message: string, type?: 'info' | 'success' | 'error') => void;
  onNavigate?: (hash: string) => void;
  onFallback?: () => void;
}

export interface MountedAiAssistant {
  unmount(): void;
}

export function mountAiAssistant(
  element: HTMLElement,
  options: MountAiAssistantOptions
): MountedAiAssistant {
  const host = element.closest<HTMLElement>('#app');
  host?.classList.add('ai-assistant-page-host');
  element.classList.add('ai-assistant-root');
  let root: Root | null = createRoot(element);
  root.render(
    <AiAssistantApp
      api={options.api}
      user={options.user}
      onToast={options.onToast}
      onNavigate={options.onNavigate}
      onFallback={options.onFallback}
    />
  );

  return {
    unmount() {
      root?.unmount();
      root = null;
      host?.classList.remove('ai-assistant-page-host');
      element.classList.remove('ai-assistant-root');
    }
  };
}

export { AiAssistantApp };
export type { LegacyAiApi } from './types';
