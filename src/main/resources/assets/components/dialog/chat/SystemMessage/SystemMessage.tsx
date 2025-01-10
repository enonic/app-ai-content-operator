import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {SystemChatMessage} from '../../../../stores/data/ChatMessage';
import AssistantIcon from '../../../base/AssistantIcon/AssistantIcon';
import ResponseControls from '../controls/ResponseControls/ResponseControls';

type Props = {
    className?: string;
    message: SystemChatMessage;
    last: boolean;
};

export default function SystemMessage({className, message, last}: Props): React.ReactNode {
    const {t} = useTranslation();

    const {type, node} = message.content;

    return (
        <div className={twMerge('flex gap-2', className)}>
            <AssistantIcon className='shrink-0 text-enonic-blue-400' />
            <article className='flex flex-col flex-1 gap-3'>
                <div className='pt-1 text-sm leading-6'>
                    {type === 'error' ? (
                        <div className='flex flex-col gap-x-2 gap-y-1'>
                            <div className='align-baseline text-red-600 truncate text-xs'>
                                {t('field.message.error')}
                            </div>
                            <div className='relative col-span-2'>{node}</div>
                        </div>
                    ) : (
                        node
                    )}
                </div>
                <ResponseControls message={message} last={last} />
            </article>
        </div>
    );
}
