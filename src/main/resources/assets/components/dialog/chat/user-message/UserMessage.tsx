import { Button, cn } from '@enonic/ui';
import { useStore } from '@nanostores/react';

import { $dialog } from '@/store/dialog';
import { scrollToField } from '@/store/host';

import type { UserChatMessage } from '@/store/content';

const USER_MESSAGE_NAME = 'UserMessage';

export type UserMessageProps = {
  className?: string;
  message: UserChatMessage;
};

export const UserMessage = ({ className, message }: UserMessageProps): React.ReactNode => {
  const { dragging } = useStore($dialog, { keys: ['dragging'] });

  const contextData = message.content.contextData;

  return (
    <div
      data-component={USER_MESSAGE_NAME}
      className={cn(USER_MESSAGE_NAME, 'flex pl-10', className)}
    >
      <article
        className={cn(
          'bg-surface-primary ml-auto max-w-4/5 rounded-xl px-5 py-2.5 text-sm leading-6 text-pretty',
          dragging && 'bg-surface-primary/40',
        )}
      >
        {contextData && (
          <Button
            variant="filled"
            size="sm"
            className="text-sm text-info-rev cursor-pointer truncate px-1.5 h-5 -my-0.5 align-baseline font-semibold"
            title={contextData.title}
            onClick={() => scrollToField(contextData.name)}
          >
            <span className="text-xs">{contextData.displayName}</span>
          </Button>
        )}
        {message.content.node}
      </article>
    </div>
  );
};
UserMessage.displayName = USER_MESSAGE_NAME;
