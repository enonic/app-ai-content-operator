import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

import {setDialogHidden} from '../../../../stores/dialog';
import ActionButton from '../../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
};

export default function CloseButton({className}: Props): React.ReactNode {
    const {t} = useTranslation();
    const classNames = clsx(
        'CloseButton',
        'w-10 h-10',
        'bg-transparent enabled:bg-transparent',
        'text-enonic-gray-600 enabled:hover:text-black enabled:hover:active:text-enonic-blue',
        className,
    );

    return (
        <ActionButton
            className={classNames}
            name={t('action.close')}
            icon='close'
            mode='icon-only'
            size='md'
            clickHandler={() => {
                setDialogHidden(true);
            }}
        />
    );
}
