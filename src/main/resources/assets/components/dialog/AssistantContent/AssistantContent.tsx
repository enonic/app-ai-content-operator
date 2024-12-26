import ChatThread from '../chat/ChatThread/ChatThread';
import AssistantInput from '../input/AssistantInput/AssistantInput';

export default function AssistantContent(): React.ReactNode {
    return (
        <div className='AssistantContent flex flex-col gap-2 pb-3 w-full h-[calc(100%-2.5rem)]'>
            <ChatThread />
            <AssistantInput />
        </div>
    );
}
