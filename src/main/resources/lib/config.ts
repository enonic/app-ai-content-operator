export const GOOGLE_GEMINI_FLASH_URL: string | null = app.config['google.api.gemini.flash.url'] ?? null;
export const GOOGLE_GEMINI_PRO_URL: string | null = app.config['google.api.gemini.pro.url'] ?? null;
export const GOOGLE_SAK_PATH: string | null = app.config['google.api.sak.path'] ?? null;
export const DEBUG_GROUPS: string[] = parseList(app.config['log.debug.groups']);

function parseList(value: string | undefined, defaultValue = ''): string[] {
    return (value ?? defaultValue)
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);
}
