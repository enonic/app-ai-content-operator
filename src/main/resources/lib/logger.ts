import {DEBUG_GROUPS} from './config';
import {CustomAiError} from './errors';

export enum LogDebugGroups {
    ALL = 'all',
    NONE = 'none',
    GOOGLE = 'google',
    REST = 'rest',
    NODE = 'node',
    QUERY = 'query',
    FUNC = 'func',
}

function stringifyCode(code: object): string {
    return JSON.stringify(code, null, 4);
}

function parseMessage(message: unknown): string {
    if (!message) {
        return '';
    } else if (message instanceof CustomAiError) {
        return String(message);
    } else if (message instanceof Error) {
        return message.stack || message.message;
    } else if (typeof message === 'object') {
        return stringifyCode(message);
    } else {
        return String(message);
    }
}

export const logInfo = (message: unknown): void => log.info(parseMessage(message));
export const logWarn = (message: unknown): void => log.warning(parseMessage(message));
export const logError = (message: unknown): void => log.error(parseMessage(message));
export const logDebug = (group: Omit<LogDebugGroups, LogDebugGroups.ALL>, message: unknown): void => {
    const canDebug =
        DEBUG_GROUPS.length === 0 ||
        DEBUG_GROUPS.indexOf(LogDebugGroups.NONE) < 0 ||
        DEBUG_GROUPS.indexOf(LogDebugGroups.ALL) >= 0 ||
        DEBUG_GROUPS.indexOf(group as string) >= 0;
    if (canDebug) {
        log.debug(parseMessage(message));
    }
};
