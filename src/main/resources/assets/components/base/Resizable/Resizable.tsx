import clsx from 'clsx';
import {CSSProperties, ForwardedRef, forwardRef, PropsWithChildren, useCallback, useState} from 'react';

export type Props = {
    className?: string;
    style?: CSSProperties;
    onStart?: () => void;
    onStop?: () => void;
} & PropsWithChildren;

const MIN_SIZE = 360;

export default forwardRef(function Resizable(
    {className, children, onStart, onStop, style = {}, ...props}: Props,
    ref: ForwardedRef<HTMLDivElement>,
): React.ReactNode {
    const [width, setWidth] = useState<number | undefined>(undefined);
    const [height, setHeight] = useState<number | undefined>(undefined);

    const rsMouseDownHandler = useCallback(
        (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
            if (!ref || !('current' in ref) || !ref.current) {
                return;
            }

            onStart?.();

            const x = e.clientX;
            const initialWidth = parseInt(window.getComputedStyle(ref.current).width, 10);

            const y = e.clientY;
            const initialHeight = parseInt(window.getComputedStyle(ref.current).height, 10);

            const mouseMoveHandler = (e: MouseEvent): void => {
                const newWidth = initialWidth + (e.clientX - x);
                if (newWidth >= MIN_SIZE) {
                    setWidth(newWidth);
                }

                const newHeight = initialHeight + (e.clientY - y);
                if (newHeight >= MIN_SIZE) {
                    setHeight(newHeight);
                }
            };

            const mouseUpHandler = (): void => {
                onStop?.();
                document.removeEventListener('mouseup', mouseUpHandler);
                document.removeEventListener('mousemove', mouseMoveHandler);
            };

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        },
        [ref],
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
                    'opacity-0 cursor-nwse-resize',
                    'group-hover/resize:opacity-100 transition-opacity',
                    'active:-bottom-4 active:-right-4 active:pl-4 active:pr-5 active:py-4 active:outline-none',
                )}
                onMouseDown={rsMouseDownHandler}
                tabIndex={-1}
            >
                ⌟
            </button>
            {children}
        </div>
    );
});
