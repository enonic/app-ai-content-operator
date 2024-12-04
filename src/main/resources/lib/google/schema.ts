import type {FunctionDeclarationSchemaProperty, Schema} from '@google/generative-ai';

import {SchemaType} from '../../shared/enums';

export type SchemaFields = Record<string, {count?: number}>;

export function fieldsToSchema(fields: SchemaFields): Schema {
    const required = Object.keys(fields);

    const properties: Record<string, FunctionDeclarationSchemaProperty> = {};
    required.forEach(name => {
        const count = fields[name]?.count || 1;
        properties[name] =
            count > 1
                ? {
                      type: SchemaType.ARRAY,
                      items: {
                          type: SchemaType.STRING,
                      },
                  }
                : {
                      type: SchemaType.STRING,
                  };
    });

    return {
        type: SchemaType.OBJECT,
        description: 'Response schema.',
        properties,
        required,
    };
}
