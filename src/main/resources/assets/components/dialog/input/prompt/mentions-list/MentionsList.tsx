import { cn } from '@enonic/ui';
import { t } from 'i18next';
import { useEffect, useRef } from 'react';

import { MENTION_ALL } from '@/common/mentions';
import { Portal } from '@/ui/primitives/portal/Portal';

import type { Mention } from '@/store/content';

export const MENTIONS_LIST_NAME = 'MentionsList';

export type MentionsListProps = {
  className?: string;
  mentions: Mention[];
  selectedIndex: number;
  targetRect?: DOMRect;
  setSelectedIndex: (index: number) => void;
  handleClick: (mention: Mention) => void;
};

export const MentionsList = ({
  className,
  targetRect,
  mentions,
  selectedIndex,
  setSelectedIndex,
  handleClick,
}: MentionsListProps): React.ReactNode => {
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
      list.style.width = 'auto';
      list.style.top = '';
      list.style.left = '';

      requestAnimationFrame(() => {
        if (buttonRefs.current.length > 0 && mentions.length > 0) {
          const widths = buttonRefs.current.map((button) => button?.offsetWidth ?? 0);
          const maxWidth = Math.max(...widths);
          list.style.width = `${maxWidth + 16}px`;
        }

        // ! Measure after width is set — flex gap-y-1 contributes height the block layout would miss
        const listRect = list.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const spaceBelow = viewportHeight - targetRect.bottom;
        const spaceAbove = targetRect.top;
        const spaceRight = viewportWidth - targetRect.left;

        let top: number;
        let left: number;

        if (spaceBelow >= listRect.height || spaceBelow >= spaceAbove) {
          top = targetRect.bottom + window.scrollY;
        } else {
          top = targetRect.top + window.scrollY - listRect.height;
        }

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
      <div
        ref={ref}
        data-component={MENTIONS_LIST_NAME}
        className={cn(
          MENTIONS_LIST_NAME,
          'absolute',
          !targetRect && 'hidden',
          'box-content',
          'flex flex-col items-start gap-y-1',
          'max-h-30 max-w-96 min-w-24',
          'p-1',
          'rounded-sm border border-bdr-subtle',
          'bg-surface-neutral',
          'shadow-lg outline-none',
          'overflow-x-hidden overflow-y-auto',
          'z-50',
          'ai-content-operator-scroll',
          className,
        )}
      >
        {hasMentions ? (
          mentions.map((mention, i) => (
            <button
              key={mention.path}
              ref={(el) => {
                buttonRefs.current[i] = el;
              }}
              // ! Keep editor focused so the cursor lands after the inserted mention, not at position 0
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleClick(mention)}
              onPointerMove={() => {
                if (i !== selectedIndex) setSelectedIndex(i);
              }}
              title={mention.prettified !== mention.label ? mention.prettified : undefined}
              className={cn(
                'relative z-0',
                'block flex-none w-full px-4.5 py-1',
                'cursor-pointer outline-none transition-highlight',
                'text-left font-semibold truncate',
                i === selectedIndex
                  ? 'bg-muted ring-3 ring-ring-offset ring-inset ring-offset-3 ring-offset-ring'
                  : 'hover:bg-surface-neutral-hover',
                mention.path === MENTION_ALL.path && "before:content-['<'] after:content-['>']",
              )}
            >
              {mention.label}
            </button>
          ))
        ) : (
          <div className="text-subtle w-full px-4.5 py-1 select-none">
            {t('text.mentions.notFound')}
          </div>
        )}
      </div>
    </Portal>
  );
};
MentionsList.displayName = MENTIONS_LIST_NAME;
