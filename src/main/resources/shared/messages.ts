/*
Message types are unified across the client and server.
We use same message types and format across WebSocket and XP Events.
*/
import {DataEntry} from './data/DataEntry';
import {ModelMessage} from './model';
import {AnalysisResult} from './prompts/analysis';
import {GenerationResult} from './prompts/generation';

export const IN_BASE = 'ai.contentoperator.in';
export const OUT_BASE = 'ai.contentoperator.out';

export enum MessageType {
    // client → server
    GENERATE = `${IN_BASE}.generate`,
    STOP = `${IN_BASE}.stop`,

    // server → client
    ANALYZED = `${OUT_BASE}.analyzed`,
    GENERATED = `${OUT_BASE}.generated`,
    FAILED = `${OUT_BASE}.failed`,
}

//
//* Client -> Server
//

export type InMessageType = MessageType.GENERATE | MessageType.STOP;

type BaseInMessage<T extends InMessageType, P = unknown> = {
    type: T;
    metadata: {
        id: string;
        clientId: string;
    };
    payload: P;
};

export type InMessage = GenerateMessage | StopMessage;

//
//* Server -> Client
//

export type OutMessageType = MessageType.ANALYZED | MessageType.GENERATED | MessageType.FAILED;

type BaseOutMessage<T extends OutMessageType, P = unknown> = {
    type: T;
    metadata: {
        id: string;
        clientId?: string;
    };
    payload: P;
};

export type OutMessage = AnalyzedMessage | GeneratedMessage | FailedMessage;

//
//* Messages
//

// Client requests generate
export type GenerateMessage = BaseInMessage<
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
export type StopMessage = BaseInMessage<
    MessageType.STOP,
    {
        generationId: string;
    }
>;

export type StopMessagePayload = StopMessage['payload'];

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
