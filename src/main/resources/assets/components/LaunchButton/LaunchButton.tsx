import {useStore} from '@nanostores/react';
import {useTranslation} from 'react-i18next';
import {twJoin} from 'tailwind-merge';

import {$visible, toggleDialog} from '../../stores/dialog';
import {saveActiveFocus} from '../../stores/focus';
import AssistantIcon from '../shared/AssistantIcon/AssistantIcon';

export default function LaunchButton(): JSX.Element {
    const {t} = useTranslation();
    const visible = useStore($visible);

    const classNames = twJoin([
        'enonic-ai',
        'w-full h-full flex items-center justify-center',
        'box-border',
        visible ? 'text-enonic-blue-light hover:text-enonic-blue' : 'text-enonic-gray-700 hover:text-enonic-gray-600',
    ]);

    const title = visible ? t('action.close') : t('action.open');

    return (
        <button className={classNames} onClick={toggleDialog} title={title} onMouseDown={saveActiveFocus}>
            <AssistantIcon className='shrink-0 w-7 h-7' />
        </button>
    );
}
