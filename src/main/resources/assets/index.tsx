import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { injectHostStyles } from '@/shadow/injectHostStyles';
import { injectStyles } from '@/shadow/injectStyles';
import { ShadowHostContext } from '@/shadow/ShadowHostContext';
import { registerThemeHost } from '@/shadow/themeSync';
import { setContext, resetContext } from '@/store/context';
import { setDialogHidden } from '@/store/dialog';
import {
  applyConfig,
  applyContent,
  applyLanguage,
  applySchema,
  clearPluginContext,
  setPluginContext,
} from '@/store/host';

import type { AiPlugin, AiPluginContext, AiPluginInstance } from '@shared/ai-protocol';

import { AssistantDialog } from './components/dialog/assistant-dialog/AssistantDialog';
import './i18n/i18n';

const VERSION = '1.1.0';

function mount(container: HTMLElement, context: AiPluginContext): AiPluginInstance {
  setPluginContext(context);

  applyConfig(context.config);
  if (context.initial.content != null) applyContent(context.initial.content);
  if (context.initial.schema != null) applySchema(context.initial.schema);
  if (context.initial.language != null) applyLanguage(context.initial.language);

  container.classList.add('ai-content-operator');

  const shadow = container.shadowRoot ?? container.attachShadow({ mode: 'open' });
  injectStyles(shadow);
  injectHostStyles();
  registerThemeHost(container);

  const mountEl = document.createElement('div');
  mountEl.classList.add('ai-content-operator');
  shadow.appendChild(mountEl);

  const root = createRoot(mountEl);
  root.render(
    <StrictMode>
      <ShadowHostContext.Provider value={mountEl}>
        <AssistantDialog />
      </ShadowHostContext.Provider>
    </StrictMode>,
  );

  const offHandlers = [
    context.api.on('content:change', applyContent),
    context.api.on('schema:change', applySchema),
    context.api.on('language:change', applyLanguage),
    context.api.on('config:change', applyConfig),
    context.api.on('dialog:open', () => setDialogHidden(false)),
    context.api.on('dialog:close', () => setDialogHidden(true)),
    context.api.on('context:set', (path) => {
      if (path != null) {
        setContext(path);
      } else {
        resetContext();
      }
    }),
  ];

  return {
    dispose: () => {
      offHandlers.forEach((off) => off());
      root.unmount();
      mountEl.remove();
      clearPluginContext();
    },
  };
}

const plugin: AiPlugin = {
  id: 'ai.contentOperator',
  version: VERSION,
  commands: ['dialog:open', 'dialog:close', 'context:set'],
  mount,
};

window.Enonic?.AI?.register(plugin);
