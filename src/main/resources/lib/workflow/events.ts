import * as eventLib from '/lib/xp/event';
import type {EnonicEvent} from '/lib/xp/event';

import {FetchLicenseMessage, GenerateMessage, IN_BASE, InMessage, MessageType} from '../../shared/messages';
import {getLicenseState} from '../license/license-manager';
import {logDebug, LogDebugGroups} from '../logger';
import {runAsyncTask} from '../utils/task';
import {sendFailedErrorMessage, sendLicenseUpdatedMessage} from './messages';
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
            handleGenerateMessage(data);
            break;
        case MessageType.STOP:
            stopGeneration(data);
            break;
        case MessageType.FETCH_LICENSE:
            handleFetchLicenseMessage(data);
            break;
    }
}

function handleGenerateMessage(data: GenerateMessage): void {
    const res = getLicenseState();
    const [licenseState, err] = res;

    if (err) {
        sendFailedErrorMessage(data.metadata, err);
        return;
    }

    if (licenseState !== 'OK') {
        sendLicenseUpdatedMessage(data.metadata, {licenseState});
        return;
    }

    runAsyncTask('events.generate', () => analyzeAndGenerate(data));
}

function handleFetchLicenseMessage(data: FetchLicenseMessage): void {
    const res = getLicenseState();
    const [licenseState, err] = res;

    if (err) {
        sendFailedErrorMessage(data.metadata, err);
        return;
    }

    sendLicenseUpdatedMessage(data.metadata, {licenseState});
}

function fromCustom<T extends string>(eventType: CustomEventType<T> | T): T {
    return eventType.replace(/^custom./, '') as T;
}
