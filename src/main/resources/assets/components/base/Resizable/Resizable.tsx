import clsx from 'clsx';
import {CSSProperties, ForwardedRef, forwardRef, PropsWithChildren, useCallback, useState} from 'react';

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
        (event: React.MouseEvent | React.TouchEvent): void => {
            if (!ref || !('current' in ref) || !ref.current) {
                return;
            }

            onStart?.();

            // Get initial positions and dimensions
            const isTouch = 'touches' in event;
            const initialPosition = isTouch
                ? {x: event.touches[0].clientX, y: event.touches[0].clientY}
                : {x: event.clientX, y: event.clientY};

            const element = ref.current;
            const initialWidth = parseInt(window.getComputedStyle(element).width, 10);
            const initialHeight = parseInt(window.getComputedStyle(element).height, 10);

            const handleResize = (e: MouseEvent | TouchEvent): void => {
                const currentPosition =
                    'touches' in e ? {x: e.touches[0].clientX, y: e.touches[0].clientY} : {x: e.clientX, y: e.clientY};

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
                document.addEventListener('touchmove', handleResize, {passive: false});
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
        <div {...props} className={clsx('group/resize', className)} style={{...style, width, height}} ref={ref}>
            <button
                className={clsx(
                    'absolute',
                    'box-content',
                    'flex justify-end',
                    'bottom-0 right-0',
                    'w-5 h-6 pr-1',
                    'text-3xl/3.5 text-enonic-gray-400',
                    'border-0 bg-transparent select-none outline-none focus:outline-none',
                    !isTouchDevice && 'opacity-0',
                    'cursor-nwse-resize',
                    'group-hover/resize:opacity-100 transition-opacity',
                    'active:-bottom-4 active:-right-4 active:pl-4 active:pr-5 active:py-4 active:outline-none',
                )}
                onMouseDown={handleResizeStart}
                onTouchStart={handleResizeStart}
                tabIndex={-1}
                aria-label='Resize'
            >
                ⌟
            </button>
            {children}
        </div>
    );
});
