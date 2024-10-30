import {MessageRole} from './MessageType';

export type ChatMessage = UserChatMessage | ModelChatMessage | SystemChatMessage;

export type UserChatMessage = {
    id: string;
    role: MessageRole.USER;
    content: UserChatMessageContent;
};

export type ModelChatMessage = {
    id: string;
    role: MessageRole.MODEL;
    content: ModelChatMessageContent;
};

export type SystemChatMessage = {
    id: string;
    role: MessageRole.SYSTEM;
    content: SystemChatMessageContent;
};

export type UserChatMessageContent = {
    node: React.ReactNode;
    text: string;
    prompt: string;
};

export type ModelChatMessageContent = Record<string, string | MultipleContentValue | undefined>;

export type MultipleContentValue = {
    values: string[];
    selectedIndex: number;
};

export type SystemChatMessageContent = {
    type: 'context';
    node: React.ReactNode;
};
