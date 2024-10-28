import clsx from 'clsx';
import {forwardRef} from 'react';
import {twMerge} from 'tailwind-merge';

import Icon, {IconName} from '../Icon/Icon';

type Props = {
    className?: string;
    disabled?: boolean;
    name: string;
    icon?: IconName;
    mode?: 'icon-only' | 'compact' | 'full' | 'text-only';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    clickHandler?: React.MouseEventHandler;
    ref?: React.RefObject<HTMLButtonElement>;
};

export default forwardRef(function ActionButton(
    {className, disabled, name, icon, mode = 'full', size = 'sm', clickHandler}: Props,
    ref: React.Ref<HTMLButtonElement>,
): React.ReactNode {
    const isFull = mode === 'full';
    const hasText = isFull || mode === 'text-only';

    return (
        <button
            title={mode === 'compact' ? name : ''}
            onClick={clickHandler}
            className={twMerge(
                clsx(
                    'inline-flex justify-center items-center',
                    'max-w-40',
                    {
                        xs: hasText ? 'h-4 px-1' : 'h-4 p-0.5',
                        sm: hasText ? 'h-6 px-1.5' : 'h-6 p-1',
                        md: hasText ? 'h-8 px-2' : 'h-8 p-1.5',
                        lg: hasText ? 'h-10 px-3' : 'h-10 p-2',
                        xl: hasText ? 'h-12 px-4' : 'h-12 p-2',
                    }[size],
                    size === 'xs' ? 'rounded-sm' : 'rounded',
                    'enabled:hover:bg-gray-100',
                    'disabled:opacity-50',
                    className,
                ),
            )}
            disabled={!clickHandler || disabled}
            ref={ref}
        >
            {icon && mode !== 'text-only' && (
                <Icon
                    name={icon}
                    className={twMerge(
                        clsx(
                            'shrink-0',
                            {
                                xs: isFull ? 'w-2 h-2' : 'w-3 h-3',
                                sm: isFull ? 'w-3 h-3' : 'w-4 h-4',
                                md: isFull ? 'w-3 h-3' : 'w-5 h-5',
                                lg: isFull ? 'w-4 h-4' : 'w-6 h-6',
                                xl: isFull ? 'w-5 h-5' : 'w-8 h-8',
                            }[size],
                        ),
                    )}
                />
            )}
            <span
                className={clsx(
                    'truncate',
                    {'pl-1': mode !== 'text-only'},
                    {'sr-only': !hasText},
                    {
                        xs: 'text-xs',
                        sm: 'text-sm',
                        md: 'text-base',
                        lg: 'text-base',
                        xl: 'text-lg',
                    }[size],
                )}
            >
                {name}
            </span>
        </button>
    );
});
