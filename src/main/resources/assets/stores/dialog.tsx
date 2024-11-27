import {computed, map} from 'nanostores';

import {addGlobalOpenDialogHandler, AiEvents, dispatchDialogEvent} from '../common/events';
import GreetingMessagePhrase from '../components/dialog/chat/system/GreetingMessagePhrase/GreetingMessagePhrase';
import {addSystemMessage} from './chat';
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
            addSystemMessage({type: 'context', key: 'greeting', node: <GreetingMessagePhrase />});
        }, 800);
    }
});

export const $loading = computed(
    [$dialog, $chatRequestRunning],
    ({initialized}, requestRunning) => !initialized || requestRunning,
);

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
