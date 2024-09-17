import {RenderElementProps} from 'slate-react';

import MentionElement, {Props as MentionElementProps} from '../MentionElement/MentionElement';

type Props = MentionElementProps | RenderElementProps;

function isMentionProps(props: Props): props is MentionElementProps {
    return 'element' in props && props.element.type === 'mention';
}

export default function PromptAreaElement(props: Props): JSX.Element {
    if (isMentionProps(props)) {
        return <MentionElement {...props} />;
    }
    return (
        <p {...props.attributes} className='relative pl-4'>
            {props.children as React.ReactNode}
        </p>
    );
}
