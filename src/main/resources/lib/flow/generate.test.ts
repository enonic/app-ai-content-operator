import {SPECIAL_NAMES} from '../../shared/enums';
import {fixResultFields, parseEntryValue} from './generate';

jest.mock('/lib/http-client', () => ({
    request: jest.fn(),
}));

describe('parseEntryValue', () => {
    it('should return string value as is', () => {
        expect(parseEntryValue('hello')).toEqual('hello');
    });

    it('should return string array as is', () => {
        expect(parseEntryValue(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should stringify non-string elements in an array', () => {
        expect(parseEntryValue(['a', 1, true, null, {x: 1}])).toEqual(['a', '1', 'true', 'null', '{"x":1}']);
    });

    it('should extract values from object with string values', () => {
        expect(parseEntryValue({key1: 'val1', key2: 'val2'})).toEqual(['val1', 'val2']);
    });

    it('should flatten and concatenate values from object with string array values', () => {
        expect(parseEntryValue({key1: ['a', 'b'], key2: ['c']})).toEqual(['a', 'b', 'c']);
    });

    it('should extract values from object with {value: string} values', () => {
        expect(parseEntryValue({key1: {value: 'val1'}, key2: {value: 'val2'}})).toEqual(['val1', 'val2']);
    });

    it('should handle object with a single value property', () => {
        expect(parseEntryValue({value: 'single'})).toEqual('single');
    });

    it('should return null for objects not matching specific structures', () => {
        expect(parseEntryValue({a: 1, b: {c: 2}})).toBeNull();
        expect(parseEntryValue({key1: {val: 'v1'}, key2: {val: 'v2'}})).toBeNull();
        expect(parseEntryValue({key1: ['a'], key2: 'b'})).toBeNull();
    });

    it('should return null for null input', () => {
        expect(parseEntryValue(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
        expect(parseEntryValue(undefined)).toBeNull();
    });

    it('should return string for numbers', () => {
        expect(parseEntryValue(123)).toEqual('123');
        expect(parseEntryValue(123.45)).toEqual('123.45');
    });

    it('should return string for booleans', () => {
        expect(parseEntryValue(true)).toEqual('true');
        expect(parseEntryValue(false)).toEqual('false');
    });

    it('should handle empty array', () => {
        expect(parseEntryValue([])).toBeNull();
    });

    it('should return null for empty object', () => {
        expect(parseEntryValue({})).toBeNull();
    });

    it('should return null for object with mixed valid/invalid array elements for string[] case', () => {
        const input = {key1: ['a', 1], key2: [true]};
        expect(parseEntryValue(input)).toBeNull();
    });
});

describe('fixResultFields', () => {
    const allowedFields = ['/field1', '/field2/subfield', '/field3', `/${SPECIAL_NAMES.common}`];

    it('should fix keys and filter out invalid entries', () => {
        const result = {
            '/field1': 'value1',
            '/field2/subfield': 'value2-1',
            'field2/subfield': 'value2-2',
            '/field3': ['value3'],
            [`${SPECIAL_NAMES.common}`]: 'value6',
            nullField: null,
            emptyArrayField: [],
        };

        const expected = {
            '/field1': 'value1',
            '/field2/subfield': 'value2-2',
            '/field3': ['value3'],
            [`/${SPECIAL_NAMES.common}`]: 'value6',
        };

        expect(fixResultFields(result, allowedFields)).toEqual(expected);
    });
});
