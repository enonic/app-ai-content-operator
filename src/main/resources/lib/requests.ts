import libHttpClient, {HttpClientResponse} from '/lib/http-client';

import type {ErrorResponse} from '../types/shared/model';
import {ERRORS, isNashornError} from './errors';
import {logError} from './logger';

export type RequestParams = {
    url: string;
    method?: Enonic.HttpMethod;
    headers?: Enonic.RequestHeaders;
    body?: unknown;
    queryParams?: Record<string, string | number>;
};

export function request({
    url,
    method = 'GET',
    headers = {},
    body,
    queryParams,
}: RequestParams): TryOptional<HttpClientResponse> {
    try {
        return [
            libHttpClient.request({
                url,
                method,
                headers: {
                    accept: 'application/json',
                    ...headers,
                },
                connectionTimeout: 60000,
                readTimeout: 10000,
                body: body != null ? JSON.stringify(body) : undefined,
                queryParams,
            }) ?? null,
            null,
        ];
    } catch (e) {
        const error = parseHttpLibError(e);
        logError(error);
        return [null, error];
    }
}

function parseHttpLibError(error: unknown): AiError {
    if (!isNashornError(error)) {
        return ERRORS.REST_REQUEST_FAILED;
    }
    if (error.message.indexOf("couldn't receive headers on time") >= 0 || error.message.indexOf('closed') >= 0) {
        return ERRORS.REST_TIMEOUT.withMsg(error.message);
    }
    return ERRORS.REST_REQUEST_FAILED;
}

export function respond<T extends Enonic.ResponseBody = Enonic.ResponseBody>(
    status: number,
    body: T,
): Enonic.Response<T> {
    return {
        status,
        contentType: 'application/json',
        body,
    };
}

export function respondError(error: AiError, status = 500): Enonic.Response<ErrorResponse> {
    return respond(status, {error});
}

export function respondData<T extends Enonic.ResponseBody = Enonic.ResponseBody>(
    [data, error]: Try<T>,
    status = 200,
): Enonic.Response<T | ErrorResponse> {
    if (error) {
        return respondError(error);
    }
    return respond(status, data);
}
