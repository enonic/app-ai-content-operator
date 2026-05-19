import type { RenderElementProps } from 'slate-react';

import { MentionElement, type MentionElementProps } from '../mention-element/MentionElement';

const PROMPT_AREA_ELEMENT_NAME = 'PromptAreaElement';

export type PromptAreaElementProps = MentionElementProps | RenderElementProps;

function isMentionProps(props: PromptAreaElementProps): props is MentionElementProps {
  return 'element' in props && props.element.type === 'mention';
}

export const PromptAreaElement = (props: PromptAreaElementProps): React.ReactElement => {
  if (isMentionProps(props)) {
    return <MentionElement {...props} />;
  }
  return (
    <p {...props.attributes} className="relative min-h-6 pl-4 leading-6">
      {props.children as React.ReactNode}
    </p>
  );
};
PromptAreaElement.displayName = PROMPT_AREA_ELEMENT_NAME;
