import { IconButton, cn } from '@enonic/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { changeModelMessageSelectedIndex } from '@/store/chat';

import type { MultipleValues } from '@/store/content';

const ELEMENT_ITEM_SWITCH_CONTROLS_NAME = 'ElementItemSwitchControls';

export type Props = {
  className?: string;
  messageId: string;
  name: string;
  content: MultipleValues;
};

export default function ElementItemSwitchControls({
  className,
  messageId,
  name,
  content,
}: Props): React.ReactNode {
  const { t } = useTranslation();
  const { values, selectedIndex } = content;
  const isFirst = selectedIndex === 0;
  const isLast = selectedIndex === values.length - 1;
  const totalCount = values.length;
  const text = `${selectedIndex + 1}/${totalCount}`;

  return (
    <div
      data-component={ELEMENT_ITEM_SWITCH_CONTROLS_NAME}
      className={cn(ELEMENT_ITEM_SWITCH_CONTROLS_NAME, 'flex items-center', className)}
    >
      <IconButton
        variant="text"
        size="sm"
        icon={ChevronLeft}
        title={t('showPreviousOption')}
        aria-label={t('showPreviousOption')}
        className="h-auto w-4 disabled:opacity-25"
        disabled={isFirst}
        onClick={() => {
          changeModelMessageSelectedIndex(messageId, name, selectedIndex - 1);
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
        title={t('action.showNextOption')}
        aria-label={t('action.showNextOption')}
        className="h-auto w-4 disabled:opacity-25"
        disabled={isLast}
        onClick={() => {
          changeModelMessageSelectedIndex(messageId, name, selectedIndex + 1);
        }}
      />
    </div>
  );
}
