import { useCallback, useEffect, useRef } from 'react';

type Point = { x: number; y: number };

export type UseDraggableOptions = {
  onStart?: () => void;
  onStop?: () => void;
};

export type UseDraggableResult = {
  onDragStart: (event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
};

const getPoint = (event: MouseEvent | TouchEvent): Point => {
  if ('touches' in event) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
  return { x: event.clientX, y: event.clientY };
};

export const useDraggable = (
  nodeRef: React.RefObject<HTMLElement | null>,
  { onStart, onStop }: UseDraggableOptions = {},
): UseDraggableResult => {
  const offset = useRef<Point>({ x: 0, y: 0 });

  const onDragStart = useCallback(
    (event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>): void => {
      const node = nodeRef.current;
      if (node == null) return;

      onStart?.();

      const isTouch = 'touches' in event;
      const start = getPoint(event);
      const origin = { ...offset.current };

      const handleMove = (moveEvent: MouseEvent | TouchEvent): void => {
        const point = getPoint(moveEvent);
        offset.current = {
          x: origin.x + (point.x - start.x),
          y: origin.y + (point.y - start.y),
        };
        node.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px)`;
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
    [nodeRef, onStart, onStop],
  );

  useEffect(() => {
    const handleViewportResize = (): void => {
      offset.current = { x: 0, y: 0 };
      nodeRef.current?.style.removeProperty('transform');
    };
    window.addEventListener('resize', handleViewportResize);
    return () => window.removeEventListener('resize', handleViewportResize);
  }, [nodeRef]);

  return { onDragStart };
};
