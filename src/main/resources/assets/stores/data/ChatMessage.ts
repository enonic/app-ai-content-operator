import {AnalysisResult} from '../../../shared/prompts/analysis';
import {GenerationResult} from '../../../shared/prompts/generation';
import {MessageRole} from './MessageType';

type ChatNode<T extends MessageRole, Data extends Record<string, unknown>> = {
    id: string;
    prevId?: string;
    nextIds: string[];
    active: boolean;
    role: T;
    content: Data;
};

export type ChatMessage = UserChatMessage | ModelChatMessage | SystemChatMessage;

export type UserChatMessage = ChatNode<MessageRole.USER, UserChatMessageContent>;

export type UserChatMessageContent = {
    node: React.ReactNode;
    prompt: string; // user text prompt
    contextData?: {name: string; title: string; displayName: string};
    analysisPrompt?: string; // May be initialized later
    generationPrompt?: string; // May be initialized later
};

export type ModelChatMessage = ChatNode<MessageRole.MODEL, ModelChatMessageContent>;

export type ModelChatMessageContent = {
    analysisResult: AnalysisResult;
    generationResult?: GenerationResult; // May be initialized later
    selectedIndices: Record<string, number>;
};

export type SystemChatMessage = ChatNode<MessageRole.SYSTEM, SystemChatMessageContent>;

export type SystemChatMessageContent = {
    type: SystemMessageType;
    key: string;
    node: React.ReactNode;
};

export type SystemMessageType = 'context' | 'error' | 'stop';
