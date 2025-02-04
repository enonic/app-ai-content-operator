import type {Schema} from '@google/generative-ai';

import type {ModelMessage} from '../../shared/model';
import {ModelParameters} from '../../shared/modes';

export type ModelProxy = {
    generate(): Try<string>;
};

export type ModelProxyConfig = {
    url: string;
    instructions: string;
    modelParameters: ModelParameters;
    messages: ModelMessage[];
    schema?: Schema;
};
