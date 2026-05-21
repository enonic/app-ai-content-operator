import { cn } from '@enonic/ui';
import { useEffect } from 'react';

import { setPersistedData, setSchema } from '@/store/content';
import { resetContext, setContext } from '@/store/context';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { ContextControls } from './ContextControls';

const meta = {
  title: 'ContentOperator/Dialog/Context/ContextControls',
  component: ContextControls,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ContextControls>;

export default meta;
type Story = StoryObj<typeof meta>;

const longLabel =
  'A really really long display name that definitely should get truncated with an ellipsis at the end';

const wrapperClasses =
  'ai-content-operator text-main bg-surface-primary flex flex-col rounded-lg p-5';

function seedSingleEntry(): () => void {
  setSchema({
    name: 'mockSchema',
    form: {
      formItems: [
        {
          Input: {
            name: 'displayName',
            label: 'Display Name',
            inputType: 'TextLine',
            occurrences: { minimum: 0, maximum: 1 },
          },
        },
      ],
    },
  });
  setPersistedData({
    contentId: 'mock-id',
    contentPath: '/mock',
    fields: [{ name: 'displayName', type: 'String', values: [{ v: '' }] }],
    topic: 'Mock topic',
  });
  setContext('/displayName');
  return resetContext;
}

function seedMultipleEntries(): () => void {
  setSchema({
    name: 'mockSchema',
    form: {
      formItems: [
        {
          FormItemSet: {
            name: 'article',
            label: 'Article',
            occurrences: { minimum: 0, maximum: 1 },
            items: [
              {
                FormItemSet: {
                  name: 'intro',
                  label: 'Intro',
                  occurrences: { minimum: 0, maximum: 1 },
                  items: [
                    {
                      Input: {
                        name: 'title',
                        label: 'Title',
                        inputType: 'TextLine',
                        occurrences: { minimum: 0, maximum: 1 },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
  setPersistedData({
    contentId: 'mock-id',
    contentPath: '/mock',
    fields: [
      {
        name: 'article',
        type: 'PropertySet',
        values: [
          {
            set: [
              {
                name: 'intro',
                type: 'PropertySet',
                values: [
                  {
                    set: [{ name: 'title', type: 'String', values: [{ v: '' }] }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    topic: 'Mock topic',
  });
  setContext('/article/intro/title');
  return resetContext;
}

function seedLongLabels(): () => void {
  setSchema({
    name: 'mockSchema',
    form: {
      formItems: [
        {
          FormItemSet: {
            name: 'outerSection',
            label: longLabel,
            occurrences: { minimum: 0, maximum: 1 },
            items: [
              {
                FormItemSet: {
                  name: 'innerSection',
                  label: longLabel,
                  occurrences: { minimum: 0, maximum: 1 },
                  items: [
                    {
                      Input: {
                        name: 'title',
                        label: 'Title',
                        inputType: 'TextLine',
                        occurrences: { minimum: 0, maximum: 1 },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
  setPersistedData({
    contentId: 'mock-id',
    contentPath: '/mock',
    fields: [
      {
        name: 'outerSection',
        type: 'PropertySet',
        values: [
          {
            set: [
              {
                name: 'innerSection',
                type: 'PropertySet',
                values: [
                  {
                    set: [{ name: 'title', type: 'String', values: [{ v: '' }] }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    topic: 'Mock topic',
  });
  setContext('/outerSection/innerSection/title');
  return resetContext;
}

const SingleEntryStory = (): React.ReactNode => {
  useEffect(() => seedSingleEntry(), []);
  return (
    <div className={cn(wrapperClasses, 'w-100')}>
      <ContextControls />
    </div>
  );
};

const MultipleEntriesStory = (): React.ReactNode => {
  useEffect(() => seedMultipleEntries(), []);
  return (
    <div className={cn(wrapperClasses, 'w-100')}>
      <ContextControls />
    </div>
  );
};

const LongLabelsStory = (): React.ReactNode => {
  useEffect(() => seedLongLabels(), []);
  return (
    <div className={cn(wrapperClasses, 'w-100')}>
      <ContextControls />
    </div>
  );
};

export const SingleEntry: Story = {
  name: 'Examples / Single Entry',
  render: () => <SingleEntryStory />,
};

export const MultipleEntries: Story = {
  name: 'Examples / Multiple Entries',
  render: () => <MultipleEntriesStory />,
};

export const LongLabelsTruncated: Story = {
  name: 'Features / Long Labels Truncated',
  render: () => <LongLabelsStory />,
};
