import type {Message} from '../../shared/model';
import {ModelParameters} from '../../shared/modes';
import type {Schema} from '../google/types';

export type ModelProxy = {
    generate(): Try<string>;
};

export type ModelProxyConfig = {
    url: string;
    instructions: string;
    modelParameters: ModelParameters;
    messages: Message[];
    schema?: Schema;
};
