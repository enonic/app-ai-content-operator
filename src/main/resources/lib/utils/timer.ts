import {schedule, unschedule} from '/lib/cron';

const createName = (id: number): string => `xp-timeout-${id}`;

export function setXpTimeout(callback: () => void, delayMs: number): number {
    const id = Number(Math.random().toString(10).substring(2, 17));
    const delay = Math.max(delayMs, 0);

    schedule({
        name: createName(id),
        delay,
        fixedDelay: delay,
        times: 1,
        callback,
    });

    return id;
}

export function clearXpTimeout(id: number): void {
    unschedule({
        name: createName(id),
    });
}
