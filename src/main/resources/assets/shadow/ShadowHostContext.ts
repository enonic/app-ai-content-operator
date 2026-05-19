import { createContext, useContext } from 'react';

export const ShadowHostContext = createContext<HTMLElement | null>(null);

export const useShadowHost = (): HTMLElement | null => useContext(ShadowHostContext);
