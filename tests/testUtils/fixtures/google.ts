import {FinishReason, HarmCategory, HarmProbability} from '@google/genai';

import type {GenerateContentResponse} from '../../../src/main/resources/lib/google/types';

// ------------------------------------
// CONTENT
// ------------------------------------
export const content = Object.freeze({
    candidates: [
        {
            content: {
                parts: [
                    {
                        text: 'Towering mountain\nPiercing through misty morning\nSilent sentinel.',
                    },
                ],
                role: 'model',
            },
            finishReason: FinishReason.STOP,
            index: 0,
            safetyRatings: [
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    probability: HarmProbability.NEGLIGIBLE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    probability: HarmProbability.NEGLIGIBLE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    probability: HarmProbability.NEGLIGIBLE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    probability: HarmProbability.NEGLIGIBLE,
                },
            ],
        },
    ],
    usageMetadata: {
        promptTokenCount: 11,
        candidatesTokenCount: 29,
        totalTokenCount: 40,
    },
} satisfies GenerateContentResponse);
