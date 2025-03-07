import {map} from 'nanostores';

import {addGlobalOpenDialogHandler, AiEvents, dispatchDialogEvent} from '../common/events';

export type Dialog = {
    hidden: boolean;
    initialized: boolean;
};

export const $dialog = map<Dialog>({
    hidden: true,
    initialized: false,
});

const unsubscribe = $dialog.listen(({hidden}, _, key) => {
    if (key === 'hidden' && !hidden) {
        unsubscribe();
        $dialog.setKey('initialized', true);
    }
});

export const setDialogHidden = (hidden: boolean): void => {
    const isStateChanged = $dialog.get().hidden !== hidden;
    if (isStateChanged) {
        dispatchDialogEvent(hidden ? AiEvents.DIALOG_HIDDEN : AiEvents.DIALOG_SHOWN);
        $dialog.setKey('hidden', hidden);
    }
};

export const toggleDialog = (): void => {
    setDialogHidden(!$dialog.get().hidden);
};

addGlobalOpenDialogHandler(() => {
    if ($dialog.get().hidden) {
        setDialogHidden(false);
    }
});
