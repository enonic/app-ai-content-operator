import {ReactNode} from 'react';
import {twMerge} from 'tailwind-merge';

type Props = {
    className?: string;
    children: ReactNode;
};

export default function UserMessage({className, children}: Props): JSX.Element {
    return (
        <div className={twMerge('flex pl-10', className)}>
            <article className='max-w-4/5 ml-auto p-3 rounded-[1.5rem] bg-enonic-gray-400er leading-6'>
                {children}
            </article>
        </div>
    );
}
