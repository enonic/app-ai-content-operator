import { cn } from '@enonic/ui';
import { LoaderCircle } from 'lucide-react';

import { REGULAR_SCREEN } from '../../../../../common/device';
import CopyControl from '../../controls/copy-control/CopyControl';

const COMMON_ITEM_CONTENT_NAME = 'CommonItemContent';

type Props = {
  className?: string;
  content: Optional<string>;
  last: boolean;
};

export default function CommonItemContent({ className, content, last }: Props): React.ReactNode {
  return (
    <div
      data-component={COMMON_ITEM_CONTENT_NAME}
      className={cn(COMMON_ITEM_CONTENT_NAME, 'group/item relative leading-6', className)}
    >
      {content ? (
        <>
          <CopyControl
            key="copy"
            className={cn(
              'relative float-right ml-2',
              REGULAR_SCREEN && !last && 'invisible group-hover/item:visible',
            )}
            content={content}
            type="html"
          />
          <article dangerouslySetInnerHTML={{ __html: content }} className="prose prose-sm pr-5" />
        </>
      ) : (
        <LoaderCircle className="text-decorative size-5 animate-spin" />
      )}
    </div>
  );
}
