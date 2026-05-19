import { cn } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { useTranslation } from 'react-i18next';

import { $dialog } from '@/store/dialog';

import PromptArea from '../prompt/prompt-area/PromptArea';

const ASSISTANT_INPUT_NAME = 'AssistantInput';

export type AssistantInputProps = {
  className?: string;
};

export const AssistantInput = ({ className = '' }: AssistantInputProps): React.ReactNode => {
  const { dragging } = useStore($dialog, { keys: ['dragging'] });
  const { t } = useTranslation();

  return (
    <div
      data-component={ASSISTANT_INPUT_NAME}
      className={cn(
        ASSISTANT_INPUT_NAME,
        'bg-surface-primary flex w-full flex-col gap-2.5 rounded-lg p-5',
        dragging && 'bg-surface-primary/40',
      )}
    >
      <PromptArea className={className} />
      <p
        className={cn(
          'col-span-full',
          'text-decorative text-center text-xs text-nowrap select-none',
          'overflow-hidden',
        )}
      >
        {t('text.input.tip')}
      </p>
    </div>
  );
};
AssistantInput.displayName = ASSISTANT_INPUT_NAME;
