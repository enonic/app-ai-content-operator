import {useStore} from '@nanostores/react';
import {twMerge} from 'tailwind-merge';

import {$scope} from '../../../../stores/scope';
import AssistantInput from '../../input/AssistantInput/AssistantInput';
import ChatThread from '../ChatThread/ChatThread';
import ScopeControl from '../ScopeControl/ScopeControl';

type Props = {
    className?: string;
};

export default function ChatContainer({className}: Props): JSX.Element {
    const scope = useStore($scope);

    return (
        <div className={twMerge('ChatContainer flex flex-col gap-1 pb-3', className)}>
            <ChatThread />
            <ScopeControl scope={scope} />
            <AssistantInput />
        </div>
    );
}
