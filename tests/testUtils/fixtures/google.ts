import {FinishReason, type GenerateContentResponse, HarmCategory, HarmProbability} from '@google/generative-ai';

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
