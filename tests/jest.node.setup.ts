type JestGlobal = typeof globalThis & {
    app: {
        config: {
            'log.debug.groups': string;
        };
    };
    log: Console;
    __: {
        newBean: jest.Mock;
    };
};

(globalThis as JestGlobal).app = {
    config: {
        'log.debug.groups': 'none',
    },
};

(globalThis as JestGlobal).log = console;

(globalThis as JestGlobal).__ = {
    newBean: jest.fn(),
};

jest.mock('/lib/cron', () => ({}));
jest.mock('/lib/http-client', () => ({request: jest.fn()}));
jest.mock('/lib/xp/auth', () => ({}));
jest.mock('/lib/xp/task', () => ({sleep: jest.fn()}));
jest.mock('/lib/xp/websocket', () => ({}));
