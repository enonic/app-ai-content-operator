import clsx from 'clsx';
import {useEffect, useRef, useState} from 'react';
import {twMerge} from 'tailwind-merge';

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

export default function MentionsList({
    className,
    targetRect,
    mentions,
    selectedIndex,
    handleClick,
}: Props): React.ReactNode {
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [listWidth, setListWidth] = useState(0);

    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        setIsRendered(true);
    }, []);

    useEffect(() => {
        buttonRefs.current[selectedIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
    }, [selectedIndex]);

    useEffect(() => {
        if (buttonRefs.current.length > 0 && isRendered) {
            const widths = buttonRefs.current.map(button => button?.offsetWidth || 0);
            setListWidth(Math.max(...widths));
        }
    }, [mentions, isRendered]);

    const classNames = twMerge(
        'ai-content-operator',
        'EnonicAiMentionsList',
        'absolute',
        !targetRect && 'hidden',
        'box-content',
        listWidth > 0 && 'flex flex-col',
        'max-w-96 max-h-30',
        'p-1',
        'bg-white',
        'rounded',
        'shadow-md',
        'overflow-y-auto',
        'z-[2000]',
        'ai-content-operator-scroll',
        className,
    );

    const style = {
        ...(targetRect && {
            top: targetRect.top + window.scrollY + 20,
            left: targetRect.left + window.scrollX,
        }),
        width: listWidth,
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
                        className={clsx(
                            'block',
                            'flex-none',
                            'h-6',
                            'px-2 py-0.5',
                            'truncate',
                            'rounded-sm',
                            'hover:bg-slate-50',
                            i === selectedIndex && 'bg-slate-100 hover:bg-slate-200',
                            i !== selectedIndex && 'hover:bg-slate-50',
                            'text-left text-sm',
                            mention.path === MENTION_ALL.path && "before:content-['<'] after:content-['>']",
                            mention.type === 'scope' && 'flex items-center gap-1',
                        )}
                    >
                        {mention.label}
                        {mention.type === 'scope' && <Icon name={'expand'} className={'shrink-0 w-3 h-3'} />}
                    </button>
                ))}
            </div>
        </Portal>
    );
}
