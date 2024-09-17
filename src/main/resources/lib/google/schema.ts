import type {FunctionDeclarationSchema, Schema, SchemaType} from '@google/generative-ai';

import type {SchemaField} from '../../types/shared/model';
import {emptyToUndefined} from '../utils/objects';

export function fieldsToSchema(fields: SchemaField[]): Schema {
    const required = emptyToUndefined(fields.filter(({required}) => required).map(({name}) => name));

    const properties: Record<string, FunctionDeclarationSchema> = {};
    fields.reduce((acc, {name, type, description}) => {
        const items = type === 'ARRAY' ? {type: 'STRING'} : undefined;
        acc[name] = {
            type,
            properties: {},
            items,
            description,
        } as FunctionDeclarationSchema;
        return acc;
    }, properties);

    return {
        type: 'OBJECT' as SchemaType,
        description: 'Response schema.',
        properties,
        required,
    };
}
