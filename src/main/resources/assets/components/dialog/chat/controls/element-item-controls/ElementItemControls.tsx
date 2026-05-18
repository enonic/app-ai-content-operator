import { twMerge } from 'tailwind-merge';

import type { DataEntryType } from '../../../../../../shared/data/DataEntry';

import ApplyControl from '../apply-control/ApplyControl';
import CopyControl from '../copy-control/CopyControl';

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
      className={twMerge(
        'inline-flex items-center justify-end',
        'ml-auto',
        'divide-x rounded',
        'overflow-hidden',
        'shadow',
        className,
      )}
    >
      <CopyControl className="rounded-none" key="copy" content={content} type={type} />
      <ApplyControl className="rounded-none" key="apply" name={name} content={content} />
    </div>
  );
}
