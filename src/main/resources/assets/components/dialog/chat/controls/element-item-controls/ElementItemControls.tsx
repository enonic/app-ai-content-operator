import { cn } from '@enonic/ui';

import type { DataEntryType } from '../../../../../../shared/data/DataEntry';

import { ApplyControl } from '../apply-control/ApplyControl';
import { CopyControl } from '../copy-control/CopyControl';

const ELEMENT_ITEM_CONTROLS_NAME = 'ElementItemControls';

export type ElementItemControlsProps = {
  className?: string;
  name: string;
  content: string;
  type?: DataEntryType;
};

export const ElementItemControls = ({
  className,
  name,
  content,
  type,
}: ElementItemControlsProps): React.ReactNode => {
  return (
    <div
      data-component={ELEMENT_ITEM_CONTROLS_NAME}
      className={cn(
        ELEMENT_ITEM_CONTROLS_NAME,
        'inline-flex items-center justify-end gap-2.5',
        className,
      )}
    >
      <CopyControl key="copy" content={content} type={type} />
      <ApplyControl key="apply" name={name} content={content} />
    </div>
  );
};
ElementItemControls.displayName = ELEMENT_ITEM_CONTROLS_NAME;
