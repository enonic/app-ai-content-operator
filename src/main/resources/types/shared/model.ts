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
    mode: string;
    instructions?: string;
    messages: Message[];
    schema?: ResponseSchema;
};

export type ResponseSchema = {
    fields: SchemaField[];
};

export type SchemaField<T extends string = string> = {
    name: T;
    type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'OBJECT' | 'ARRAY';
    description?: string;
    required?: boolean;
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
