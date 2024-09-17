export const GOOGLE_GEMINI_URL: string | null = app.config['google.api.gemini.url'] ?? null;
export const GOOGLE_SAK_PATH: string | null = app.config['google.api.sak.path'] ?? null;
export const DEBUG_GROUPS: string[] = parseList(app.config['log.debug.groups']);

function parseList(value: string | undefined, defaultValue = ''): string[] {
    return (value ?? defaultValue)
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);
}
