export class CustomAiError extends Error implements AiError {
    constructor(
        public code: number,
        public message: string,
    ) {
        super(message);
    }

    withMsg(message: string, replace?: boolean): CustomAiError {
        return new CustomAiError(this.code, replace ? message : `${this.message} ${message}`);
    }

    toString(): string {
        return `AI Error [${this.code}]: ${this.message}`;
    }
}

const err = (code: number, message: string): CustomAiError => new CustomAiError(code, message);

export const ERRORS = {
    // REST Errors 0000
    REST_REQUEST_FAILED: err(0, 'REST request failed.'),
    RESPONSE_BODY_MISSING: err(1, 'REST response body is missing.'),
    REST_WRONG_CONTENT_TYPE: err(10, 'Wrong content type.'),
    REST_NOT_AUTHENTICATED: err(401, 'Not authenticated.'),
    REST_NOT_FOUND: err(404, 'Not found.'),
    REST_TIMEOUT: err(408, 'Request timeout.'),
    REST_UNHANDLED_ERROR: err(500, 'Unhandled server error.'),
    // Node Errors 1000

    // Query Errors 2000

    // Function Errors 3000
    FUNC_INSUFFICIENT_DATA: err(3000, 'Insufficient data.'),
    FUNC_UNKNOWN_MODEL: err(3001, 'Unknown AI model.'),
    FUNC_UNKNOWN_MODE: err(3002, 'Unknown AI mode.'),

    // Model Errors 4000
    MODEL_MAX_TOKENS: err(4000, 'Max tokens limit reached.'),
    MODEL_SAFETY: err(4001, 'Generation was stopped due to safety reasons.'),
    MODEL_UNEXPECTED: err(4002, 'Generation finished unexpectedly.'),
    // Model (Flow) Errors 4100
    MODEL_ANALYSIS_PARSE_FAILED: err(4100, 'Failed to parse analysis result.'),
    MODEL_ANALYSIS_INCORRECT: err(4101, 'Analysis result has incorrect format.'),
    MODEL_GENERATION_PARSE_FAILED: err(4102, 'Failed to parse generation result.'),
    MODEL_GENERATION_INCORRECT: err(4103, 'Generation result has incorrect format.'),
    MODEL_OPERATION_ALREADY_RUNNING: err(4104, 'Operation already running.'),

    // Google Errors 5000
    GOOGLE_SAK_MISSING: err(5000, 'Google Service Account Key is missing or invalid.'),
    GOOGLE_SAK_READ_FAILED: err(5001, 'Failed to read Google Service Account Key.'),
    GOOGLE_ACCESS_TOKEN_MISSING: err(5002, 'Google Access Token is missing or invalid.'),
    GOOGLE_PROJECT_ID_MISSING: err(5003, 'Google Project ID is missing or invalid.'),
    GOOGLE_GEMINI_URL_MISSING: err(5004, 'Google Gemini model URL is missing.'),
    GOOGLE_GEMINI_URL_INVALID: err(5005, 'Google Gemini model URL cannot be parsed.'),
    GOOGLE_PROJECT_ID_MISMATCH: err(5006, 'Google Project ID in SAK and URL do not match.'),
    GOOGLE_MODEL_NOT_SUPPORTED: err(5007, 'Model in URL is not supported.'),
    GOOGLE_REQUEST_FAILED: err(5010, 'Request to Google API failed.'),
    GOOGLE_RESPONSE_PARSE_FAILED: err(5020, 'Failed to parse Google response.'),
    GOOGLE_CANDIDATES_EMPTY: err(5040, 'Candidates in response are empty.'),
    GOOGLE_BLOCKED: err(5041, 'Generation was blocked.'),
    GOOGLE_FINISHED_UNEXPECTEDLY: err(5042, 'Generation finished unexpectedly.'),
    GOOGLE_CANDIDATES_INVALID: err(5043, 'Unexpected format of JSON in candidates.'),
    GOOGLE_BAD_REQUEST: err(5400, 'Google API: Bad request.'),
    GOOGLE_UNAUTHORIZED: err(5401, 'Google API: Unauthorized.'),
    GOOGLE_FORBIDDEN: err(5403, 'Google API: Forbidden.'),
    GOOGLE_NOT_FOUND: err(5404, 'Google API: Not found.'),
    GOOGLE_REQUEST_TIMEOUT: err(5408, 'Request to Google API timed out.'),
    GOOGLE_TOO_MANY_REQUESTS: err(5429, 'Google API: Resource exhausted, please try again later.'),
    GOOGLE_SERVER_ERROR: err(5500, 'Google server error.'),
    GOOGLE_SERVICE_UNAVAILABLE: err(5503, 'Google service unavailable.'),

    // Other Errors 9000
    UNKNOWN_ERROR: err(9000, 'Unknown error.'),
} as const;

export function isNashornError(error: unknown): error is NashornError {
    // Nashorn error will return `false` for `error instanceof Error`
    return typeof error === 'object' && error != null && 'message' in error;
}
