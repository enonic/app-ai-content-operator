import type { Props as MentionElementProps } from '../mention-element/MentionElement';
import type { RenderElementProps } from 'slate-react';

import MentionElement from '../mention-element/MentionElement';

type Props = MentionElementProps | RenderElementProps;

function isMentionProps(props: Props): props is MentionElementProps {
  return 'element' in props && props.element.type === 'mention';
}

export default function PromptAreaElement(props: Props): React.ReactElement {
  if (isMentionProps(props)) {
    return <MentionElement {...props} />;
  }
  return (
    <p {...props.attributes} className="relative min-h-6 pl-4 leading-6">
      {props.children as React.ReactNode}
    </p>
  );
}
