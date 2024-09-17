import {Schema} from './data/Schema';
import {getFormItemsWithPaths} from './schemaUtil';

describe('schemaUtil', () => {
    it('should return two top items', () => {
        const received = getFormItemsWithPaths(getRootInputsSchema().form.formItems);
        const expected = [
            {
                Input: {
                    inputType: 'HtmlArea',
                    label: 'HtmlArea',
                    name: 'myHtmlArea',
                    occurrences: {
                        maximum: 0,
                        minimum: 0,
                    },
                },
                elements: [
                    {
                        label: 'HtmlArea',
                        name: 'myHtmlArea',
                    },
                ],
            },
            {
                Input: {
                    inputType: 'TextArea',
                    label: 'TextArea',
                    name: 'myTextArea',
                    occurrences: {
                        maximum: 0,
                        minimum: 0,
                    },
                },
                elements: [
                    {
                        label: 'TextArea',
                        name: 'myTextArea',
                    },
                ],
            },
            {
                Input: {
                    inputType: 'TextLine',
                    label: 'TextLine',
                    name: 'myTextLine',
                    occurrences: {
                        maximum: 0,
                        minimum: 0,
                    },
                },
                elements: [
                    {
                        label: 'TextLine',
                        name: 'myTextLine',
                    },
                ],
            },
        ];

        expect(received).toEqual(expected);
    });

    it('should return text inputs in fieldset', () => {
        const received = getFormItemsWithPaths(getFieldSetSchema().form.formItems);
        const expected = [
            {
                Input: {
                    inputType: 'TextArea',
                    label: 'TextAreas',
                    name: 'myTextAreas',
                    occurrences: {
                        maximum: 5,
                        minimum: 0,
                    },
                },
                elements: [
                    {
                        label: 'TextAreas',
                        name: 'myTextAreas',
                    },
                ],
            },
        ];

        expect(received).toEqual(expected);
    });

    it('should return all form items from FormOptionSet, including option set itself and options', () => {
        const received = getFormItemsWithPaths(getFormOptionSetSchema().form.formItems);
        const expected = [
            {
                FormOptionSet: {
                    label: 'Multi-selection OptionSet',
                    name: 'checkOptionSet',
                    occurrences: {
                        maximum: 1,
                        minimum: 1,
                    },
                    options: [
                        {
                            items: [],
                            label: 'Option 1',
                            name: 'option_1',
                        },
                        {
                            items: [
                                {
                                    Input: {
                                        inputType: 'ContentSelector',
                                        label: 'Content selector',
                                        name: 'contentSelector',
                                        occurrences: {
                                            maximum: 0,
                                            minimum: 0,
                                        },
                                    },
                                },
                            ],
                            label: 'Option 2',
                            name: 'option_2',
                        },
                        {
                            items: [
                                {
                                    Input: {
                                        inputType: 'TextArea',
                                        label: 'Text Area',
                                        name: 'textarea',
                                        occurrences: {
                                            maximum: 1,
                                            minimum: 0,
                                        },
                                    },
                                },
                                {
                                    Input: {
                                        inputType: 'Long',
                                        label: 'Long',
                                        name: 'long',
                                        occurrences: {
                                            maximum: 1,
                                            minimum: 0,
                                        },
                                    },
                                },
                            ],
                            label: 'Option 3',
                            name: 'option_3',
                        },
                    ],
                },
                elements: [
                    {
                        label: 'Multi-selection OptionSet',
                        name: 'checkOptionSet',
                    },
                ],
            },
            {
                elements: [
                    {
                        label: 'Multi-selection OptionSet',
                        name: 'checkOptionSet',
                    },
                    {
                        label: 'Option 1',
                        name: 'option_1',
                    },
                ],
                items: [],
                label: 'Option 1',
                name: 'option_1',
            },
            {
                elements: [
                    {
                        label: 'Multi-selection OptionSet',
                        name: 'checkOptionSet',
                    },
                    {
                        label: 'Option 2',
                        name: 'option_2',
                    },
                ],
                items: [
                    {
                        Input: {
                            inputType: 'ContentSelector',
                            label: 'Content selector',
                            name: 'contentSelector',
                            occurrences: {
                                maximum: 0,
                                minimum: 0,
                            },
                        },
                    },
                ],
                label: 'Option 2',
                name: 'option_2',
            },
            {
                elements: [
                    {
                        label: 'Multi-selection OptionSet',
                        name: 'checkOptionSet',
                    },
                    {
                        label: 'Option 3',
                        name: 'option_3',
                    },
                ],
                items: [
                    {
                        Input: {
                            inputType: 'TextArea',
                            label: 'Text Area',
                            name: 'textarea',
                            occurrences: {
                                maximum: 1,
                                minimum: 0,
                            },
                        },
                    },
                    {
                        Input: {
                            inputType: 'Long',
                            label: 'Long',
                            name: 'long',
                            occurrences: {
                                maximum: 1,
                                minimum: 0,
                            },
                        },
                    },
                ],
                label: 'Option 3',
                name: 'option_3',
            },
            {
                Input: {
                    inputType: 'TextArea',
                    label: 'Text Area',
                    name: 'textarea',
                    occurrences: {
                        maximum: 1,
                        minimum: 0,
                    },
                },
                elements: [
                    {
                        label: 'Multi-selection OptionSet',
                        name: 'checkOptionSet',
                    },
                    {
                        label: 'Option 3',
                        name: 'option_3',
                    },
                    {
                        label: 'Text Area',
                        name: 'textarea',
                    },
                ],
            },
        ];

        expect(received).toEqual(expected);
    });

    it('should return all text inputs and item sets in entire schema', () => {
        const received = getFormItemsWithPaths(getFullSchema().form.formItems);
        const expected = [
            {
                Input: {
                    inputType: 'HtmlArea',
                    label: 'HtmlArea',
                    name: 'myHtmlArea',
                    occurrences: {
                        maximum: 0,
                        minimum: 0,
                    },
                },
                elements: [
                    {
                        label: 'HtmlArea',
                        name: 'myHtmlArea',
                    },
                ],
            },
            {
                Input: {
                    inputType: 'TextArea',
                    label: 'TextArea',
                    name: 'myTextArea',
                    occurrences: {
                        maximum: 0,
                        minimum: 0,
                    },
                },
                elements: [
                    {
                        label: 'TextArea',
                        name: 'myTextArea',
                    },
                ],
            },
            {
                Input: {
                    inputType: 'TextLine',
                    label: 'TextLine',
                    name: 'myTextLine',
                    occurrences: {
                        maximum: 0,
                        minimum: 0,
                    },
                },
                elements: [
                    {
                        label: 'TextLine',
                        name: 'myTextLine',
                    },
                ],
            },
            {
                Input: {
                    inputType: 'TextArea',
                    label: 'TextAreas',
                    name: 'myTextAreas',
                    occurrences: {
                        maximum: 5,
                        minimum: 0,
                    },
                },
                elements: [
                    {
                        label: 'TextAreas',
                        name: 'myTextAreas',
                    },
                ],
            },
            {
                FormItemSet: {
                    items: [
                        {
                            Input: {
                                inputType: 'TextLine',
                                label: 'TextLine',
                                name: 'textLine',
                                occurrences: {
                                    maximum: 1,
                                    minimum: 0,
                                },
                            },
                        },
                        {
                            Input: {
                                inputType: 'Long',
                                label: 'Long',
                                name: 'long',
                                occurrences: {
                                    maximum: 1,
                                    minimum: 0,
                                },
                            },
                        },
                    ],
                    label: 'ItemSet',
                    name: 'myItemSet',
                    occurrences: {
                        maximum: 5,
                        minimum: 0,
                    },
                },
                elements: [
                    {
                        label: 'ItemSet',
                        name: 'myItemSet',
                    },
                ],
            },
            {
                Input: {
                    inputType: 'TextLine',
                    label: 'TextLine',
                    name: 'textLine',
                    occurrences: {
                        maximum: 1,
                        minimum: 0,
                    },
                },
                elements: [
                    {
                        label: 'ItemSet',
                        name: 'myItemSet',
                    },
                    {
                        label: 'TextLine',
                        name: 'textLine',
                    },
                ],
            },
            {
                FormOptionSet: {
                    label: 'Multi-selection OptionSet',
                    name: 'checkOptionSet',
                    occurrences: {
                        maximum: 1,
                        minimum: 1,
                    },
                    options: [
                        {
                            items: [],
                            label: 'Option 1',
                            name: 'option_1',
                        },
                        {
                            items: [
                                {
                                    Input: {
                                        inputType: 'ContentSelector',
                                        label: 'Content selector',
                                        name: 'contentSelector',
                                        occurrences: {
                                            maximum: 0,
                                            minimum: 0,
                                        },
                                    },
                                },
                            ],
                            label: 'Option 2',
                            name: 'option_2',
                        },
                        {
                            items: [
                                {
                                    Input: {
                                        inputType: 'TextArea',
                                        label: 'Text Area',
                                        name: 'textarea',
                                        occurrences: {
                                            maximum: 1,
                                            minimum: 0,
                                        },
                                    },
                                },
                                {
                                    Input: {
                                        inputType: 'Long',
                                        label: 'Long',
                                        name: 'long',
                                        occurrences: {
                                            maximum: 1,
                                            minimum: 0,
                                        },
                                    },
                                },
                            ],
                            label: 'Option 3',
                            name: 'option_3',
                        },
                    ],
                },
                elements: [
                    {
                        label: 'Multi-selection OptionSet',
                        name: 'checkOptionSet',
                    },
                ],
            },
            {
                elements: [
                    {
                        label: 'Multi-selection OptionSet',
                        name: 'checkOptionSet',
                    },
                    {
                        label: 'Option 1',
                        name: 'option_1',
                    },
                ],
                items: [],
                label: 'Option 1',
                name: 'option_1',
            },
            {
                elements: [
                    {
                        label: 'Multi-selection OptionSet',
                        name: 'checkOptionSet',
                    },
                    {
                        label: 'Option 2',
                        name: 'option_2',
                    },
                ],
                items: [
                    {
                        Input: {
                            inputType: 'ContentSelector',
                            label: 'Content selector',
                            name: 'contentSelector',
                            occurrences: {
                                maximum: 0,
                                minimum: 0,
                            },
                        },
                    },
                ],
                label: 'Option 2',
                name: 'option_2',
            },
            {
                elements: [
                    {
                        label: 'Multi-selection OptionSet',
                        name: 'checkOptionSet',
                    },
                    {
                        label: 'Option 3',
                        name: 'option_3',
                    },
                ],
                items: [
                    {
                        Input: {
                            inputType: 'TextArea',
                            label: 'Text Area',
                            name: 'textarea',
                            occurrences: {
                                maximum: 1,
                                minimum: 0,
                            },
                        },
                    },
                    {
                        Input: {
                            inputType: 'Long',
                            label: 'Long',
                            name: 'long',
                            occurrences: {
                                maximum: 1,
                                minimum: 0,
                            },
                        },
                    },
                ],
                label: 'Option 3',
                name: 'option_3',
            },
            {
                Input: {
                    inputType: 'TextArea',
                    label: 'Text Area',
                    name: 'textarea',
                    occurrences: {
                        maximum: 1,
                        minimum: 0,
                    },
                },
                elements: [
                    {
                        label: 'Multi-selection OptionSet',
                        name: 'checkOptionSet',
                    },
                    {
                        label: 'Option 3',
                        name: 'option_3',
                    },
                    {
                        label: 'Text Area',
                        name: 'textarea',
                    },
                ],
            },
            {
                FormOptionSet: {
                    label: 'Single-selection OptionSet',
                    name: 'radioOptionSet',
                    occurrences: {
                        maximum: 1,
                        minimum: 1,
                    },
                    options: [
                        {
                            items: [],
                            label: 'Option 1',
                            name: 'option_1',
                        },
                        {
                            items: [
                                {
                                    Input: {
                                        inputType: 'ContentSelector',
                                        label: 'Content selector',
                                        name: 'contentSelector',
                                        occurrences: {
                                            maximum: 0,
                                            minimum: 0,
                                        },
                                    },
                                },
                            ],
                            label: 'Option 2',
                            name: 'option_2',
                        },
                        {
                            items: [
                                {
                                    Input: {
                                        inputType: 'TextArea',
                                        label: 'Text Area',
                                        name: 'textarea',
                                        occurrences: {
                                            maximum: 1,
                                            minimum: 0,
                                        },
                                    },
                                },
                                {
                                    Input: {
                                        inputType: 'Long',
                                        label: 'Long',
                                        name: 'long',
                                        occurrences: {
                                            maximum: 1,
                                            minimum: 0,
                                        },
                                    },
                                },
                            ],
                            label: 'Option 3',
                            name: 'option_3',
                        },
                    ],
                },
                elements: [
                    {
                        label: 'Single-selection OptionSet',
                        name: 'radioOptionSet',
                    },
                ],
            },
            {
                elements: [
                    {
                        label: 'Single-selection OptionSet',
                        name: 'radioOptionSet',
                    },
                    {
                        label: 'Option 1',
                        name: 'option_1',
                    },
                ],
                items: [],
                label: 'Option 1',
                name: 'option_1',
            },
            {
                elements: [
                    {
                        label: 'Single-selection OptionSet',
                        name: 'radioOptionSet',
                    },
                    {
                        label: 'Option 2',
                        name: 'option_2',
                    },
                ],
                items: [
                    {
                        Input: {
                            inputType: 'ContentSelector',
                            label: 'Content selector',
                            name: 'contentSelector',
                            occurrences: {
                                maximum: 0,
                                minimum: 0,
                            },
                        },
                    },
                ],
                label: 'Option 2',
                name: 'option_2',
            },
            {
                elements: [
                    {
                        label: 'Single-selection OptionSet',
                        name: 'radioOptionSet',
                    },
                    {
                        label: 'Option 3',
                        name: 'option_3',
                    },
                ],
                items: [
                    {
                        Input: {
                            inputType: 'TextArea',
                            label: 'Text Area',
                            name: 'textarea',
                            occurrences: {
                                maximum: 1,
                                minimum: 0,
                            },
                        },
                    },
                    {
                        Input: {
                            inputType: 'Long',
                            label: 'Long',
                            name: 'long',
                            occurrences: {
                                maximum: 1,
                                minimum: 0,
                            },
                        },
                    },
                ],
                label: 'Option 3',
                name: 'option_3',
            },
            {
                Input: {
                    inputType: 'TextArea',
                    label: 'Text Area',
                    name: 'textarea',
                    occurrences: {
                        maximum: 1,
                        minimum: 0,
                    },
                },
                elements: [
                    {
                        label: 'Single-selection OptionSet',
                        name: 'radioOptionSet',
                    },
                    {
                        label: 'Option 3',
                        name: 'option_3',
                    },
                    {
                        label: 'Text Area',
                        name: 'textarea',
                    },
                ],
            },
        ];

        expect(received).toEqual(expected);
    });
});

