import {DataEntry} from '../../shared/data/DataEntry';
import {SPECIAL_KEYS, SPECIAL_NAMES} from '../../shared/enums';
import {ERRORS} from '../../shared/errors';
import {GenerateMessagePayload} from '../../shared/messages';
import {ModelMessage} from '../../shared/model';
import {MODES_DATA} from '../../shared/modes';
import {
    AnalysisErrorResult,
    AnalysisObjectEntry,
    AnalysisReferenceEntry,
    AnalysisResult,
    AnalysisUnclearResult,
    createAnalysisInstructions,
    RawAnalysisResult,
} from '../../shared/prompts/analysis';
import {getOptions} from '../google/options';
import {logError} from '../logger';
import {GeminiProxy} from '../proxy/gemini';
import {fixFieldKey, toFieldPath} from '../utils/fields';

type AnalyzePromptAndResult = {
    request: string;
    result: AnalysisResult;
};

export function analyze(payload: GenerateMessagePayload): Try<AnalyzePromptAndResult | string> {
    try {
        const [options, err1] = getOptions();
        if (err1) {
            return [null, err1];
        }

        const prompt = createAnalysisPrompt(payload);
        const messages = createAnalysisMessages(prompt, payload.history.analysis);

        const proxy = new GeminiProxy({
            url: options.flash,
            instructions: createAnalysisInstructions(),
            modelParameters: MODES_DATA.focused.gemini,
            messages,
        });

        const [textResult, err2] = proxy.generate();
        if (err2) {
            return [null, err2];
        }

        const allowedFields = createAllowedFields(payload.fields);
        const [result, err3] = parseAnalysisResult(textResult, allowedFields);
        if (err3) {
            return [null, err3];
        }

        if (isWarningResult(result)) {
            return [getWarningMessage(result), null];
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

function createAllowedFields(fields: Record<string, DataEntry>): string[] {
    return [...Object.keys(fields), toFieldPath(SPECIAL_NAMES.topic), SPECIAL_NAMES.common];
}

function parseAnalysisResult(textResult: string, allowedFields: string[]): Try<RawAnalysisResult> {
    try {
        const result: unknown = JSON.parse(cleanBackticks(textResult));
        if (!isObject(result)) {
            return [null, ERRORS.MODEL_ANALYSIS_WRONG_TYPE];
        }
        const cleaned = fixEntries(result, allowedFields);
        if (Object.keys(cleaned).length === 0) {
            return [null, ERRORS.MODEL_ANALYSIS_EMPTY];
        }
        return [cleaned, null];
    } catch (err) {
        logError(err);
        return [null, ERRORS.MODEL_ANALYSIS_PARSE_FAILED];
    }
}

function cleanBackticks(input: string): string {
    return input.replace(/^`+|`+$/g, '');
}

export function fixEntries(result: Record<string, unknown>, allowedFields: string[]): RawAnalysisResult {
    const cleaned: AnalysisResult = {};
    for (const key in result) {
        const value = result[key];

        // ! Return object with single special field
        if (isAnalysisStringEntry(value)) {
            if (key === SPECIAL_KEYS.error) {
                return {[key]: value};
            } else if (key === SPECIAL_KEYS.unclear) {
                return {[key]: value};
            }
        }

        const validKey = fixFieldKey(key, allowedFields);
        if (validKey == null) {
            continue;
        }

        if (isAnalysisReferenceEntry(value)) {
            cleaned[validKey] = {count: 0} satisfies AnalysisReferenceEntry;
        } else if (isAnalysisObjectEntry(value)) {
            cleaned[validKey] = {
                task: value.task,
                language: value.language,
                count: Math.max(parseInt(String(value.count)) || 1, 1),
            } satisfies AnalysisObjectEntry;
        }
    }
    return cleaned;
}

function isObject(result: unknown): result is Record<string, unknown> {
    return typeof result === 'object' && result !== null;
}

function isAnalysisObjectEntry(entry: unknown): entry is AnalysisObjectEntry {
    return (
        isObject(entry) &&
        'task' in entry &&
        'language' in entry &&
        typeof entry.task === 'string' &&
        typeof entry.language === 'string' &&
        entry.task !== ''
    );
}

function isAnalysisReferenceEntry(entry: unknown): entry is AnalysisReferenceEntry {
    return isObject(entry) && !('task' in entry) && 'count' in entry;
}

function isAnalysisStringEntry(entry: unknown): entry is string {
    return typeof entry === 'string' && entry !== '';
}

const isErrorResult = (result: RawAnalysisResult): result is AnalysisErrorResult => SPECIAL_KEYS.error in result;
const isUnclearResult = (result: RawAnalysisResult): result is AnalysisUnclearResult => SPECIAL_KEYS.unclear in result;

export function isWarningResult(result: RawAnalysisResult): result is AnalysisErrorResult | AnalysisUnclearResult {
    return isErrorResult(result) || isUnclearResult(result);
}

export function getWarningMessage(result: AnalysisErrorResult | AnalysisUnclearResult): string {
    return isErrorResult(result) ? result[SPECIAL_KEYS.error] : result[SPECIAL_KEYS.unclear];
}

//
//* PROMPT
//

function createAnalysisMessages(prompt: string, messages: ModelMessage[]): ModelMessage[] {
    return [...messages, {role: 'user', text: prompt}];
}

function createAnalysisPrompt({prompt, instructions, meta, fields}: GenerateMessagePayload): string {
    return [
        createPromptRequest(prompt),
        createPromptInstructions(instructions ?? ''),
        createPromptMetadata(meta.language, meta.contentPath),
        createPromptFields(fields),
        createPromptContent(fields),
    ].join('\n\n');
}

function createPromptRequest(prompt: string): string {
    return `# Request\n${prompt}`;
}

function createPromptInstructions(instructions: string): string {
    return `# Instructions\n${instructions}`;
}

function createPromptMetadata(language: string, contentPath: string): string {
    return `# Metadata\n- Language: ${language}\n- Content path: ${contentPath}`;
}

function createPromptFields(fields: Record<string, DataEntry>): string {
    const paths = Object.keys(fields)
        .map(path => `- ${path}`)
        .join('\n');
    return `# Fields\n${paths}`;
}

function createPromptContent(fields: Record<string, DataEntry>): string {
    return `# Content\n${JSON.stringify(fields, null, 2)}`;
}
