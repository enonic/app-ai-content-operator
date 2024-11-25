import type {
    ErrorResponse,
    Message,
    ModelRequestGenerateData,
    ModelResponseGenerateData,
} from '../../types/shared/model';
import {$config} from '../stores/config';

export async function generate(messages: Message[]): Promise<ModelResponseGenerateData | ErrorResponse> {
    const {instructions} = $config.get();
    const body = JSON.stringify({
        operation: 'generate',
        messages,
        instructions,
    } satisfies ModelRequestGenerateData);
    const response = await fetch($config.get().serviceUrl, {method: 'POST', body});

    return (await response.json()) as ModelResponseGenerateData | ErrorResponse;
}
