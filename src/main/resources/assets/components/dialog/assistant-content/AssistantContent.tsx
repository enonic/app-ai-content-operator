import ChatThread from '../chat/chat-thread/ChatThread';
import AssistantInput from '../input/assistant-input/AssistantInput';

export default function AssistantContent(): React.ReactNode {
  return (
    <div className="AssistantContent flex h-[calc(100%-2.5rem)] w-full flex-col gap-2 pb-3">
      <ChatThread />
      <AssistantInput />
    </div>
  );
}
