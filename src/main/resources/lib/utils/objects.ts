export function emptyToUndefined<T = unknown>(array: Optional<T[]>): T[] | undefined {
    return array == null || array.length === 0 ? undefined : array;
}

export function find<T>(
    list: T[] | readonly T[],
    compare: (value: T, index: number, array: T[] | readonly T[]) => boolean,
): T | undefined {
    for (let i = 0; i < list.length; i++) {
        const value = list[i];
        if (compare(value, i, list)) {
            return value;
        }
    }
}

export function isObject(value: unknown): value is Record<string, unknown> {
    return (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.getPrototypeOf(value) === Object.prototype
    );
}

export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

export function isPrimitive(value: unknown): value is string | number | boolean {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

export function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(isString);
}
