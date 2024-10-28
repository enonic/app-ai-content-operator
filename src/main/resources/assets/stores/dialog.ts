import {map} from 'nanostores';

import {addGlobalOpenDialogHandler, AiEvents, dispatch} from '../common/events';
import {setContext} from './context';
import {getParentPath, pathFromString, pathToString} from './pathUtil';
import {setScope} from './scope';

export type Dialog = {
    hidden: boolean;
    welcomed: boolean;
};

type OpenDialogData = {
    sourceDataPath: Optional<string>;
};

export const $dialog = map<Dialog>({
    hidden: true,
    welcomed: false,
});

export const setDialogHidden = (hidden: boolean): void => $dialog.setKey('hidden', hidden);

export const markWelcomed = (): void => $dialog.setKey('welcomed', true);

export const toggleDialog = (): void => {
    const {hidden} = $dialog.get();
    dispatch(hidden ? AiEvents.DIALOG_SHOWN : AiEvents.DIALOG_HIDDEN);
    setDialogHidden(!hidden);
};

addGlobalOpenDialogHandler((event: CustomEvent<OpenDialogData>) => {
    if ($dialog.get().hidden) {
        toggleDialog();
    }

    const dataPath = event.detail.sourceDataPath;

    if (dataPath) {
        const scopePath = getParentPath(pathFromString(dataPath));
        const scope = scopePath ? pathToString(scopePath) : null;

        setScope(scope);
        setContext(dataPath);
    }
});
