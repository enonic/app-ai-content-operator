import {atom} from 'nanostores';
import type {Range} from 'slate';

export const $target = atom<Range | undefined>(undefined);

export const setTarget = (target: Range): void => $target.set(target);
export const clearTarget = (): void => $target.set(undefined);

window.addEventListener('resize', () => {
    clearTarget();
});
