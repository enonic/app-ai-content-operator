import {MENTION_ALL} from '../common/mentions';
import {createPrompt, getValueByPath, getValueByStringPath, setPersistedData, setSchema, setValueByPath} from './data';
import {ContentData, PropertyValue} from './data/ContentData';
import {Path} from './data/Path';
import {Schema} from './data/Schema';

describe('getValueByPath', () => {
    it('should return first item when no index defined', () => {
        setPersistedData(getRootTextItems());

        const parentPath: Path = {
            elements: [{name: 'myTextArea'}],
        };

        const received = getValueByPath(parentPath);
        const expected: PropertyValue = {v: 'v1'};

        expect(received).toEqual(expected);
    });

    it('should return right item when index specified', () => {
        setPersistedData(getRootTextItems());

        const parentPath: Path = {
            elements: [{name: 'myTextArea', index: 1}],
        };

        const received = getValueByPath(parentPath);
        const expected: PropertyValue = {v: 'v2'};

        expect(received).toEqual(expected);
    });

    it('should return nested property value', () => {
        setPersistedData(getFieldSetData());

        const parentPath: Path = {
            elements: [{name: 'contact_info'}, {name: 'phone_number'}],
        };

        const received = getValueByPath(parentPath);
        const expected: PropertyValue = {v: 'phone number 00'};

        expect(received).toEqual(expected);
    });

    it('should return nested property value with indexes specified', () => {
        setPersistedData(getFieldSetData());

        const parentPath: Path = {
            elements: [
                {name: 'contact_info', index: 0},
                {name: 'phone_number', index: 1},
            ],
        };

        const received = getValueByPath(parentPath);
        const expected: PropertyValue = {v: 'phone number 01'};

        expect(received).toEqual(expected);
    });
});

describe('getValueByStringPath', () => {
    it('should return first item when no index defined', () => {
        setPersistedData(getRootTextItems());

        const parentPath = 'myTextArea';
        const received = getValueByStringPath(parentPath);
        const expected: PropertyValue = {v: 'v1'};

        expect(received).toEqual(expected);
    });

    it('should return right item when index specified', () => {
        setPersistedData(getRootTextItems());

        const parentPath = 'myTextArea[1]';
        const received = getValueByStringPath(parentPath);
        const expected: PropertyValue = {v: 'v2'};

        expect(received).toEqual(expected);
    });

    it('should return right item with trailing slash', () => {
        setPersistedData(getRootTextItems());

        const parentPath = '/myTextArea[1]';
        const received = getValueByStringPath(parentPath);
        const expected: PropertyValue = {v: 'v2'};

        expect(received).toEqual(expected);
    });

    it('should return nested property value', () => {
        setPersistedData(getFieldSetData());

        const parentPath = 'contact_info[1]/phone_number[1]';
        const received = getValueByStringPath(parentPath);
        const expected: PropertyValue = {v: 'phone number 11'};

        expect(received).toEqual(expected);
    });
});

describe('setValueByPath', () => {
    it('should set value', () => {
        const data = getRootTextItems();

        const parentPath: Path = {
            elements: [{name: 'myTextArea'}],
        };

        setValueByPath({v: 'newValue'}, parentPath, data);
        setPersistedData(data);

        const received = getValueByPath(parentPath);
        const expected: PropertyValue = {v: 'newValue'};

        expect(received).toEqual(expected);
    });

    it('should set value in nested item', () => {
        const data = getFieldSetData();

        const parentPath: Path = {
            elements: [
                {name: 'contact_info', index: 1},
                {name: 'phone_number', index: 1},
            ],
        };

        setValueByPath({v: 'newValue'}, parentPath, data);
        setPersistedData(data);

        const received = getValueByPath(parentPath);
        const expected: PropertyValue = {v: 'newValue'};

        expect(received).toEqual(expected);
    });
});

