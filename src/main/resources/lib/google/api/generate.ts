import {ERRORS} from '../../../shared/errors';
import {ModelResponseGenerateData} from '../../../shared/model';
import {logDebug, LogDebugGroups} from '../../logger';
import {parseResponse, sendPostRequest} from '../client';
import type {GenerateContentRequest, GenerateContentResponse, ResponseSchema} from '../types';

export type GenerationMeta = {
    instructions: string;
    mimeType: 'text/plain' | 'application/json';
    schema?: ResponseSchema;
};

export function generate(url: string, params: GenerateContentRequest): Try<GenerateContentResponse> {
    logDebug(LogDebugGroups.GOOGLE, `generate.generate(${JSON.stringify(params)})`);

    const [response, err] = sendPostRequest(url, params);
    if (err) {
        return [null, err];
    }

    return parseResponse(response);
}

export function generateCandidate(url: string, params: GenerateContentRequest): Try<ModelResponseGenerateData> {
    logDebug(LogDebugGroups.FUNC, 'gemini.GeminiProxy.generate()');

    const [response, err] = generate(url, params);
    if (err) {
        return [null, err];
    }

    const {candidates, promptFeedback} = response;
    if (promptFeedback?.blockReason != null) {
        return [{content: '', finishReason: promptFeedback.blockReason}, null];
    }

    const [content] = candidates ?? [];
    if (!content) {
        return [null, ERRORS.GOOGLE_CANDIDATES_EMPTY];
    }

    const text = content.content?.parts?.map(({text}) => text).join('') ?? '';
    const data: ModelResponseGenerateData = {
        content: text,
        finishReason: content.finishReason,
    };

    return [data, null];
}
