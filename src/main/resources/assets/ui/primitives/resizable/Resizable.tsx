import clsx from 'clsx';
import { forwardRef, useCallback, useState } from 'react';

import type { CSSProperties, ForwardedRef, PropsWithChildren } from 'react';

import useIsTouchDevice from '../../../hooks/useIsTouchDevice';

export type Props = {
  className?: string;
  style?: CSSProperties;
  onStart?: () => void;
  onStop?: () => void;
  minWidth?: number;
  minHeight?: number;
} & PropsWithChildren;

const DEFAULT_MIN_SIZE = 360;

export default forwardRef(function Resizable(
  {
    className,
    children,
    onStart,
    onStop,
    minWidth = DEFAULT_MIN_SIZE,
    minHeight = DEFAULT_MIN_SIZE,
    style = {},
    ...props
  }: Props,
  ref: ForwardedRef<HTMLDivElement>,
): React.ReactNode {
  const isTouchDevice = useIsTouchDevice();
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const handleResizeStart = useCallback(
    (event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>): void => {
      if (!ref || !('current' in ref) || !ref.current) {
        return;
      }

      onStart?.();

      // Get initial positions and dimensions
      const isTouch = 'touches' in event;
      const initialPosition = isTouch
        ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
        : { x: event.clientX, y: event.clientY };

      const element = ref.current;
      const initialWidth = parseInt(window.getComputedStyle(element).width, 10);
      const initialHeight = parseInt(window.getComputedStyle(element).height, 10);

      const handleResize = (e: MouseEvent | TouchEvent): void => {
        const currentPosition =
          'touches' in e
            ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
            : { x: e.clientX, y: e.clientY };

        const newWidth = initialWidth + (currentPosition.x - initialPosition.x);
        if (newWidth >= minWidth) {
          setWidth(newWidth);
        }

        const newHeight = initialHeight + (currentPosition.y - initialPosition.y);
        if (newHeight >= minHeight) {
          setHeight(newHeight);
        }
      };

      const handleResizeEnd = (): void => {
        onStop?.();

        if (isTouch) {
          document.removeEventListener('touchmove', handleResize);
          document.removeEventListener('touchend', handleResizeEnd);
          document.removeEventListener('touchcancel', handleResizeEnd);
        } else {
          document.removeEventListener('mousemove', handleResize);
          document.removeEventListener('mouseup', handleResizeEnd);
        }
      };

      if (isTouch) {
        document.addEventListener('touchmove', handleResize, { passive: false });
        document.addEventListener('touchend', handleResizeEnd);
        document.addEventListener('touchcancel', handleResizeEnd);
      } else {
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', handleResizeEnd);
      }
    },
    [ref, minWidth, minHeight, onStart, onStop],
  );

  return (
    <div
      {...props}
      className={clsx('group/resize', className)}
      style={{ ...style, width, height }}
      ref={ref}
    >
      <button
        className={clsx(
          'absolute',
          'box-content',
          'flex justify-end',
          'right-0 bottom-0',
          'h-6 w-5 pr-1',
          'text-enonic-gray-400 text-3xl/[0.875rem]',
          'border-0 bg-transparent outline-none select-none focus:outline-none',
          !isTouchDevice && 'opacity-0',
          'cursor-nwse-resize',
          'transition-opacity group-hover/resize:opacity-100',
          'active:-right-4 active:-bottom-4 active:py-4 active:pr-5 active:pl-4 active:outline-none',
        )}
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeStart}
        tabIndex={-1}
        aria-label="Resize"
      >
        ⌟
      </button>
      {children}
    </div>
  );
});
