import {useStore} from '@nanostores/react';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

import {$settings, setMode} from '../../../../stores/settings';
import ModesGroup from '../ModesGroup/ModesGroup';

type Props = {
    className?: string;
};

export default function SettingsContent({className}: Props): JSX.Element {
    const {t} = useTranslation();
    const {mode} = useStore($settings, {keys: ['mode']});

    return (
        <form className={clsx(['SettingsContent', 'px-3 overflow-y-auto', className])}>
            <ModesGroup
                label={t('field.settings.chat.mode')}
                group={'chat-mode'}
                mode={mode}
                handleChange={mode => setMode(mode)}
            />
        </form>
    );
}