function getRootInputsSchema(): Schema {
    return {
        form: {
            formItems: [
                {
                    Input: {
                        name: 'myHtmlArea',
                        label: 'HtmlArea',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'HtmlArea',
                    },
                },
                {
                    Input: {
                        name: 'myImageSelector',

                        label: 'Image selector (tree-structured)',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'ImageSelector',
                    },
                },
                {
                    Input: {
                        name: 'myLong',

                        label: 'Long',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },

                        inputType: 'Long',
                    },
                },
                {
                    Input: {
                        name: 'myRelationship',

                        label: 'Content selector (flat)',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },

                        inputType: 'ContentSelector',
                    },
                },
                {
                    Input: {
                        name: 'myTextArea',
                        label: 'TextArea',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'TextArea',
                    },
                },
                {
                    Input: {
                        name: 'myTextLine',
                        label: 'TextLine',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'TextLine',
                    },
                },
            ],
        },
        name: 'All the Input Types',
    };
}

function getFieldSetSchema(): Schema {
    return {
        form: {
            formItems: [
                {
                    FieldSet: {
                        name: 'fieldSet10',
                        items: [
                            {
                                Input: {
                                    name: 'myTextAreas',
                                    label: 'TextAreas',
                                    occurrences: {
                                        maximum: 5,
                                        minimum: 0,
                                    },
                                    inputType: 'TextArea',
                                },
                            },
                        ],
                        label: 'FieldSet',
                    },
                },
            ],
        },
        name: 'All the Input Types',
    };
}

