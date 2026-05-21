import { useEffect } from 'react';

import { setPersistedData, setSchema } from '@/store/content';

import type { ModelChatMessageContent } from '@/store/content';
import type { Meta, StoryObj } from '@storybook/preact-vite';

import { AssistantMessagePlaceholder } from './AssistantMessagePlaceholder';

const meta = {
  title: 'ContentOperator/Dialog/Chat/AssistantMessagePlaceholder',
  component: AssistantMessagePlaceholder,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="ai-content-operator text-main bg-surface-neutral w-100 rounded-lg p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AssistantMessagePlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

type PlaceholderContent = Omit<ModelChatMessageContent, 'generationResult'>;

const noFieldsContent: PlaceholderContent = {
  analysisResult: {},
  selectedIndices: {},
};

const singleFieldContent: PlaceholderContent = {
  analysisResult: {
    '/displayName': { task: 'Suggest a display name.', count: 1, language: 'en' },
  },
  selectedIndices: {},
};

const multipleFieldsContent: PlaceholderContent = {
  analysisResult: {
    '/displayName': { task: 'Suggest a display name.', count: 1, language: 'en' },
    '/description': { task: 'Suggest a description.', count: 1, language: 'en' },
    '/tagline': { task: 'Suggest a tagline.', count: 1, language: 'en' },
  },
  selectedIndices: {},
};

function seedStores(): void {
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
            name: 'description',
            label: 'Description',
            inputType: 'TextArea',
            occurrences: { minimum: 0, maximum: 1 },
          },
        },
        {
          Input: {
            name: 'tagline',
            label: 'Tagline',
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
    fields: [
      { name: 'displayName', type: 'String', values: [{ v: '' }] },
      { name: 'description', type: 'String', values: [{ v: '' }] },
      { name: 'tagline', type: 'String', values: [{ v: '' }] },
    ],
    topic: 'Mock topic',
  });
}

const PlaceholderStory = ({ content }: { content: PlaceholderContent }): React.ReactNode => {
  useEffect(() => {
    seedStores();
  }, []);
  return <AssistantMessagePlaceholder content={content} />;
};

export const NoFields: Story = {
  name: 'Examples / No Fields',
  args: { content: noFieldsContent },
  render: (args) => <PlaceholderStory content={args.content} />,
};

export const SingleField: Story = {
  name: 'Examples / Single Field',
  args: { content: singleFieldContent },
  render: (args) => <PlaceholderStory content={args.content} />,
};

export const MultipleFields: Story = {
  name: 'Examples / Multiple Fields',
  args: { content: multipleFieldsContent },
  render: (args) => <PlaceholderStory content={args.content} />,
};
