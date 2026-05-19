import { MessageRole } from '@/store/content';

import type { ModelChatMessage } from '@/store/content';
import type { Meta, StoryObj } from '@storybook/preact-vite';

import { AssistantMessage } from './AssistantMessage';

const meta = {
  title: 'ContentOperator/Dialog/Chat/AssistantMessage',
  component: AssistantMessage,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="ai-content-operator text-main bg-surface-neutral w-100 rounded-lg p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AssistantMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

const generatingMessage: ModelChatMessage = {
  id: 'model-1',
  nextIds: [],
  active: true,
  role: MessageRole.MODEL,
  content: {
    analysisResult: {},
    selectedIndices: {},
  },
};

export const Generating: Story = {
  name: 'States / Generating',
  args: { message: generatingMessage, last: true },
};
