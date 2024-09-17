import {useStore} from '@nanostores/react';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

import {$dialog, toggleDialogView} from '../../../../stores/dialog';
import ActionButton from '../../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
};

export default function SettingsButton({className}: Props): JSX.Element {
    const {t} = useTranslation();
    const {view} = useStore($dialog, {keys: ['view']});
    const isActive = view === 'settings';

    const classNames = clsx(
        'w-10 h-10',
        'bg-transparent enabled:bg-transparent',
        {'text-enonic-blue enabled:hover:text-enonic-blue-light enabled:hover:active:text-enonic-gray': isActive},
        {'text-enonic-gray enabled:hover:text-black enabled:hover:active:text-enonic-blue': !isActive},
        className,
    );

    return (
        <ActionButton
            className={classNames}
            name={t('action.settings')}
            icon={'cog'}
            mode='compact'
            size='medium'
            handleClick={() => {
                toggleDialogView();
            }}
        />
    );
}
