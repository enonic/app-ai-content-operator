import {MENTION_ALL} from '../common/mentions';
import {setContext} from './context';
import {createPrompt, findValueByPath, setLanguage, setPersistedData, setSchema} from './data';
import {ContentData, PropertyValue} from './data/ContentData';
import {Path} from './data/Path';
import {Schema} from './data/Schema';
import {setValueByPath} from './utils/data';

beforeAll(() => {
    setLanguage({tag: 'ak', name: 'Akkadian'});
});

describe('getValueByPath', () => {
    it('should return first item when no index defined', () => {
        setPersistedData(getRootTextItems());

        const parentPath: Path = {
            elements: [{name: 'myTextArea'}],
        };

        const received = findValueByPath(parentPath);
        const expected: PropertyValue = {v: 'v1'};

        expect(received).toEqual(expected);
    });

    it('should return right item when index specified', () => {
        setPersistedData(getRootTextItems());

        const parentPath: Path = {
            elements: [{name: 'myTextArea', index: 1}],
        };

        const received = findValueByPath(parentPath);
        const expected: PropertyValue = {v: 'v2'};

        expect(received).toEqual(expected);
    });

    it('should return nested property value', () => {
        setPersistedData(getFieldSetData());

        const parentPath: Path = {
            elements: [{name: 'contact_info'}, {name: 'phone_number'}],
        };

        const received = findValueByPath(parentPath);
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

        const received = findValueByPath(parentPath);
        const expected: PropertyValue = {v: 'phone number 01'};

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

        const received = findValueByPath(parentPath);
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

        const received = findValueByPath(parentPath);
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
            '#Request:\n' +
            'Generate lorem ipsum for {{__all__}} items\n\n' +
            '#Instructions:\n\n\n' +
            '#Metadata\n' +
            '- Language: ak\n' +
            '- Content path: /path\n\n' +
            '#Fields:\n' +
            '/myTextArea\n' +
            '/myTextArea[1]\n' +
            '/myTextLine\n\n' +
            '#Content\n' +
            '```\n\n' +
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
            '}\n\n' +
            '```';

        expect(received).toEqual(expected);
    });

    it('should keep only fields in context', () => {
        setSchema(getRootTextItemsSchema());
        setPersistedData(getRootTextItems());
        setContext('/myTextLine');

        const received = createPrompt('Generate lorem ipsum for all items');
        const expected =
            '#Request:\n' +
            'Generate lorem ipsum for all items\n\n' +
            '#Instructions:\n\n\n' +
            '#Metadata\n' +
            '- Language: ak\n' +
            '- Content path: /path\n\n' +
            '#Fields:\n' +
            '/myTextLine\n\n' +
            '#Content\n' +
            '```\n\n' +
            '{\n' +
            '  "/myTextLine": {\n' +
            '    "value": "",\n' +
            '    "type": "text",\n' +
            '    "schemaType": "TextLine",\n' +
            '    "schemaLabel": "My Text Line"\n' +
            '  }\n' +
            '}\n\n' +
            '```';

        expect(received).toEqual(expected);
    });
});
function getRootTextItems(): ContentData {
    return {
        contentId: '123',
        contentPath: '/path',
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
    };
}
function getFieldSetData(): ContentData {
    return {
        contentId: '123',
        contentPath: '/path',
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
