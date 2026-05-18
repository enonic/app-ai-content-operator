import { describe, expect, it, vi } from 'vitest';

import type { FinishReason } from '../../shared/model';
import type { ModelProxyConfig } from './model';

import { HarmBlockThreshold, HarmCategory } from '../../shared/enums';
import { ERRORS } from '../../shared/errors';
import * as GenerateApi from '../google/api/generate';
import { GeminiProxy } from './gemini';

vi.mock('../google/api/generate', async (importOriginal) => {
  const original = await importOriginal<typeof GenerateApi>();
  return {
    ...original,
    generateCandidate: vi.fn(),
  };
});

const config: ModelProxyConfig = {
  url: 'https://aiplatform.eu.rep.googleapis.com/v1/projects/test/locations/eu/publishers/google/models/gemini-3.1-flash-lite:generateContent',
  instructions: 'Be precise.',
  modelParameters: { temperature: 0.3, topP: 0.95 },
  thinkingLevel: 'medium',
  messages: [{ role: 'user', text: 'Generate the content.' }],
};

describe('GeminiProxy', () => {
  it('passes the request with thinking config to the model', () => {
    const mocked = vi.mocked(GenerateApi.generateCandidate);
    mocked.mockImplementationOnce(() => [
      { content: 'Generated text.', finishReason: 'STOP' },
      null,
    ]);

    const [result, err] = new GeminiProxy(config).generate();

    expect(result).toBe('Generated text.');
    expect(err).toBeNull();

    expect(mocked).toHaveBeenCalledWith(config.url, {
      contents: [{ role: 'user', parts: [{ text: 'Generate the content.' }] }],
      generationConfig: {
        candidateCount: 1,
        temperature: 0.3,
        topP: 0.95,
        responseMimeType: 'application/json',
        thinkingConfig: {
          thinkingLevel: 'medium',
        },
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      systemInstruction: { role: 'system', parts: [{ text: 'Be precise.' }] },
    });
  });

  it.each<[FinishReason, (typeof ERRORS)[keyof typeof ERRORS]]>([
    ['MAX_TOKENS', ERRORS.MODEL_MAX_TOKENS],
    ['SAFETY', ERRORS.MODEL_SAFETY],
    ['PROHIBITED_CONTENT', ERRORS.MODEL_PROHIBITED_CONTENT],
    ['SPII', ERRORS.MODEL_SPII],
  ])('returns an error for the %s finish reason', (finishReason, expected) => {
    vi.mocked(GenerateApi.generateCandidate).mockImplementationOnce(() => [
      { content: '', finishReason },
      null,
    ]);

    const [result, err] = new GeminiProxy(config).generate();

    expect(result).toBeNull();
    expect(err).toEqual(expected);
  });

  it('propagates errors from the model', () => {
    vi.mocked(GenerateApi.generateCandidate).mockImplementationOnce(() => [
      null,
      ERRORS.REST_REQUEST_FAILED,
    ]);

    const [result, err] = new GeminiProxy(config).generate();

    expect(result).toBeNull();
    expect(err).toEqual(ERRORS.REST_REQUEST_FAILED);
  });
});
