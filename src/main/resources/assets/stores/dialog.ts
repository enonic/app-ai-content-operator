import {computed, map} from 'nanostores';

import {addGlobalOpenDialogHandler, AiEvents, dispatch} from '../common/events';
import {setFocusedElementPath} from './focus';
import {getParentPath, pathFromString, pathToString} from './pathUtil';
import {setScope} from './scope';

export type DialogView = 'none' | 'chat' | 'settings';

export type Dialog = {
    view: DialogView;
    firstTime: boolean;
    contextPath: Optional<string>;
};

type OpenDialogData = {
    sourceDataPath: Optional<string>;
};

export const $dialog = map<Dialog>({
    view: 'none',
    firstTime: true,
    contextPath: undefined,
});

export const $visible = computed($dialog, state => state.view !== 'none');

export const markVisited = (): void => $dialog.setKey('firstTime', false);

export const setContextPath = (path: Optional<string>): void => $dialog.setKey('contextPath', path);

export const setDialogView = (view: DialogView): void => $dialog.setKey('view', view);

export const toggleDialogVisible = (): void => $dialog.setKey('view', $dialog.get().view === 'none' ? 'chat' : 'none');

export const toggleDialogView = (): void => $dialog.setKey('view', $dialog.get().view === 'chat' ? 'settings' : 'chat');

export const toggleDialog = (): void => {
    dispatch($visible.get() ? AiEvents.DIALOG_HIDDEN : AiEvents.DIALOG_SHOWN);
    toggleDialogVisible();
};

addGlobalOpenDialogHandler((event: CustomEvent<OpenDialogData>) => {
    if (!$visible.get()) {
        toggleDialog();
    }

    const dataPath = event.detail.sourceDataPath;

    if (dataPath) {
        const scopePath = getParentPath(pathFromString(dataPath));
        const scope = scopePath ? pathToString(scopePath) : null;

        setScope(scope);
        setFocusedElementPath(dataPath);
        setContextPath(dataPath);
    }
});
