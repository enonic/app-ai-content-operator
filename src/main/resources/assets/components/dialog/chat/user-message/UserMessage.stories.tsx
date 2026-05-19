import { MessageRole } from '@/store/content';

import type { UserChatMessage } from '@/store/content';
import type { Meta, StoryObj } from '@storybook/preact-vite';

import UserMessage from './UserMessage';

const meta = {
  title: 'ContentOperator/Dialog/Chat/UserMessage',
  component: UserMessage,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="ai-content-operator text-main bg-surface-neutral w-100 rounded-lg p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseMessage: UserChatMessage = {
  id: 'user-1',
  nextIds: [],
  active: true,
  role: MessageRole.USER,
  content: {
    node: 'Rewrite the introduction to be more concise and engaging.',
    prompt: 'Rewrite the introduction to be more concise and engaging.',
  },
};

export const Default: Story = {
  name: 'Examples / Default',
  args: { message: baseMessage },
};

export const SingleLine: Story = {
  name: 'Examples / Single Line',
  args: {
    message: {
      ...baseMessage,
      content: {
        node: 'Make it shorter.',
        prompt: 'Make it shorter.',
      },
    },
  },
};

export const WithContext: Story = {
  name: 'Examples / With Context',
  args: {
    message: {
      ...baseMessage,
      content: {
        ...baseMessage.content,
        contextData: {
          name: 'article/intro',
          title: 'Introduction',
          displayName: 'Introduction',
        },
      },
    },
  },
};
