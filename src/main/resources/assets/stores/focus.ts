import {atom} from 'nanostores';

import {MENTION_TOPIC} from '../common/mentions';
import {$visible} from './dialog';

export const $focus = atom<Optional<string>>(undefined);

init();

export const setFocusedElementPath = (path: Optional<string>): void => $focus.set(path);

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
