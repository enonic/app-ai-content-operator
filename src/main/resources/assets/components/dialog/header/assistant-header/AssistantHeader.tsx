import { IconButton, cn } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { SquarePen, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { clearChat } from '@/store/chat';
import { resetContext } from '@/store/context';
import { $dialog, setDialogHidden } from '@/store/dialog';

const ASSISTANT_HEADER_NAME = 'AssistantHeader';

export type AssistantHeaderProps = {
  onDragStart?: (event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  className?: string;
};

export const AssistantHeader = ({
  onDragStart,
  className,
}: AssistantHeaderProps): React.ReactNode => {
  const { t } = useTranslation();
  const { dragging } = useStore($dialog, { keys: ['dragging'] });

  return (
    <div
      data-component={ASSISTANT_HEADER_NAME}
      className={cn(
        ASSISTANT_HEADER_NAME,
        'flex items-center justify-between gap-2.5 pt-5',
        className,
      )}
    >
      <IconButton
        className="z-10"
        variant="filled"
        shape="round"
        size="lg"
        icon={SquarePen}
        title={t('action.newChat')}
        aria-label={t('action.newChat')}
        onClick={() => {
          clearChat();
          resetContext();
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        className={cn(
          'flex items-center justify-center',
          'flex-1 self-stretch',
          'w-full h-20 -mt-5 absolute left-0',
          'text-center text-2xl font-semibold',
          dragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
      >
        Juke AI
      </button>
      <IconButton
        className="z-10"
        variant="filled"
        shape="round"
        size="lg"
        icon={X}
        title={t('action.close')}
        aria-label={t('action.close')}
        onClick={() => {
          setDialogHidden(true);
        }}
      />
    </div>
  );
};
AssistantHeader.displayName = ASSISTANT_HEADER_NAME;
