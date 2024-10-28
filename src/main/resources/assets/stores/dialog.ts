import {map} from 'nanostores';

import {addGlobalOpenDialogHandler, AiEvents, dispatch} from '../common/events';
import {getParentPath, pathFromString, pathToString} from './pathUtil';
import {setScope} from './scope';

type WelcomeState = 'in-progress' | 'done';

export type Dialog = {
    hidden: boolean;
    welcomeState?: WelcomeState;
    contextPath: Optional<string>;
};

type OpenDialogData = {
    sourceDataPath: Optional<string>;
};

export const $dialog = map<Dialog>({
    hidden: true,
    contextPath: undefined,
});

export const setDialogHidden = (hidden: boolean): void => $dialog.setKey('hidden', hidden);

export const setWelcomeState = (state: WelcomeState): void => $dialog.setKey('welcomeState', state);

export const setContextPath = (path: Optional<string>): void => $dialog.setKey('contextPath', path);

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
        setContextPath(dataPath);
    }
});
