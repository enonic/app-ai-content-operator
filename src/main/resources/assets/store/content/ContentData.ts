export type ContentData = {
    contentId: string;
    contentPath: string;
    fields: PropertyArray[];
    topic: string;
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
