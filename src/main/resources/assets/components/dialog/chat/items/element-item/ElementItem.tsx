import { cn } from '@enonic/ui';

import { scrollToField } from '@/store/host';

import type { FieldDescriptor, MultipleValues } from '@/store/content';

import { REGULAR_SCREEN } from '../../../../../common/device';
import { pickValue } from '../../../../../common/messages';
import ElementItemControls from '../../controls/element-item-controls/ElementItemControls';
import ElementItemSwitchControls from '../../controls/element-item-switch-controls/ElementItemSwitchControls';
import ElementItemContent from '../element-item-content/ElementItemContent';

const ELEMENT_ITEM_NAME = 'ElementItem';

type Props = {
  className?: string;
  messageId: string;
  descriptor: FieldDescriptor;
  last: boolean;
  value: Optional<string | MultipleValues>;
};

export default function ElementItem({
  className,
  messageId,
  descriptor,
  value,
  last,
}: Props): React.ReactNode {
  const { name, label, displayName, type } = descriptor;
  const content = value && pickValue(value);

  return (
    <li
      data-component={ELEMENT_ITEM_NAME}
      className={cn(
        ELEMENT_ITEM_NAME,
        'group/item grid-cols-fit-fit-1fr grid gap-x-1 gap-y-1 hover:bg-slate-50',
        className,
      )}
    >
      <button
        className="text-info-rev cursor-pointer truncate px-1 align-baseline"
        title={displayName}
        onClick={() => scrollToField(name)}
      >
        <span className="text-xs">{label}</span>
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
          name={name}
          type={type}
        />
      )}
      <ElementItemContent className="col-span-3" content={content} type={type} />
    </li>
  );
}
