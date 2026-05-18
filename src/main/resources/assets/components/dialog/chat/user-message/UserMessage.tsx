import { twMerge } from 'tailwind-merge';

import type { UserChatMessage } from '@/store/content';

import { dispatchInteracted } from '../../../../common/events';

type Props = {
  className?: string;
  message: UserChatMessage;
};

export default function UserMessage({ className, message }: Props): React.ReactNode {
  const contextData = message.content.contextData;

  return (
    <div className={twMerge('flex pl-10', className)}>
      <article className="bg-enonic-gray-100 ml-auto max-w-4/5 rounded-[1.5rem] p-3 text-sm leading-6">
        {contextData && (
          <button
            className="-mx-1 cursor-pointer truncate px-1 align-baseline text-sky-600"
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
