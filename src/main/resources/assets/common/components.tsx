import {ReactNode, ReactPortal} from 'react';
import {createPortal} from 'react-dom';

export const Portal = ({children}: {children?: ReactNode}): ReactPortal | null => {
    return typeof document === 'object' ? createPortal(children, document.body) : null;
};
