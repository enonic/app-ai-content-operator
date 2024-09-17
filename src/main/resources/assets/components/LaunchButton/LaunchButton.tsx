import {useStore} from '@nanostores/react';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

import {$visible, toggleDialog} from '../../stores/dialog';
import {saveActiveFocus} from '../../stores/focus';
import ApplicantIcon from '../shared/AssistantIcon/AssistantIcon';

export default function LaunchButton(): JSX.Element {
    const {t} = useTranslation();
    const visible = useStore($visible);

    const classNames = clsx([
        'enonic-ai',
        'w-full h-full flex items-center justify-center',
        'box-border',
        visible ? 'text-enonic-blue-light hover:text-enonic-blue' : 'text-enonic-gray-dark hover:text-enonic-gray',
    ]);

    const title = visible ? t('action.close') : t('action.open');

    return (
        <button className={classNames} onClick={toggleDialog} title={title} onMouseDown={saveActiveFocus}>
            <ApplicantIcon className='shrink-0 w-7 h-7' />
        </button>
    );
}
