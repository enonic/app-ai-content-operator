import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { clearChat } from '@/store/chat';
import { resetContext } from '@/store/context';
import ActionButton from '@/ui/primitives/action-button/ActionButton';

type Props = {
  className?: string;
  disabled?: boolean;
};

export default function NewChatButton({ className, disabled }: Props): React.ReactNode {
  const { t } = useTranslation();

  const classNames = clsx(
    'h-10 w-10',
    'bg-transparent enabled:bg-transparent',
    'text-enonic-gray-600 enabled:hover:active:text-enonic-blue enabled:hover:text-black',
    className,
  );

  return (
    <ActionButton
      className={classNames}
      disabled={disabled}
      name={t('action.newChat')}
      icon={'pencilSquared'}
      mode="icon-with-title"
      size="md"
      clickHandler={() => {
        clearChat();
        resetContext();
      }}
    />
  );
}
