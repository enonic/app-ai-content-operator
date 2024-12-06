import {DataEntry} from '../../shared/data/DataEntry';
import {ERRORS} from '../../shared/errors';
import {Message} from '../../shared/model';
import {MODES_DATA} from '../../shared/modes';
import {AnalysisResult, createAnalysisInstructions, isAnalysisResult} from '../../shared/prompts/analysis';
import {GenerateMessagePayload} from '../../shared/websocket';
import {getOptions} from '../google/options';
import {logError} from '../logger';
import {GeminiProxy} from '../proxy/gemini';

type AnalyzePromptAndResult = {
    request: string;
    result: AnalysisResult;
};

export function analyze(payload: GenerateMessagePayload): Try<AnalyzePromptAndResult> {
    try {
        const [options, err1] = getOptions();
        if (err1) {
            return [null, err1];
        }

        const {url} = options.flash;
        const prompt = createAnalysisPrompt(payload);
        const messages = createAnalysisMessages(prompt, payload.history.analysis);

        const proxy = new GeminiProxy({
            url,
            instructions: createAnalysisInstructions(),
            modelParameters: MODES_DATA.focused.gemini,
            messages,
        });

        const [textResult, err2] = proxy.generate();
        if (err2) {
            return [null, err2];
        }

        const [result, err3] = parseAnalysisResult(textResult);
        if (err3) {
            return [null, err3];
        }

        return [{request: prompt, result}, null];
    } catch (err) {
        logError(err);
        return [null, ERRORS.MODEL_UNEXPECTED];
    }
}

function parseAnalysisResult(textResult: string): Try<AnalysisResult> {
    try {
        const result = JSON.parse(textResult) as AnalysisResult;
        if (!isAnalysisResult(result)) {
            return [null, ERRORS.MODEL_ANALYSIS_INCORRECT];
        }
        return [result, null];
    } catch (err) {
        logError(err);
        return [null, ERRORS.MODEL_ANALYSIS_PARSE_FAILED];
    }
}

//
//* PROMPT
//

function createAnalysisMessages(prompt: string, messages: Message[]): Message[] {
    return [{role: 'user', text: prompt}, ...messages];
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
