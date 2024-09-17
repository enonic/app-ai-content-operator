import clsx from 'clsx';
import {useFocused, useSelected} from 'slate-react';

import {animateScroll, animateTopicScroll} from '../../../../../common/animations';
import {MENTION_ALL, MENTION_TOPIC} from '../../../../../common/mentions';

export type Props = {
    attributes?: React.Attributes;
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

export default function MentionElement({attributes = {}, children, element}: Props): JSX.Element {
    const selected = useSelected();
    const focused = useFocused();

    const isAllMention = element.path === MENTION_ALL.path;

    const classNames = clsx([
        'inline-flex',
        'px-1 py-0.5',
        'align-baseline',
        'rounded',
        'border border-slate-300',
        {'text-sky-600': !isAllMention},
        {'cursor-default': isAllMention},
        {'outline outline-2': selected && focused},
    ]);

    return (
        <button
            {...attributes}
            data-slate-node='mention'
            contentEditable={false}
            className={classNames}
            title={element.title}
            onClick={isAllMention ? undefined : () => animateScrollForPath(element.path)}
        >
            <span className='text-xs mention leading-'>
                {element.character}
                {children}
            </span>
        </button>
    );
}
