import {useFocused, useSelected} from 'slate-react';
import {twJoin} from 'tailwind-merge';

import {animateScroll, animateTopicScroll} from '../../../../../common/animations';
import {MENTION_ALL, MENTION_TOPIC} from '../../../../../common/mentions';

export type Props = {
    attributes?: React.Attributes;
    className?: string;
    children?: React.ReactNode;
    element: Slate.MentionElement;
};

function animateScrollForPath(path: string): void {
    if (path === MENTION_TOPIC.path) {
        animateTopicScroll();
    } else {
        animateScroll(path);
    }
}

export default function MentionElement({attributes = {}, className, children, element}: Props): React.ReactNode {
    const selected = useSelected();
    const focused = useFocused();

    const isAllMention = element.path === MENTION_ALL.path;

    const classNames = twJoin(
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
            data-slate-node='mention'
            contentEditable={false}
            className={classNames}
            title={element.title}
            onClick={isAllMention ? undefined : () => animateScrollForPath(element.path)}
        >
            <span className='text-xs mention'>
                {element.character}
                {children}
            </span>
        </button>
    );
}
