import { Button, cn } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isNonOptional } from '@/common/objects';
import { $fieldDescriptors } from '@/store/content';
import { scrollToField } from '@/store/host';

import type { FieldDescriptor, ModelChatMessageContent } from '@/store/content';

const ASSISTANT_MESSAGE_PLACEHOLDER_NAME = 'AssistantMessagePlaceholder';

export type AssistantMessagePlaceholderProps = {
  content: Omit<ModelChatMessageContent, 'generationResult'>;
};

function getPlaceholderMessage(count: number): string {
  switch (count) {
    case 0:
      return 'field.message.assistant.placeholder.common';
    case 1:
      return 'field.message.assistant.placeholder.single';
    default:
      return 'field.message.assistant.placeholder.multiple';
  }
}

export const AssistantMessagePlaceholder = ({
  content,
}: AssistantMessagePlaceholderProps): React.ReactNode => {
  const { t } = useTranslation();
  const fieldDescriptors = useStore($fieldDescriptors);

  const analyzedFieldsDescriptors: FieldDescriptor[] = Object.entries(content.analysisResult)
    .map(([path, value]) => {
      return value.count > 0 ? fieldDescriptors.find(({ name }) => name === path) : null;
    })
    .filter(isNonOptional);

  const count = analyzedFieldsDescriptors.length;

  const hasFields = count > 0;

  const [expanded, setExpanded] = useState(false);

  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (expanded && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }, [expanded]);

  return (
    <>
      <button
        ref={ref}
        type="button"
        data-component={ASSISTANT_MESSAGE_PLACEHOLDER_NAME}
        disabled={!hasFields}
        onClick={() => setExpanded(!expanded)}
        className={cn(
          ASSISTANT_MESSAGE_PLACEHOLDER_NAME,
          'inline-flex items-center justify-start gap-1',
          '-mx-2 min-h-8 rounded px-2 py-1.5',
          'text-main bg-surface-neutral text-sm',
          'enabled:hover:bg-surface-neutral-hover enabled:cursor-pointer',
          'disabled:opacity-50',
          !hasFields && 'enabled:hover:bg-surface-neutral enabled:hover:cursor-default',
        )}
      >
        {hasFields && (
          <ChevronRight
            className={cn('size-3 shrink-0 transition-transform', expanded && 'rotate-90')}
          />
        )}
        <span className="bg-gradient-middle bg-text-gradient-size to-muted animate-move-gradient from-main bg-clip-text text-left text-sm text-transparent">
          {t(getPlaceholderMessage(count), {
            name: analyzedFieldsDescriptors.at(0)?.label,
            count: count - 1,
          })}
        </span>
      </button>
      <ul className={cn('flex flex-col gap-1 pl-6 mt-1', !expanded && 'hidden')}>
        {analyzedFieldsDescriptors.map(({ name, label, displayName }) => (
          <li key={name}>
            <Button
              size="sm"
              endIcon={LoaderCircle}
              endIconClassName="text-subtle size-3 animate-spin"
              className="text-info flex h-6 leading-6 px-2 -ml-2 text-sm max-w-full truncate"
              title={displayName}
              onClick={() => scrollToField(name)}
            >
              <span className="truncate">{label}</span>
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
};
AssistantMessagePlaceholder.displayName = ASSISTANT_MESSAGE_PLACEHOLDER_NAME;
