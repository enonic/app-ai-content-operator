import {computed, map} from 'nanostores';

import type {
    ErrorResponse,
    Message,
    ModelPostResponse,
    ModelResponseGenerateData,
    SchemaField,
} from '../../types/shared/model';
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

export const isChatRequestRunning = computed($requests, ({chat}) => chat.state === RequestState.IN_PROGRESS);

async function attachRequest<T extends ModelPostResponse, K extends keyof RequestStore>(
    key: K,
    request: Promise<T>,
): Promise<Err<T>> {
    try {
        const data = await request;
        $requests.setKey(key, {state: RequestState.DONE});
        return [data, null];
    } catch (e) {
        $requests.setKey(key, {state: RequestState.ERROR});
        console.error(`[Enonic AI] Failed to complete request "${key}". Reason: ${String(e)}`);
        return [null, Error(String(e))];
    }
}

export async function postMessage(
    messages: Message[],
    fields?: SchemaField[],
): Promise<Err<ModelResponseGenerateData | ErrorResponse>> {
    const request = attachRequest('chat', generate(messages, fields));

    $requests.setKey('chat', {state: RequestState.IN_PROGRESS, request});

    return await request;
}
