import React from 'react';
import { createRoot } from 'react-dom/client';

import { $config, setWsServiceUrl } from '@/store/config';

import AssistantDialog from './components/dialog/assistant-dialog/AssistantDialog';
import './i18n/i18n';
import './index.css';
import LaunchButton from './components/launch-button/LaunchButton';

type SetupConfig = {
  wsServiceUrl: string;
};

export function render(buttonContainer: HTMLElement, dialogContainer: HTMLElement): void {
  if ($config.get().wsServiceUrl === '') {
    console.warn('[Enonic AI] Content Operator was rendered before configured.');
  }

  buttonContainer.classList.add('ai-content-operator');
  const buttonRoot = createRoot(buttonContainer);
  buttonRoot.render(
    <React.StrictMode>
      <LaunchButton />
    </React.StrictMode>,
  );

  dialogContainer.classList.add('ai-content-operator');
  const dialogRoot = createRoot(dialogContainer);
  dialogRoot.render(
    <React.StrictMode>
      <AssistantDialog />
    </React.StrictMode>,
  );
}

export function setup({ wsServiceUrl }: SetupConfig): void {
  setWsServiceUrl(wsServiceUrl);
}
