import {DataEntry} from '../../shared/data/DataEntry';
import {ERRORS} from '../../shared/errors';
import {Message} from '../../shared/model';
import {MODES_DATA} from '../../shared/modes';
import {AnalysisObjectEntry, AnalysisReferenceEntry, AnalysisResult} from '../../shared/prompts/analysis';
import {createGenerationInstructions, GenerationResult} from '../../shared/prompts/generation';
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

type GenerationTasksEntry = AnalysisObjectEntry & {
    type: DataEntry['type'];
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

//
//* PARSE
//

function parseGenerationResult(textResult: string): Try<GenerationResult> {
    try {
        const result: unknown = JSON.parse(cleanBackticks(textResult));
        if (!isGenerationResult(result)) {
            logError(ERRORS.MODEL_GENERATION_INCORRECT.withMsg('\n' + textResult));
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

//
//* PROMPT
//

function createGenerationMessages(prompt: string, messages: Message[]): Message[] {
    return [...messages, {role: 'user', text: prompt}];
}

function createGenerationPrompt(params: GenerateParams): string {
    return [createPromptTasks(params), createPromptContent(params)].join('\n\n');
}

function isAnalysisObjectEntry(entry: AnalysisObjectEntry | AnalysisReferenceEntry): entry is AnalysisObjectEntry {
    return 'task' in entry && entry.count > 0;
}

function createPromptTasks({prompt, fields}: GenerateParams): string {
    const content: Record<string, GenerationTasksEntry> = {};

    Object.keys(prompt).forEach(key => {
        const entry = prompt[key];
        if (isAnalysisObjectEntry(entry)) {
            content[key] = {
                ...entry,
                type: fields[key]?.type ?? 'text',
            };
        }
    });

    return `# Tasks\n${JSON.stringify(content)}`;
}

function createPromptContent({prompt, fields}: GenerateParams): string {
    const content: Record<string, string> = {};

    Object.keys(prompt).forEach(key => {
        if (key in fields) {
            content[key] = String(fields[key].value);
        }
    });

    return `# Content\n${JSON.stringify(content)}`;
}

export function isGenerationResult(result: unknown): result is GenerationResult {
    return (
        typeof result === 'object' &&
        result !== null &&
        Object.keys(result).every((key: string) => {
            const value = (result as Record<string, unknown>)[key];
            return (
                typeof value === 'string' ||
                (Array.isArray(value) && value.every((item: unknown): item is string => typeof item === 'string'))
            );
        })
    );
}
