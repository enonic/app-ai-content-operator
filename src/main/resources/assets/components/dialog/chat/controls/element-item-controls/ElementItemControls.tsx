import { cn } from '@enonic/ui';

import type { DataEntryType } from '../../../../../../shared/data/DataEntry';

import ApplyControl from '../apply-control/ApplyControl';
import CopyControl from '../copy-control/CopyControl';

const ELEMENT_ITEM_CONTROLS_NAME = 'ElementItemControls';

type Props = {
  className?: string;
  name: string;
  content: string;
  type?: DataEntryType;
};

export default function ElementItemControls({
  className,
  name,
  content,
  type,
}: Props): React.ReactNode {
  return (
    <div
      data-component={ELEMENT_ITEM_CONTROLS_NAME}
      className={cn(
        ELEMENT_ITEM_CONTROLS_NAME,
        'inline-flex items-center justify-end',
        'ml-2',
        'divide-x rounded',
        'overflow-hidden',
        className,
      )}
    >
      <CopyControl className="rounded-none" key="copy" content={content} type={type} />
      <ApplyControl className="rounded-none" key="apply" name={name} content={content} />
    </div>
  );
}
