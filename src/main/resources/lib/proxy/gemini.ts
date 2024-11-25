import type {Content, GenerateContentRequest, POSSIBLE_ROLES} from '@google/generative-ai';

import type {ModelResponseGenerateData} from '../../types/shared/model';
import {ERRORS} from '../errors';
import {generateCandidate} from '../google/api/generate';
import {fieldsToSchema} from '../google/schema';
import {logDebug, LogDebugGroups} from '../logger';
import {HarmBlockThreshold, HarmCategory} from '../shared/enums';
import {ModelParameters, MODES_DATA} from '../shared/modes';
import {
    createStructureAnalysisInstructions,
    isStructureAnalysisFieldsResult,
    StructureAnalysisResult,
} from '../shared/prompts/structureAnalysis';
import {createTextGenerationInstructions} from '../shared/prompts/textGeneration';
import {ModelProxy, ModelProxyConfig} from './model';

type Role = (typeof POSSIBLE_ROLES)[number];

type RequestConfig = Omit<ModelProxyConfig, 'models'> &
    ModelParameters & {
        systemInstruction: string;
    };

export class GeminiProxy implements ModelProxy {
    private readonly config: ModelProxyConfig;

    constructor(config: ModelProxyConfig) {
        this.config = config;
    }

    private static createRequestParams(config: RequestConfig): GenerateContentRequest {
        const contents = GeminiProxy.createContents(config);
        const systemInstruction = GeminiProxy.createTextContent('system', config.systemInstruction);

        return {
            contents,
            generationConfig: {
                candidateCount: 1,
                temperature: config.temperature,
                topP: config.topP,
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

    private static createContents(config: RequestConfig): Content[] {
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

    private static extractText(content: Content | undefined): string {
        return content?.parts.map(({text}) => text).join('') ?? '';
    }

    generate(): Try<ModelResponseGenerateData> {
        logDebug(LogDebugGroups.FUNC, 'gemini.GeminiProxy.generate()');

        const {flash, pro} = this.config.models;

        const analyzeParams = GeminiProxy.createRequestParams({
            ...MODES_DATA.focused.gemini,
            messages: this.config.messages,
            systemInstruction: createStructureAnalysisInstructions(),
        });

        const [content, error] = generateCandidate(flash.url, analyzeParams);

        if (error) {
            return [null, error];
        }

        if (content.finishReason !== 'STOP') {
            logDebug(
                LogDebugGroups.FUNC,
                `Analyzing prompt not completed. Finish reason: ${content.finishReason}.\nPrompt: ${JSON.stringify(analyzeParams.contents)}`,
            );
            return [content, null];
        }

        try {
            const text = content.content;
            const result = JSON.parse(text) as StructureAnalysisResult;

            log.info(JSON.stringify(result, null, 2));

            if (!isStructureAnalysisFieldsResult(result)) {
                return [content, null];
            }

            const generateParams = GeminiProxy.createRequestParams({
                ...MODES_DATA.creative.gemini,
                messages: [{role: 'user', text}],
                schema: fieldsToSchema(result),
                systemInstruction: createTextGenerationInstructions(),
            });

            return generateCandidate(pro.url, generateParams);
        } catch (error) {
            log.error(error);
            return [null, ERRORS.GOOGLE_CANDIDATES_INVALID];
        }
    }
}
