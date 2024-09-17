import {useStore} from '@nanostores/react';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

import {$dialog} from '../../../../stores/dialog';

type Props = {
    className?: string;
};

export default function HeaderTitle({className}: Props): JSX.Element {
    const {t} = useTranslation();
    const {view} = useStore($dialog, {keys: ['view']});

    const isSettings = view === 'settings';

    const title = isSettings ? t('field.settings') : `${t('field.chat')}`;

    return (
        <div
            className={clsx([
                'flex justify-center items-center flex-nowrap',
                'px-2',
                'text-sm text-enonic-gray text-center',
                className,
            ])}
        >
            <span>{title}</span>
        </div>
    );
}
