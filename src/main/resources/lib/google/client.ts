import type {HttpClientResponse} from '/lib/http-client';

import {CustomAiError, ERRORS} from '../errors';
import {logDebug, LogDebugGroups, logError} from '../logger';
import {request, RequestParams} from '../requests';
import {parseOptions} from './options';

type GoogleRequestOptions = RequestParams & {
    method: Enonic.HttpMethod;
};

type GoogleHeaders = {
    'content-type': 'application/json';
} & Enonic.RequestHeaders;

type GoogleErrorResponseBody = {
    error: {
        message: string;
    };
};

function sendRequest(params: GoogleRequestOptions): Try<HttpClientResponse> {
    logDebug(LogDebugGroups.GOOGLE, `client.sendRequest(${params?.method}})`);

    const [options, optionsErr] = parseOptions();
    if (optionsErr) {
        return [null, optionsErr];
    }
    const {accessToken} = options;

    logDebug(LogDebugGroups.GOOGLE, `client.sendRequest(${params?.method}}) url: ${params.url}`);

    const headers: GoogleHeaders = {
        ...(params.headers ?? {}),
        Authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
    };
    const [response, requestErr] = request({
        ...params,
        headers,
    });

    if (requestErr) {
        return [null, requestErr];
    }
    if (!response) {
        return [null, ERRORS.RESPONSE_BODY_MISSING];
    }
    const isJson = response.headers?.['contentType']?.indexOf('application/json') !== -1;
    if (!isJson) {
        return [null, ERRORS.REST_WRONG_CONTENT_TYPE];
    }

    return [response, null];
}

export function sendPostRequest(url: string, body?: unknown): Try<HttpClientResponse> {
    return sendRequest({url, method: 'POST', body});
}

export function parseResponse<Data, Body = unknown>(
    response: HttpClientResponse,
    mapper?: (body: Body) => Data,
): Try<Data> {
    logDebug(LogDebugGroups.GOOGLE, 'client.parseResponse()');

    try {
        if (response.status >= 400) {
            logDebug(LogDebugGroups.GOOGLE, `client.parseResponse() error: ${JSON.stringify(response)}`);
            return [null, parseError(response)];
        }

        if (response.body == null) {
            return [null, ERRORS.RESPONSE_BODY_MISSING];
        }

        const data = JSON.parse(response.body) as unknown;
        return [mapper?.(data as Body) ?? (data as Data), null];
    } catch (e) {
        logError(e);
        return [null, ERRORS.GOOGLE_RESPONSE_PARSE_FAILED];
    }
}

function parseError(response: HttpClientResponse): AiError {
    const error = getErrorByCode(response.status);
    const message = parseErrorMessage(response);
    return message ? error.withMsg(message) : error;
}

function parseErrorMessage(response: HttpClientResponse): Optional<string> {
    logDebug(LogDebugGroups.GOOGLE, 'client.parseErrorMessage()');

    try {
        if (response.body == null) {
            return response.message ?? null;
        }
        const {error} = (JSON.parse(response.body) ?? {error: {message: ''}}) as GoogleErrorResponseBody;
        return error.message;
    } catch (e) {
        return null;
    }
}

function getErrorByCode(code: number): CustomAiError {
    switch (code) {
        case 400:
            return ERRORS.GOOGLE_BAD_REQUEST;
        case 401:
            return ERRORS.GOOGLE_UNAUTHORIZED;
        case 403:
            return ERRORS.GOOGLE_FORBIDDEN;
        case 404:
            return ERRORS.GOOGLE_NOT_FOUND;
        case 408:
            return ERRORS.GOOGLE_REQUEST_TIMEOUT;
        case 500:
            return ERRORS.GOOGLE_SERVER_ERROR;
        case 503:
            return ERRORS.GOOGLE_SERVICE_UNAVAILABLE;
        default:
            return ERRORS.GOOGLE_REQUEST_FAILED;
    }
}
