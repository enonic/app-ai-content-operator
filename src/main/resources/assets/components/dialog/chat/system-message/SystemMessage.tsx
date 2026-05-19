import { cn } from '@enonic/ui';
import { useTranslation } from 'react-i18next';

import { JukeIcon } from '@/ui/primitives/juke-icon/JukeIcon';

import type { SystemChatMessage } from '@/store/content';

import { ResponseControls } from '../controls/response-controls/ResponseControls';

const SYSTEM_MESSAGE_NAME = 'SystemMessage';

export type SystemMessageProps = {
  className?: string;
  message: SystemChatMessage;
  last: boolean;
};

export const SystemMessage = ({
  className,
  message,
  last,
}: SystemMessageProps): React.ReactNode => {
  const { t } = useTranslation();

  const { type, node } = message.content;

  return (
    <div
      data-component={SYSTEM_MESSAGE_NAME}
      className={cn(SYSTEM_MESSAGE_NAME, 'flex gap-4', className)}
    >
      <JukeIcon className="size-8 shrink-0" />
      <article className="flex flex-1 flex-col gap-3">
        <div className="pt-1 text-sm leading-6">
          {type === 'error' ? (
            <div className="flex flex-col gap-x-2 gap-y-1">
              <div className="truncate align-baseline text-xs text-red-600">
                {t('field.message.error')}
              </div>
              <div className="relative col-span-2">{node}</div>
            </div>
          ) : (
            node
          )}
        </div>
        <ResponseControls message={message} last={last} />
      </article>
    </div>
  );
};
SystemMessage.displayName = SYSTEM_MESSAGE_NAME;
