import { cn } from '@enonic/ui';

import type { UserChatMessage } from '@/store/content';

import { dispatchInteracted } from '../../../../common/events';

const USER_MESSAGE_NAME = 'UserMessage';

type Props = {
  className?: string;
  message: UserChatMessage;
};

export default function UserMessage({ className, message }: Props): React.ReactNode {
  const contextData = message.content.contextData;

  return (
    <div data-component={USER_MESSAGE_NAME} className={cn(USER_MESSAGE_NAME, 'flex pl-10', className)}>
      <article className="bg-surface-primary ml-auto max-w-4/5 rounded-xl px-5 py-2.5 text-sm leading-6 text-pretty">
        {contextData && (
          <button
            className="cursor-pointer truncate px-1 align-baseline text-info-rev"
            title={contextData.title}
            onClick={() => dispatchInteracted(contextData?.name)}
          >
            <span className="text-xs">{contextData.displayName}</span>
          </button>
        )}
        {message.content.node}
      </article>
    </div>
  );
}
