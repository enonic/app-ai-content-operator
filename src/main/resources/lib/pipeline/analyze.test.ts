import {SPECIAL_KEYS, SPECIAL_NAMES} from '../../shared/enums';
import {fixEntries} from './analyze';

jest.mock('/lib/http-client', () => ({
    request: jest.fn(),
}));

describe('fixEntries', () => {
    const allowedFields = ['/field1', '/field2', '/field3', `/${SPECIAL_NAMES.topic}`, SPECIAL_NAMES.common];

    it('should return same object entries', () => {
        const input = {
            '/field1': {
                task: 'some task',
                count: 1,
                language: 'en',
            },
            '/field2': {
                task: 'another task',
                count: 3,
                language: 'es',
            },
            '/field3': {
                count: 0,
            },
            [`/${SPECIAL_NAMES.topic}`]: {
                task: 'some topic task',
                count: 2,
                language: 'en',
            },
            [SPECIAL_NAMES.common]: {
                task: 'answer on common question',
                count: 1,
                language: 'en',
            },
        };

        expect(fixEntries(input, allowedFields)).toEqual(input);
    });

    it('should fix reference fields', () => {
        const input = {
            '/field1': {
                count: 1,
            },
            '/field2': {
                count: 0,
                language: 'en',
            },
        };

        const result = {
            '/field1': {
                count: 0,
            },
            '/field2': {
                count: 0,
            },
        };

        expect(fixEntries(input, allowedFields)).toEqual(result);
    });

    it('should clean invalid fields', () => {
        const input = {
            '/field1': {
                task: 'task',
                count: 1,
                language: 'en',
            },
            '/fieldOfDifferentType': {
                value: 'value',
            },
            '/fieldWithoutTask': {
                language: 'en',
            },
            [`/${SPECIAL_NAMES.topic}`]: 'topic',
            [SPECIAL_KEYS.unclear]: {task: 'unclear task'},
            [SPECIAL_KEYS.error]: {count: 0},
        };

        const result = {
            '/field1': {
                task: 'task',
                count: 1,
                language: 'en',
            },
        };
        expect(fixEntries(input, allowedFields)).toEqual(result);
    });

    it('should return "error" special field only', () => {
        const input = {
            '/field1': {
                task: 'some task',
                count: 1,
                language: 'en',
            },
            [SPECIAL_KEYS.error]: 'error message',
        };

        const result = {
            [SPECIAL_KEYS.error]: 'error message',
        };

        expect(fixEntries(input, allowedFields)).toEqual(result);
    });

    it('should return "unclear" special field only', () => {
        const input = {
            '/field1': {
                task: 'some task',
                count: 1,
                language: 'en',
            },
            [SPECIAL_KEYS.unclear]: 'unclear message',
        };

        const result = {
            [SPECIAL_KEYS.unclear]: 'unclear message',
        };

        expect(fixEntries(input, allowedFields)).toEqual(result);
    });

    it('should fix count', () => {
        const input = {
            '/field1': {
                task: 'some task',
                count: '2',
                language: 'no',
            },
            '/field2': {
                task: 'another task',
                language: 'es',
            },
            '/field3': {
                task: 'yet another task',
                count: 0,
                language: 'ru',
            },
        };

        const result = {
            '/field1': {
                task: 'some task',
                count: 2,
                language: 'no',
            },
            '/field2': {
                task: 'another task',
                count: 1,
                language: 'es',
            },
            '/field3': {
                task: 'yet another task',
                count: 1,
                language: 'ru',
            },
        };

        expect(fixEntries(input, allowedFields)).toEqual(result);
    });

    it('should fix allowed fields and drop invalid fields', () => {
        const input = {
            field1: {
                task: 'task 1',
                count: '2',
                language: 'en',
            },
            '/field2': {
                task: 'task 2',
                count: '2',
                language: 'by',
            },
            '/wrong/field': {
                task: 'some task',
                count: '2',
                language: 'no',
            },
            [SPECIAL_NAMES.topic]: {
                task: 'another task',
                language: 'es',
            },
            [SPECIAL_NAMES.common]: {
                task: 'yet another task',
                count: 1,
                language: 'ru',
            },
        };

        const result = {
            '/field1': {
                task: 'task 1',
                count: 2,
                language: 'en',
            },
            '/field2': {
                task: 'task 2',
                count: 2,
                language: 'by',
            },
            [`/${SPECIAL_NAMES.topic}`]: {
                task: 'another task',
                count: 1,
                language: 'es',
            },
            [SPECIAL_NAMES.common]: {
                task: 'yet another task',
                count: 1,
                language: 'ru',
            },
        };

        expect(fixEntries(input, allowedFields)).toEqual(result);
    });
});