describe('createPrompt', () => {
    it('should replace all macro with list of fields', () => {
        setSchema(getRootTextItemsSchema());
        setPersistedData(getRootTextItems());

        const received = createPrompt('Generate lorem ipsum for {{' + MENTION_ALL.path + '}} items');
        const expected =
            'Generate lorem ipsum for {{__all__}} items\n' +
            '\n' +
            '#Context#\n' +
            '- Topic is "all input types"\n' +
            '- Language is "ak"\n' +
            '\n' +
            '#Fields#\n' +
            '- /myTextArea\n' +
            '- /myTextArea[1]\n' +
            '- /myTextLine\n' +
            '- __topic__\n' +
            '\n' +
            '#Content#\n' +
            '```json\n' +
            '{\n' +
            '  "__topic__": {\n' +
            '    "value": "all input types",\n' +
            '    "type": "text",\n' +
            '    "schemaType": "text",\n' +
            '    "schemaLabel": "Display Name"\n' +
            '  },\n' +
            '  "/myTextArea": {\n' +
            '    "value": "v1",\n' +
            '    "type": "text",\n' +
            '    "schemaType": "TextArea",\n' +
            '    "schemaLabel": "My Text Area"\n' +
            '  },\n' +
            '  "/myTextArea[1]": {\n' +
            '    "value": "v2",\n' +
            '    "type": "text",\n' +
            '    "schemaType": "TextArea",\n' +
            '    "schemaLabel": "My Text Area"\n' +
            '  },\n' +
            '  "/myTextLine": {\n' +
            '    "value": "",\n' +
            '    "type": "text",\n' +
            '    "schemaType": "TextLine",\n' +
            '    "schemaLabel": "My Text Line"\n' +
            '  }\n' +
            '}\n' +
            '```';

        expect(received).toEqual(expected);
    });

    it('should add all fields into the request if no fields mentioned in user input', () => {
        setSchema(getRootTextItemsSchema());
        setPersistedData(getRootTextItems());

        const received = createPrompt('Generate lorem ipsum for all items');
        const expected =
            'Generate lorem ipsum for all items\n' +
            '\n' +
            '#Context#\n' +
            '- Topic is "all input types"\n' +
            '- Language is "ak"\n' +
            '\n' +
            '#Content#\n' +
            '```json\n' +
            '{\n' +
            '  "__topic__": {\n' +
            '    "value": "all input types",\n' +
            '    "type": "text",\n' +
            '    "schemaType": "text",\n' +
            '    "schemaLabel": "Display Name"\n' +
            '  },\n' +
            '  "/myTextArea": {\n' +
            '    "value": "v1",\n' +
            '    "type": "text",\n' +
            '    "schemaType": "TextArea",\n' +
            '    "schemaLabel": "My Text Area"\n' +
            '  },\n' +
            '  "/myTextArea[1]": {\n' +
            '    "value": "v2",\n' +
            '    "type": "text",\n' +
            '    "schemaType": "TextArea",\n' +
            '    "schemaLabel": "My Text Area"\n' +
            '  },\n' +
            '  "/myTextLine": {\n' +
            '    "value": "",\n' +
            '    "type": "text",\n' +
            '    "schemaType": "TextLine",\n' +
            '    "schemaLabel": "My Text Line"\n' +
            '  }\n' +
            '}\n' +
            '```';

        expect(received).toEqual(expected);
    });
});

function getRootTextItems(): ContentData {
    return {
        fields: [
            {
                name: 'myTextArea',
                type: 'String',
                values: [{v: 'v1'}, {v: 'v2'}],
            },
            {
                name: 'myTextLine',
                type: 'String',
                values: [{v: null}],
            },
        ],
        topic: 'all input types',
        language: 'ak',
    };
}

function getFieldSetData(): ContentData {
    return {
        fields: [
            {
                name: 'contact_info',
                type: 'PropertySet',
                values: [
                    {
                        set: [
                            {
                                name: 'label',
                                type: 'String',
                                values: [{v: 'label'}],
                            },
                            {
                                name: 'phone_number',
                                type: 'String',
                                values: [{v: 'phone number 00'}, {v: 'phone number 01'}],
                            },
                        ],
                    },
                    {
                        set: [
                            {
                                name: 'label',
                                type: 'String',
                                values: [{v: 'c'}],
                            },
                            {
                                name: 'phone_number',
                                type: 'String',
                                values: [{v: 'phone number 10'}, {v: 'phone number 11'}],
                            },
                        ],
                    },
                ],
            },
        ],
        topic: 'all input types',
        language: 'ak',
    };
}

function getRootTextItemsSchema(): Schema {
    return {
        form: {
            formItems: [
                {
                    Input: {
                        name: 'myTextArea',
                        label: 'My Text Area',
                        occurrences: {
                            maximum: 0,
                            minimum: 1,
                        },
                        inputType: 'TextArea',
                    },
                },
                {
                    Input: {
                        name: 'myTextLine',
                        label: 'My Text Line',
                        occurrences: {
                            maximum: 0,
                            minimum: 1,
                        },
                        inputType: 'TextLine',
                    },
                },
            ],
        },
        name: 'Assistant',
    };
}
