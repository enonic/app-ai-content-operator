import clsx from 'clsx';
import {twMerge} from 'tailwind-merge';

import ApplyControl from '../ApplyControl/ApplyControl';
import CopyControl from '../CopyControl/CopyControl';

type Props = {
    className?: string;
    name: string;
    content: string;
};

export default function ElementItemControls({className, name, content}: Props): JSX.Element {
    return (
        <div
            className={twMerge(
                clsx([
                    'inline-flex justify-end items-center',
                    'ml-auto',
                    'divide-x rounded',
                    'overflow-hidden',
                    'shadow',
                    className,
                ]),
            )}
        >
            <CopyControl className='rounded-none' key='copy' content={content} />
            <ApplyControl className='rounded-none' key='apply' name={name} content={content} />
        </div>
    );
}
