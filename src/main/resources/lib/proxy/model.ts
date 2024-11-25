import type {Schema} from '@google/generative-ai';

import type {Message, ModelResponseGenerateData} from '../../types/shared/model';
import {ModelOptions} from '../google/options';
import {Model} from '../shared/models';

export type ModelProxy = {
    generate(): Try<ModelResponseGenerateData>;
};

export type ModelProxyConfig = {
    models: Record<Model, ModelOptions>;
    instructions?: string;
    messages: Message[];
    schema?: Schema;
};
