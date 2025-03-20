import {atom} from 'nanostores';

import {addGlobalOpenDialogHandler, addGlobalSetContextHandler, dispatchContextChanged} from '../common/events';
import {$dialog} from './dialog';

export const $context = atom<Optional<string>>(undefined);

export const setContext = (value: string): void => $context.set(value);

export const resetContext = (): void => $context.set(undefined);

addGlobalOpenDialogHandler(event => {
    const {sourceDataPath} = event.detail;
    if (sourceDataPath) {
        setContext(sourceDataPath);
    }
});

addGlobalSetContextHandler(event => {
    if (!$dialog.get().hidden) {
        const {sourceDataPath} = event.detail;

        if (sourceDataPath) {
            setContext(sourceDataPath);
        }
    }
});

$context.listen((context: Optional<string>) => {
    dispatchContextChanged(context);
});
