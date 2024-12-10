import {DataEntry} from '../../shared/data/DataEntry';
import {ERRORS} from '../../shared/errors';
import {Message} from '../../shared/model';
import {MODES_DATA} from '../../shared/modes';
import {AnalysisResult} from '../../shared/prompts/analysis';
import {
    createGenerationInstructions,
    GenerationRequest,
    GenerationResult,
    isGenerationResult,
} from '../../shared/prompts/generation';
import {getOptions} from '../google/options';
import {fieldsToSchema} from '../google/schema';
import {logError} from '../logger';
import {GeminiProxy} from '../proxy/gemini';

type GenerateParams = {
    prompt: AnalysisResult;
    history: Message[];
    fields: Record<string, DataEntry>;
};

type GeneratePromptAndResult = {
    request: string;
    result: GenerationResult;
};

export function generate(params: GenerateParams): Try<GeneratePromptAndResult> {
    try {
        const [options, err1] = getOptions();
        if (err1) {
            return [null, err1];
        }

        const prompt = createGenerationPrompt(params);
        const messages = createGenerationMessages(prompt, params.history);

        const proxy = new GeminiProxy({
            url: options.pro.url,
            instructions: createGenerationInstructions(),
            modelParameters: MODES_DATA.balanced.gemini,
            messages,
            schema: fieldsToSchema(params.prompt),
        });

        const [textResult, err2] = proxy.generate();
        if (err2) {
            return [null, err2];
        }

        const [result, err3] = parseGenerationResult(textResult);
        if (err3) {
            return [null, err3];
        }

        return [{request: prompt, result}, null];
    } catch (err) {
        logError(err);
        return [null, ERRORS.MODEL_UNEXPECTED];
    }
}

function parseGenerationResult(textResult: string): Try<GenerationResult> {
    try {
        const result: unknown = JSON.parse(cleanBackticks(textResult));
        if (!isGenerationResult(result)) {
            return [null, ERRORS.MODEL_GENERATION_INCORRECT];
        }
        return [result, null];
    } catch (err) {
        logError(err);
        return [null, ERRORS.MODEL_GENERATION_PARSE_FAILED];
    }
}

function cleanBackticks(input: string): string {
    return input.replace(/^`+|`+$/g, '');
}

function createGenerationPrompt(params: GenerateParams): string {
    const {prompt, fields} = params;
    const reachPrompt = createReachPrompt(prompt, fields);
    return JSON.stringify(reachPrompt);
}

function createGenerationMessages(prompt: string, messages: Message[]): Message[] {
    return [{role: 'user', text: prompt}, ...messages];
}

function createReachPrompt(prompt: AnalysisResult, fields: Record<string, DataEntry>): GenerationRequest {
    const result: GenerationRequest = {};
    Object.keys(prompt).forEach(path => {
        result[path] = {
            ...prompt[path],
            value: fields[path].value,
        };
    });
    return result;
}
