import type { DataEntry } from './data/DataEntry';
import type { LicenseState } from './license';
import type { Message } from './model';
import type { AnalysisResult } from './prompts/analysis';
import type { GenerationResult } from './prompts/generation';

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

  // License state
  LICENSE_UPDATED = 'license_updated',

  // Connection health
  PING = 'ping',
  PONG = 'pong',

  // Generation flow (client → server)
  GENERATE = 'generate',
  STOP = 'stop',

  // Generation flow (server → client)
  ANALYZED = 'analyzed',
  GENERATED = 'generated',
  FAILED = 'failed',

  // Alt text flow (client → server)
  GENERATE_ALT_TEXT = 'generate_alt_text',

  // Alt text flow (server → client)
  ALT_TEXT_GENERATED = 'alt_text_generated',
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

// Client requests stop generation
export type StopMessage = MessageWithPayload<MessageType.STOP, { generationId: string }>;

export type StopMessagePayload = StopMessage['payload'];

// Client requests alt text generation for a content item
export type GenerateAltTextMessage = MessageWithPayload<
  MessageType.GENERATE_ALT_TEXT,
  { contentId: string; project: string }
>;

export type GenerateAltTextMessagePayload = GenerateAltTextMessage['payload'];

// Server returns the alt text result; null when generation failed or was skipped
export type AltTextGeneratedMessage = MessageWithPayload<
  MessageType.ALT_TEXT_GENERATED,
  { contentId: string; altText: string | null }
>;

export type AltTextGeneratedMessagePayload = AltTextGeneratedMessage['payload'];

// Server returns license state on connect
export type LicenseUpdatedStatePayload = { licenseState: LicenseState };
export type LicenseUpdatedErrorPayload = { code: number; message: string };
export type LicenseUpdatedPayload = LicenseUpdatedStatePayload | LicenseUpdatedErrorPayload;
export type LicenseUpdatedMessage = MessageWithPayload<
  MessageType.LICENSE_UPDATED,
  LicenseUpdatedPayload
>;

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
export type FailedMessage = MessageWithPayload<MessageType.FAILED, FailedMessagePayload>;

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

// Connection messages
export type ConnectMessage = BaseMessage<MessageType.CONNECT>;
export type ConnectedMessage = BaseMessage<MessageType.CONNECTED>;
export type DisconnectMessage = BaseMessage<MessageType.DISCONNECT>;
export type DisconnectedMessage = BaseMessage<MessageType.DISCONNECTED>;

// Health check messages
export type PingMessage = BaseMessage<MessageType.PING>;
export type PongMessage = BaseMessage<MessageType.PONG>;

export type ClientMessage =
  | ConnectMessage
  | DisconnectMessage
  | PingMessage
  | GenerateMessage
  | StopMessage
  | GenerateAltTextMessage;

export type ServerMessage =
  | ConnectedMessage
  | LicenseUpdatedMessage
  | DisconnectedMessage
  | PongMessage
  | AnalyzedMessage
  | GeneratedMessage
  | FailedMessage
  | AltTextGeneratedMessage;
