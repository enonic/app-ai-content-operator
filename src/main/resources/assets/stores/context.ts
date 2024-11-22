import {atom} from 'nanostores';

import {addGlobalOpenDialogHandler} from '../common/events';

export const $context = atom<Optional<string>>(undefined);

export const setContext = (value: string): void => $context.set(value);

export const resetContext = (): void => $context.set(undefined);

addGlobalOpenDialogHandler(event => {
    const {sourceDataPath} = event.detail;
    if (sourceDataPath) {
        setContext(sourceDataPath);
    }
});
