import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { $config, setWsServiceUrl } from '@/store/config';

import AssistantDialog from './components/dialog/assistant-dialog/AssistantDialog';
import './i18n/i18n';
import './index.css';

type SetupConfig = {
  wsServiceUrl: string;
};

export function render(container: HTMLElement): void {
  if ($config.get().wsServiceUrl === '') {
    console.warn('[Enonic AI] Content Operator was rendered before configured.');
  }

  container.classList.add('ai-content-operator');

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <AssistantDialog container={container} />
    </StrictMode>,
  );
}

export function setup({ wsServiceUrl }: SetupConfig): void {
  setWsServiceUrl(wsServiceUrl);
}
