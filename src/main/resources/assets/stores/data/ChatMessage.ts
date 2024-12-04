import type {ModelRequestData} from '../../../shared/model';
import type {MessageRole} from './MessageType';
import type {MultipleValues} from './MultipleValues';

export type ChatMessage = UserChatMessage | ModelChatMessage | SystemChatMessage;

export type UserChatMessage = {
    id: string;
    role: MessageRole.USER;
    content: UserChatMessageContent;
};

export type UserChatMessageContent = {
    node: React.ReactNode;
    data: ModelRequestData;
    prompt?: string;
};

export type ModelChatMessage = {
    id: string;
    forId: string; // ID of the related user message
    role: MessageRole.MODEL;
    content: ModelChatMessageContent;
};

export type ModelChatMessageContent = Record<string, string | MultipleValues>;

export type SystemChatMessage = {
    id: string;
    role: MessageRole.SYSTEM;
    content: SystemChatMessageContent;
};

export type SystemChatMessageContent = {
    type: 'context' | 'error';
    key: string;
    node: React.ReactNode;
};
