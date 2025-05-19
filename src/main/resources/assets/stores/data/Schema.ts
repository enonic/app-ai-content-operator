export interface Schema {
    name: string;
    form: {
        formItems: FormItem[];
    };
}

export type FormItem = FieldSet | FormItemSet | FormOptionSet | Input | FormOptionSetOption;

export type Input = {
    Input: InputData;
};

export type FieldSet = {
    FieldSet: FieldSetData;
};

export type FormItemSet = {
    FormItemSet: FormItemSetData;
};

export type FormOptionSet = {
    FormOptionSet: FormOptionSetData;
};

export type FormOptionSetOption = FormItemNameAndLabel & FormItemHelpText & FormItems;

export type FormItemNameAndLabel = {
    name: string;
    label: string;
};

export type FormItems = {
    items: FormItem[];
};

export type FormItemOccurrences = {
    occurrences: {
        minimum: number;
        maximum: number;
    };
};

export type FieldSetData = FormItemNameAndLabel & FormItems;

export type FormSetData = FormItemNameAndLabel & FormItemHelpText & FormItemOccurrences;

export type FormItemSetData = FormSetData & FormItems;

export type InputData = FormSetData & {
    inputType: string;
};

export type FormItemHelpText = {
    helpText?: string;
};

export type FormOptionSetData = FormSetData & {
    options: FormOptionSetOption[];
};
