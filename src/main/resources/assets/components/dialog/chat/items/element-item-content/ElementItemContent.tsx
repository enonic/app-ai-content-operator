import { cn } from '@enonic/ui';
import { LoaderCircle } from 'lucide-react';

import type { DataEntryType } from '../../../../../../shared/data/DataEntry';

const ELEMENT_ITEM_CONTENT_NAME = 'ElementItemContent';

export type ElementItemContentProps = {
  className?: string;
  content: Optional<string>;
  type?: DataEntryType;
};

export const ElementItemContent = ({
  className,
  content,
  type = 'text',
}: ElementItemContentProps): React.ReactNode => {
  if (!content) {
    return (
      <div
        data-component={ELEMENT_ITEM_CONTENT_NAME}
        className={cn(ELEMENT_ITEM_CONTENT_NAME, 'relative col-span-2', className)}
      >
        <LoaderCircle className="text-subtle size-5 animate-spin" />
      </div>
    );
  }

  switch (type) {
    case 'html':
      return (
        <div
          data-component={ELEMENT_ITEM_CONTENT_NAME}
          dangerouslySetInnerHTML={{ __html: content }}
          className={cn(
            ELEMENT_ITEM_CONTENT_NAME,
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
        <div
          data-component={ELEMENT_ITEM_CONTENT_NAME}
          className={cn(
            ELEMENT_ITEM_CONTENT_NAME,
            'prose prose-sm relative',
            'col-span-2',
            className,
          )}
        >
          {content}
        </div>
      );
  }
};
ElementItemContent.displayName = ELEMENT_ITEM_CONTENT_NAME;
