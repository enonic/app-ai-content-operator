import {useStore} from '@nanostores/react';
import clsx from 'clsx';
import {useEffect, useRef} from 'react';
import {twJoin, twMerge} from 'tailwind-merge';

import {$history} from '../../../../stores/chat';
import {ChatMessage} from '../../../../stores/data/ChatMessage';
import {$initialized, $licenseState} from '../../../../stores/license';
import {$busyAnalyzing, $isConnected} from '../../../../stores/worker';
import LoadingMessage from '../LoadingMessage/LoadingMessage';
import Message from '../Message/Message';

export type Props = {
    className?: string;
};

function scrollBottom(element: HTMLDivElement): void {
    element.scrollTop = element.scrollHeight;
}

function createMessages(history: ChatMessage[], isLoading: boolean): React.ReactNode[] {
    const messages = history.map((message, index) => {
        const isLast = index === history.length - 1;
        const animate = isLast && !isLoading;
        const classNames = twJoin('first:mt-auto', animate && 'animate-slide-fade-in');
        return <Message key={message.id} className={classNames} message={message} last={isLast} />;
    });

    if (isLoading) {
        messages.push(<LoadingMessage className='first:mt-auto animate-slide-fade-in' key='loading' />);
    }

    return messages;
}

export default function ChatThread({className = ''}: Props): React.ReactNode {
    const isInitialized = useStore($initialized);
    const licenseState = useStore($licenseState);
    const isConnected = useStore($isConnected);
    const isBusyAnalyzing = useStore($busyAnalyzing);
    const isLoading = !isInitialized || !licenseState || !isConnected || isBusyAnalyzing;

    const history = useStore($history);
    const count = history.length;

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            scrollBottom(ref.current);
        }
    }, [count]);

    return (
        <div ref={ref} className={twMerge('flex-1 overflow-y-auto scroll-smooth relative', className)}>
            <div className={clsx('flex w-full h-full flex-col grow gap-6 px-3 pt-3')}>
                {createMessages(history, isLoading)}
            </div>
        </div>
    );
}
