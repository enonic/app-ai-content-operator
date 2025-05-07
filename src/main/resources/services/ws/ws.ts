import {send} from '/lib/xp/websocket';

import {analyze} from '../../lib/flow/analyze';
import {generate} from '../../lib/flow/generate';
import {respondError} from '../../lib/http/requests';
import {getLicenseState} from '../../lib/license/license-manager';
import {logDebug, LogDebugGroups, logError} from '../../lib/logger';
import {runAsyncTask} from '../../lib/utils/task';
import {unsafeUUIDv4} from '../../lib/utils/uuid';
import {WS_PROTOCOL} from '../../shared/constants';
import {ERRORS} from '../../shared/errors';
import {LicenseState} from '../../shared/license';
import {
    AnalyzedMessage,
    AnalyzedMessagePayload,
    ClientMessage,
    FailedMessage,
    GeneratedMessage,
    GeneratedMessagePayload,
    GenerateMessage,
    LicenseUpdatedMessage,
    MessageMetadata,
    MessageType,
    ServerMessage,
} from '../../shared/websocket';

//
//* Active generation operations
//

const ACTIVE_OPERATIONS = __.newBean<Java.ConcurrentHashMap<string, boolean>>('java.util.concurrent.ConcurrentHashMap');

function isActiveOperation(id: string): boolean {
    return ACTIVE_OPERATIONS.get(id) != null;
}

function addActiveOperation(id: string): boolean {
    if (isActiveOperation(id)) {
        return false;
    }
    ACTIVE_OPERATIONS.put(id, true);
    return isActiveOperation(id);
}

function removeActiveOperation(id: string): void {
    ACTIVE_OPERATIONS.remove(id);
}

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
    const {id} = event.session;
    const message = parseMessage(event.message);
    if (!message) {
        return;
    }

    logDebug(LogDebugGroups.WS, `Received message: ${JSON.stringify(message)}`);

    switch (message.type) {
        case MessageType.PING:
            sendMessage(id, {type: MessageType.PONG});
            break;
        case MessageType.CONNECT:
            handleConnect(id);
            break;
        case MessageType.GENERATE:
            handleGenerateMessage(id, message);
            break;
        case MessageType.STOP:
            stopGeneration(message.payload.generationId);
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

//
//* Send
//

function createMetadata(): MessageMetadata {
    return {
        id: unsafeUUIDv4(),
        timestamp: Date.now(),
    };
}

function sendMessage(socketId: string, message: Omit<ServerMessage, 'metadata'>): void {
    send(socketId, JSON.stringify({...message, metadata: createMetadata()}));
}

function sendAnalyzedMessage(socketId: string, payload: AnalyzedMessagePayload): void {
    const message = {type: MessageType.ANALYZED, payload} satisfies Omit<AnalyzedMessage, 'metadata'>;
    sendMessage(socketId, message);
}

function sendGeneratedMessage(socketId: string, payload: GeneratedMessagePayload): void {
    const message = {type: MessageType.GENERATED, payload} satisfies Omit<GeneratedMessage, 'metadata'>;
    sendMessage(socketId, message);
}

function sendConnectedMessage(socketId: string): void {
    sendMessage(socketId, {type: MessageType.CONNECTED});
}

function sendLicenseUpdatedMessage(socketId: string, licenseStateOrError?: Try<LicenseState>): void {
    const license = licenseStateOrError ?? getLicenseState();
    const [licenseState, licenseError] = license;
    const payload = licenseError ? licenseError : {licenseState};
    const message = {type: MessageType.LICENSE_UPDATED, payload} satisfies Omit<LicenseUpdatedMessage, 'metadata'>;

    sendMessage(socketId, message);
}

function sendFailedErrorMessage(socketId: string, error: AiError): void {
    const message = {
        type: MessageType.FAILED,
        payload: {
            type: 'error',
            message: error.message,
            code: error.code,
        },
    } satisfies Omit<FailedMessage, 'metadata'>;
    sendMessage(socketId, message);
}

function sendFailedWarningMessage(socketId: string, text: string): void {
    const message = {
        type: MessageType.FAILED,
        payload: {
            type: 'warning',
            message: text,
        },
    } satisfies Omit<FailedMessage, 'metadata'>;
    sendMessage(socketId, message);
}

//
//* Flow
//

function handleConnect(socketId: string): void {
    sendConnectedMessage(socketId);
    sendLicenseUpdatedMessage(socketId);
}

function handleGenerateMessage(socketId: string, message: GenerateMessage): void {
    const result = getLicenseState();
    const [licenseState] = getLicenseState();

    if (licenseState !== 'OK') {
        return sendLicenseUpdatedMessage(socketId, result);
    }

    runAsyncTask('ws', () => analyzeAndGenerate(socketId, message));
}

function analyzeAndGenerate(socketId: string, message: GenerateMessage): void {
    try {
        const {id} = message.metadata;

        if (!addActiveOperation(id)) {
            return sendFailedErrorMessage(
                socketId,
                ERRORS.WS_OPERATION_ALREADY_RUNNING.withMsg(`Generation id: ${id}`),
            );
        }

        const [analysis, err1] = analyze(message.payload);

        if (!isActiveOperation(id)) {
            return;
        }

        if (err1) {
            return sendFailedErrorMessage(socketId, err1);
        }

        if (typeof analysis === 'string') {
            return sendFailedWarningMessage(socketId, analysis);
        }

        sendAnalyzedMessage(socketId, analysis);

        const [generation, err2] = generate({
            prompt: analysis.result,
            history: message.payload.history.generation,
            fields: message.payload.fields,
        });

        if (!isActiveOperation(id)) {
            return;
        }

        if (err2) {
            return sendFailedErrorMessage(socketId, err2);
        }

        sendGeneratedMessage(socketId, generation);

        removeActiveOperation(id);
    } catch (e) {
        sendFailedErrorMessage(socketId, ERRORS.WS_UNKNOWN_ERROR.withMsg('See server logs.'));
        logError(e);
    }
}

function stopGeneration(id: string): void {
    removeActiveOperation(id);
}
