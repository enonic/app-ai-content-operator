import {findMentionsNames} from './mentions';

describe('findMentionsNames', () => {
    it('should return unique list of names', () => {
        expect(findMentionsNames('{{/a}}')).toEqual(['/a']);
        expect(findMentionsNames('{{/a}}{{/b}}{{/a}}')).toEqual(['/a', '/b']);
        expect(findMentionsNames('Get {{__all__}} and {{{input}}}.')).toEqual(['__all__', 'input']);
    });

    it('should return empty array, if no mentions found', () => {
        expect(findMentionsNames('').length).toBe(0);
        expect(findMentionsNames('Not a {mention}.').length).toBe(0);
    });
});
