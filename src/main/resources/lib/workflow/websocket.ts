import * as websocketLib from '/lib/xp/websocket';

import {
    AnalyzedMessage,
    AnalyzedMessagePayload,
    FailedMessage,
    GeneratedMessage,
    GeneratedMessagePayload,
    InMessage,
    MessageType,
    OutMessage,
} from '../../shared/messages';
import {unsafeUUIDv4} from '../utils/uuid';

type Recipient = Omit<InMessage['metadata'], 'id'>;
type Metadata = OutMessage['metadata'];

function createMetadata({clientId, sessionId}: Recipient): Metadata {
    return {
        id: unsafeUUIDv4(),
        clientId,
        sessionId,
    };
}

export function sendMessage(socketId: string, message: OutMessage): void {
    log.info(`websocket.sendMessage(): ${message.type}`);
    websocketLib.send(socketId, JSON.stringify(message));
}

export function sendAnalyzedMessage(recipient: Recipient, payload: AnalyzedMessagePayload): void {
    const message: AnalyzedMessage = {
        type: MessageType.ANALYZED,
        metadata: createMetadata(recipient),
        payload,
    };
    sendMessage(recipient.socketId, message);
}

export function sendGeneratedMessage(recipient: Recipient, payload: GeneratedMessagePayload): void {
    const message: GeneratedMessage = {
        type: MessageType.GENERATED,
        metadata: createMetadata(recipient),
        payload,
    };
    sendMessage(recipient.socketId, message);
}

export function sendFailedErrorMessage(recipient: Recipient, error: AiError): void {
    const message: FailedMessage = {
        type: MessageType.FAILED,
        metadata: createMetadata(recipient),
        payload: {
            type: 'error',
            message: error.message,
            code: error.code,
        },
    };
    sendMessage(recipient.socketId, message);
}

export function sendFailedWarningMessage(recipient: Recipient, text: string): void {
    const message: FailedMessage = {
        type: MessageType.FAILED,
        metadata: createMetadata(recipient),
        payload: {
            type: 'warning',
            message: text,
        },
    };
    sendMessage(recipient.socketId, message);
}
