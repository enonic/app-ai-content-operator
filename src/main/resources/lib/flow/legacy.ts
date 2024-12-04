import {DataEntry} from '../../shared/data/DataEntry';
import {SPECIAL_NAMES} from '../../shared/enums';
import {ERRORS} from '../../shared/errors';
import {Message, ModelRequestData, ModelResponseData, ModelResult} from '../../shared/model';
import {MODES_DATA} from '../../shared/modes';
import {createLegacyInstructions} from '../../shared/prompts/legacy';
import {getOptions} from '../google/options';
import {logError} from '../logger';
import {GeminiProxy} from '../proxy/gemini';

export function generate(payload: ModelRequestData): Try<ModelResponseData> {
    try {
        const [options, err1] = getOptions();
        if (err1) {
            return [null, err1];
        }

        const {url} = options.pro;
        const prompt = createPrompt(payload);
        const messages = createMessages(prompt, payload.history);

        const proxy = new GeminiProxy({
            url,
            instructions: createLegacyInstructions(),
            modelParameters: MODES_DATA.balanced.gemini,
            messages,
        });

        const [textResult, err2] = proxy.generate();
        if (err2) {
            return [null, err2];
        }

        const [result, err3] = parseResult(textResult, Object.keys(payload.fields));
        if (err3) {
            return [null, err3];
        }

        return [{request: prompt, result}, null];
    } catch (err) {
        logError(err);
        return [null, ERRORS.MODEL_UNEXPECTED];
    }
}

function isRecord(record: unknown): record is AnyObject {
    return record != null && typeof record === 'object' && !Array.isArray(record);
}

function parseResult(textResult: string, fields: string[]): Try<ModelResult> {
    try {
        const data = JSON.parse(cleanBackticks(textResult)) as unknown;
        if (!isRecord(data)) {
            return [null, ERRORS.MODEL_RESPONSE_INCORRECT];
        }

        const result = sortAndFixResult(data, fields);

        return [result, null];
    } catch (err) {
        logError(err);
        logError(textResult);
        return [null, ERRORS.MODEL_RESPONSE_PARSE_FAILED];
    }
}

function cleanBackticks(input: string): string {
    return input.replace(/^`+|`+$/g, '');
}

function sortAndFixResult(result: Record<string, unknown>, fields: string[]): ModelResult {
    const specialValues = Object.keys(SPECIAL_NAMES).map(key => SPECIAL_NAMES[key as keyof typeof SPECIAL_NAMES]);
    const ORDERED_KEYS: string[] = [...specialValues, ...fields].reverse();

    return Object.keys(result)
        .sort((keyA, keyB) => {
            const indexA = ORDERED_KEYS.indexOf(keyA);
            const indexB = ORDERED_KEYS.indexOf(keyB);
            return indexB - indexA;
        })
        .map((key): [string, unknown] => [key, result[key]])
        .reduce((acc, [key, value]) => {
            const parsedValue = parseValue(value);
            const isEmpty = typeof parsedValue === 'string' && parsedValue === '';
            return isEmpty ? acc : {...acc, [key]: parsedValue};
        }, {});
}

function parseValue(value: unknown): string | string[] {
    if (typeof value === 'string') {
        return value.trim();
    }

    if (Array.isArray(value)) {
        if (value.length > 1) {
            return value.map(v => String(v).trim()).filter(v => v !== '');
        } else {
            return String(value[0] ?? '').trim();
        }
    }

    if (isRecord(value) && 'value' in value && typeof value.value === 'string') {
        return value.value.trim();
    }

    return String(value).trim();
}

//
//* PROMPT
//

function createMessages(prompt: string, messages: Message[]): Message[] {
    return [...messages, {role: 'user', text: prompt}];
}

function createPrompt({prompt, instructions, meta, fields}: ModelRequestData): string {
    return [
        createPromptRequest(prompt),
        createPromptInstructions(instructions ?? ''),
        createPromptMetadata(meta.language, meta.contentPath),
        createPromptFields(fields),
        createPromptContent(fields),
    ].join('\n\n');
}

function createPromptRequest(prompt: string): string {
    return `#Request:\n${prompt}`;
}

function createPromptInstructions(instructions: string): string {
    return `#Instructions:\n${instructions}`;
}

function createPromptMetadata(language: string, contentPath: string): string {
    return ['#Metadata', `- Language: ${language}`, `- Content path: ${contentPath}`].join('\n');
}

function createPromptFields(fields: Record<string, DataEntry>): string {
    return (
        '#Fields:\n' +
        Object.keys(fields)
            .map(path => `- ${path}`)
            .join('\n')
    );
}

function createPromptContent(fields: Record<string, DataEntry>): string {
    return ['#Content', '```\n', JSON.stringify(fields, null, 2), '\n```'].join('\n');
}
