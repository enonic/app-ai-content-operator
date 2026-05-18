import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import CloseButton from '../close-button/CloseButton';
import NewChatButton from '../new-chat-button/NewChatButton';

type Props = {
  className?: string;
};

export default function AssistantHeader({ className }: Props): React.ReactNode {
  const { t } = useTranslation();

  return (
    <div
      className={twMerge(
        'AssistantHeader',
        'grid-cols-mid-3 grid items-center',
        'h-10',
        'bg-enonic-gray-100',
        className,
      )}
    >
      <NewChatButton />
      <div className="drag-handle self-stretch px-2 text-center leading-10 font-semibold">
        {t('field.chat')}
      </div>
      <div className="text-right text-nowrap">
        <CloseButton />
      </div>
    </div>
  );
}
