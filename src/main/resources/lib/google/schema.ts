import type {FunctionDeclarationSchema, Schema} from '@google/generative-ai';

import type {SchemaField} from '../../types/shared/model';
import {SchemaType} from '../shared/enums';
import {emptyToUndefined} from '../utils/objects';

export function fieldsToSchema(fields: SchemaField[]): Schema {
    const required = emptyToUndefined(fields.filter(({required}) => required).map(({name}) => name));

    const properties: Record<string, FunctionDeclarationSchema> = {};
    fields.reduce((acc, {name, type, description}) => {
        const items = type === SchemaType.ARRAY ? {type: SchemaType.STRING} : undefined;
        acc[name] = {
            type: type,
            properties: {},
            items,
            description,
        } as FunctionDeclarationSchema;
        return acc;
    }, properties);

    return {
        type: SchemaType.OBJECT,
        description: 'Response schema.',
        properties,
        required,
    };
}
