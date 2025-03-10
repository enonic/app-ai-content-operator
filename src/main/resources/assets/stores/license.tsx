import {t} from 'i18next';
import {atom} from 'nanostores';

import {LicenseState} from '../../shared/license';
import GreetingText from '../components/dialog/chat/GreetingText/GreetingText';
import {addErrorMessage, addSystemMessage} from './chat';

export const $licenseState = atom<Optional<LicenseState>>(null);
export const $initialized = atom<boolean>(false);
export const setInitialized = (): void => $initialized.set(true);

$licenseState.listen(value => {
    if (value === 'OK') {
        setTimeout(() => {
            setInitialized(); // creating a delay for better UX
            addSystemMessage({type: 'context', key: 'greeting', node: <GreetingText />});
        }, 800);
    } else {
        setInitialized();
        const message = value === 'EXPIRED' ? t('text.error.license.expired') : t('text.error.license.missing');
        addErrorMessage(message);
    }
});
