import * as eventLib from '/lib/xp/event';
import * as websocketLib from '/lib/xp/websocket';

import * as licenseManager from '../../lib/license/license-manager';
import {logDebug, LogDebugGroups, logError} from '../../lib/logger';
import {respondError} from '../../lib/requests';
import {unsafeUUIDv4} from '../../lib/utils/uuid';
import {WS_PROTOCOL} from '../../shared/constants';
import {ERRORS} from '../../shared/errors';
import {LicenseState} from '../../shared/license';
import {GenerateMessage, MessageType, StopMessage} from '../../shared/messages';
import {
    ClientMessage as WSClientMessage,
    GenerateMessage as WSGenerateMessage,
    LicenseUpdatedMessage as WSLicenseUpdatedMessage,
    MessageMetadata as WSMessageMetadata,
    MessageType as WSMessageType,
    ServerMessage as WSServerMessage,
    StopMessage as WSStopMessage,
} from '../../shared/websocket';

//
//* WebSocket
//

export function get(request: Enonic.Request): Enonic.Response {
    if (!request.webSocket) {
        const error = ERRORS.REST_NOT_FOUND.withMsg('Trying to access WebSocket with "webSocket" set to "false"');
        return respondError(error, 404);
    }

    const protocols = request.headers?.['Sec-WebSocket-Protocol']?.split(', ');
    const isValidProtocol = protocols?.some(protocol => protocol === WS_PROTOCOL);
    if (!isValidProtocol) {
        const error = ERRORS.WS_INVALID_PROTOCOL.withMsg(`Expected <${WS_PROTOCOL}>.`);
        return respondError(error, 400);
    }

    return {
        status: 101,
        webSocket: {
            subProtocols: [WS_PROTOCOL],
        },
    };
}

export function webSocketEvent(event: Enonic.WebSocketEvent): void {
    try {
        const {type} = event;

        switch (type) {
            case 'open':
            case 'close':
                break;
            case 'message':
                handleMessage(event);
                break;
            case 'error':
                logError(event.error);
                break;
        }
    } catch (e) {
        logError(e);
    }
}

//
//* Receive
//

function handleMessage(event: Enonic.WebSocketEvent): void {
    const {id} = event.session;
    const message = parseMessage(event.message);
    if (!message) {
        return;
    }

    logDebug(LogDebugGroups.WS, `Received message: ${JSON.stringify(message)}`);

    switch (message.type) {
        case WSMessageType.PING:
            sendMessage(id, {type: WSMessageType.PONG});
            break;
        case WSMessageType.CONNECT:
            handleConnect(id);
            break;
        case WSMessageType.GENERATE:
            handleGenerate(id, message);
            break;
        case WSMessageType.STOP:
            handleStop(id, message);
            break;
    }
}

function parseMessage(message: Optional<string>): Optional<WSClientMessage> {
    try {
        return message != null ? (JSON.parse(message) as WSClientMessage) : undefined;
    } catch (e) {
        return undefined;
    }
}

//
//* Send
//

function createMetadata(): WSMessageMetadata {
    return {
        id: unsafeUUIDv4(),
        timestamp: Date.now(),
    };
}

function sendMessage(socketId: string, message: Omit<WSServerMessage, 'metadata'>): void {
    websocketLib.send(socketId, JSON.stringify({...message, metadata: createMetadata()}));
}

function sendConnectedMessage(socketId: string): void {
    sendMessage(socketId, {type: WSMessageType.CONNECTED});
}

function sendLicenseUpdatedMessage(socketId: string, licenseStateOrError?: Try<LicenseState>): void {
    const license = licenseStateOrError ?? licenseManager.getLicenseState();
    const [licenseState, licenseError] = license;
    const payload = licenseError ? licenseError : {licenseState};
    const message = {type: WSMessageType.LICENSE_UPDATED, payload} satisfies Omit<WSLicenseUpdatedMessage, 'metadata'>;

    sendMessage(socketId, message);
}

//
//* Flow
//

function handleConnect(socketId: string): void {
    sendConnectedMessage(socketId);
    sendLicenseUpdatedMessage(socketId);
}

function handleGenerate(socketId: string, message: WSGenerateMessage): void {
    sendEvent({
        type: MessageType.GENERATE,
        metadata: {
            id: message.metadata.id,
            clientId: socketId,
            useWebSocket: true,
        },
        payload: message.payload,
    } satisfies GenerateMessage);
}

function handleStop(socketId: string, message: WSStopMessage): void {
    sendEvent({
        type: MessageType.STOP,
        metadata: {
            id: message.metadata.id,
            clientId: socketId,
            useWebSocket: true,
        },
        payload: message.payload,
    } satisfies StopMessage);
}

//
//* Events
//

type EventData = Record<string, unknown> & {
    type: string;
};

function sendEvent(data: EventData): void {
    eventLib.send({
        type: data.type,
        distributed: false,
        data,
    });
}
