import cloneDeep from 'lodash.clonedeep';

globalThis.structuredClone = cloneDeep;

// XP runtime globals
(globalThis as unknown as { app: unknown }).app = {
    config: {
        'log.debug.groups': 'none',
    },
};

(globalThis as unknown as { log: unknown }).log = console;

// XP Java bridge stub
(globalThis as unknown as { __: unknown }).__ = {
    newBean: () => new Map(),
    toScriptValue: <T>(value: T): T => value,
    toNativeObject: <T>(value: T): T => value,
    nullOrValue: <T>(value: T): T | null => value ?? null,
    disposer: () => undefined,
};

(globalThis as unknown as { Java: unknown }).Java = {
    type: () => ({}),
    from: <T>(value: T): T => value,
    to: <T>(value: T): T => value,
    synchronized: <T>(fn: () => T): (() => T) => fn,
};
