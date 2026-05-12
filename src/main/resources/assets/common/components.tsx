import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export const Portal = ({ children }: { children?: ReactNode }): ReactNode => {
  return typeof document === 'object' ? createPortal(children, document.body) : null;
};
