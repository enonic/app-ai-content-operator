import type {Message, ModelResponseGenerateData, ResponseSchema} from '../../types/shared/model';
import {Mode, MODES} from '../shared/modes';
import {find} from '../utils/objects';

export type ModelProxy = {
    generate(): Try<ModelResponseGenerateData>;
};

export type ModelProxyConfig = {
    model: string;
    mode: Mode;
    instructions?: string;
    messages: Message[];
    schema?: ResponseSchema;
};

export function isMode(mode: unknown): mode is Mode {
    return mode != null && typeof mode === 'string' && MODES.indexOf(mode as Mode) >= 0;
}

export function validateMode(mode: unknown): Optional<Mode> {
    return find(MODES, m => m === mode);
}
