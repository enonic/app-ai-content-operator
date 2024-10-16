import isEqual from 'lodash.isequal';
import {useMemo, useRef} from 'react';

export function useDeepMemo<T>(value: T): T {
    const lastValueRef = useRef(value);

    return useMemo(() => {
        if (!isEqual(lastValueRef.current, value)) {
            lastValueRef.current = value;
        }
        return lastValueRef.current;
    }, [value]);
}
