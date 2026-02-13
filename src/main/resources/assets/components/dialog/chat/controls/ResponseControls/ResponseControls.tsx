import {useStore} from '@nanostores/react';
import {twMerge} from 'tailwind-merge';

import {SPECIAL_NAMES} from '../../../../../../shared/enums';
import {$messages} from '../../../../../stores/chat';
import {
    ChatMessage,
    ModelChatMessage,
    SystemChatMessage,
    UserChatMessage,
} from '../../../../../stores/data/ChatMessage';
import {MessageRole} from '../../../../../stores/data/MessageType';
import {$licenseState} from '../../../../../stores/license';
import {$isBusy, $isConnected} from '../../../../../stores/websocket';
import ApplyAllControl from '../ApplyAllControl/ApplyAllControl';
import MessageSwitchControls from '../MessageSwitchControls/MessageSwitchControls';
import RetryControl from '../RetryControl/RetryControl';

export type Props = {
    className?: string;
    message: ModelChatMessage | SystemChatMessage;
    last: boolean;
};

function canApplyAnyContent(message: ModelChatMessage | SystemChatMessage): message is ModelChatMessage {
    if (message.role !== MessageRole.MODEL || message.content.generationResult == null) {
        return false;
    }

    const {generationResult} = message.content;
    const keys = Object.keys(generationResult);

    return keys.length > 0 && keys.indexOf(SPECIAL_NAMES.common) === -1;
}

function findUserMessageById(messages: Record<string, ChatMessage>, id: string): Optional<Readonly<UserChatMessage>> {
    const message = messages[id];
    return message != null && message.role === MessageRole.USER ? message : undefined;
}

export default function ResponseControls({className, message, last}: Props): React.ReactNode {
    const messages = useStore($messages);
    const prevId = message?.prevId;
    const userMessage = prevId ? findUserMessageById(messages, prevId) : undefined;

    const options = userMessage?.nextIds;
    const userMessageId = userMessage?.id;

    const isConnected = useStore($isConnected);
    const isBusy = useStore($isBusy);
    const isLastAndAvailable = last && !isBusy;
    const licenseState = useStore($licenseState);

    const isRetryAvailable = isLastAndAvailable && userMessageId && licenseState === 'OK';
    const isApplyAllAvailable = isLastAndAvailable && canApplyAnyContent(message);
    const isSwitchAvailable = isLastAndAvailable && options != null && options.length > 1;

    return (
        <div className={twMerge('flex empty:hidden', className)}>
            {isRetryAvailable && <RetryControl userMessageId={userMessageId} disabled={!isConnected} />}
            {isApplyAllAvailable && <ApplyAllControl content={message.content} />}
            {isSwitchAvailable && <MessageSwitchControls className='ml-auto' ids={options} selectedId={message.id} />}
        </div>
    );
}
