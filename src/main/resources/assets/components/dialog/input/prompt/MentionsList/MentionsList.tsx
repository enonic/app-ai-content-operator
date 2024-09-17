import clsx from 'clsx';
import {useEffect, useRef} from 'react';

import {Portal} from '../../../../../common/components';
import {MENTION_ALL} from '../../../../../common/mentions';
import {Mention} from '../../../../../stores/data/Mention';
import Icon from '../../../../shared/Icon/Icon';

type Props = {
    className?: string;
    mentions: Mention[];
    selectedIndex: number;
    targetRect?: DOMRect;
    handleClick: (mention: Mention) => void;
};

export default function MentionsList({targetRect, mentions, selectedIndex, handleClick}: Props): JSX.Element {
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        buttonRefs.current[selectedIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
    }, [selectedIndex]);

    const classNames = clsx([
        'enonic-ai',
        'EnonicAiMentionsList',
        'absolute',
        {hidden: !targetRect},
        'box-content',
        'flex flex-col',
        'max-h-30',
        'p-1',
        'bg-white',
        'rounded',
        'shadow-md',
        'overflow-y-auto',
        'z-[2000]',
        'enonic-ai-scroll',
    ]);

    const style = targetRect && {
        top: targetRect.top + window.scrollY + 20,
        left: targetRect.left + window.scrollX,
    };

    return (
        <Portal>
            <div className={classNames} style={style}>
                {mentions.map((mention, i) => (
                    <button
                        key={mention.path}
                        ref={el => (buttonRefs.current[i] = el)}
                        onClick={() => handleClick(mention)}
                        title={mention.prettified !== mention.label ? mention.prettified : undefined}
                        className={clsx([
                            'block',
                            'px-2 py-0.5',
                            'rounded-sm',
                            'hover:bg-slate-50',
                            {
                                'bg-slate-100 hover:bg-slate-200': i === selectedIndex,
                                'hover:bg-slate-50': i !== selectedIndex,
                            },
                            'text-left text-sm',
                            {
                                "before:content-['<'] after:content-['>']": mention.path === MENTION_ALL.path,
                            },
                            {
                                'flex items-center gap-1': mention.type === 'scope',
                            },
                        ])}
                    >
                        {mention.label}
                        {mention.type === 'scope' ? (
                            <Icon name={'expand'} className={clsx(['shrink-0', 'w-3 h-3'])} />
                        ) : null}
                    </button>
                ))}
            </div>
        </Portal>
    );
}
