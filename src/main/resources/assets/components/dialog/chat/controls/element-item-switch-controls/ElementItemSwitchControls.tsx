import { IconButton, Tooltip, cn } from '@enonic/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { changeModelMessageSelectedIndex } from '@/store/chat';

import type { MultipleValues } from '@/store/content';

const ELEMENT_ITEM_SWITCH_CONTROLS_NAME = 'ElementItemSwitchControls';

export type ElementItemSwitchControlsProps = {
  className?: string;
  messageId: string;
  name: string;
  content: MultipleValues;
};

export const ElementItemSwitchControls = ({
  className,
  messageId,
  name,
  content,
}: ElementItemSwitchControlsProps): React.ReactNode => {
  const { t } = useTranslation();
  const { values, selectedIndex } = content;
  const isFirst = selectedIndex === 0;
  const isLast = selectedIndex === values.length - 1;
  const totalCount = values.length;
  const text = `${selectedIndex + 1}/${totalCount}`;

  return (
    <div
      data-component={ELEMENT_ITEM_SWITCH_CONTROLS_NAME}
      className={cn(ELEMENT_ITEM_SWITCH_CONTROLS_NAME, 'flex items-center h-7', className)}
    >
      <Tooltip delay={500} value={t('action.showPreviousOption')} asChild>
        <IconButton
          variant="text"
          size="sm"
          icon={ChevronLeft}
          aria-label={t('action.showPreviousOption')}
          className="h-7 w-6"
          disabled={isFirst}
          onClick={() => {
            changeModelMessageSelectedIndex(messageId, name, selectedIndex - 1);
          }}
        />
      </Tooltip>
      <span
        className={cn(
          'flex items-center justify-center',
          'h-6 min-w-6 tabular-nums',
          'text-subtle cursor-default text-xs',
        )}
      >
        {text}
      </span>
      <Tooltip delay={500} value={t('action.showNextOption')} asChild>
        <IconButton
          variant="text"
          size="sm"
          icon={ChevronRight}
          aria-label={t('action.showNextOption')}
          className="h-7 w-6"
          disabled={isLast}
          onClick={() => {
            changeModelMessageSelectedIndex(messageId, name, selectedIndex + 1);
          }}
        />
      </Tooltip>
    </div>
  );
};
ElementItemSwitchControls.displayName = ELEMENT_ITEM_SWITCH_CONTROLS_NAME;
