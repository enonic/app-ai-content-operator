import * as eventLib from '/lib/xp/event';
import * as websocketLib from '/lib/xp/websocket';

import {logDebug, LogDebugGroups, logError} from '../../lib/logger';
import {respondError} from '../../lib/requests';
import {WS_PROTOCOL} from '../../shared/constants';
import {ERRORS} from '../../shared/errors';
import {GenerateMessage, InMessage, MessageType, StopMessage} from '../../shared/messages';
import {ClientMessage, WSMessageType} from '../../shared/websocket';

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
                break;
            case 'message':
                handleMessage(event);
                break;
            case 'close':
                handleClose();
                break;
            case 'error':
                handleError(event);
                break;
        }
    } catch (e) {
        logError(e);
    }
}

function handleClose(): void {
    // TODO: Prevent unnecessary operations and call to LLMs in case of close
}

function handleError(event: Enonic.WebSocketEvent): void {
    logError(event.error);
}

//
//* Receive
//

function handleMessage(event: Enonic.WebSocketEvent): void {
    const {id: socketId} = event.session;
    const message = parseMessage(event.message);
    if (!message) {
        return;
    }

    logDebug(LogDebugGroups.WS, `Received message: ${JSON.stringify(message)}`);

    switch (message.type) {
        case WSMessageType.PING:
            websocketLib.send(socketId, JSON.stringify({type: WSMessageType.PONG}));
            break;
        case WSMessageType.CONNECT:
            websocketLib.send(socketId, JSON.stringify({type: WSMessageType.CONNECTED}));
            break;
        case MessageType.GENERATE:
            sendEvent({
                type: MessageType.GENERATE,
                metadata: {
                    id: message.metadata.id,
                    sessionId: 'message.metadata.sessionId',
                    clientId: 'message.metadata.clientId',
                    socketId,
                },
                payload: message.payload,
            } satisfies GenerateMessage);
            break;
        case MessageType.STOP:
            sendEvent({
                type: MessageType.STOP,
                metadata: {
                    id: message.metadata.id,
                    sessionId: 'message.metadata.sessionId',
                    clientId: 'message.metadata.clientId',
                    socketId,
                },
                payload: message.payload,
            } satisfies StopMessage);
            break;
    }
}

function parseMessage(message: Optional<string>): Optional<ClientMessage> {
    try {
        return message != null ? (JSON.parse(message) as ClientMessage) : undefined;
    } catch (e) {
        return undefined;
    }
}

function sendEvent(data: InMessage): void {
    eventLib.send({
        type: data.type,
        distributed: true,
        data,
    });
}
