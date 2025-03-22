import {useEffect, useState} from 'react';

export default function useIsTouchDevice(): boolean {
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const mq = window.matchMedia('(pointer: coarse)');
            const hasTouchEvents = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            setIsTouch(mq.matches || hasTouchEvents);

            const handleChange = (e: MediaQueryListEvent): void => {
                setIsTouch(e.matches || hasTouchEvents);
            };

            const handleTouch = (): void => {
                setIsTouch(true);
                window.removeEventListener('touchstart', handleTouch);
            };

            mq.addEventListener('change', handleChange);
            window.addEventListener('touchstart', handleTouch, {once: true});

            return () => {
                mq.removeEventListener('change', handleChange);
                window.removeEventListener('touchstart', handleTouch);
            };
        }

        return undefined;
    }, []);

    return isTouch;
}
