import { cn } from '@enonic/ui';
import { useFocused, useSelected } from 'slate-react';

import { scrollToField } from '@/store/host';

import { MENTION_ALL } from '../../../../../common/mentions';

const MENTION_ELEMENT_NAME = 'MentionElement';

export type MentionElementProps = {
  attributes?: Record<string, unknown>;
  className?: string;
  children?: React.ReactNode;
  element: Slate.MentionElement;
};

export const MentionElement = ({
  attributes = {},
  className,
  children,
  element,
}: MentionElementProps): React.ReactNode => {
  const selected = useSelected();
  const focused = useFocused();

  const isAllMention = element.path === MENTION_ALL.path;

  return (
    <button
      {...attributes}
      data-component={MENTION_ELEMENT_NAME}
      data-slate-node="mention"
      contentEditable={false}
      className={cn(
        MENTION_ELEMENT_NAME,
        'inline-flex',
        'px-1 py-px',
        'align-baseline font-semibold',
        'rounded',
        'border border-bdr-subtle',
        !isAllMention && 'text-info',
        isAllMention ? 'cursor-default' : 'cursor-pointer',
        selected && focused && 'outline outline-info-rev border-info-rev',
        className,
      )}
      tabIndex={-1}
      title={element.title}
      onClick={isAllMention ? undefined : () => scrollToField(element.path)}
    >
      <span className="mention text-xs">
        {element.character}
        {children}
      </span>
    </button>
  );
};
MentionElement.displayName = MENTION_ELEMENT_NAME;
