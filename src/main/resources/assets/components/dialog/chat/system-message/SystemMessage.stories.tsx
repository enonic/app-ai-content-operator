import { MessageRole } from '@/store/content';

import type { SystemChatMessage } from '@/store/content';
import type { Meta, StoryObj } from '@storybook/preact-vite';

import { SystemMessage } from './SystemMessage';

const meta = {
  title: 'ContentOperator/Dialog/Chat/SystemMessage',
  component: SystemMessage,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="ai-content-operator text-main bg-surface-neutral w-100 rounded-lg p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SystemMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

const errorMessage: SystemChatMessage = {
  id: 'system-1',
  nextIds: [],
  active: true,
  role: MessageRole.SYSTEM,
  content: {
    type: 'error',
    key: 'error.network',
    node: 'Something went wrong while contacting the model. Please try again in a moment.',
  },
};

const contextMessage: SystemChatMessage = {
  id: 'system-1',
  nextIds: [],
  active: true,
  role: MessageRole.SYSTEM,
  content: {
    type: 'context',
    key: 'context.switched',
    node: 'Context has been updated to a new content item.',
  },
};

const stopMessage: SystemChatMessage = {
  id: 'system-1',
  nextIds: [],
  active: true,
  role: MessageRole.SYSTEM,
  content: {
    type: 'stop',
    key: 'stop.generation',
    node: 'Generation was stopped.',
  },
};

export const Error: Story = {
  name: 'States / Error',
  args: { message: errorMessage, last: true },
};

export const Context: Story = {
  name: 'States / Context',
  args: { message: contextMessage, last: true },
};

export const Stop: Story = {
  name: 'States / Stop',
  args: { message: stopMessage, last: true },
};
