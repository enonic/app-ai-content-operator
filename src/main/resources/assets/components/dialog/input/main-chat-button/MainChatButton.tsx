import { IconButton, Tooltip, cn } from '@enonic/ui';
import { ArrowUp, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MAIN_CHAT_BUTTON_NAME = 'MainChatButton';

export type MainChatButtonProps = {
  className?: string;
  disabled?: boolean;
  kind: 'send' | 'stop';
  clickHandler: () => void;
};

export const MainChatButton = ({
  className,
  disabled,
  kind,
  clickHandler,
}: MainChatButtonProps): React.ReactNode => {
  const { t } = useTranslation();
  const label = t(kind === 'send' ? 'action.send' : 'action.stop');

  return (
    <Tooltip delay={500} value={label} asChild>
      <IconButton
        data-component={MAIN_CHAT_BUTTON_NAME}
        variant="text"
        size="lg"
        iconSize={kind === 'send' ? 'lg' : 'md'}
        iconStrokeWidth={2}
        icon={kind === 'send' ? ArrowUp : Square}
        aria-label={label}
        className={cn(MAIN_CHAT_BUTTON_NAME, 'size-10 rounded-md', className)}
        disabled={disabled}
        onClick={clickHandler}
      />
    </Tooltip>
  );
};
MainChatButton.displayName = MAIN_CHAT_BUTTON_NAME;
