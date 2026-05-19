import type { Meta, StoryObj } from '@storybook/preact-vite';

import LoadingMessage from './LoadingMessage';

const meta = {
  title: 'ContentOperator/Dialog/Chat/LoadingMessage',
  component: LoadingMessage,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="ai-content-operator text-main bg-surface-neutral w-100 rounded-lg p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoadingMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: 'Examples / Default' };
