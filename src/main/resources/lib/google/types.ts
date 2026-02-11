import type {Content, Part, SafetySetting} from '@google/genai';

import type {FinishReason} from '../../shared/model';

export type {Content, Part};

export type Role = 'user' | 'model' | 'system';

export type FunctionDeclarationSchemaProperty = {
    type: string;
    description?: string;
    items?: FunctionDeclarationSchemaProperty;
    enum?: string[];
    properties?: Record<string, FunctionDeclarationSchemaProperty>;
    required?: string[];
};

export type Schema = {
    type: string;
    description?: string;
    items?: Schema;
    enum?: string[];
    properties?: Record<string, FunctionDeclarationSchemaProperty>;
    required?: string[];
};

export type ResponseSchema = Schema;

export type GenerationConfig = {
    candidateCount?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
    responseMimeType?: string;
    responseSchema?: ResponseSchema;
};

export type GenerateContentRequest = {
    contents: Content[];
    generationConfig?: GenerationConfig;
    safetySettings?: SafetySetting[];
    systemInstruction?: Content;
};

export type SafetyRating = {
    category: string;
    probability: string;
    blocked?: boolean;
};

export type Candidate = {
    content: Content;
    finishReason?: FinishReason;
    index?: number;
    safetyRatings?: SafetyRating[];
};

export type GenerateContentResponse = {
    candidates?: Candidate[];
    promptFeedback?: {
        blockReason?: FinishReason;
        safetyRatings?: SafetyRating[];
    };
    usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
    };
};
