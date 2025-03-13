import {twMerge} from 'tailwind-merge';

import {dispatchInteracted} from '../../../../common/events';
import {UserChatMessage} from '../../../../stores/data/ChatMessage';

type Props = {
    className?: string;
    message: UserChatMessage;
};

export default function UserMessage({className, message}: Props): React.ReactNode {
    const contextData = message.content.contextData;

    return (
        <div className={twMerge('flex pl-10', className)}>
            <article className='max-w-4/5 ml-auto p-3 text-sm rounded-[1.5rem] bg-enonic-gray-100 leading-6'>
                {contextData && (
                    <button
                        className='-mx-1 px-1 align-baseline cursor-pointer text-sky-600 truncate'
                        title={contextData.title}
                        onClick={() => dispatchInteracted(contextData?.name)}
                    >
                        <span className='text-xs'>{contextData.displayName}</span>
                    </button>
                )}
                {message.content.node}
            </article>
        </div>
    );
}
