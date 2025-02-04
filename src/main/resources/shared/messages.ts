import {DataEntry} from './data/DataEntry';
import {LicenseState} from './license';
import {ModelMessage} from './model';
import {AnalysisResult} from './prompts/analysis';
import {GenerationResult} from './prompts/generation';

export const MESSAGE_BASE = 'ai.contentoperator';
export const IN_BASE = `${MESSAGE_BASE}.in`;
export const OUT_BASE = `${MESSAGE_BASE}.out`;

export enum MessageType {
    // client → server
    GENERATE = `${IN_BASE}.generate`,
    STOP = `${IN_BASE}.stop`,
    FETCH_LICENSE = `${IN_BASE}.fetch_license`,

    // server → client
    ANALYZED = `${OUT_BASE}.analyzed`,
    GENERATED = `${OUT_BASE}.generated`,
    FAILED = `${OUT_BASE}.failed`,
    LICENSE_UPDATED = `${OUT_BASE}.license_updated`,
}

//
//* Client -> Server
//

export type InMessageType = MessageType.GENERATE | MessageType.STOP | MessageType.FETCH_LICENSE;

type BaseInMessage<T extends InMessageType> = {
    type: T;
    metadata: {
        id: string;
        clientId: string;
    };
};

type BaseInMessageWithPayload<T extends InMessageType, P = unknown> = BaseInMessage<T> & {
    payload: P;
};

export type InMessage = GenerateMessage | StopMessage | FetchLicenseMessage;

//
//* Server -> Client
//

export type OutMessageType =
    | MessageType.ANALYZED
    | MessageType.GENERATED
    | MessageType.FAILED
    | MessageType.LICENSE_UPDATED;

type BaseOutMessage<T extends OutMessageType, P = unknown> = {
    type: T;
    metadata: {
        id: string;
        clientId?: string;
    };
    payload: P;
};

export type OutMessage = AnalyzedMessage | GeneratedMessage | FailedMessage | LicenseUpdatedMessage;

//
//* Messages
//

// Client requests generate
export type GenerateMessage = BaseInMessageWithPayload<
    MessageType.GENERATE,
    {
        prompt: string;
        instructions?: string;
        history: {
            analysis: ModelMessage[];
            generation: ModelMessage[];
        };
        meta: {
            language: string;
            contentPath: string;
        };
        fields: Record<string, DataEntry>;
    }
>;

export type GenerateMessagePayload = GenerateMessage['payload'];

// Client requests stop generation
export type StopMessage = BaseInMessageWithPayload<
    MessageType.STOP,
    {
        generationId: string;
    }
>;

export type StopMessagePayload = StopMessage['payload'];

// Client requests license state
export type FetchLicenseMessage = BaseInMessage<MessageType.FETCH_LICENSE>;

// Server returns license state on request or after update
export type LicenseUpdatedStatePayload = {licenseState: LicenseState};
export type LicenseUpdatedErrorPayload = {code: number; message: string};
export type LicenseUpdatedPayload = LicenseUpdatedStatePayload | LicenseUpdatedErrorPayload;
export type LicenseUpdatedMessage = BaseOutMessage<MessageType.LICENSE_UPDATED, LicenseUpdatedPayload>;

// Server returns prompt for analysis and the result
export type AnalyzedMessage = BaseOutMessage<
    MessageType.ANALYZED,
    {
        request: string;
        result: AnalysisResult;
    }
>;

export type AnalyzedMessagePayload = AnalyzedMessage['payload'];

// Server returns prompt for generation and the result
export type GeneratedMessage = BaseOutMessage<
    MessageType.GENERATED,
    {
        request: string;
        result: GenerationResult;
    }
>;

export type GeneratedMessagePayload = GeneratedMessage['payload'];

// Server reports generate failure
export type FailedMessage = BaseOutMessage<MessageType.FAILED, FailedMessagePayload>;

// Error is something thrown by code
export type FailedMessageErrorPayload = {
    type: 'error';
    code: number;
    message: string;
};

// Warning is something reported by the model
export type FailedMessageWarningPayload = {
    type: 'warning';
    message: string;
};

export type FailedMessagePayload = FailedMessageErrorPayload | FailedMessageWarningPayload;
