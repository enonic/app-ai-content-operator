import clsx from 'clsx';
import {t} from 'i18next';
import {useEffect, useRef, useState} from 'react';
import {twMerge} from 'tailwind-merge';

import {Portal} from '../../../../../common/components';
import {MENTION_ALL} from '../../../../../common/mentions';
import {Mention} from '../../../../../stores/data/Mention';

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
    const hasMentions = mentions.length > 0;
    const mentionsToUse = hasMentions
        ? mentions
        : [
              {
                  path: '__not_found__',
                  label: t('text.mentions.missing'),
                  prettified: t('text.mentions.missing'),
              },
          ];

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
    }, [hasMentions, mentionsToUse, isRendered]);

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
        width: hasMentions ? listWidth : 'auto',
    };

    return (
        <Portal>
            <div className={classNames} style={style}>
                {mentionsToUse.map((mention, i) => (
                    <button
                        key={mention.path}
                        ref={el => (buttonRefs.current[i] = el)}
                        onClick={hasMentions ? () => handleClick(mention) : undefined}
                        title={mention.prettified !== mention.label ? mention.prettified : undefined}
                        className={clsx(
                            'block',
                            'flex-none',
                            'h-6',
                            'px-2 py-0.5',
                            hasMentions && 'truncate',
                            'rounded-sm',
                            'hover:bg-slate-50',
                            i === selectedIndex && 'bg-slate-100 hover:bg-slate-200',
                            i !== selectedIndex && 'hover:bg-slate-50',
                            'text-left text-sm',
                            mention.path === MENTION_ALL.path && "before:content-['<'] after:content-['>']",
                        )}
                    >
                        {mention.label}
                    </button>
                ))}
            </div>
        </Portal>
    );
}
