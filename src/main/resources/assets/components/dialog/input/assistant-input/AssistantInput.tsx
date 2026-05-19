import { cn } from '@enonic/ui';
import { useTranslation } from 'react-i18next';

import PromptArea from '../prompt/prompt-area/PromptArea';

const ASSISTANT_INPUT_NAME = 'AssistantInput';

export type Props = {
  className?: string;
};

export default function AssistantInput({ className = '' }: Props): React.ReactNode {
  const { t } = useTranslation();

  return (
    <div
      data-component={ASSISTANT_INPUT_NAME}
      className={cn(ASSISTANT_INPUT_NAME, 'flex w-full flex-col p-5 bg-surface-primary rounded-lg gap-2.5')}
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
}
