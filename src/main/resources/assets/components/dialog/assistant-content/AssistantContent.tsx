import ChatThread from '../chat/chat-thread/ChatThread';
import AssistantInput from '../input/assistant-input/AssistantInput';

const ASSISTANT_CONTENT_NAME = 'AssistantContent';

export default function AssistantContent(): React.ReactNode {
  return (
    <div
      data-component={ASSISTANT_CONTENT_NAME}
      className={`${ASSISTANT_CONTENT_NAME} flex min-h-0 w-full flex-1 flex-col gap-2 pt-7`}
    >
      <ChatThread />
      <AssistantInput />
    </div>
  );
}
