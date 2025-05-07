declare const Java: {
    synchronized: <T>(callback: (...args: unknown[]) => T, ...args: unknown[]) => () => T;
};
