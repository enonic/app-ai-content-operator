import {useStore} from '@nanostores/react';
import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

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
            className={twMerge(
                'flex justify-center items-center flex-nowrap',
                'px-2',
                'text-sm text-enonic-gray-600 text-center',
                className,
            )}
        >
            <span>{title}</span>
        </div>
    );
}
