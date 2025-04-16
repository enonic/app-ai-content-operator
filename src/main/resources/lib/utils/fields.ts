export function toFieldPath(path: string): string {
    return path.startsWith('/') ? path.replace(/^\/+/, '/') : `/${path}`;
}

export function fixFieldKey(key: string, allowedFields: string[]): Optional<string> {
    if (allowedFields.indexOf(key) >= 0) {
        return key;
    }

    const pathKey = toFieldPath(key);
    return allowedFields.indexOf(pathKey) >= 0 ? pathKey : null;
}
