import type { Range } from 'slate';

import { $target } from './editor.store';

export const setTarget = (target: Range): void => $target.set(target);
export const clearTarget = (): void => $target.set(undefined);

window.addEventListener('resize', () => {
  clearTarget();
});
