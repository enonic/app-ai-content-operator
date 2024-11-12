import type {
    ErrorResponse,
    Message,
    ModelRequestGenerateData,
    ModelResponseGenerateData,
    ResponseSchema,
    SchemaField,
} from '../../types/shared/model';
import {$config} from '../stores/config';
import {$settings} from '../stores/settings';

export async function generate(
    messages: Message[],
    fields?: SchemaField[],
): Promise<ModelResponseGenerateData | ErrorResponse> {
    const {mode} = $settings.get();
    const {instructions} = $config.get();
    const schema: ResponseSchema | undefined = fields && {fields};
    const body = JSON.stringify({
        operation: 'generate',
        model: 'pro',
        mode,
        messages,
        schema,
        instructions,
    } satisfies ModelRequestGenerateData);
    const response = await fetch($config.get().serviceUrl, {method: 'POST', body});

    return (await response.json()) as ModelResponseGenerateData | ErrorResponse;
}
