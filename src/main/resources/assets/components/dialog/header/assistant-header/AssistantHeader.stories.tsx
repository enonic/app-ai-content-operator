import { useEffect } from 'react';

import { setDialogDragging } from '@/store/dialog';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { AssistantHeader } from './AssistantHeader';

const meta = {
  title: 'ContentOperator/Dialog/Header/AssistantHeader',
  component: AssistantHeader,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="ai-content-operator text-main bg-surface-neutral w-100 overflow-hidden rounded-lg border px-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AssistantHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

function DraggingHeader(): React.ReactNode {
  useEffect(() => {
    setDialogDragging(true);
    return () => setDialogDragging(false);
  }, []);
  return <AssistantHeader />;
}

export const Default: Story = { name: 'Examples / Default' };

export const Dragging: Story = {
  name: 'States / Dragging',
  render: () => <DraggingHeader />,
};
