import type { RenderElementProps } from 'slate-react';

import { MentionElement, type MentionElementProps } from '../mention-element/MentionElement';
import { cn } from '@enonic/ui';

const PROMPT_AREA_ELEMENT_NAME = 'PromptAreaElement';

export type PromptAreaElementProps = MentionElementProps | RenderElementProps;

function isMentionProps(props: PromptAreaElementProps): props is MentionElementProps {
  return 'element' in props && props.element.type === 'mention';
}

export const PromptAreaElement = (props: PromptAreaElementProps): React.ReactElement => {
  if (isMentionProps(props)) {
    return <MentionElement data-component={PROMPT_AREA_ELEMENT_NAME} {...props} className={PROMPT_AREA_ELEMENT_NAME} />;
  }
  return (
    <p {...props.attributes} data-component={PROMPT_AREA_ELEMENT_NAME} className={cn(PROMPT_AREA_ELEMENT_NAME, 'relative min-h-6 pl-4 leading-6')}>
      {props.children as React.ReactNode}
    </p>
  );
};
PromptAreaElement.displayName = PROMPT_AREA_ELEMENT_NAME;
