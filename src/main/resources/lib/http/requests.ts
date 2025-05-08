import type {HttpClientRequestOptions, HttpClientResponse} from '/lib/http-client';
import libHttpClient from '/lib/http-client';
import {sleep} from '/lib/xp/task';

import {ERRORS, isNashornError} from '../../shared/errors';
import type {ErrorResponse} from '../../shared/model';
import {logError} from '../logger';
import {calcBackoffDelay, shouldRetryRequest} from '../utils/http';
import {calcDelayWithJitter, deleteRetryState, getRetryState, updateRetryStateIfNextAttempt} from './retries';

export type RequestParams = {
    url: string;
    method?: Enonic.HttpMethod;
    headers?: Enonic.RequestHeaders;
    body?: unknown;
    queryParams?: Record<string, string | number>;
    retries?: number;
};

export function request({retries = 3, ...options}: RequestParams): Try<HttpClientResponse> {
    try {
        let response: Optional<HttpClientResponse>;

        const retryState = getRetryState(options.url);
        const prevAttemptCount = retryState?.attempt ?? 0;
        const nextAllowed = retryState?.nextAllowed;

        const currAttempt = prevAttemptCount + 1;
        const maxAttempts = retries + 1;

        if (currAttempt > maxAttempts) {
            return [null, ERRORS.REST_MAX_RETRIES_REACHED];
        }

        for (let attempt = currAttempt; attempt <= maxAttempts; attempt++) {
            if (nextAllowed && nextAllowed > new Date()) {
                sleep(calcDelayWithJitter(retryState));
            }

            response = libHttpClient.request(createRequestOptions(options));

            const canRetry = shouldRetryRequest(response) && attempt < maxAttempts;
            if (!canRetry) {
                deleteRetryState(options.url);
                break;
            }

            const delay = calcBackoffDelay(attempt, response.headers);
            updateRetryStateIfNextAttempt(options.url, delay, attempt);
        }

        if (!response) {
            return [null, ERRORS.REST_MAX_RETRIES_REACHED];
        }

        return [response, null];
    } catch (e) {
        const error = parseHttpLibError(e);
        logError(error);
        return [null, error];
    }
}

function createRequestOptions({url, method, headers, body, queryParams}: RequestParams): HttpClientRequestOptions {
    return {
        url,
        method,
        headers: {
            accept: 'application/json',
            ...headers,
        },
        connectionTimeout: 60_000,
        readTimeout: 60_000,
        body: body != null ? JSON.stringify(body) : undefined,
        queryParams,
    };
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
