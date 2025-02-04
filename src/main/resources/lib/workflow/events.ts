import * as eventLib from '/lib/xp/event';
import type {EnonicEvent} from '/lib/xp/event';

import {IN_BASE, InMessage, MessageType} from '../../shared/messages';
import {logDebug, LogDebugGroups} from '../logger';
import {runAsyncTask} from '../utils/task';
import {analyzeAndGenerate, stopGeneration} from './operations';

type CustomEventType<T extends string> = `custom.${T}`;

type AnyEnonicEvent = EnonicEvent<Record<string, unknown>>;

type ServerEvent<Message extends InMessage = InMessage, Type extends Message['type'] = Message['type']> = Merge<
    EnonicEvent<Message>,
    {type: Type | CustomEventType<Type>}
>;

export function init(): void {
    logDebug(LogDebugGroups.FUNC, 'events.init()');

    eventLib.listener({
        // Events, created inside JS, are prefixed with 'custom.'
        type: `custom.${IN_BASE}.*`,
        localOnly: false,
        callback: (event: AnyEnonicEvent) => {
            if (isContentOperatorServerEvent(event)) {
                handleContentOperatorEvent(event);
            }
        },
    });
}

function isContentOperatorServerEvent(event: AnyEnonicEvent): event is ServerEvent<InMessage> {
    const type = fromCustom(event.type);
    return type.startsWith(IN_BASE);
}

function handleContentOperatorEvent(event: ServerEvent): void {
    const {data} = event;

    log.info(`events.handleContentOperatorEvent(): ${data.type}`);

    switch (data.type) {
        case MessageType.GENERATE:
            runAsyncTask('events.generate', () => analyzeAndGenerate(data));
            break;
        case MessageType.STOP:
            stopGeneration(data);
            break;
    }
}

export function toCustom<T extends string>(eventType: T): CustomEventType<T> {
    return `custom.${eventType}`;
}

export function fromCustom<T extends string>(eventType: CustomEventType<T> | T): T {
    return eventType.replace(/^custom./, '') as T;
}
