import type {HttpClientResponse, ResponseHeaders} from '/lib/http-client';

export function parseRetryAfterMs(header: Optional<string | number>): Optional<number> {
    if (!header) {
        return null;
    }

    const seconds = typeof header === 'string' ? parseInt(header, 10) : header;
    if (!isNaN(seconds)) {
        return seconds * 1000;
    }

    const date = new Date(header);
    if (!isNaN(date.getTime())) {
        const diff = date.getTime() - Date.now();
        return diff > 0 ? diff : 0;
    }

    return null;
}

export function calcBackoffDelay(attempt: number, headers: Optional<ResponseHeaders>): number {
    const baseDelay = 500;
    const maxDelay = 15_000;

    const retryAfterMs = headers && parseRetryAfterMs(headers['retry-after']);
    if (retryAfterMs != null) {
        return retryAfterMs;
    }

    return Math.min(baseDelay * 2 ** (attempt - 1), maxDelay);
}

export function calcFullJitterWindow(delay: number): number {
    const cap = Math.min(delay, 5_000);
    return Math.random() * cap;
}

export function shouldRetryRequest(response: Optional<HttpClientResponse>): response is HttpClientResponse {
    if (!response) {
        return false;
    }

    const status = response.status;

    return (
        status === 408 ||
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        status === 520 ||
        status === 521 ||
        status === 522 ||
        status === 599
    );
}
