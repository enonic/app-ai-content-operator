import {atom} from 'nanostores';

import {addGlobalOpenDialogHandler} from '../common/events';

export const $context = atom<Optional<string>>(undefined);

export const resetContext = (): void => $context.set(undefined);

addGlobalOpenDialogHandler(event => {
    const {sourceDataPath} = event.detail;
    if (sourceDataPath) {
        $context.set(sourceDataPath);
    }
});
