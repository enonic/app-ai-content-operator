import { IconButton, cn } from '@enonic/ui';
import { ArrowUp, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MAIN_CHAT_BUTTON_NAME = 'MainChatButton';

type Props = {
  className?: string;
  disabled?: boolean;
  kind: 'send' | 'stop';
  clickHandler: () => void;
};

export default function MainChatButton({
  className,
  disabled,
  kind,
  clickHandler,
}: Props): React.ReactNode {
  const { t } = useTranslation();

  return (
    <IconButton
      data-component={MAIN_CHAT_BUTTON_NAME}
      variant="text"
      size="lg"
      iconStrokeWidth={2}
      icon={kind === 'send' ? ArrowUp : Square}
      title={t('action.send')}
      aria-label={t('action.send')}
      className={cn(MAIN_CHAT_BUTTON_NAME, 'size-10 rounded-lg', className)}
      disabled={disabled}
      onClick={clickHandler}
    />
  );
}
