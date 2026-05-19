// Import from the host submodule, not the @/store/host barrel: the barrel
// re-exports host.utils, which imports @/store/content and would close a
// content -> context -> host -> utils -> content import cycle. The cycle
// leaves $context undefined when content.store.ts builds $inputsInContext.
import { getHostApi } from '@/store/host/host.utils';

import { $context } from './context.store';

export const setContext = (value: string): void => $context.set(value);

export const resetContext = (): void => $context.set(undefined);

$context.listen((context: Optional<string>) => {
  getHostApi().setContext(context ?? null);
});
