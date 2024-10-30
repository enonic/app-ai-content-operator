import {computed, map} from 'nanostores';

import {addGlobalOpenDialogHandler, AiEvents, dispatch} from '../common/events';
import {$chatRequestRunning} from './requests';

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
        setTimeout(() => {
            $dialog.setKey('initialized', true);
        }, 800);
    }
});

export const $loading = computed(
    [$dialog, $chatRequestRunning],
    ({initialized}, requestRunning) => !initialized || requestRunning,
);

export const setDialogHidden = (hidden: boolean): void => $dialog.setKey('hidden', hidden);

export const toggleDialog = (): void => {
    const {hidden} = $dialog.get();
    dispatch(hidden ? AiEvents.DIALOG_SHOWN : AiEvents.DIALOG_HIDDEN);
    setDialogHidden(!hidden);
};

addGlobalOpenDialogHandler(() => {
    if ($dialog.get().hidden) {
        toggleDialog();
    }
});
