import {calcFullJitterWindow} from '../utils/http';
import {clearXpTimeout, setXpTimeout} from '../utils/timer';

type RequestRetryState = {
    nextAllowed: Date;
    delay: number;
    attempt: number;
};

const RETRIES = __.newBean<Java.ConcurrentHashMap<string, RequestRetryState>>('java.util.concurrent.ConcurrentHashMap');

function sync<T>(fn: () => T): T {
    return Java.synchronized(fn, RETRIES)();
}

const calculateNextAllowedTime = (delay: number): Date => new Date(Date.now() + delay);

export function saveRetryState(url: string, delay: number, attempt: number): void {
    sync(() => {
        RETRIES.put(url, {
            nextAllowed: calculateNextAllowedTime(delay),
            delay,
            attempt,
        });

        scheduleCleanup();
    });
}

export function getRetryState(url: string): Optional<RequestRetryState> {
    return sync(() => {
        return RETRIES.get(url);
    });
}

export function deleteRetryState(url: string): void {
    sync(() => {
        RETRIES.remove(url);

        scheduleCleanup();
    });
}

export function updateRetryStateIfNextAttempt(url: string, delay: number, attempt: number): void {
    const state = getRetryState(url);
    if (!state || state.attempt < attempt) {
        saveRetryState(url, delay, attempt);
    }
}

export function calcDelayWithJitter({nextAllowed, delay}: RequestRetryState): number {
    return nextAllowed.getTime() - Date.now() + calcFullJitterWindow(delay);
}

//
// Cleanup
//

// ! Modify only in sync scope
let nearestScheduledRetry: Optional<Date> = null;
let cleanupTimeoutId: Optional<number> = null;

function cleanupRetries(): void {
    sync(() => {
        const now = new Date();
        RETRIES.forEach((key, {nextAllowed}) => {
            if (nextAllowed < now) {
                RETRIES.remove(key);
            }
        });
    });

    scheduleCleanup();
}

function scheduleCleanup(): void {
    sync(() => {
        const nearest = getNearestNextAllowed();
        if (!nearest) {
            unscheduleCleanup();
            return;
        }

        if (nearestScheduledRetry?.getTime() === nearest.getTime()) {
            return;
        }

        unscheduleCleanup();

        nearestScheduledRetry = nearest;
        cleanupTimeoutId = setXpTimeout(() => cleanupRetries(), nearest.getTime() - Date.now());
    });
}

function unscheduleCleanup(): void {
    if (nearestScheduledRetry != null && cleanupTimeoutId != null) {
        clearXpTimeout(cleanupTimeoutId);
    }
}

function getNearestNextAllowed(): Optional<Date> {
    return sync(() => {
        let nearest: Optional<Date>;

        RETRIES.forEach((_, {nextAllowed}) => {
            if (nearest == null || nextAllowed < nearest) {
                nearest = nextAllowed;
            }
        });

        return nearest;
    });
}
