import { twMerge } from 'tailwind-merge';

import LoadingIcon from '@/ui/primitives/loading-icon/LoadingIcon';

import type { DataEntryType } from '../../../../../../shared/data/DataEntry';

type Props = {
  className?: string;
  content: Optional<string>;
  type?: DataEntryType;
};

export default function ElementItemContent({
  className,
  content,
  type = 'text',
}: Props): React.ReactNode {
  if (!content) {
    return (
      <div className={twMerge('relative', 'col-span-2', className)}>
        <LoadingIcon />
      </div>
    );
  }

  switch (type) {
    case 'html':
      return (
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          className={twMerge(
            'ai-content-operator-html-based',
            'prose prose-sm max-w-max',
            'relative',
            'col-span-2',
            className,
          )}
        />
      );
    case 'text':
      return (
        <div className={twMerge('prose prose-sm relative', 'col-span-2', className)}>{content}</div>
      );
  }
}
