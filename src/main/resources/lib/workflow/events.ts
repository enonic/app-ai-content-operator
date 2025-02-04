import * as eventLib from '/lib/xp/event';
import * as websocketLib from '/lib/xp/websocket';
import type {EnonicEvent} from '/lib/xp/event';

import {
    FetchLicenseMessage,
    GenerateMessage,
    IN_BASE,
    InMessage,
    MessageType,
    OUT_BASE,
    OutMessage,
} from '../../shared/messages';
import {
    AnalyzedMessage as WSAnalyzedMessage,
    FailedMessage as WSFailedMessage,
    GeneratedMessage as WSGeneratedMessage,
    LicenseUpdatedMessage as WSLicenseUpdatedMessage,
    MessageType as WSMessageType,
    ServerMessage as WSServerMessage,
} from '../../shared/websocket';
import {getLicenseState} from '../license/license-manager';
import {logDebug, LogDebugGroups} from '../logger';
import {runAsyncTask} from '../utils/task';
import {sendFailedErrorMessage, sendLicenseUpdatedMessage} from './messages';
import {analyzeAndGenerate, stopGeneration} from './operations';

type CustomEventType<T extends string> = `custom.${T}`;

type AnyEnonicEvent = EnonicEvent<Record<string, unknown>>;

type ServerEvent<
    Message extends InMessage | OutMessage = InMessage,
    Type extends Message['type'] = Message['type'],
> = Merge<EnonicEvent<Message>, {type: Type | CustomEventType<Type>}>;

export function init(): void {
    logDebug(LogDebugGroups.FUNC, 'events.init()');

    eventLib.listener({
        // Events, created inside JS, are prefixed with 'custom.'
        type: `custom.${IN_BASE}.*`,
        localOnly: false,
        callback: (event: AnyEnonicEvent) => {
            if (isContentOperatorInServerEvent(event)) {
                handleContentOperatorEvent(event);
            }
        },
    });

    // TODO: Remove, when backward compatibility is no longer needed
    eventLib.listener({
        type: `custom.${OUT_BASE}.*`,
        localOnly: true, // Do not need cluster-wide events
        callback: (event: AnyEnonicEvent) => {
            if (isContentOperatorOutServerEvent(event)) {
                checkAndForwardToWebSocket(event);
            }
        },
    });
}

function isContentOperatorInServerEvent(event: AnyEnonicEvent): event is ServerEvent<InMessage> {
    const type = fromCustom(event.type);
    return type.startsWith(IN_BASE);
}

function isContentOperatorOutServerEvent(event: AnyEnonicEvent): event is ServerEvent<OutMessage> {
    const type = fromCustom(event.type);
    return type.startsWith(OUT_BASE);
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

//
//* WebSocket
//

// TODO: Remove, when backward compatibility is no longer needed

function checkAndForwardToWebSocket(event: ServerEvent<OutMessage>): void {
    const {metadata} = event.data;
    const socketId = metadata.clientId;

    const needsForwarding = metadata.useWebSocket === true && socketId != null;
    if (!needsForwarding) {
        return;
    }

    const message = createWebSocketMessage(event.data);
    if (!message) {
        return;
    }

    websocketLib.send(socketId, JSON.stringify(message));
}

function createWebSocketMessage(message: OutMessage): Optional<WSServerMessage> {
    const metadata = {
        id: message.metadata.id,
        timestamp: Date.now(),
    };

    const msg = fromCustomMessage(message);

    switch (msg.type) {
        case MessageType.GENERATED:
            return {
                type: WSMessageType.GENERATED,
                metadata,
                payload: msg.payload,
            } satisfies WSGeneratedMessage;
        case MessageType.ANALYZED:
            return {
                type: WSMessageType.ANALYZED,
                metadata,
                payload: msg.payload,
            } satisfies WSAnalyzedMessage;
        case MessageType.FAILED:
            return {
                type: WSMessageType.FAILED,
                metadata,
                payload: msg.payload,
            } satisfies WSFailedMessage;
        case MessageType.LICENSE_UPDATED:
            return {
                type: WSMessageType.LICENSE_UPDATED,
                metadata,
                payload: msg.payload,
            } satisfies WSLicenseUpdatedMessage;
        default:
            return null;
    }
}

function fromCustomMessage(message: OutMessage): OutMessage {
    const type = fromCustom(message.type);
    return {
        ...message,
        type,
    } as OutMessage;
}
