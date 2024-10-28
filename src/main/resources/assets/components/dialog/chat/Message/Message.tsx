import {ChatMessage} from '../../../../stores/data/ChatMessage';
import {MessageRole} from '../../../../stores/data/MessageType';
import AssistantMessage from '../AssistantMessage/AssistantMessage';
import UserMessage from '../UserMessage/UserMessage';

type Props = {
    className?: string;
    message: ChatMessage;
    last: boolean;
};

export default function Message({className, message, last}: Props): React.ReactNode {
    return message.role === MessageRole.USER ? (
        <UserMessage className={className}>{message.content.node}</UserMessage>
    ) : (
        <AssistantMessage className={className} message={message} last={last} />
    );
}
