import type {HttpClientResponse} from '/lib/http-client';

export const createResponse = (body: object | string): HttpClientResponse => ({
    status: 200,
    message: 'OK',
    headers: {},
    cookies: {},
    contentType: 'application/json',
    body: JSON.stringify(body),
});
