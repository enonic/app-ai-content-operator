import { cn, Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { useEffect, useRef, useState } from 'react';

import { useDraggable } from '@/hooks/useDraggable';
import useIsTouchDevice from '@/hooks/useIsTouchDevice';
import { useResizable } from '@/hooks/useResizable';
import { $dialog, setDialogHidden } from '@/store/dialog';
import { clearTarget } from '@/store/editor';
import { mountWebSocket } from '@/store/websocket';

import AssistantContent from '../assistant-content/AssistantContent';
import AssistantHeader from '../header/assistant-header/AssistantHeader';
import './AssistantDialog.css';

const ASSISTANT_DIALOG_NAME = 'AssistantDialog';

export type Props = {
  container?: HTMLElement;
  className?: string;
};

const DRAGGING_BODY_CLASS = 'ai-content-operator-dragging';

export default function AssistantDialog({ container, className = '' }: Props): React.ReactNode {
  const contentRef = useRef<HTMLDivElement>(null);

  const { hidden } = useStore($dialog, { keys: ['hidden'] });

  const [dragging, setDragging] = useState(false);
  const isTouchDevice = useIsTouchDevice();

  const handleInteractionStart = (): void => {
    setDragging(true);
    clearTarget();
    document.body.classList.add(DRAGGING_BODY_CLASS);
  };

  const handleInteractionStop = (): void => {
    setDragging(false);
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
      if (
        event.target instanceof HTMLElement &&
        contentRef.current &&
        !contentRef.current.contains(event.target) &&
        !event.target.classList.contains('EnonicAiMentionsList') &&
        !document.querySelector('.EnonicAiMentionsList')?.contains(event.target)
      ) {
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
      <Dialog.Portal container={container}>
        <Dialog.Content
          ref={contentRef}
          data-component={ASSISTANT_DIALOG_NAME}
          className={cn(
            ASSISTANT_DIALOG_NAME,
            'group/resize pointer-events-auto',
            'flex flex-col overflow-hidden',
            'leading-initial rounded-lg border px-5 pb-10 text-base shadow-xl',
            dragging && 'opacity-80 select-none',
            className,
          )}
        >
          <AssistantHeader dragging={dragging} onDragStart={onDragStart} />
          <AssistantContent />
          <button
            type="button"
            tabIndex={-1}
            aria-label="Resize"
            className={cn(
              'absolute right-0 bottom-0',
              'box-content flex h-6 w-5 justify-end pr-1',
              'text-decorative text-3xl/[0.875rem]',
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
}