function getFormOptionSetSchema(): Schema {
    return {
        form: {
            formItems: [
                {
                    FormOptionSet: {
                        name: 'checkOptionSet',
                        options: [
                            {
                                name: 'option_1',
                                label: 'Option 1',
                                items: [],
                            },
                            {
                                name: 'option_2',
                                label: 'Option 2',
                                items: [
                                    {
                                        Input: {
                                            name: 'contentSelector',
                                            label: 'Content selector',
                                            occurrences: {
                                                maximum: 0,
                                                minimum: 0,
                                            },
                                            inputType: 'ContentSelector',
                                        },
                                    },
                                ],
                            },
                            {
                                name: 'option_3',
                                label: 'Option 3',
                                items: [
                                    {
                                        Input: {
                                            name: 'textarea',
                                            label: 'Text Area',
                                            occurrences: {
                                                maximum: 1,
                                                minimum: 0,
                                            },
                                            inputType: 'TextArea',
                                        },
                                    },
                                    {
                                        Input: {
                                            name: 'long',
                                            label: 'Long',
                                            occurrences: {
                                                maximum: 1,
                                                minimum: 0,
                                            },
                                            inputType: 'Long',
                                        },
                                    },
                                ],
                            },
                        ],
                        label: 'Multi-selection OptionSet',

                        occurrences: {
                            maximum: 1,
                            minimum: 1,
                        },
                    },
                },
            ],
        },
        name: 'All the Input Types',
    };
}

