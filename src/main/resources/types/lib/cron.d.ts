declare global {
    interface XpLibraries {
        '/lib/cron': typeof import('./cron');
    }
}

interface CronParams {
    cron: string;
}

interface CronDelayedParams {
    fixedDelay: number;
    delay: number;
    times?: number;
}

export type CronScheduleParams = {
    name: string;
    callback: () => void;
} & (CronParams | CronDelayedParams);

export interface CronUnscheduleParams {
    name: string;
}

export function schedule(params: CronScheduleParams): void;
export function unschedule(params: CronUnscheduleParams): void;
