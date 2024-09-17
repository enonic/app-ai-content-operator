import {computed, map} from 'nanostores';

import {addGlobalOpenDialogHandler, dispatch, EnonicAiEvents} from '../common/events';
import {setFocusedElementPath} from './focus';
import {getParentPath, pathFromString, pathToString} from './pathUtil';
import {setScope} from './scope';

export type DialogView = 'none' | 'chat' | 'settings';

export type Dialog = {
    view: DialogView;
};

type OpenDialogData = {
    sourceDataPath: Optional<string>;
};

export const $dialog = map<Dialog>({
    view: 'none',
});

export const $visible = computed($dialog, state => state.view !== 'none');

export const setDialogView = (view: DialogView): void => $dialog.setKey('view', view);

export const toggleDialogVisible = (): void => $dialog.setKey('view', $dialog.get().view === 'none' ? 'chat' : 'none');

export const toggleDialogView = (): void => $dialog.setKey('view', $dialog.get().view === 'chat' ? 'settings' : 'chat');

export const toggleDialog = (): void => {
    dispatch($visible.get() ? EnonicAiEvents.HIDE : EnonicAiEvents.SHOW);
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
    }
});
