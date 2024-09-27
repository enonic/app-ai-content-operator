import {MessageRole} from './MessageType';

export type ChatMessage = UserChatMessage | ModelChatMessage;

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

export type UserChatMessageContent = {
    node: JSX.Element;
    text: string;
    prompt: string;
};

export type ModelChatMessageContent = Record<string, string | MultipleContentValue | undefined>;

export type MultipleContentValue = {
    values: string[];
    selectedIndex: number;
};
