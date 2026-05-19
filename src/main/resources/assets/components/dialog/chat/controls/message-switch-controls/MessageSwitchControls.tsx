import { IconButton, cn } from '@enonic/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { markMessageAsActive } from '@/store/chat';

const MESSAGE_SWITCH_CONTROLS_NAME = 'MessageSwitchControls';

export type Props = {
  className?: string;
  ids: string[];
  selectedId: string;
};

export default function MessageSwitchControls({
  className,
  ids,
  selectedId,
}: Props): React.ReactNode {
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
      <IconButton
        variant="text"
        size="sm"
        icon={ChevronLeft}
        title={t('showPreviousMessage')}
        aria-label={t('showPreviousMessage')}
        className="disabled:opacity-25"
        disabled={isFirst}
        onClick={() => {
          markMessageAsActive(ids.at(selectedIndex - 1));
        }}
      />
      <span
        className={cn(
          'flex items-center justify-center',
          'h-6 w-6',
          'text-subtle cursor-default text-xs',
        )}
      >
        {text}
      </span>
      <IconButton
        variant="text"
        size="sm"
        icon={ChevronRight}
        title={t('action.showNextMessage')}
        aria-label={t('action.showNextMessage')}
        className="disabled:opacity-25"
        disabled={isLast}
        onClick={() => {
          markMessageAsActive(ids.at(selectedIndex + 1));
        }}
      />
    </div>
  );
}
