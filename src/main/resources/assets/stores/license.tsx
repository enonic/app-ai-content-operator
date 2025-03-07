import {atom} from 'nanostores';

import {LicenseState} from '../../shared/license';
import GreetingText from '../components/dialog/chat/GreetingText/GreetingText';
import {addErrorMessage, addSystemMessage} from './chat';

export const $licenseState = atom<Optional<LicenseState>>(null);

$licenseState.listen(value => {
    if (value === 'OK') {
        addSystemMessage({type: 'context', key: 'greeting', node: <GreetingText />});
    } else {
        const message =
            value === 'EXPIRED'
                ? 'License expired. Please contact your administrator.'
                : 'No valid license found. Please contact your administrator.';
        addErrorMessage(message);
    }
});
