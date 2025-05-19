export type DataEntry = {
    value: string | boolean | number;
    type: DataEntryType;
    schemaType: string;
    schemaLabel: string;
    schemaHelpText?: string;
    parentHelpTexts?: string[];
};

export type DataEntryType = 'text' | 'html';
