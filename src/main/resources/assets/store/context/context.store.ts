import { atom } from 'nanostores';

import { getHostApi } from '@/store/host';

export const $context = atom<Optional<string>>(undefined);

export const setContext = (value: string): void => $context.set(value);

export const resetContext = (): void => $context.set(undefined);

$context.listen((context: Optional<string>) => {
  getHostApi().setContext(context ?? null);
});
