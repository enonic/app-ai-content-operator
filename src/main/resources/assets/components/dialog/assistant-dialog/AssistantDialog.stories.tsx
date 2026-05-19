import { cn } from '@enonic/ui';

import { MessageRole } from '@/store/content';

import type { ModelChatMessage, UserChatMessage } from '@/store/content';
import type { Meta, StoryObj } from '@storybook/preact-vite';

import AssistantMessage from '../chat/assistant-message/AssistantMessage';
import UserMessage from '../chat/user-message/UserMessage';
import AssistantHeader from '../header/assistant-header/AssistantHeader';
import AssistantInput from '../input/assistant-input/AssistantInput';
import './AssistantDialog.css';

const userMessage: UserChatMessage = {
  id: 'user-1',
  nextIds: ['model-1'],
  active: true,
  role: MessageRole.USER,
  content: {
    node: 'Rewrite the introduction so it sounds more confident and direct, and keep it under three sentences.',
    prompt:
      'Rewrite the introduction so it sounds more confident and direct, and keep it under three sentences.',
    contextData: {
      name: 'article/intro',
      title: 'Article › Introduction',
      displayName: 'Introduction',
    },
  },
};

const assistantMessage: ModelChatMessage = {
  id: 'model-1',
  prevId: 'user-1',
  nextIds: [],
  active: true,
  role: MessageRole.MODEL,
  content: {
    analysisResult: {
      __common__: { task: 'Rewrite the introduction.', count: 1, language: 'en' },
    },
    selectedIndices: {},
    generationResult: {
      __common__:
        '<p>Renewable energy is no longer a future ambition — it is the engine of the next decade.</p><p>From rooftop solar to grid-scale wind, the technology is ready, the economics are working, and the only question left is how fast we choose to move.</p>',
    },
  },
};

const meta = {
  title: 'ContentOperator/Dialog/AssistantDialog',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="ai-content-operator text-main flex h-svh w-svw items-center justify-center p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullDialog: Story = {
  name: 'Examples / Full Dialog',
  render: () => (
    <div
      className={cn(
        'AssistantDialog pointer-events-auto',
        'flex h-full max-h-160 w-full max-w-160 flex-col overflow-hidden',
        'leading-initial rounded-lg border bg-surface-neutral px-5 pb-10 text-base shadow-xl',
      )}
    >
      <AssistantHeader />
      <div className="flex min-h-0 w-full flex-1 flex-col gap-2 pt-7">
        <div className="relative flex-1 overflow-y-auto scroll-smooth">
          <div className="flex h-full w-full grow flex-col justify-end gap-6 px-3 pt-3">
            <UserMessage message={userMessage} />
            <AssistantMessage message={assistantMessage} last={true} />
          </div>
        </div>
        <AssistantInput />
      </div>
    </div>
  ),
};