function getFullSchema(): Schema {
    return {
        form: {
            formItems: [
                {
                    Input: {
                        name: 'contentTypeFilter',
                        label: 'Content Type Filter',
                        occurrences: {
                            maximum: 1,
                            minimum: 0,
                        },
                        inputType: 'ContentTypeFilter',
                    },
                },
                {
                    Input: {
                        name: 'contentTypeFilter2',
                        label: 'Content Type Filter 2',
                        occurrences: {
                            maximum: 3,
                            minimum: 0,
                        },
                        inputType: 'ContentTypeFilter',
                    },
                },
                {
                    Input: {
                        name: 'myCheckbox',
                        label: 'Checkbox',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'Checkbox',
                    },
                },
                {
                    Input: {
                        name: 'myComboBox',
                        label: 'ComboBox',
                        occurrences: {
                            maximum: 2,
                            minimum: 0,
                        },
                        inputType: 'ComboBox',
                    },
                },
                {
                    Input: {
                        name: 'myDate',
                        label: 'Date',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'Date',
                    },
                },
                {
                    Input: {
                        name: 'myDateTime',
                        label: 'DateTime',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'DateTime',
                    },
                },
                {
                    Input: {
                        name: 'myDouble',
                        label: 'Double',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'Double',
                    },
                },
                {
                    Input: {
                        name: 'myGeoPoint',
                        label: 'GeoPoint',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'GeoPoint',
                    },
                },
                {
                    Input: {
                        name: 'myHtmlArea',
                        label: 'HtmlArea',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'HtmlArea',
                    },
                },
                {
                    Input: {
                        name: 'myImageSelector',

                        label: 'Image selector (tree-structured)',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'ImageSelector',
                    },
                },
                {
                    Input: {
                        name: 'myImageSelector2',

                        label: 'Image selector (flat - by default)',
                        occurrences: {
                            maximum: 1,
                            minimum: 1,
                        },

                        inputType: 'ImageSelector',
                    },
                },
                {
                    Input: {
                        name: 'myMediaSelector',
                        label: 'Media selector',
                        occurrences: {
                            maximum: 1,
                            minimum: 1,
                        },

                        inputType: 'MediaSelector',
                    },
                },
                {
                    Input: {
                        name: 'myMediaSelector2',

                        label: 'Media selector',
                        occurrences: {
                            maximum: 0,
                            minimum: 1,
                        },

                        inputType: 'MediaSelector',
                    },
                },
                {
                    Input: {
                        name: 'myLong',

                        label: 'Long',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },

                        inputType: 'Long',
                    },
                },
                {
                    Input: {
                        name: 'myRelationship',

                        label: 'Content selector (flat)',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },

                        inputType: 'ContentSelector',
                    },
                },
                {
                    Input: {
                        name: 'myRelationship2',

                        label: 'Content selector (tree-structured)',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },

                        inputType: 'ContentSelector',
                    },
                },
                {
                    Input: {
                        name: 'myRelationship3',

                        label: 'Content selector (flat, filtered)',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },

                        inputType: 'ContentSelector',
                    },
                },
                {
                    Input: {
                        name: 'myRelationship4',

                        label: 'Content selector (tree-structured, filtered, 2 max)',
                        occurrences: {
                            maximum: 2,
                            minimum: 0,
                        },

                        inputType: 'ContentSelector',
                    },
                },
                {
                    Input: {
                        name: 'myRelationship5',

                        label: 'Content selector (tree-structured, with status)',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },

                        inputType: 'ContentSelector',
                    },
                },
                {
                    Input: {
                        name: 'myRadioButtons',

                        label: 'Radio Buttons',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },

                        inputType: 'RadioButton',
                    },
                },
                {
                    Input: {
                        name: 'myTag',
                        label: 'Tag',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'Tag',
                    },
                },
                {
                    Input: {
                        name: 'myTextArea',
                        label: 'TextArea',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'TextArea',
                    },
                },
                {
                    Input: {
                        name: 'myTextLine',
                        label: 'TextLine',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'TextLine',
                    },
                },
                {
                    Input: {
                        name: 'myTime',
                        label: 'Time',
                        occurrences: {
                            maximum: 0,
                            minimum: 0,
                        },
                        inputType: 'Time',
                    },
                },
                {
                    FieldSet: {
                        name: 'fieldSet10',
                        items: [
                            {
                                Input: {
                                    name: 'myTextAreas',
                                    label: 'TextAreas',
                                    occurrences: {
                                        maximum: 5,
                                        minimum: 0,
                                    },
                                    inputType: 'TextArea',
                                },
                            },
                        ],
                        label: 'FieldSet',
                    },
                },
                {
                    FormItemSet: {
                        name: 'myItemSet',
                        items: [
                            {
                                Input: {
                                    name: 'textLine',
                                    label: 'TextLine',
                                    occurrences: {
                                        maximum: 1,
                                        minimum: 0,
                                    },
                                    inputType: 'TextLine',
                                },
                            },
                            {
                                Input: {
                                    name: 'long',
                                    label: 'Long',
                                    occurrences: {
                                        maximum: 1,
                                        minimum: 0,
                                    },
                                    inputType: 'Long',
                                },
                            },
                        ],
                        label: 'ItemSet',
                        occurrences: {
                            maximum: 5,
                            minimum: 0,
                        },
                    },
                },
                {
                    FormOptionSet: {
                        name: 'checkOptionSet',
                        options: [
                            {
                                name: 'option_1',
                                label: 'Option 1',
                                items: [],
                            },
                            {
                                name: 'option_2',
                                label: 'Option 2',
                                items: [
                                    {
                                        Input: {
                                            name: 'contentSelector',
                                            label: 'Content selector',
                                            occurrences: {
                                                maximum: 0,
                                                minimum: 0,
                                            },
                                            inputType: 'ContentSelector',
                                        },
                                    },
                                ],
                            },
                            {
                                name: 'option_3',
                                label: 'Option 3',
                                items: [
                                    {
                                        Input: {
                                            name: 'textarea',
                                            label: 'Text Area',
                                            occurrences: {
                                                maximum: 1,
                                                minimum: 0,
                                            },
                                            inputType: 'TextArea',
                                        },
                                    },
                                    {
                                        Input: {
                                            name: 'long',
                                            label: 'Long',
                                            occurrences: {
                                                maximum: 1,
                                                minimum: 0,
                                            },
                                            inputType: 'Long',
                                        },
                                    },
                                ],
                            },
                        ],
                        label: 'Multi-selection OptionSet',

                        occurrences: {
                            maximum: 1,
                            minimum: 1,
                        },
                    },
                },
                {
                    FormOptionSet: {
                        name: 'radioOptionSet',
                        options: [
                            {
                                name: 'option_1',
                                label: 'Option 1',
                                items: [],
                            },
                            {
                                name: 'option_2',
                                label: 'Option 2',
                                items: [
                                    {
                                        Input: {
                                            name: 'contentSelector',
                                            label: 'Content selector',
                                            occurrences: {
                                                maximum: 0,
                                                minimum: 0,
                                            },
                                            inputType: 'ContentSelector',
                                        },
                                    },
                                ],
                            },
                            {
                                name: 'option_3',
                                label: 'Option 3',
                                items: [
                                    {
                                        Input: {
                                            name: 'textarea',
                                            label: 'Text Area',
                                            occurrences: {
                                                maximum: 1,
                                                minimum: 0,
                                            },

                                            inputType: 'TextArea',
                                        },
                                    },
                                    {
                                        Input: {
                                            name: 'long',
                                            label: 'Long',
                                            occurrences: {
                                                maximum: 1,
                                                minimum: 0,
                                            },
                                            inputType: 'Long',
                                        },
                                    },
                                ],
                            },
                        ],
                        label: 'Single-selection OptionSet',
                        occurrences: {
                            maximum: 1,
                            minimum: 1,
                        },
                    },
                },
            ],
        },
        name: 'All the Input Types',
    };
}
