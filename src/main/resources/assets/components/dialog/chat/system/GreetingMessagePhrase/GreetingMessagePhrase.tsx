import {useStore} from '@nanostores/react';
import {useTranslation} from 'react-i18next';

import {$config} from '../../../../../stores/config';

export default function GreetingMessagePhrase(): React.ReactNode {
    const {t} = useTranslation();
    const {user} = useStore($config, {keys: ['user']});

    const name = user.fullName.split(' ')[0];
    const hours = new Date().getHours();

    switch (true) {
        case hours < 6:
            return t('text.greeting.recurring.night', {name});
        case hours < 12:
            return t('text.greeting.recurring.morning', {name});
        case hours < 18:
            return t('text.greeting.recurring.afternoon', {name});
        default:
            return t('text.greeting.recurring.evening', {name});
    }
}
