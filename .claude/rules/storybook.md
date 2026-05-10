---
paths:
  - '**/*.stories.tsx'
  - '.storybook/**/*.{ts,tsx}'
---

# Storybook Rules

## Hierarchical story names

Use `/` to group stories under a standard taxonomy. The `name` field on each story controls grouping in the sidebar:

```tsx
export const Basic: Story = {name: 'Examples / Basic', render: () => <Component />};
export const Disabled: Story = {name: 'States / Disabled', render: () => <Component disabled />};
export const AlignEnd: Story = {name: 'Features / Align End', render: () => <Component align='end' />};
export const FocusNav: Story = {name: 'Behavior / Focus Nav', render: () => <Component />};
```

Flat names (`Default`, `Disabled`, `Variants`) without a group prefix are not allowed.

## Standard groups, in this order

1. **Examples** — basic usage patterns
2. **States** — visual states (disabled, read-only, loading)
3. **Features** — specific capabilities and configurations
4. **Behavior** — interaction patterns and accessibility
5. **Specialized** — component-specific variants

## Interactive playground

For components with 2+ variant props with multiple options, add an `Interactive` story under `Features`. Skip for components with only a single boolean prop.

## State

Use local `useState` for interactive stories. Never subscribe stories to nanostores — stories must be hermetic.

## File template

```tsx
import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Component} from './component';

type Story = StoryObj<typeof Component>;

export default {
  title: 'Components/Component',
  component: Component,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
} satisfies Meta<typeof Component>;

export const Basic: Story = {name: 'Examples / Basic', render: () => <Component />};
export const Interactive: Story = {
  name: 'Features / Interactive',
  render: () => {
    /* useState here */
  },
};
export const FocusNav: Story = {name: 'Behavior / Focus Nav', render: () => <Component />};
```

## Story wrapper

When the story benefits from explanation (keyboard interaction, multi-variant comparison), wrap with the standard frame:

```tsx
render: () => (
  <div className='flex flex-col gap-y-3 p-4 items-center'>
    <div className='max-w-120 text-sm text-subtle'>
      Brief description, especially useful for keyboard/interaction testing.
    </div>
    <Component />
  </div>
);
```

For self-contained stories, `render: () => <Component />` is fine.
