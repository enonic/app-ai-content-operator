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
