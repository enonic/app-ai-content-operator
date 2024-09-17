import {atom} from 'nanostores';

import {MENTION_TOPIC} from '../common/mentions';
import {$visible} from './dialog';

const store = atom<Optional<string>>(undefined);

export default store;

init();

export const setFocusedElementPath = (path: Optional<string>): void => store.set(path);

export const getFocusedElementPath = (): Optional<string> => store.get();

export function saveActiveFocus(): void {
    const focusedElement: Element | null = document.activeElement;
    const dataPath = focusedElement?.getAttribute('data-path');

    if (dataPath) {
        setFocusedElementPath(dataPath);
    }
}

function init(): void {
    document.addEventListener(
        'focus',
        (e: FocusEvent) => {
            const {target} = e;

            if (!$visible.get() || !(target instanceof Element)) {
                return;
            }

            const dataPathAttr = target.getAttribute('data-path');
            if (target.getAttribute('data-path')) {
                setFocusedElementPath(dataPathAttr);
            } else if (target.getAttribute('name') === 'displayName') {
                setFocusedElementPath(MENTION_TOPIC.path);
            }
        },
        true,
    );
}
