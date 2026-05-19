import { IconButton, cn } from '@enonic/ui';
import { Astroid, Check } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { delay } from '@/common/delay';
import { applyResults } from '@/store/host';

const APPLY_CONTROL_NAME = 'ApplyControl';

export type ApplyControlProps = {
  className?: string;
  name: string;
  content: string;
};

export const ApplyControl = ({ className, name, content }: ApplyControlProps): React.ReactNode => {
  const { t } = useTranslation();
  const [applying, setApplying] = useState(false);

  const handleApply = useCallback(() => {
    setApplying(true);
    applyResults([{ path: name, text: content }]);
    void delay(500).then(() => {
      setApplying(false);
    });
  }, [name, content]);

  return (
    <IconButton
      data-component={APPLY_CONTROL_NAME}
      variant="text"
      size="sm"
      iconSize="md"
      icon={applying ? Check : Astroid}
      title={t('action.insert')}
      aria-label={t('action.insert')}
      className={cn(APPLY_CONTROL_NAME, applying && 'text-success hover:text-success', className)}
      onClick={handleApply}
    />
  );
};
ApplyControl.displayName = APPLY_CONTROL_NAME;
