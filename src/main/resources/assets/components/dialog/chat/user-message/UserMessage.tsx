import { cn } from '@enonic/ui';

import { scrollToField } from '@/store/host';

import type { UserChatMessage } from '@/store/content';

const USER_MESSAGE_NAME = 'UserMessage';

type Props = {
  className?: string;
  message: UserChatMessage;
};

export default function UserMessage({ className, message }: Props): React.ReactNode {
  const contextData = message.content.contextData;

  return (
    <div
      data-component={USER_MESSAGE_NAME}
      className={cn(USER_MESSAGE_NAME, 'flex pl-10', className)}
    >
      <article className="bg-surface-primary ml-auto max-w-4/5 rounded-xl px-5 py-2.5 text-sm leading-6 text-pretty">
        {contextData && (
          <button
            className="text-info-rev cursor-pointer truncate px-1 align-baseline"
            title={contextData.title}
            onClick={() => scrollToField(contextData.name)}
          >
            <span className="text-xs">{contextData.displayName}</span>
          </button>
        )}
        {message.content.node}
      </article>
    </div>
  );
}
