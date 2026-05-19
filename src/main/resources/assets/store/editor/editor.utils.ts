import { $target } from './editor.store';

import type { Range } from 'slate';

export const setTarget = (target: Range): void => $target.set(target);
export const clearTarget = (): void => $target.set(undefined);

window.addEventListener('resize', () => {
  clearTarget();
});
