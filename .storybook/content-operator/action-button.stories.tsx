import type {Meta, StoryObj} from '@storybook/preact-vite';

import ActionButton from '../../src/main/resources/assets/ui/primitives/ActionButton/ActionButton';

const meta = {
    title: 'ContentOperator/ActionButton',
    component: ActionButton,
    parameters: {layout: 'centered'},
    args: {
        name: 'Apply',
        clickHandler: () => undefined,
    },
} satisfies Meta<typeof ActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
    args: {
        icon: 'check',
    },
};

export const IconOnly: Story = {
    args: {
        mode: 'icon-only',
        icon: 'check',
        title: 'Apply suggestion',
    },
};

export const Sizes: Story = {
    render: (args) => (
        <div className='flex items-center gap-2'>
            <ActionButton {...args} size='xs' />
            <ActionButton {...args} size='sm' />
            <ActionButton {...args} size='md' />
            <ActionButton {...args} size='lg' />
            <ActionButton {...args} size='xl' />
        </div>
    ),
    args: {icon: 'check'},
};

export const Disabled: Story = {
    args: {
        icon: 'check',
        disabled: true,
    },
};
