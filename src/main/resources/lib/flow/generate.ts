import {DataEntry, DataEntryType} from '../../shared/data/DataEntry';
import {SPECIAL_KEYS, SPECIAL_NAMES} from '../../shared/enums';
import {ERRORS} from '../../shared/errors';
import {Message} from '../../shared/model';
import {MODES_DATA} from '../../shared/modes';
import {AnalysisObjectEntry, AnalysisReferenceEntry, AnalysisResult} from '../../shared/prompts/analysis';
import {createGenerationInstructions, GenerationResult} from '../../shared/prompts/generation';
import {getOptions} from '../google/options';
import {fieldsToSchema} from '../google/schema';
import {logError, logWarn} from '../logger';
import {GeminiProxy} from '../proxy/gemini';
import {fixFieldKey} from '../utils/fields';
import {isObject, isPrimitive, isString, isStringArray} from '../utils/objects';

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
    type: DataEntryType;
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
            url: options.pro,
            instructions: createGenerationInstructions(),
            modelParameters: MODES_DATA.balanced.gemini,
            messages,
            schema: fieldsToSchema(params.prompt),
        });

        const [textResult, err2] = proxy.generate();
        if (err2) {
            return [null, err2];
        }

        const allowedFields = createAllowedFields(params.fields);
        const [result, err3] = parseGenerationResult(textResult, allowedFields);
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

function parseGenerationResult(textResult: string, allowedFields: string[]): Try<GenerationResult> {
    try {
        const result: unknown = JSON.parse(cleanBackticks(textResult));
        if (!isObject(result)) {
            return [null, ERRORS.MODEL_GENERATION_WRONG_TYPE];
        }

        const cleanedResult = fixResultFields(result, allowedFields);
        if (isGenerationResult(cleanedResult)) {
            return [cleanedResult, null];
        }

        const normalizedResult = attemptResultNormalization(cleanedResult);

        if (isGenerationResult(normalizedResult)) {
            logWarn(ERRORS.MODEL_GENERATION_WRONG_TYPE.withMsg('\n' + textResult));
            return [normalizedResult, null];
        }

        if (Object.keys(normalizedResult).length === 0) {
            logError(ERRORS.MODEL_GENERATION_EMPTY.withMsg('\n' + textResult));
            return [null, ERRORS.MODEL_GENERATION_EMPTY];
        }

        logError(ERRORS.MODEL_GENERATION_INCORRECT.withMsg('\n' + textResult));
        return [null, ERRORS.MODEL_GENERATION_INCORRECT];
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
                type: fields[key]?.type ?? (key === SPECIAL_NAMES.common ? 'html' : 'text'),
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

function isGenerationResult(result: Record<string, unknown>): result is GenerationResult {
    const keys = Object.keys(result);
    return (
        keys.length > 0 &&
        keys.every(key => {
            const value = result[key];
            return (
                typeof value === 'string' ||
                (Array.isArray(value) && value.every((item: unknown): item is string => typeof item === 'string'))
            );
        })
    );
}

export function fixResultFields(result: Record<string, unknown>, allowedFields: string[]): Record<string, unknown> {
    const fixedResult: Record<string, unknown> = {};

    Object.keys(result).forEach(key => {
        const validKey = fixFieldKey(key, allowedFields);
        if (validKey != null) {
            fixedResult[validKey] = result[key];
        }
    });

    return fixedResult;
}

export function attemptResultNormalization(result: Record<string, unknown>): Record<string, unknown> {
    const fixedResult: Record<string, unknown> = {};

    Object.keys(result).forEach(key => {
        const newValue = parseEntryValue(result[key]);
        if (newValue != null) {
            fixedResult[key] = newValue;
        }
    });

    return fixedResult;
}

export function parseEntryValue(value: unknown): Optional<string | string[]> {
    if (isString(value)) {
        return value;
    }

    if (isPrimitive(value)) {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value.length > 0 ? value.map(v => (isString(v) ? v : JSON.stringify(v))) : null;
    }

    if (isObject(value)) {
        const objValues = Object.keys(value).map(key => value[key]);

        // {value: string}
        if (isObjectWithValueProperty(value)) {
            return value.value;
        }

        // {[key: string | number]: string}
        if (objValues.length > 0 && objValues.every(isString)) {
            return objValues;
        }

        // {[key: string | number]: string[]}
        if (objValues.length > 0 && objValues.every(isStringArray)) {
            return objValues.reduce((acc: string[], val: string[]) => acc.concat(val), []);
        }

        // {[key: string | number]: {value: string}}
        const valueObjects = objValues.filter(isObjectWithValueProperty);
        if (objValues.length > 0 && valueObjects.length === objValues.length) {
            return valueObjects.map(v => v.value);
        }
    }

    return null;
}

function isObjectWithValueProperty(value: unknown): value is {value: string} {
    return isObject(value) && typeof value.value === 'string';
}

function createAllowedFields(entries: Record<string, DataEntry>): string[] {
    return [SPECIAL_NAMES.common, ...Object.keys(SPECIAL_KEYS), ...Object.keys(entries)];
}
