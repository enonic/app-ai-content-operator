import {AnalysisResult} from '../../../shared/prompts/analysis';
import {GenerationResult} from '../../../shared/prompts/generation';
import {MessageRole} from './MessageType';

export type ChatMessage = UserChatMessage | ModelChatMessage | SystemChatMessage;

export type UserChatMessage = {
    id: string;
    role: MessageRole.USER;
    content: UserChatMessageContent;
};

export type UserChatMessageContent = {
    node: React.ReactNode;
    prompt: string; // user text prompt
    analysisPrompt?: string; // May be initialized later
    generationPrompt?: string; // May be initialized later
};

export type ModelChatMessage = {
    id: string;
    for: string; // ID of the related user message
    role: MessageRole.MODEL;
    content: ModelChatMessageContent;
};

export type ModelChatMessageContent = {
    analysisResult: AnalysisResult;
    generationResult?: GenerationResult; // May be initialized later
    selectedIndices: Record<string, number>;
};

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
