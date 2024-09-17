import clsx from 'clsx';
import {twMerge} from 'tailwind-merge';

import Icon, {IconNameOrOptions} from '../Icon/Icon';

type Props<T extends string> = {
    className?: string;
    group: string;
    icon: IconNameOrOptions;
    name: string;
    description?: string;
    value: T;
    checked?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    changeHandler: (value: T) => void;
};

export default function RadioOption<T extends string>({
    className,
    group,
    icon,
    name,
    description,
    value,
    checked,
    disabled,
    readOnly,
    changeHandler,
}: Props<T>): JSX.Element {
    return (
        <label
            className={twMerge(
                clsx([
                    'inline-grid grid-cols-mid-3 gap-x-2 items-center',
                    description ? 'gap-y-1' : 'gap-y-0',
                    'px-4 py-2',
                    'rounded',
                    {'cursor-pointer hover:bg-gray-100': !disabled && !readOnly},
                    {'opacity-50': disabled},
                    {'outline outline-2 outline-enonic-blue -outline-offset-2': checked},
                    className,
                ]),
            )}
        >
            <input
                className='sr-only'
                type='radio'
                name={group}
                value={value}
                checked={checked}
                aria-checked={checked}
                disabled={disabled}
                readOnly={readOnly}
                onChange={e => changeHandler(e.currentTarget.value as T)}
            />

            <Icon
                className='w-6 h-6 col-span-1 row-span-2'
                name={typeof icon === 'string' ? icon : icon.name}
                type={typeof icon === 'string' ? undefined : icon.type}
            />

            <h4
                className={clsx([
                    'inline-flex items-center',
                    'col-span-1 col-start-2 row-start-1',
                    description ? 'self-end row-span-1' : 'row-span-2',
                ])}
            >
                {name}
            </h4>

            {description && (
                <p
                    className={clsx([
                        'text-enonic-gray',
                        'self-start',
                        'col-span-1 col-start-2 row-span-1 row-start-2',
                    ])}
                >
                    {description}
                </p>
            )}

            <Icon
                className={clsx(['w-4 h-4 text-enonic-blue', 'col-span-1 row-span-2', {invisible: !checked}])}
                name='checkCircle'
                type={'solid'}
            />
        </label>
    );
}
