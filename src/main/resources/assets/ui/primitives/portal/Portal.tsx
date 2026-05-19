import { createPortal } from 'react-dom';

import { useShadowHost } from '@/shadow/ShadowHostContext';

import type { ReactNode } from 'react';

export type PortalProps = {
  container?: HTMLElement | null;
  children?: ReactNode;
};

export const Portal = ({ container, children }: PortalProps): ReactNode => {
  const shadowHost = useShadowHost();
  const target = container ?? shadowHost ?? (typeof document === 'object' ? document.body : null);
  return target ? createPortal(children, target) : null;
};
Portal.displayName = 'Portal';
