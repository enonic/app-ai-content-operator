import {DataEntry} from './data/DataEntry';

export type Message = {
    role: 'user' | 'model';
    text: string;
};

export type FinishReason =
    | 'BLOCKED_REASON_UNSPECIFIED'
    | 'FINISH_REASON_UNSPECIFIED'
    | 'STOP'
    | 'MAX_TOKENS'
    | 'SAFETY'
    | 'RECITATION'
    | 'LANGUAGE'
    | 'OTHER'
    | undefined;

export type ModelResult = Record<string, string | string[]>;

// ------------------------------------
// Request
// ------------------------------------
export type ModelRequestData = {
    prompt: string;
    instructions?: string;
    history: Message[];
    meta: {
        language: string;
        contentPath: string;
    };
    fields: Record<string, DataEntry>;
};

export function isModelRequestData(data: unknown): data is ModelRequestData {
    return (
        typeof data === 'object' &&
        data !== null &&
        'prompt' in data &&
        typeof data.prompt === 'string' &&
        'history' in data &&
        Array.isArray(data.history) &&
        'meta' in data &&
        typeof data.meta === 'object' &&
        data.meta !== null &&
        'language' in data.meta &&
        typeof data.meta.language === 'string' &&
        'contentPath' in data.meta &&
        typeof data.meta.contentPath === 'string' &&
        'fields' in data &&
        typeof data.fields === 'object' &&
        data.fields !== null
    );
}

// ------------------------------------
// Response
// ------------------------------------
export type GenerateResponseData = {
    content: string;
    finishReason: FinishReason;
};

export type ErrorResponse = {
    error: AiError;
};

export type ModelResponseData = {
    request: string;
    result: ModelResult;
};

export type ModelPostResponse = ModelResponseData | ErrorResponse;
