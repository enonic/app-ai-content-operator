export type ContentData = {
    fields: PropertyArray[];
    topic: string;
    language: string;
};

export type PropertyArray = {
    name: string;
    type: string;
    values: PropertyValue[];
};

export type PropertyValue = {
    v?: string | boolean | number | null;
    set?: PropertyArray[];
};
