import {useStore} from '@nanostores/react';
import {useTranslation} from 'react-i18next';
import {twJoin} from 'tailwind-merge';

import {$dialog, toggleDialog} from '../../stores/dialog';
import AssistantIcon from '../shared/AssistantIcon/AssistantIcon';

export default function LaunchButton(): React.ReactNode {
    const {t} = useTranslation();
    const {hidden} = useStore($dialog, {keys: ['hidden']});

    const classNames = twJoin([
        'ai-content-operator',
        'w-full h-full flex items-center justify-center',
        'box-border',
        hidden ? 'text-enonic-gray-700 hover:text-enonic-gray-600' : 'text-enonic-blue-light hover:text-enonic-blue',
    ]);

    const title = hidden ? t('action.open') : t('action.close');

    return (
        <button className={classNames} onClick={toggleDialog} title={title}>
            <AssistantIcon className='shrink-0 w-7 h-7' />
        </button>
    );
}
