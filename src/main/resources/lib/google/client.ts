import type {HttpClientResponse} from '/lib/http-client';

import {ERRORS} from '../errors';
import {logDebug, LogDebugGroups, logError} from '../logger';
import {request, RequestParams} from '../requests';
import {getOptions} from './options';

type GoogleRequestOptions = Omit<RequestParams, 'url'> & {
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

    const [options, err] = getOptions();
    if (err) {
        return [null, err];
    }
    const {accessToken, url} = options;

    logDebug(LogDebugGroups.GOOGLE, `client.sendRequest(${params?.method}}) url: ${url}`);

    const headers: GoogleHeaders = {
        ...(params.headers ?? {}),
        Authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
    };
    return request({
        ...params,
        headers,
        url,
    });
}

export function sendPostRequest(body?: unknown): Try<HttpClientResponse> {
    return sendRequest({method: 'POST', body});
}

export function parseResponse<Data, Body = unknown>(
    response: HttpClientResponse,
    mapper?: (body: Body) => Data,
): Try<Data> {
    logDebug(LogDebugGroups.GOOGLE, 'client.parseResponse()');

    try {
        if (response.status >= 400) {
            const message = parseError(response);
            logDebug(LogDebugGroups.GOOGLE, `client.parseResponse() error: ${JSON.stringify(response)}`);
            return [null, message ? ERRORS.GOOGLE_REQUEST_FAILED.withMsg(message) : ERRORS.GOOGLE_REQUEST_FAILED];
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

function parseError(response: HttpClientResponse): Optional<string> {
    logDebug(LogDebugGroups.GOOGLE, 'client.parseError()');

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
