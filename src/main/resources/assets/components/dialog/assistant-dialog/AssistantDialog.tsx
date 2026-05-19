import { cn, Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { useEffect, useRef } from 'react';

import { useDraggable } from '@/hooks/useDraggable';
import useIsTouchDevice from '@/hooks/useIsTouchDevice';
import { useResizable } from '@/hooks/useResizable';
import { useShadowHost } from '@/shadow/ShadowHostContext';
import { $dialog, setDialogDragging, setDialogHidden } from '@/store/dialog';
import { clearTarget } from '@/store/editor';
import { mountWebSocket } from '@/store/websocket';

import { AssistantContent } from '../assistant-content/AssistantContent';
import { AssistantHeader } from '../header/assistant-header/AssistantHeader';
import { MENTIONS_LIST_NAME } from '../input/prompt/mentions-list/MentionsList';

const ASSISTANT_DIALOG_NAME = 'AssistantDialog';

export type AssistantDialogProps = {
  className?: string;
};

const DRAGGING_BODY_CLASS = 'ai-content-operator-dragging';

export const AssistantDialog = ({ className = '' }: AssistantDialogProps): React.ReactNode => {
  const contentRef = useRef<HTMLDivElement>(null);

  const shadowHost = useShadowHost();

  const { hidden, dragging } = useStore($dialog, { keys: ['hidden', 'dragging'] });

  const isTouchDevice = useIsTouchDevice();

  const handleInteractionStart = (): void => {
    setDialogDragging(true);
    clearTarget();
    document.body.classList.add(DRAGGING_BODY_CLASS);
  };

  const handleInteractionStop = (): void => {
    setDialogDragging(false);
    document.body.classList.remove(DRAGGING_BODY_CLASS);
  };

  const { onDragStart } = useDraggable(contentRef, {
    onStart: handleInteractionStart,
    onStop: handleInteractionStop,
  });

  const { onResizeStart } = useResizable(contentRef, {
    onStart: handleInteractionStart,
    onStop: handleInteractionStop,
  });

  useEffect(() => {
    if (!hidden) {
      return mountWebSocket();
    }
  }, [hidden]);

  useEffect(() => {
    if (hidden) return;

    const handleClickOutside = (event: MouseEvent): void => {
      if (!contentRef.current) return;

      // ! composedPath pierces the shadow root; event.target retargets to the host outside it
      const path = event.composedPath();
      const insideDialog = path.includes(contentRef.current);
      const insideMentionsList = path.some(
        (node) =>
          node instanceof HTMLElement && node.dataset.component === MENTIONS_LIST_NAME,
      );

      if (!insideDialog && !insideMentionsList) {
        clearTarget();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hidden]);

  return (
    <Dialog.Root
      open={!hidden}
      onOpenChange={(open) => {
        if (!open) {
          setDialogHidden(true);
        }
      }}
    >
      <Dialog.Portal container={shadowHost ?? undefined}>
        <Dialog.Content
          ref={contentRef}
          data-component={ASSISTANT_DIALOG_NAME}
          modal={false}
          className={cn(
            ASSISTANT_DIALOG_NAME,
            'group/resize',
            'flex flex-col overflow-hidden',
            'h-svh max-h-svh w-svw max-w-svw',
            'sm:w-lg md:w-xl lg:w-2xl',
            'sm:h-128 md:h-144 lg:h-168',
            'sm:max-h-[calc(100svh-4rem)]',
            'leading-initial rounded-2xl border p-5 pt-0 text-base shadow-xl',
            dragging && 'bg-surface-neutral/20 backdrop-blur-xs select-none',
            className,
          )}
        >
          <AssistantHeader onDragStart={onDragStart} />
          <AssistantContent />
          <button
            type="button"
            tabIndex={-1}
            aria-label="Resize"
            className={cn(
              'absolute right-0 bottom-0',
              'box-content flex h-6 w-5 justify-end pr-1',
              'text-subtle text-3xl/[0.875rem]',
              'cursor-nwse-resize border-0 bg-transparent outline-none select-none focus:outline-none',
              'transition-opacity group-hover/resize:opacity-100',
              !isTouchDevice && 'opacity-0',
              'active:-right-4 active:-bottom-4 active:py-4 active:pr-5 active:pl-4',
            )}
            onMouseDown={onResizeStart}
            onTouchStart={onResizeStart}
          >
            ⌟
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
AssistantDialog.displayName = ASSISTANT_DIALOG_NAME;
