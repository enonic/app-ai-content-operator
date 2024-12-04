export type DataEntry = {
    value: string | boolean | number;
    type: 'text' | 'html';
    schemaType: string;
    schemaLabel: string;
    schemaHelpText?: string;
};
