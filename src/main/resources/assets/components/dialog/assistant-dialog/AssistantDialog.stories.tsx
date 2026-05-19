import { useEffect, useState } from 'react';

import { ShadowHostContext } from '@/shadow/ShadowHostContext';
import {
  addModelMessage,
  addSystemMessage,
  addUserMessage,
  clearChat,
  updateModelMessage,
} from '@/store/chat';
import { setPersistedData, setSchema } from '@/store/content';
import { resetContext, setContext } from '@/store/context';
import { $dialog } from '@/store/dialog';
import { clearPluginContext, setPluginContext } from '@/store/host';
import { $initialized, $licenseState } from '@/store/license';
import { $websocket } from '@/store/websocket';

import type { AiPluginApi, AiPluginContext } from '@shared/ai-protocol';
import type { Meta, StoryObj } from '@storybook/preact-vite';

import { GreetingText } from '../chat/greeting-text/GreetingText';
import { AssistantDialog } from './AssistantDialog';

const noopApi: AiPluginApi = {
  on: () => () => undefined,
  applyValue: () => true,
  setFieldState: () => undefined,
  animateField: () => undefined,
  setContext: () => undefined,
  setDialogState: () => undefined,
  requestSave: () => undefined,
  notify: () => undefined,
};

const mockPluginContext: AiPluginContext = {
  config: { wsServiceUrl: 'ws://mock', instructions: '' },
  initial: { content: null, schema: null, language: null },
  api: noopApi,
};

function seedMockStores(): () => void {
  setPluginContext(mockPluginContext);

  setSchema({
    name: 'mockSchema',
    form: {
      formItems: [
        {
          Input: {
            name: 'intro',
            label: 'Introduction',
            inputType: 'TextArea',
            occurrences: { minimum: 0, maximum: 1 },
          },
        },
        {
          Input: {
            name: 'displayName',
            label: 'Display Name',
            inputType: 'TextLine',
            occurrences: { minimum: 0, maximum: 1 },
          },
        },
        {
          Input: {
            name: 'description',
            label: 'Description',
            inputType: 'TextArea',
            occurrences: { minimum: 0, maximum: 1 },
          },
        },
      ],
    },
  });
  setPersistedData({
    contentId: 'mock-id',
    contentPath: '/mock',
    fields: [
      { name: 'intro', type: 'String', values: [{ v: 'Sample introduction.' }] },
      { name: 'displayName', type: 'String', values: [{ v: '' }] },
      { name: 'description', type: 'String', values: [{ v: '' }] },
    ],
    topic: 'Renewable energy',
  });
  setContext('/intro');

  $licenseState.set('OK');
  $initialized.set(true);
  $websocket.set({
    lifecycle: 'mounted',
    state: 'connected',
    connection: {
      readyState: WebSocket.OPEN,
      send: () => undefined,
      close: () => undefined,
    } as unknown as WebSocket,
    online: true,
    reconnectAttempts: 0,
  });

  clearChat();
  addSystemMessage({ type: 'context', key: 'greeting', node: <GreetingText /> });
  const userMsg = addUserMessage({
    node: 'Rewrite the introduction so it sounds more confident and direct, and keep it under three sentences.',
    prompt:
      'Rewrite the introduction so it sounds more confident and direct, and keep it under three sentences.',
    contextData: {
      name: '/intro',
      title: 'Introduction',
      displayName: 'Introduction',
    },
  });
  const modelMsg =
    userMsg &&
    addModelMessage(
      { __common__: { task: 'Rewrite the introduction.', count: 1, language: 'en' } },
      userMsg.id,
    );
  if (modelMsg) {
    updateModelMessage(modelMsg.id, {
      __common__:
        '<p>Renewable energy is no longer a future ambition — it is the engine of the next decade.</p><p>From rooftop solar to grid-scale wind, the technology is ready, the economics are working, and the only question left is how fast we choose to move.</p>',
    });
  }

  const followUpUserMsg =
    modelMsg &&
    addUserMessage({
      node: 'Now suggest a display name and description for a heroic-fantasy story.',
      prompt: 'Now suggest a display name and description for a heroic-fantasy story.',
      contextData: {
        name: '/',
        title: 'All',
        displayName: 'All',
      },
    });
  const followUpModelMsg =
    followUpUserMsg &&
    addModelMessage(
      {
        '/displayName': { task: 'Suggest a display name.', count: 1, language: 'en' },
        '/description': { task: 'Suggest a description.', count: 1, language: 'en' },
      },
      followUpUserMsg.id,
    );
  if (followUpModelMsg) {
    updateModelMessage(followUpModelMsg.id, {
      '/displayName': 'Chronicles of Heroes: The Awakening',
      '/description':
        'Dive into a world of justice and courage, where every story reveals the true power of the heroes who protect our destiny.',
    });
  }

  $dialog.setKey('hidden', false);

  return () => {
    $dialog.setKey('hidden', true);
    resetContext();
    clearChat();
    $websocket.set({
      lifecycle: 'unmounted',
      state: 'disconnected',
      connection: null,
      online: navigator.onLine,
      reconnectAttempts: 0,
    });
    clearPluginContext();
  };
}

function MockedDialog(): React.ReactNode {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => seedMockStores(), []);

  return (
    <div ref={setContainer} className="ai-content-operator text-main relative h-svh w-svw">
      <div
        aria-hidden
        className="text-subtle/60 pointer-events-none absolute inset-0 flex items-center justify-center p-8 text-center text-4xl font-semibold text-balance select-none"
      >
        Drag the dialog around to preview the glassy backdrop against this text.
      </div>
      <ShadowHostContext.Provider value={container}>
        <AssistantDialog />
      </ShadowHostContext.Provider>
    </div>
  );
}

const meta = {
  title: 'ContentOperator/Dialog/AssistantDialog',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullDialog: Story = {
  name: 'Examples / Full Dialog',
  render: () => <MockedDialog />,
};
