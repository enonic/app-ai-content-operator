import {twMerge} from 'tailwind-merge';

import AssistantIcon from '../../../base/AssistantIcon/AssistantIcon';
import LoadingIcon from '../../../base/LoadingIcon/LoadingIcon';

type Props = {
    className?: string;
};

export default function LoadingMessage({className}: Props): React.ReactNode {
    return (
        <div className={twMerge('flex gap-2', className)}>
            <AssistantIcon className='shrink-0 text-enonic-blue-400' animated />
            <article className='flex items-center'>
                <LoadingIcon className='w-8 h-2' />
            </article>
        </div>
    );
}
