import { cn } from '@enonic/ui';
import { useTranslation } from 'react-i18next';

import { scrollToField } from '@/store/host';

import type { MultipleValues } from '@/store/content';

import { SPECIAL_NAMES } from '../../../../../../shared/enums';
import { REGULAR_SCREEN } from '../../../../../common/device';
import { pickValue } from '../../../../../common/messages';
import { ElementItemControls } from '../../controls/element-item-controls/ElementItemControls';
import { ElementItemSwitchControls } from '../../controls/element-item-switch-controls/ElementItemSwitchControls';
import { ElementItemContent } from '../element-item-content/ElementItemContent';

const TOPIC_ITEM_NAME = 'TopicItem';

export type TopicItemProps = {
  className?: string;
  messageId: string;
  name: string;
  last: boolean;
  value: Optional<string | MultipleValues>;
};

export const TopicItem = ({
  className,
  messageId,
  name,
  last,
  value,
}: TopicItemProps): React.ReactNode => {
  const { t } = useTranslation();
  const topic = t('field.mentions.__topic__.label');
  const content = value && pickValue(value);

  return (
    <li
      data-component={TOPIC_ITEM_NAME}
      className={cn(
        TOPIC_ITEM_NAME,
        'group/item grid-cols-fit-fit-1fr grid gap-x-1 gap-y-1 hover:bg-slate-50',
        className,
      )}
    >
      <button
        className="text-info-rev cursor-pointer truncate px-1 align-baseline"
        title={topic}
        onClick={() => scrollToField(SPECIAL_NAMES.topic)}
      >
        <span className="text-xs">{topic}</span>
      </button>
      {content && typeof value !== 'string' && (
        <ElementItemSwitchControls messageId={messageId} name={name} content={value} />
      )}
      {content && (
        <ElementItemControls
          className={cn(
            'col-start-3',
            REGULAR_SCREEN && !last && 'invisible group-hover/item:visible',
          )}
          content={content}
          name={SPECIAL_NAMES.topic}
        />
      )}
      <ElementItemContent className="col-span-3" content={content} />
    </li>
  );
};
TopicItem.displayName = TOPIC_ITEM_NAME;
