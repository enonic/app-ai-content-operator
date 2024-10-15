import type {Content, GenerateContentRequest, POSSIBLE_ROLES, ResponseSchema} from '@google/generative-ai';

import type {ModelResponseGenerateData} from '../../types/shared/model';
import {ERRORS} from '../errors';
import {generate} from '../google/api/generate';
import {fieldsToSchema} from '../google/schema';
import {logDebug, LogDebugGroups} from '../logger';
import {HarmBlockThreshold, HarmCategory} from '../shared/enums';
import {MODES_DATA} from '../shared/modes';
import {createSystemInstructions} from '../shared/prompts';
import {ModelProxy, ModelProxyConfig} from './model';

type Role = (typeof POSSIBLE_ROLES)[number];

export class GeminiProxy implements ModelProxy {
    private readonly url: string;
    private readonly params: GenerateContentRequest;

    constructor(config: ModelProxyConfig) {
        this.url = config.url;
        this.params = GeminiProxy.createRequestParams(config);
    }

    private static createRequestParams(config: ModelProxyConfig): GenerateContentRequest {
        const {temperature, topP} = MODES_DATA[config.mode].gemini;
        const responseMimeType = 'application/json';
        const contents = GeminiProxy.createContents(config);
        const responseSchema = GeminiProxy.createResponseSchema(config);
        const systemInstruction = GeminiProxy.createTextContent('system', createSystemInstructions());

        return {
            contents,
            generationConfig: {
                candidateCount: 1,
                temperature,
                topP,
                responseMimeType,
                responseSchema,
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
            systemInstruction,
        };
    }

    private static createContents(config: ModelProxyConfig): Content[] {
        const {instructions, messages} = config;
        const contents: Content[] = [];

        if (instructions) {
            contents.push(this.createTextContent('user', instructions));
        }

        messages.forEach(({role, text}) => {
            contents.push(this.createTextContent(role, text));
        });

        return contents;
    }

    private static createTextContent(role: Role, text: string): Content {
        return {
            role,
            parts: [{text}],
        };
    }

    private static createResponseSchema({schema, modelName}: ModelProxyConfig): ResponseSchema | undefined {
        const isSchemaSupported = modelName.startsWith('gemini-1.5-pro');
        const hasSchema = schema != null && schema.fields.length > 0;

        return isSchemaSupported && hasSchema ? fieldsToSchema(schema.fields) : undefined;
    }

    private static extractText(content: Content | undefined): string {
        return content?.parts.map(({text}) => text).join('') ?? '';
    }

    generate(): Try<ModelResponseGenerateData> {
        logDebug(LogDebugGroups.FUNC, 'gemini.GeminiProxy.generate()');

        const [response, err] = generate(this.url, this.params);
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

        const data: ModelResponseGenerateData = {
            content: GeminiProxy.extractText(content.content),
            finishReason: content.finishReason,
        };

        return [data, null];
    }
}
