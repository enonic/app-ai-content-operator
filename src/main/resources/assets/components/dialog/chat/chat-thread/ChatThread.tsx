import { useStore } from '@nanostores/react';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { twJoin, twMerge } from 'tailwind-merge';

import { $history } from '@/store/chat';
import { $initialized, $licenseState } from '@/store/license';
import { $busyAnalyzing, $websocket } from '@/store/websocket';

import type { ChatMessage } from '@/store/content';

import LoadingMessage from '../loading-message/LoadingMessage';
import Message from '../message/Message';

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
    messages.push(<LoadingMessage className="animate-slide-fade-in first:mt-auto" key="loading" />);
  }

  return messages;
}

export default function ChatThread({ className = '' }: Props): React.ReactNode {
  const isInitialized = useStore($initialized);
  const licenseState = useStore($licenseState);
  const isConnecting = useStore($websocket, { keys: ['state'] }).state === 'connecting';
  const isBusyAnalyzing = useStore($busyAnalyzing);
  const isLoading = !isInitialized || !licenseState || isConnecting || isBusyAnalyzing;

  const history = useStore($history);
  const count = history.length;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      scrollBottom(ref.current);
    }
  }, [count]);

  return (
    <div ref={ref} className={twMerge('relative flex-1 overflow-y-auto scroll-smooth', className)}>
      <div className={clsx('flex h-full w-full grow flex-col gap-6 px-3 pt-3')}>
        {createMessages(history, isLoading)}
      </div>
    </div>
  );
}
