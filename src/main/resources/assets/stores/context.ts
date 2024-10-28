import {atom} from 'nanostores';

export const $context = atom<Optional<string>>(undefined);

export const setContext = (value: Optional<string>): void => $context.set(value);

export const resetContext = (): void => $context.set(undefined);

export const isContextEmpty = (): boolean => $context.get() == null;
