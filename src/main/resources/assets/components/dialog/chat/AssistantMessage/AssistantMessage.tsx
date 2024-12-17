import {twJoin, twMerge} from 'tailwind-merge';

import {ModelChatMessage, ModelChatMessageContent} from '../../../../stores/data/ChatMessage';
import AssistantIcon from '../../../base/AssistantIcon/AssistantIcon';
import {AssistantMessageList} from '../AssistantMessageList/AssistantMessageList';
import AssistantMessagePlaceholder from '../AssistantMessagePlaceholder/AssistantMessagePlaceholder';
import AssistantMessageControls from '../controls/AssistantMessageControls/AssistantMessageControls';

type Props = {
    className?: string;
    message: ModelChatMessage;
    last: boolean;
};

const hasGenerationResult = (content: ModelChatMessageContent): content is Required<ModelChatMessageContent> => {
    return content.generationResult != null;
};

export default function AssistantMessage({className, message, last}: Props): React.ReactNode {
    const {id: messageId, for: forId, content} = message;
    const isGenerating = !hasGenerationResult(content);

    return (
        <div className={twMerge('flex gap-2', className)}>
            <AssistantIcon className={twJoin('shrink-0 text-enonic-blue-400', !isGenerating && 'mt-3 ')} />
            <article className={twJoin('flex flex-col flex-1', !isGenerating && 'gap-1 text-sm')}>
                {isGenerating ? (
                    <AssistantMessagePlaceholder content={content} />
                ) : (
                    <>
                        <AssistantMessageList messageId={messageId} content={content} last={last} />
                        <AssistantMessageControls forId={forId} content={content} last={last} />
                    </>
                )}
            </article>
        </div>
    );
}
