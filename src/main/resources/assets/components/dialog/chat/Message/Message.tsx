import {ChatMessage} from '../../../../stores/data/ChatMessage';
import {MessageRole} from '../../../../stores/data/MessageType';
import AssistantMessage from '../AssistantMessage/AssistantMessage';
import SystemMessage from '../SystemMessage/SystemMessage';
import UserMessage from '../UserMessage/UserMessage';

type Props = {
    className?: string;
    message: ChatMessage;
    last: boolean;
};

export default function Message({className, message, last}: Props): React.ReactNode {
    switch (message.role) {
        case MessageRole.USER:
            return <UserMessage className={className} message={message} />;
        case MessageRole.SYSTEM:
            return <SystemMessage className={className} message={message} last={last} />;
        default:
            return <AssistantMessage className={className} message={message} last={last} />;
    }
}
