import {DataEntry} from './data/DataEntry';
import {Message} from './model';
import {AnalysisResult} from './prompts/analysis';
import {GenerationResult} from './prompts/generation';

export type MessageMetadata = {
    id: string;
    timestamp: number;
};

type BaseMessage<T extends MessageType> = {
    type: T;
    metadata: MessageMetadata;
};

type MessageWithPayload<T extends MessageType, P = unknown> = BaseMessage<T> & {
    payload: P;
};

export enum MessageType {
    // Connection lifecycle (client → server)
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',

    // Connection lifecycle (server → client)
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',

    // Connection health
    PING = 'ping',
    PONG = 'pong',

    // Generation flow (client → server)
    GENERATE = 'generate',

    // Generation flow (server → client)
    ANALYZED = 'analyzed',
    GENERATED = 'generated',
    FAILED = 'failed',
}

// Client requests generate
export type GenerateMessage = MessageWithPayload<
    MessageType.GENERATE,
    {
        prompt: string;
        instructions?: string;
        history: {
            analysis: Message[];
            generation: Message[];
        };
        meta: {
            language: string;
            contentPath: string;
        };
        fields: Record<string, DataEntry>;
    }
>;

export type GenerateMessagePayload = GenerateMessage['payload'];

// Server returns prompt for analysis and the result
export type AnalyzedMessage = MessageWithPayload<
    MessageType.ANALYZED,
    {
        request: string;
        result: AnalysisResult;
    }
>;

export type AnalyzedMessagePayload = AnalyzedMessage['payload'];

// Server returns prompt for generation and the result
export type GeneratedMessage = MessageWithPayload<
    MessageType.GENERATED,
    {
        request: string;
        result: GenerationResult;
    }
>;

export type GeneratedMessagePayload = GeneratedMessage['payload'];

// Server reports generate failure
export type FailedMessage = MessageWithPayload<
    MessageType.FAILED,
    {
        code: number;
        message: string;
        details?: unknown;
    }
>;

export type FailedMessagePayload = FailedMessage['payload'];

// Connection messages
export type ConnectMessage = BaseMessage<MessageType.CONNECT>;
export type ConnectedMessage = BaseMessage<MessageType.CONNECTED>;
export type DisconnectMessage = BaseMessage<MessageType.DISCONNECT>;
export type DisconnectedMessage = BaseMessage<MessageType.DISCONNECTED>;

// Health check messages
export type PingMessage = BaseMessage<MessageType.PING>;
export type PongMessage = BaseMessage<MessageType.PONG>;

export type ClientMessage = ConnectMessage | DisconnectMessage | PingMessage | GenerateMessage;

export type ServerMessage =
    | ConnectedMessage
    | DisconnectedMessage
    | PongMessage
    | AnalyzedMessage
    | GeneratedMessage
    | FailedMessage;
