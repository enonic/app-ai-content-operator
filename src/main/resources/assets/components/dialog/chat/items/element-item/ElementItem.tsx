import { Button, cn } from '@enonic/ui';

import { scrollToField } from '@/store/host';

import type { FieldDescriptor, MultipleValues } from '@/store/content';

import { REGULAR_SCREEN } from '../../../../../common/device';
import { pickValue } from '../../../../../common/messages';
import { ElementItemControls } from '../../controls/element-item-controls/ElementItemControls';
import { ElementItemSwitchControls } from '../../controls/element-item-switch-controls/ElementItemSwitchControls';
import { ElementItemContent } from '../element-item-content/ElementItemContent';

const ELEMENT_ITEM_NAME = 'ElementItem';

export type ElementItemProps = {
  className?: string;
  messageId: string;
  descriptor: FieldDescriptor;
  last: boolean;
  value: Optional<string | MultipleValues>;
};

export const ElementItem = ({
  className,
  messageId,
  descriptor,
  value,
  last,
}: ElementItemProps): React.ReactNode => {
  const { name, label, displayName, type } = descriptor;
  const content = value && pickValue(value);

  return (
    <li
      data-component={ELEMENT_ITEM_NAME}
      className={cn(
        ELEMENT_ITEM_NAME,
        'group/item grid-cols-fit-fit-1fr grid gap-x-1',
        className,
      )}
    >
      <Button
        size="sm"
        className="text-info -ml-1 block h-7 cursor-pointer truncate px-1 leading-7 font-semibold"
        title={displayName}
        onClick={() => scrollToField(name)}
      >
        {label}
      </Button>
      {content && typeof value !== 'string' && (
        <ElementItemSwitchControls messageId={messageId} name={name} content={value} />
      )}
      {content && (
        <ElementItemControls
          className={cn(
            'col-start-3 -mt-1',
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
};
ElementItem.displayName = ELEMENT_ITEM_NAME;
