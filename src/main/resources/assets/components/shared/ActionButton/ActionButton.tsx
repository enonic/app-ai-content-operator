import clsx from 'clsx';
import {twMerge} from 'tailwind-merge';

import Icon, {IconNameOrOptions} from '../Icon/Icon';

type Props = {
    className?: string;
    disabled?: boolean;
    name: string;
    icon: IconNameOrOptions;
    mode?: 'icon-only' | 'compact' | 'full';
    size?: 'tiny' | 'small' | 'medium' | 'large';
    handleClick?: React.MouseEventHandler;
};

export default function ActionButton({
    className,
    disabled,
    name,
    icon,
    mode = 'full',
    size = 'small',
    handleClick,
}: Props): JSX.Element {
    const compact = mode === 'compact';
    const full = mode === 'full';

    return (
        <button
            title={compact ? name : ''}
            onClick={handleClick}
            className={twMerge(
                clsx([
                    'inline-flex justify-center items-center',
                    'max-w-40',
                    {'h-6 p-1': size === 'small', 'h-8 p-1': size === 'medium', 'h-12 p-2': size === 'large'},
                    {'pr-2': full},
                    'rounded',
                    'enabled:hover:bg-gray-100',
                    'disabled:opacity-50',
                    className,
                ]),
            )}
            disabled={!handleClick || disabled}
        >
            <Icon
                name={typeof icon === 'string' ? icon : icon.name}
                type={typeof icon === 'string' ? undefined : icon.type}
                className={clsx([
                    'shrink-0',
                    {
                        'w-3 h-3': size === 'tiny',
                        'w-4 h-4': size === 'small',
                        'w-6 h-6': size === 'medium',
                        'w-8 h-8': size === 'large',
                    },
                ])}
            />
            <span
                className={clsx([
                    'pl-1',
                    'truncate',
                    {'text-xs': size === 'small', 'text-sm': size === 'medium', 'text-base': size === 'large'},
                    {'sr-only': !full},
                ])}
            >
                {name}
            </span>
        </button>
    );
}
