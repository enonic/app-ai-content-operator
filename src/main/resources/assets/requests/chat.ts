import type {
    ErrorResponse,
    Message,
    ModelRequestGenerateData,
    ModelResponseGenerateData,
    ResponseSchema,
    SchemaField,
} from '../../types/shared/model';
import {isErrorResponse} from '../common/data';
import {$config} from '../stores/config';
import {$settings} from '../stores/settings';

export async function generate(
    messages: Message[],
    fields?: SchemaField[],
): Promise<ModelResponseGenerateData | ErrorResponse> {
    const result = await requestGenerate(messages, fields);

    if (isErrorResponse(result)) {
        throw new Error(result.error.message);
    }

    return result;
}

async function requestGenerate(
    messages: Message[],
    fields?: SchemaField[],
): Promise<ModelResponseGenerateData | ErrorResponse> {
    const {mode} = $settings.get();
    const schema: ResponseSchema | undefined = fields && {fields};
    const body = JSON.stringify({
        operation: 'generate',
        mode,
        messages,
        schema,
    } satisfies ModelRequestGenerateData);
    const response = await fetch($config.get().serviceUrl, {method: 'POST', body});

    return (await response.json()) as ModelResponseGenerateData | ErrorResponse;
}
