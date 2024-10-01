import type {Message, ModelResponseGenerateData, ResponseSchema} from '../../types/shared/model';
import {Model, MODELS} from '../shared/models';
import {Mode, MODES} from '../shared/modes';
import {find} from '../utils/objects';

export type ModelProxy = {
    generate(): Try<ModelResponseGenerateData>;
};

export type ModelProxyConfig = {
    modelName: string;
    mode: Mode;
    url: string;
    instructions?: string;
    messages: Message[];
    schema?: ResponseSchema;
};

export function validateModel(model: unknown): Optional<Model> {
    return find(MODELS, m => m === model);
}

export function validateMode(mode: unknown): Optional<Mode> {
    return find(MODES, m => m === mode);
}
