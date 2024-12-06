export function unsafeUUIDv4(): `${string}-${string}-4${string}-${string}-${string}` {
    return `${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}-${hex()}${hex()}${hex()}${hex()}-4${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}-${variantDigit()}${hex()}${hex()}${hex()}-${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}`;
}

function hex(): string {
    // Generates a single random hex digit (0-f)
    return ((Math.random() * 16) | 0).toString(16);
}

function variantDigit(): string {
    // Generates the variant (8, 9, a, b)
    return (((Math.random() * 4) | 0) + 8).toString(16);
}
