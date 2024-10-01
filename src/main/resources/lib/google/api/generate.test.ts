import type {HttpClientResponse} from '/lib/http-client';
import {createResponse} from '/tests/testUtils/testHelpers';

import type {GenerateContentRequest} from '@google/generative-ai';

import {content} from '../../../../../../tests/testUtils/fixtures/google';
import {ERRORS} from '../../errors';
import {generate} from './generate';

type Client = typeof import('../client');

// MOCKS
type MockedResponse = jest.Mock<Try<HttpClientResponse>>;

type MockedClient = Client & {
    sendPostRequest: MockedResponse;
};

const url =
    'https://us-central1-aiplatform.googleapis.com/v1/projects/playground-123456/locations/us-central1/publishers/google/models/gemini-1.5-flash-001';

jest.mock('../client', () => {
    const originalModule = jest.requireActual<Client>('../client');
    return {
        ...originalModule,
        sendPostRequest: jest.fn(),
    } satisfies MockedClient;
});

let mocks: MockedClient;

beforeAll(() => {
    mocks = jest.requireMock<MockedClient>('../client');
});

describe('generate', () => {
    const params: GenerateContentRequest = {
        contents: [
            {
                role: 'user',
                parts: [{text: 'Write a haiku about a mountain.'}],
            },
        ],
    };

    it('should generate content', () => {
        mocks.sendPostRequest.mockImplementationOnce(() => [createResponse(content), null]);

        const [result, err] = generate(url, params);

        expect(result).toEqual(content);
        expect(err).toBeNull();

        expect(mocks.sendPostRequest).toHaveBeenCalledWith(url, params);
    });

    it('should return an error if content cannot be generated', () => {
        mocks.sendPostRequest.mockImplementationOnce(() => [null, ERRORS.REST_REQUEST_FAILED]);

        const [result, err] = generate(url, params);

        expect(result).toBeNull();
        expect(err).toEqual(ERRORS.REST_REQUEST_FAILED);
    });
});
