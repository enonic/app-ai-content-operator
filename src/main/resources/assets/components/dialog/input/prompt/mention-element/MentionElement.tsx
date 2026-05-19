import { cn } from '@enonic/ui';
import { useFocused, useSelected } from 'slate-react';

import { dispatchInteracted } from '../../../../../common/events';
import { MENTION_ALL } from '../../../../../common/mentions';

const MENTION_ELEMENT_NAME = 'MentionElement';

export type Props = {
  attributes?: Record<string, unknown>;
  className?: string;
  children?: React.ReactNode;
  element: Slate.MentionElement;
};

export default function MentionElement({
  attributes = {},
  className,
  children,
  element,
}: Props): React.ReactNode {
  const selected = useSelected();
  const focused = useFocused();

  const isAllMention = element.path === MENTION_ALL.path;

  const classNames = cn(
    MENTION_ELEMENT_NAME,
    'inline-flex',
    'px-1 py-0.25',
    'align-baseline',
    'rounded',
    'border border-slate-300',
    !isAllMention && 'text-sky-600',
    isAllMention && 'cursor-default',
    selected && focused && 'outline outline-2',
    className,
  );

  return (
    <button
      {...attributes}
      data-component={MENTION_ELEMENT_NAME}
      data-slate-node="mention"
      contentEditable={false}
      className={classNames}
      title={element.title}
      onClick={isAllMention ? undefined : () => dispatchInteracted(element.path)}
    >
      <span className="mention text-xs">
        {element.character}
        {children}
      </span>
    </button>
  );
}
