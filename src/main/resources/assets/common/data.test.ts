import {isNonOptional, mergeContent} from './data';

describe('isNonOptional', () => {
    it('should return true if the value is not null or undefined', () => {
        expect(isNonOptional(1)).toBe(true);
        expect(isNonOptional('test')).toBe(true);
    });

    it('should return false if the value is null or undefined', () => {
        expect(isNonOptional(null)).toBe(false);
        expect(isNonOptional(undefined)).toBe(false);
    });
});

describe('mergeContent', () => {
    it('should merge simple objects', () => {
        expect(mergeContent({a: 'a', b: 1}, {c: 'c', d: 2})).toEqual({a: 'a', b: 1, c: 'c', d: 2});
    });

    it('should merge strings and arrays', () => {
        expect(mergeContent({a: 'foo'}, {a: ' bar'})).toEqual({a: 'foo bar'});
        expect(mergeContent({a: ['b', 'c']}, {a: ['d']})).toEqual({a: ['b', 'c', 'd']});
    });

    it('should keep original non string and non array values', () => {
        expect(mergeContent({a: 1}, {a: 2})).toEqual({a: 1});
        expect(mergeContent({a: true}, {a: false})).toEqual({a: true});
    });

    it('should keep original values, if new have different type', () => {
        expect(mergeContent({a: 'a'}, {a: 1})).toEqual({a: 'a'});
        expect(mergeContent({a: ['b']}, {a: 'c'})).toEqual({a: ['b']});
    });

    it('should merge nested objects', () => {
        expect(mergeContent({a: {b: 'b'}}, {a: {c: 'c'}})).toEqual({a: {b: 'b', c: 'c'}});
    });
});
