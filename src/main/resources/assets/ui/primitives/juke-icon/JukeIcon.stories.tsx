import type { Meta, StoryObj } from '@storybook/preact-vite';

import { JukeIcon } from './JukeIcon';

const meta = {
  title: 'ContentOperator/Primitives/JukeIcon',
  component: JukeIcon,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof JukeIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Examples / Default',
  render: () => <JukeIcon className="size-16" />,
};
