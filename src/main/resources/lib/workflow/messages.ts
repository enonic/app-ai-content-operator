import * as eventLib from '/lib/xp/event';

import {
    AnalyzedMessage,
    AnalyzedMessagePayload,
    FailedMessage,
    GeneratedMessage,
    GeneratedMessagePayload,
    InMessage,
    LicenseUpdatedMessage,
    LicenseUpdatedPayload,
    MessageType,
    OutMessage,
} from '../../shared/messages';
import {unsafeUUIDv4} from '../utils/uuid';

type Recipient = Omit<InMessage['metadata'], 'id'>;
type Metadata = OutMessage['metadata'];

function createMetadata({clientId}: Recipient): Metadata {
    return {
        id: unsafeUUIDv4(),
        clientId,
    };
}

function sendMessageEvent(data: OutMessage): void {
    log.info(`events.sendMessageEvent(): ${data.type}`);
    eventLib.send({
        type: data.type,
        distributed: false,
        data,
    });
}

export function sendAnalyzedMessage(recipient: Recipient, payload: AnalyzedMessagePayload): void {
    sendMessageEvent({
        type: MessageType.ANALYZED,
        metadata: createMetadata(recipient),
        payload,
    } satisfies AnalyzedMessage);
}

export function sendGeneratedMessage(recipient: Recipient, payload: GeneratedMessagePayload): void {
    sendMessageEvent({
        type: MessageType.GENERATED,
        metadata: createMetadata(recipient),
        payload,
    } satisfies GeneratedMessage);
}

export function sendFailedErrorMessage(recipient: Recipient, error: AiError): void {
    sendMessageEvent({
        type: MessageType.FAILED,
        metadata: createMetadata(recipient),
        payload: {
            type: 'error',
            message: error.message,
            code: error.code,
        },
    } satisfies FailedMessage);
}

export function sendFailedWarningMessage(recipient: Recipient, text: string): void {
    sendMessageEvent({
        type: MessageType.FAILED,
        metadata: createMetadata(recipient),
        payload: {
            type: 'warning',
            message: text,
        },
    } satisfies FailedMessage);
}

export function sendLicenseUpdatedMessage(recipient: Recipient, payload: LicenseUpdatedPayload): void {
    sendMessageEvent({
        type: MessageType.LICENSE_UPDATED,
        metadata: createMetadata(recipient),
        payload,
    } satisfies LicenseUpdatedMessage);
}
