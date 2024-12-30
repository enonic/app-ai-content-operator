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
        if (list && targetRect) {
            // Reset position, width, and children auto-fit to calculate proper dimensions
            list.style.display = 'block';
            list.style.width = 'auto';
            list.style.top = '';
            list.style.left = '';

            // Calculate dimensions AFTER the list has had a chance to layout its content
            requestAnimationFrame(() => {
                const listRect = list.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const viewportWidth = window.innerWidth;

                const spaceBelow = viewportHeight - (targetRect.bottom + window.scrollY);
                const spaceAbove = targetRect.top - window.scrollY;
                const spaceRight = viewportWidth - targetRect.left;

                if (buttonRefs.current.length > 0 && mentions.length > 0) {
                    const widths = buttonRefs.current.map(button => button?.offsetWidth ?? 0);
                    const maxWidth = Math.max(...widths);
                    list.style.width = `${maxWidth + 16}px`; // Adding padding
                    list.style.display = '';
                }

                let top: number;
                let left: number;

                // Vertical positioning
                if (spaceBelow >= listRect.height || spaceBelow >= spaceAbove) {
                    top = targetRect.bottom + window.scrollY;
                } else {
                    top = targetRect.top + window.scrollY - listRect.height;
                }

                // Horizontal positioning
                if (spaceRight >= listRect.width) {
                    left = targetRect.left + window.scrollX;
                } else {
                    left = targetRect.right + window.scrollX - listRect.width;
                }

                list.style.top = `${top}px`;
                list.style.left = `${left}px`;
            });
        }
    }, [mentions, targetRect]);

    return (
        <Portal>
            <div className='ai-content-operator'>
                <div
                    ref={ref}
                    className={twMerge(
                        'EnonicAiMentionsList',
                        'absolute',
                        !targetRect && 'hidden',
                        'box-content',
                        'flex flex-col',
                        'max-w-96 max-h-30 min-w-24',
                        'p-1',
                        'bg-white',
                        'rounded',
                        'shadow-md',
                        'overflow-y-auto overflow-x-hidden',
                        'z-[2000]',
                        'ai-content-operator-scroll',
                        className,
                    )}
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
            </div>
        </Portal>
    );
}
