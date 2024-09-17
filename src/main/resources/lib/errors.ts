export class CustomAiError implements AiError {
    constructor(
        public code: number,
        public message: string,
    ) {}

    withMsg(message: string): CustomAiError {
        return new CustomAiError(this.code, message);
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
    REST_MODE_REQUIRED: err(10, 'Mode is required.'),
    REST_MESSAGES_REQUIRED: err(11, 'Messages are required.'),
    REST_FIELDS_REQUIRED: err(12, 'Fields are required.'),
    REST_REQUEST_PARAMS_MISSING: err(13, 'Request params are missing.'),
    REST_REQUEST_BODY_MISSING: err(20, 'Request body is missing.'),
    REST_OPERATION_NOT_SUPPORTED: err(21, 'Operation not supported.'),
    REST_NOT_AUTHENTICATED: err(401, 'Not authenticated.'),
    REST_UNHANDLED_ERROR: err(500, 'Unhandled server error.'),

    // Node Errors 1000

    // Query Errors 2000

    // Function Errors 3000
    FUNC_INSUFFICIENT_DATA: err(3000, 'Insufficient data.'),
    FUNC_UNKNOWN_MODE: err(3001, 'Unknown AI mode.'),

    // Model Errors 4000

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

    // Other Errors 9000
    UNKNOWN_ERROR: err(9000, 'Unknown error.'),
} as const;
