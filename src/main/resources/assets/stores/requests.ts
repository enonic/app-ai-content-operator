import {computed, map} from 'nanostores';

import type {ErrorResponse, Message, ModelPostResponse, ModelResponseGenerateData} from '../../types/shared/model';
import {generate} from '../requests/chat';
import {RequestState} from './data/RequestState';

type StoredRunningRequest<T> = {
    request: Promise<Err<T>>;
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

async function attachRequest<T extends ModelPostResponse, K extends keyof RequestStore>(
    key: K,
    request: Promise<T>,
): Promise<Err<T>> {
    try {
        const data = await request;
        $requests.setKey(key, {state: RequestState.DONE});
        return [data, null];
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        $requests.setKey(key, {state: RequestState.ERROR});
        console.error(`[Enonic AI] Failed to complete request "${key}". Reason: ${msg}`);
        return [null, Error(msg)];
    }
}

export async function postMessage(messages: Message[]): Promise<Err<ModelResponseGenerateData | ErrorResponse>> {
    const request = attachRequest('chat', generate(messages));

    $requests.setKey('chat', {state: RequestState.IN_PROGRESS, request});

    return await request;
}
