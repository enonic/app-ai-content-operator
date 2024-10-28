import {useStore} from '@nanostores/react';
import clsx from 'clsx';
import {twMerge} from 'tailwind-merge';

import {$config} from '../../../stores/config';

type Props = {
    className?: string;
};

export default function UserIcon({className}: Props): React.ReactNode {
    const {user} = useStore($config, {keys: ['user']});
    return (
        <div
            className={twMerge(
                clsx(
                    'flex justify-center items-center',
                    'w-8 h-8',
                    'text-xs',
                    'rounded-full',
                    'text-white',
                    'bg-black',
                    className,
                ),
            )}
        >
            {user.shortName}
        </div>
    );
}
