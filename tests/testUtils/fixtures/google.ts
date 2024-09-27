import type {FinishReason, GenerateContentResponse, HarmCategory, HarmProbability} from '@google/generative-ai';

// ------------------------------------
// CONTENT
// ------------------------------------
export const content = Object.freeze({
    candidates: [
        {
            content: {
                parts: [
                    {
                        text: 'The backpack, heavier than it looked, hummed with the weight of a thousand untold stories, each zipper pull a potential portal to another world. \n',
                    },
                ],
                role: 'model',
            },
            finishReason: 'STOP' as FinishReason,
            index: 0,
            safetyRatings: [
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as HarmCategory,
                    probability: 'NEGLIGIBLE' as HarmProbability,
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH' as HarmCategory,
                    probability: 'NEGLIGIBLE' as HarmProbability,
                },
                {
                    category: 'HARM_CATEGORY_HARASSMENT' as HarmCategory,
                    probability: 'NEGLIGIBLE' as HarmProbability,
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as HarmCategory,
                    probability: 'NEGLIGIBLE' as HarmProbability,
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
