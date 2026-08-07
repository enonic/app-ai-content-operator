export const GOOGLE_GEMINI_FLASH_URL: string | null = parseText(
  app.config['google.api.gemini.flash.url'],
);
export const GOOGLE_GEMINI_PRO_URL: string | null = parseText(
  app.config['google.api.gemini.pro.url'],
);
export const GOOGLE_PROJECT_ID: string | null = parseText(app.config['google.api.project.id']);
export const GOOGLE_SAK_PATH: string | null = parseText(app.config['google.api.sak.path']);
export const DEBUG_GROUPS: string[] = parseList(app.config['log.debug.groups']);

// ? A blank value must read as absent, so the fallbacks behind it still run
function parseText(value: string | undefined): string | null {
  const text = value?.trim();
  return text != null && text.length > 0 ? text : null;
}

function parseList(value: string | undefined, defaultValue = ''): string[] {
  return (value ?? defaultValue)
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}
