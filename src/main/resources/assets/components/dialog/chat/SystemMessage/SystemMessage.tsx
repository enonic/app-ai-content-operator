import {ReactNode} from 'react';
import {twJoin, twMerge} from 'tailwind-merge';

import AssistantIcon from '../../../shared/AssistantIcon/AssistantIcon';

type Props = {
    className?: string;
    children: ReactNode;
};

export default function SystemMessage({className, children}: Props): React.ReactNode {
    return (
        <div className={twMerge('flex gap-2', className)}>
            <AssistantIcon className='shrink-0 text-enonic-blue-light' />
            <article className={twJoin('pt-1 text-sm leading-6')}>{children}</article>
        </div>
    );
}
