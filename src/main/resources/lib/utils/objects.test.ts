import {emptyToUndefined, find} from './objects';

describe('emptyToUndefined', () => {
    it('should return `undefined` if the input is `null` or `undefined`', () => {
        expect(emptyToUndefined(null)).toBe(undefined);
        expect(emptyToUndefined(undefined)).toBe(undefined);
    });

    it('should return `undefined` if the input array is empty', () => {
        expect(emptyToUndefined([])).toBe(undefined);
    });

    it('should return same input array if it is not empty', () => {
        expect(emptyToUndefined(['1'])).toEqual(['1']);
        expect(emptyToUndefined([undefined])).toEqual([undefined]);
        expect(emptyToUndefined([1, 2])).toEqual([1, 2]);
    });
});

describe('find', () => {
    it('should return the first element that satisfies the compare function', () => {
        const list = [1, 2, 3, 4, 5];
        const compare = (value: number): boolean => value > 3;
        expect(find(list, compare)).toBe(4);
    });

    it('should return undefined if no element satisfies the compare function', () => {
        const list = [1, 2, 3, 4, 5];
        const compare = (value: number): boolean => value > 5;
        expect(find(list, compare)).toBeUndefined();
    });
});
