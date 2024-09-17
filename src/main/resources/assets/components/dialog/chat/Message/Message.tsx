import {ChatMessage} from '../../../../stores/data/ChatMessage';
import {MessageType} from '../../../../stores/data/MessageType';
import AssistantMessage from '../AssistantMessage/AssistantMessage';
import UserMessage from '../UserMessage/UserMessage';

type Props = {
    className?: string;
    message: ChatMessage;
    last: boolean;
};

export default function Message({className, message, last}: Props): JSX.Element {
    return message.type === MessageType.USER ? (
        <UserMessage className={className}>{message.content.node}</UserMessage>
    ) : (
        <AssistantMessage className={className} message={message} last={last} />
    );
}
