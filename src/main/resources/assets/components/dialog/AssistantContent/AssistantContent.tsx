import ChatThread from '../chat/ChatThread/ChatThread';
import AssistantInput from '../input/AssistantInput/AssistantInput';

export default function AssistantContent(): React.ReactNode {
  return (
    <div className="AssistantContent flex h-[calc(100%-2.5rem)] w-full flex-col gap-2 pb-3">
      <ChatThread />
      <AssistantInput />
    </div>
  );
}
