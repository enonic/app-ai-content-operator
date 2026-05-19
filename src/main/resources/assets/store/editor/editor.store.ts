import { atom } from 'nanostores';

import type { Range } from 'slate';

export const $target = atom<Range | undefined>(undefined);
