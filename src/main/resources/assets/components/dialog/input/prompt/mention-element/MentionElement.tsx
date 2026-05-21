import { Button, cn } from '@enonic/ui';
import { useFocused, useSelected } from 'slate-react';

import { scrollToField } from '@/store/host';

import { MENTION_ALL } from '../../../../../common/mentions';

const MENTION_ELEMENT_NAME = 'MentionElement';

export type MentionElementProps = {
  attributes?: Record<string, unknown>;
  className?: string;
  children?: React.ReactNode;
  element: Slate.MentionElement;
  'data-component'?: string;
};

export const MentionElement = ({
  attributes = {},
  className,
  children,
  element,
  'data-component': dataComponent = MENTION_ELEMENT_NAME,
}: MentionElementProps): React.ReactNode => {
  const selected = useSelected();
  const focused = useFocused();

  const isAllMention = element.path === MENTION_ALL.path;

  return (
    <Button
      {...attributes}
      data-component={dataComponent}
      data-slate-node="mention"
      variant="filled"
      size="sm"
      className={cn(
        MENTION_ELEMENT_NAME,
        "px-1.5 h-5 font-semibold",
        "bg-transparent",
        !isAllMention && 'text-info',
        isAllMention && 'cursor-default',
        'border border-bdr-subtle',
        selected && focused && 'outline outline-info-rev border-info-rev',
        className,
      )}
      onClick={isAllMention ? undefined : () => scrollToField(element.path)}
      tabIndex={-1}
    >
      <span className="mention text-xs truncate">
        {element.character}
        {children}
      </span>
    </Button>


  );
};
MentionElement.displayName = MENTION_ELEMENT_NAME;
