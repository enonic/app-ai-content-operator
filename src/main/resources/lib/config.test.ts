import { afterEach, describe, expect, it, vi } from 'vitest';

const runtime = globalThis as unknown as { app: { config: Record<string, string | undefined> } };
const originalConfig = runtime.app.config;

async function loadConfig(config: Record<string, string | undefined>) {
  vi.resetModules();
  runtime.app.config = config;

  return import('./config');
}

describe('config', () => {
  afterEach(() => {
    runtime.app.config = originalConfig;
  });

  it('should read a configured value', async () => {
    const { GOOGLE_PROJECT_ID } = await loadConfig({ 'google.api.project.id': 'playground-123456' });

    expect(GOOGLE_PROJECT_ID).toBe('playground-123456');
  });

  it('should read an unset value as null', async () => {
    const { GOOGLE_PROJECT_ID } = await loadConfig({});

    expect(GOOGLE_PROJECT_ID).toBeNull();
  });

  it('should read an empty value as null', async () => {
    const { GOOGLE_PROJECT_ID } = await loadConfig({ 'google.api.project.id': '' });

    expect(GOOGLE_PROJECT_ID).toBeNull();
  });

  it('should read a whitespace-only value as null', async () => {
    const { GOOGLE_PROJECT_ID } = await loadConfig({ 'google.api.project.id': '   ' });

    expect(GOOGLE_PROJECT_ID).toBeNull();
  });

  it('should trim surrounding whitespace', async () => {
    const { GOOGLE_SAK_PATH } = await loadConfig({
      'google.api.sak.path': '  /xp/config/key.json  ',
    });

    expect(GOOGLE_SAK_PATH).toBe('/xp/config/key.json');
  });

  it('should normalize every text value', async () => {
    const config = await loadConfig({
      'google.api.gemini.flash.url': '  ',
      'google.api.gemini.pro.url': '',
      'google.api.project.id': ' ',
      'google.api.sak.path': '\t',
    });

    expect(config.GOOGLE_GEMINI_FLASH_URL).toBeNull();
    expect(config.GOOGLE_GEMINI_PRO_URL).toBeNull();
    expect(config.GOOGLE_PROJECT_ID).toBeNull();
    expect(config.GOOGLE_SAK_PATH).toBeNull();
  });
});
