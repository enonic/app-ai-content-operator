import { useCallback, useEffect } from 'react';

type Point = { x: number; y: number };

export type UseResizableOptions = {
  minWidth?: number;
  minHeight?: number;
  onStart?: () => void;
  onStop?: () => void;
};

export type UseResizableResult = {
  onResizeStart: (event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
};

const DEFAULT_MIN_SIZE = 360;

const getPoint = (event: MouseEvent | TouchEvent): Point => {
  if ('touches' in event) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
  return { x: event.clientX, y: event.clientY };
};

export const useResizable = (
  nodeRef: React.RefObject<HTMLElement | null>,
  {
    minWidth = DEFAULT_MIN_SIZE,
    minHeight = DEFAULT_MIN_SIZE,
    onStart,
    onStop,
  }: UseResizableOptions = {},
): UseResizableResult => {
  const onResizeStart = useCallback(
    (event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>): void => {
      const node = nodeRef.current;
      if (node == null) return;

      onStart?.();

      const isTouch = 'touches' in event;
      const start = getPoint(event);
      const style = window.getComputedStyle(node);
      const initialWidth = parseInt(style.width, 10);
      const initialHeight = parseInt(style.height, 10);

      const handleMove = (moveEvent: MouseEvent | TouchEvent): void => {
        const point = getPoint(moveEvent);
        const nextWidth = initialWidth + (point.x - start.x);
        const nextHeight = initialHeight + (point.y - start.y);
        node.style.width = `${Math.max(nextWidth, minWidth)}px`;
        node.style.height = `${Math.max(nextHeight, minHeight)}px`;
      };

      const handleEnd = (): void => {
        onStop?.();
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
        document.removeEventListener('touchcancel', handleEnd);
      };

      if (isTouch) {
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd);
        document.addEventListener('touchcancel', handleEnd);
      } else {
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
      }
    },
    [nodeRef, minWidth, minHeight, onStart, onStop],
  );

  useEffect(() => {
    const handleViewportResize = (): void => {
      const node = nodeRef.current;
      if (node == null) return;
      node.style.removeProperty('width');
      node.style.removeProperty('height');
    };
    window.addEventListener('resize', handleViewportResize);
    return () => window.removeEventListener('resize', handleViewportResize);
  }, [nodeRef]);

  return { onResizeStart };
};
