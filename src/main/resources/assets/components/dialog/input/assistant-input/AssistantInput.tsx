import { cn } from '@enonic/ui';
import { useStore } from '@nanostores/react';

import { $dialog } from '@/store/dialog';

import { ContextControls } from '../../context/context-controls/ContextControls';
import { PromptArea } from '../prompt/prompt-area/PromptArea';

const ASSISTANT_INPUT_NAME = 'AssistantInput';

export const AssistantInput = (): React.ReactNode => {
  const { dragging } = useStore($dialog, { keys: ['dragging'] });

  return (
    <div
      data-component={ASSISTANT_INPUT_NAME}
      className={cn(
        ASSISTANT_INPUT_NAME,
        'bg-surface-primary flex w-full flex-col rounded-lg p-5',
        dragging && 'bg-surface-primary/40',
      )}
    >
      <ContextControls />
      <PromptArea />
    </div>
  );
};
AssistantInput.displayName = ASSISTANT_INPUT_NAME;
