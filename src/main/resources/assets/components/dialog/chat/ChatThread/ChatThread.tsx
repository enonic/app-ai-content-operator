import {useStore} from '@nanostores/react';
import clsx from 'clsx';
import {useEffect, useRef} from 'react';

import {$chat} from '../../../../stores/chat';
import {ChatMessage} from '../../../../stores/data/ChatMessage';
import {isChatRequestRunning} from '../../../../stores/requests';
import LoadingMessage from '../LoadingMessage/LoadingMessage';
import Message from '../Message/Message';
import WelcomeMessage from '../WelcomeMessage/WelcomeMessage';

export type Props = {
    className?: string;
};

function scrollBottom(element: HTMLDivElement): void {
    element.scrollTop = element.scrollHeight;
}

function createMessages(history: ChatMessage[], isLoading: boolean): JSX.Element[] {
    const messages = history.map((message, index) => {
        const last = index === history.length - 1;
        return <Message key={message.id} className='first:mt-auto' message={message} last={last} />;
    });
    if (isLoading) {
        messages.push(<LoadingMessage key='loading' />);
    }
    return messages;
}

export default function ChatThread({className = ''}: Props): JSX.Element {
    const {history} = useStore($chat, {keys: ['history']});
    const count = history.length;
    const empty = count === 0;
    const requestRunning = useStore(isChatRequestRunning);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            scrollBottom(ref.current);
        }
    }, [count]);

    return (
        <div ref={ref} className={clsx(['flex-1', 'overflow-y-auto scroll-smooth', className])}>
            <div className={clsx(['flex w-full h-full flex-col grow gap-6 px-3 pt-3', {'justify-center': empty}])}>
                {empty ? <WelcomeMessage /> : createMessages(history, requestRunning)}
            </div>
        </div>
    );
}
