import {computed, map} from 'nanostores';

import {ERRORS} from '../../shared/errors';
import type {ErrorResponse, ModelPostResponse, ModelRequestData} from '../../shared/model';
import {$config} from './config';
import {RequestState} from './data/RequestState';

type StoredRunningRequest<T> = {
    request: Promise<T>;
    state: RequestState.IN_PROGRESS;
};

type StoredCompletedRequest = {
    state: Exclude<RequestState, RequestState.IN_PROGRESS>;
};

type StoredRequest<T> = StoredRunningRequest<T> | StoredCompletedRequest;

export interface RequestStore {
    chat: StoredRequest<ModelPostResponse>;
}

export const $requests = map<RequestStore>({
    chat: {state: RequestState.DONE},
});

export const $chatRequestRunning = computed($requests, ({chat}) => chat.state === RequestState.IN_PROGRESS);

async function attachRequest<K extends keyof RequestStore>(
    key: K,
    request: Promise<ModelPostResponse>,
): Promise<ModelPostResponse> {
    try {
        const data = await request;
        $requests.setKey(key, {state: RequestState.DONE});
        return data;
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        $requests.setKey(key, {state: RequestState.ERROR});
        console.error(`[Enonic AI] Failed to complete request "${key}". Reason: ${msg}`);
        return {error: ERRORS.UNKNOWN_ERROR.withMsg(msg)} satisfies ErrorResponse;
    }
}

export async function postMessage(data: ModelRequestData): Promise<ModelPostResponse> {
    const request = attachRequest('chat', generate(data));

    $requests.setKey('chat', {state: RequestState.IN_PROGRESS, request});

    return await request;
}

export async function generate(data: ModelRequestData): Promise<ModelPostResponse> {
    const response = await fetch($config.get().serviceUrl, {method: 'POST', body: JSON.stringify(data)});
    return (await response.json()) as ModelPostResponse;
}
