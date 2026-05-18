import { twJoin, twMerge } from 'tailwind-merge';

import type { FieldDescriptor, MultipleValues } from '@/store/content';

import { REGULAR_SCREEN } from '../../../../../common/device';
import { dispatchInteracted } from '../../../../../common/events';
import { pickValue } from '../../../../../common/messages';
import ElementItemControls from '../../controls/element-item-controls/ElementItemControls';
import ElementItemSwitchControls from '../../controls/element-item-switch-controls/ElementItemSwitchControls';
import ElementItemContent from '../element-item-content/ElementItemContent';

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
      className={twMerge(
        'group/item grid-cols-fit-fit-1fr grid gap-x-1 gap-y-1 hover:bg-slate-50',
        className,
      )}
    >
      <button
        className="-mx-1 cursor-pointer truncate px-1 align-baseline text-sky-600"
        title={displayName}
        onClick={() => dispatchInteracted(name)}
      >
        <span className="text-xs">{label}</span>
      </button>
      {content && typeof value !== 'string' && (
        <ElementItemSwitchControls messageId={messageId} name={name} content={value} />
      )}
      {content && (
        <ElementItemControls
          className={twJoin(
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
