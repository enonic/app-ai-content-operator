import { createPortal } from 'react-dom';

import type { ReactNode } from 'react';

export type PortalProps = {
  children?: ReactNode;
};

export const Portal = ({ children }: PortalProps): ReactNode => {
  return typeof document === 'object' ? createPortal(children, document.body) : null;
};
Portal.displayName = 'Portal';
