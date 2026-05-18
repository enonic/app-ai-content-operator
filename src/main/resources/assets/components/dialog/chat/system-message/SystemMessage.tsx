import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import AssistantIcon from '@/ui/primitives/assistant-icon/AssistantIcon';

import type { SystemChatMessage } from '@/store/content';

import ResponseControls from '../controls/response-controls/ResponseControls';

type Props = {
  className?: string;
  message: SystemChatMessage;
  last: boolean;
};

export default function SystemMessage({ className, message, last }: Props): React.ReactNode {
  const { t } = useTranslation();

  const { type, node } = message.content;

  return (
    <div className={twMerge('flex gap-2', className)}>
      <AssistantIcon className="text-enonic-blue-400 shrink-0" />
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
}
