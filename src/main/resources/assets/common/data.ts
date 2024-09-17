import type {ErrorResponse} from '../../types/shared/model';

export const isNonNullable = <T>(value: T): value is NonNullable<T> => value != null;

export function isErrorResponse(data: unknown): data is ErrorResponse {
    return data != null && typeof data == 'object' && 'error' in data;
}

export function mergeContent<T extends Record<string, unknown>>(oldContent: T, newContent: T): T {
    const content = structuredClone(oldContent);

    for (const key in newContent) {
        const newValue = newContent[key];
        const oldValue = oldContent[key];

        if (newValue == null) {
            continue;
        }

        if (oldValue == null) {
            content[key] = newContent[key];
            continue;
        }

        if (typeof oldValue === 'string' && typeof newValue === 'string') {
            content[key] = (oldValue + newValue) as T[Extract<keyof T, string>];
            continue;
        }
        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
            content[key] = [...oldValue, ...newValue] as T[Extract<keyof T, string>];
            continue;
        }
        if (typeof newValue === 'object' && typeof oldValue === 'object') {
            content[key] = mergeContent(oldValue as T, newValue as T) as T[Extract<keyof T, string>];
            continue;
        }
    }

    return content;
}
