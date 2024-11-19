import {twMerge} from 'tailwind-merge';

import AssistantInput from '../../input/AssistantInput/AssistantInput';
import ChatThread from '../ChatThread/ChatThread';
import ContextControl from '../ContextControls/ContextControls';

type Props = {
    className?: string;
};

export default function ChatContainer({className}: Props): React.ReactNode {
    return (
        <div className={twMerge('ChatContainer flex flex-col gap-2 pb-3', className)}>
            <ChatThread />
            <ContextControl />
            <AssistantInput />
        </div>
    );
}
