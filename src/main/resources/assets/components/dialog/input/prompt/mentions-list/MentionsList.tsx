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
  handleClick: (mention: Mention) => void;
};

export const MentionsList = ({
  className,
  targetRect,
  mentions,
  selectedIndex,
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
          const widths = buttonRefs.current.map((button) => button?.offsetWidth ?? 0);
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
      <div className="ai-content-operator">
        <div
          ref={ref}
          data-component={MENTIONS_LIST_NAME}
          className={cn(
            MENTIONS_LIST_NAME,
            'absolute',
            !targetRect && 'hidden',
            'box-content',
            'flex flex-col',
            'max-h-30 max-w-96 min-w-24',
            'p-1',
            'bg-surface-neutral',
            'rounded',
            'shadow-md',
            'overflow-x-hidden overflow-y-auto',
            'z-2000',
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
                onClick={() => handleClick(mention)}
                title={mention.prettified !== mention.label ? mention.prettified : undefined}
                className={cn(
                  'block',
                  'flex-none',
                  'h-6',
                  'px-2 py-0.5',
                  'truncate',
                  'rounded-sm',
                  'hover:bg-surface-neutral-hover',
                  i === selectedIndex && 'bg-muted hover:bg-muted',
                  i !== selectedIndex && 'hover:bg-surface-neutral-hover',
                  'text-left text-sm',
                  mention.path === MENTION_ALL.path && "before:content-['<'] after:content-['>']",
                )}
              >
                {mention.label}
              </button>
            ))
          ) : (
            <div className="text-subtle flex h-6 items-center px-2 text-sm select-none">
              {t('text.mentions.notFound')}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
};
MentionsList.displayName = MENTIONS_LIST_NAME;
