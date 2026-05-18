import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { setDialogHidden } from '@/store/dialog';
import ActionButton from '@/ui/primitives/action-button/ActionButton';

type Props = {
  className?: string;
};

export default function CloseButton({ className }: Props): React.ReactNode {
  const { t } = useTranslation();
  const classNames = clsx(
    'CloseButton',
    'h-10 w-10',
    'bg-transparent enabled:bg-transparent',
    'text-enonic-gray-600 enabled:hover:active:text-enonic-blue enabled:hover:text-black',
    className,
  );

  return (
    <ActionButton
      className={classNames}
      name={t('action.close')}
      icon="close"
      mode="icon-only"
      size="md"
      clickHandler={() => {
        setDialogHidden(true);
      }}
    />
  );
}
