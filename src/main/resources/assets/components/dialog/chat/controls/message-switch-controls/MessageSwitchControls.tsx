import { IconButton, Tooltip, cn } from '@enonic/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { markMessageAsActive } from '@/store/chat';

const MESSAGE_SWITCH_CONTROLS_NAME = 'MessageSwitchControls';

export type MessageSwitchControlsProps = {
  className?: string;
  ids: string[];
  selectedId: string;
};

export const MessageSwitchControls = ({
  className,
  ids,
  selectedId,
}: MessageSwitchControlsProps): React.ReactNode => {
  const { t } = useTranslation();

  const selectedIndex = ids.indexOf(selectedId);
  const isFirst = selectedIndex === 0;
  const isLast = selectedIndex === ids.length - 1;
  const totalCount = ids.length;
  const text = `${selectedIndex + 1}/${totalCount}`;

  return (
    <div
      data-component={MESSAGE_SWITCH_CONTROLS_NAME}
      className={cn(MESSAGE_SWITCH_CONTROLS_NAME, 'flex items-center', className)}
    >
      <Tooltip delay={500} value={t('action.showPreviousMessage')} asChild>
        <IconButton
          variant="text"
          size="sm"
          icon={ChevronLeft}
          aria-label={t('action.showPreviousMessage')}
          disabled={isFirst}
          onClick={() => {
            markMessageAsActive(ids.at(selectedIndex - 1));
          }}
        />
      </Tooltip>
      <span
        className={cn(
          'flex items-center justify-center',
          'h-6 min-w-8 px-1 tabular-nums',
          'text-subtle cursor-default text-sm',
        )}
      >
        {text}
      </span>
      <Tooltip delay={500} value={t('action.showNextMessage')} asChild>
        <IconButton
          variant="text"
          size="sm"
          icon={ChevronRight}
          aria-label={t('action.showNextMessage')}
          disabled={isLast}
          onClick={() => {
            markMessageAsActive(ids.at(selectedIndex + 1));
          }}
        />
      </Tooltip>
    </div>
  );
};
MessageSwitchControls.displayName = MESSAGE_SWITCH_CONTROLS_NAME;
