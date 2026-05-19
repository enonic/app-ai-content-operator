import { atom } from 'nanostores';

export const $context = atom<Optional<string>>(undefined);
