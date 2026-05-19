import { Button, cn } from '@enonic/ui';
import { RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { sendRetry } from '@/store/websocket';

const RETRY_CONTROL_NAME = 'RetryControl';

type Props = {
  className?: string;
  userMessageId: string;
  disabled?: boolean;
};

export default function RetryControl({
  className,
  userMessageId,
  disabled,
}: Props): React.ReactNode {
  const { t } = useTranslation();

  return (
    <Button
      data-component={RETRY_CONTROL_NAME}
      variant="outline"
      size="sm"
      label={t('action.retry')}
      endIcon={RotateCw}
      className={cn(RETRY_CONTROL_NAME, className)}
      disabled={disabled}
      onClick={() => sendRetry(userMessageId)}
    />
  );
}
