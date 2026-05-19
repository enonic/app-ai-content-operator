import { useEffect } from 'react';

import { MessageRole, setPersistedData, setSchema } from '@/store/content';
import { resetContext, setContext } from '@/store/context';

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

const longLabel =
  'A really really long display name that definitely should get truncated with an ellipsis at the end';

const longLabelMessage: ModelChatMessage = {
  id: 'model-long-label',
  nextIds: [],
  active: true,
  role: MessageRole.MODEL,
  content: {
    analysisResult: {
      '/displayName': { task: 'Suggest a display name.', count: 1, language: 'en' },
      '/veryLongLabel': { task: 'Generate content.', count: 1, language: 'en' },
      '/description': { task: 'Suggest a description.', count: 1, language: 'en' },
    },
    generationResult: {
      '/displayName': 'Chronicles of Heroes: The Awakening',
      '/veryLongLabel':
        'This is a moderate-length value to demonstrate how the body of the element item flows beneath a truncated header.',
      '/description':
        'Dive into a world of justice and courage, where every story reveals the true power of the heroes who protect our destiny.',
    },
    selectedIndices: {},
  },
};

function seedLongLabelStores(): () => void {
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
        {
          Input: {
            name: 'veryLongLabel',
            label: longLabel,
            inputType: 'TextLine',
            occurrences: { minimum: 0, maximum: 1 },
          },
        },
        {
          Input: {
            name: 'description',
            label: 'Description',
            inputType: 'TextArea',
            occurrences: { minimum: 0, maximum: 1 },
          },
        },
      ],
    },
  });
  setPersistedData({
    contentId: 'mock-id',
    contentPath: '/mock',
    fields: [
      { name: 'displayName', type: 'String', values: [{ v: '' }] },
      { name: 'veryLongLabel', type: 'String', values: [{ v: '' }] },
      { name: 'description', type: 'String', values: [{ v: '' }] },
    ],
    topic: 'Mock topic',
  });
  setContext('/');

  return resetContext;
}

const LongLabelStory = (): React.ReactNode => {
  useEffect(() => seedLongLabelStores(), []);
  return <AssistantMessage message={longLabelMessage} last={true} />;
};

export const LongLabel: Story = {
  name: 'Features / Long Label Truncation',
  args: { message: longLabelMessage, last: true },
  render: () => <LongLabelStory />,
};
