import { createResponse } from '/tests/testUtils/testHelpers';
import { describe, expect, it, vi } from 'vitest';

import { content } from '../../../../../../tests/testUtils/fixtures/google';
import { ERRORS } from '../../../shared/errors';
import type { ModelResponseGenerateData } from '../../../shared/model';
import * as Client from '../client';
import type { GenerateContentRequest } from '../types';
import { generate, generateCandidate } from './generate';

const url =
    'https://us-central1-aiplatform.googleapis.com/v1/projects/playground-123456/locations/us-central1/publishers/google/models/gemini-1.5-flash-001';

vi.mock('../client', async importOriginal => {
    const original = await importOriginal<typeof Client>();
    return {
        ...original,
        sendPostRequest: vi.fn(),
    };
});

describe('generate', () => {
    const params: GenerateContentRequest = {
        contents: [
            {
                role: 'user',
                parts: [{ text: 'Write a haiku about a mountain.' }],
            },
        ],
    };

    it('should generate content', () => {
        const mockedSend = vi.mocked(Client.sendPostRequest);
        mockedSend.mockImplementationOnce(() => [createResponse(content), null]);

        const [result, err] = generate(url, params);

        expect(result).toEqual(content);
        expect(err).toBeNull();

        expect(mockedSend).toHaveBeenCalledWith(url, params);
    });

    it('should return an error if content cannot be generated', () => {
        const mockedSend = vi.mocked(Client.sendPostRequest);
        mockedSend.mockImplementationOnce(() => [null, ERRORS.REST_REQUEST_FAILED]);

        const [result, err] = generate(url, params);

        expect(result).toBeNull();
        expect(err).toEqual(ERRORS.REST_REQUEST_FAILED);
    });
});

describe('generateCandidate', () => {
    const params: GenerateContentRequest = {
        contents: [
            {
                role: 'user',
                parts: [{ text: 'Write a haiku about a mountain.' }],
            },
        ],
    };

    it('should generate candidate content', () => {
        const expectedResponse: ModelResponseGenerateData = {
            content: 'Towering mountain\nPiercing through misty morning\nSilent sentinel.',
            finishReason: 'STOP',
        };

        const mockedSend = vi.mocked(Client.sendPostRequest);
        mockedSend.mockImplementationOnce(() => [createResponse(content), null]);

        const [result, err] = generateCandidate(url, params);

        expect(result).toEqual(expectedResponse);
        expect(err).toBeNull();

        expect(mockedSend).toHaveBeenCalledWith(url, params);
    });

    it('should handle blocked content', () => {
        const blockedContent = {
            candidates: [],
            promptFeedback: {
                blockReason: 'SAFETY',
            },
        };

        const mockedSend = vi.mocked(Client.sendPostRequest);
        mockedSend.mockImplementationOnce(() => [createResponse(blockedContent), null]);

        const [result, err] = generateCandidate(url, params);

        expect(result).toEqual({
            content: '',
            finishReason: 'SAFETY',
        });
        expect(err).toBeNull();
    });

    it('should handle empty candidates', () => {
        const emptyResponse = {
            candidates: [],
            promptFeedback: {},
        };

        const mockedSend = vi.mocked(Client.sendPostRequest);
        mockedSend.mockImplementationOnce(() => [createResponse(emptyResponse), null]);

        const [result, err] = generateCandidate(url, params);

        expect(result).toBeNull();
        expect(err).toEqual(ERRORS.GOOGLE_CANDIDATES_EMPTY);
    });

    it('should return an error if request fails', () => {
        const mockedSend = vi.mocked(Client.sendPostRequest);
        mockedSend.mockImplementationOnce(() => [null, ERRORS.REST_REQUEST_FAILED]);

        const [result, err] = generateCandidate(url, params);

        expect(result).toBeNull();
        expect(err).toEqual(ERRORS.REST_REQUEST_FAILED);
    });
});
