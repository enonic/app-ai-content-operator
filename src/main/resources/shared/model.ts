// ------------------------------------
// DATA
// ------------------------------------
type Operation = 'generate';

type OperationData<T extends Operation> = {
    operation: T;
};

export type ModelMessage = {
    role: 'user' | 'model';
    text: string;
};

export type FinishReason =
    // Finish reasons
    | 'FINISH_REASON_UNSPECIFIED'
    | 'STOP'
    | 'MAX_TOKENS'
    | 'RECITATION'
    | 'LANGUAGE'
    | 'BLOCKLIST'
    | 'PROHIBITED_CONTENT'
    | 'SPII'
    | 'MALFORMED_FUNCTION_CALL'
    // Blocked reasons
    | 'BLOCKED_REASON_UNSPECIFIED'
    // Both
    | 'SAFETY'
    | 'OTHER'
    | undefined;

// ------------------------------------
// Request
// ------------------------------------
export type ModelRequestData = ModelRequestGenerateData;
export type ModelRequestGenerateData = OperationData<'generate'> & {
    instructions?: string;
    messages: ModelMessage[];
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
