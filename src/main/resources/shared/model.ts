// ------------------------------------
// DATA
// ------------------------------------
type Operation = 'generate';

type OperationData<T extends Operation> = {
    operation: T;
};

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

// ------------------------------------
// Request
// ------------------------------------
export type ModelRequestData = ModelRequestGenerateData;
export type ModelRequestGenerateData = OperationData<'generate'> & {
    instructions?: string;
    messages: Message[];
};

// ------------------------------------
// Response
// ------------------------------------
export type ErrorResponse = {
    error: AiError;
};

export type ModelResponseGenerateData = {
    content: string;
    finishReason: FinishReason;
};

export type ModelPostResponse = ModelResponseGenerateData | ErrorResponse;
