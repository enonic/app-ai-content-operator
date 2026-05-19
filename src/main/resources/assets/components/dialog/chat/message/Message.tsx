import { MessageRole } from '@/store/content';

import type { ChatMessage } from '@/store/content';

import { AssistantMessage } from '../assistant-message/AssistantMessage';
import { SystemMessage } from '../system-message/SystemMessage';
import { UserMessage } from '../user-message/UserMessage';

const MESSAGE_NAME = 'Message';

export type MessageProps = {
  className?: string;
  message: ChatMessage;
  last: boolean;
};

export const Message = ({ className, message, last }: MessageProps): React.ReactNode => {
  switch (message.role) {
    case MessageRole.USER:
      return <UserMessage className={className} message={message} />;
    case MessageRole.SYSTEM:
      return <SystemMessage className={className} message={message} last={last} />;
    default:
      return <AssistantMessage className={className} message={message} last={last} />;
  }
};
Message.displayName = MESSAGE_NAME;
