import { cn } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { useEffect, useRef } from 'react';

import { $history } from '@/store/chat';
import { $initialized } from '@/store/license';
import { $busyAnalyzing } from '@/store/websocket';

import type { ChatMessage } from '@/store/content';

import { LoadingMessage } from '../loading-message/LoadingMessage';
import { Message } from '../message/Message';

const CHAT_THREAD_NAME = 'ChatThread';

export type ChatThreadProps = {
  className?: string;
};

function scrollBottom(element: HTMLDivElement): void {
  element.scrollTop = element.scrollHeight;
}

function createMessages(history: ChatMessage[], isLoading: boolean): React.ReactNode[] {
  const messages = history.map((message, index) => {
    const isLast = index === history.length - 1;
    const animate = isLast && !isLoading;
    const classNames = cn('first:mt-auto', animate && 'animate-slide-fade-in');
    return <Message key={message.id} className={classNames} message={message} last={isLast} />;
  });

  if (isLoading) {
    messages.push(<LoadingMessage className="animate-slide-fade-in first:mt-auto" key="loading" />);
  }

  return messages;
}

export const ChatThread = ({ className = '' }: ChatThreadProps): React.ReactNode => {
  const isInitialized = useStore($initialized);
  const isBusyAnalyzing = useStore($busyAnalyzing);
  const isLoading = !isInitialized || isBusyAnalyzing;

  const history = useStore($history);
  const count = history.length;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      scrollBottom(ref.current);
    }
  }, [count]);

  return (
    <div
      ref={ref}
      data-component={CHAT_THREAD_NAME}
      className={cn(
        CHAT_THREAD_NAME,
        'relative flex-1 overflow-y-auto scroll-smooth',
        'focus-visible:ring-ring/10 outline-none focus-visible:ring-2 focus-visible:ring-inset',
        className,
      )}
    >
      <div className={cn('flex h-full w-full grow flex-col gap-6 px-2.5')}>
        {createMessages(history, isLoading)}
      </div>
    </div>
  );
};
ChatThread.displayName = CHAT_THREAD_NAME;
