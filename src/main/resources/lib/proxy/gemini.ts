import {HarmBlockThreshold, HarmCategory} from '../../shared/enums';
import {ERRORS} from '../../shared/errors';
import {generateCandidate} from '../google/api/generate';
import type {Content, GenerateContentRequest, Role} from '../google/types';
import {logDebug, LogDebugGroups} from '../logger';
import {ModelProxy, ModelProxyConfig} from './model';

export class GeminiProxy implements ModelProxy {
    private readonly config: ModelProxyConfig;

    constructor(config: ModelProxyConfig) {
        this.config = config;
    }

    private static createRequestParams(config: ModelProxyConfig): GenerateContentRequest {
        const contents = GeminiProxy.createContents(config);
        const systemInstruction = GeminiProxy.createTextContent('system', config.instructions);

        const {temperature, topP} = config.modelParameters;

        return {
            contents,
            generationConfig: {
                candidateCount: 1,
                temperature,
                topP,
                responseMimeType: 'application/json',
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

    private static createContents({messages}: ModelProxyConfig): Content[] {
        return messages.map(({role, text}) => GeminiProxy.createTextContent(role, text));
    }

    private static createTextContent(role: Role, text: string): Content {
        return {
            role,
            parts: [{text}],
        };
    }

    generate(): Try<string> {
        logDebug(LogDebugGroups.FUNC, 'gemini.GeminiProxy.generate()');

        const params = GeminiProxy.createRequestParams(this.config);
        const [data, error] = generateCandidate(this.config.url, params);

        if (error) {
            return [null, error];
        }

        const {content, finishReason} = data;

        if (content && (finishReason === 'STOP' || finishReason == null)) {
            return [content, null];
        }

        logDebug(LogDebugGroups.FUNC, `Generation not completed. Finish reason: ${finishReason}.`);
        switch (finishReason) {
            case 'MAX_TOKENS':
                return [null, ERRORS.MODEL_MAX_TOKENS];
            case 'SAFETY':
                return [null, ERRORS.MODEL_SAFETY];
            case 'PROHIBITED_CONTENT':
                return [null, ERRORS.MODEL_PROHIBITED_CONTENT];
            case 'SPII':
                return [null, ERRORS.MODEL_SPII];
            default:
                return [null, ERRORS.MODEL_UNEXPECTED.withMsg(`Finish reason: ${finishReason}.`)];
        }
    }
}
