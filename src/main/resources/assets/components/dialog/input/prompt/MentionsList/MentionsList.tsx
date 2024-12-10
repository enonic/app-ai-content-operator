import {t} from 'i18next';
import {useEffect, useRef} from 'react';
import {twJoin, twMerge} from 'tailwind-merge';

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
    const ref = useRef<HTMLDivElement | null>(null);
    const hasMentions = mentions.length > 0;

    useEffect(() => {
        buttonRefs.current[selectedIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
    }, [selectedIndex]);

    useEffect(() => {
        const list = ref.current;
        if (list) {
            list.style.width = 'auto';
            if (buttonRefs.current.length > 0 && mentions.length > 0) {
                const widths = buttonRefs.current.map(button => button?.offsetWidth || 0);
                list.style.width = `${Math.max(...widths) + 1}px`;
            }
        }
    }, [mentions, buttonRefs, ref]);

    return (
        <Portal>
            <div
                ref={ref}
                className={twMerge(
                    'ai-content-operator',
                    'EnonicAiMentionsList',
                    'absolute',
                    !targetRect && 'hidden',
                    'box-content',
                    'flex flex-col',
                    'max-w-96 max-h-30',
                    'p-1',
                    'bg-white',
                    'rounded',
                    'shadow-md',
                    'overflow-y-auto',
                    'z-[2000]',
                    'ai-content-operator-scroll',
                    className,
                )}
                style={{
                    ...(targetRect && {
                        top: targetRect.top + window.scrollY + 20,
                        left: targetRect.left + window.scrollX,
                    }),
                }}
            >
                {hasMentions ? (
                    mentions.map((mention, i) => (
                        <button
                            key={mention.path}
                            ref={el => {
                                buttonRefs.current[i] = el;
                            }}
                            onClick={() => handleClick(mention)}
                            title={mention.prettified !== mention.label ? mention.prettified : undefined}
                            className={twJoin(
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
                            )}
                        >
                            {mention.label}
                        </button>
                    ))
                ) : (
                    <div className='flex items-center h-6 px-2 text-sm text-enonic-gray-400 select-none'>
                        {t('text.mentions.notFound')}
                    </div>
                )}
            </div>
        </Portal>
    );
}
