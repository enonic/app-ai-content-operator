import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ERRORS } from '../../shared/errors';

type ConfigOverrides = {
  GOOGLE_GEMINI_FLASH_URL?: string | null;
  GOOGLE_GEMINI_PRO_URL?: string | null;
  GOOGLE_PROJECT_ID?: string | null;
  GOOGLE_SAK_PATH?: string | null;
};

type Handler = {
  getAccessToken: ReturnType<typeof vi.fn>;
  getProjectId: ReturnType<typeof vi.fn>;
};

type HandlerOverrides = {
  accessToken?: string;
  projectId?: string | null;
};

function buildHandler({
  accessToken = 'token-123',
  projectId = null,
}: HandlerOverrides = {}): Handler {
  return {
    getAccessToken: vi.fn(() => accessToken),
    getProjectId: vi.fn(() => projectId),
  };
}

function buildFailingHandler(): Handler {
  return {
    getAccessToken: vi.fn(() => {
      throw new Error('java.io.IOException: boom');
    }),
    getProjectId: vi.fn(),
  };
}

const bridge = globalThis as unknown as { __: { newBean: unknown } };
const originalNewBean = bridge.__.newBean;

async function loadOptions(config: ConfigOverrides, handler: Handler) {
  vi.resetModules();
  vi.doMock('../config', () => ({
    GOOGLE_GEMINI_FLASH_URL: null,
    GOOGLE_GEMINI_PRO_URL: null,
    GOOGLE_PROJECT_ID: null,
    GOOGLE_SAK_PATH: null,
    DEBUG_GROUPS: [],
    ...config,
  }));

  bridge.__.newBean = () => handler;

  return import('./options');
}

describe('parseOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    bridge.__.newBean = originalNewBean;
    vi.doUnmock('../config');
  });

  it('should prefer the configured project id over the credentials project', async () => {
    const handler = buildHandler({ projectId: 'from-key' });
    const { parseOptions } = await loadOptions({ GOOGLE_PROJECT_ID: 'from-config' }, handler);

    const [options, err] = parseOptions();

    expect(err).toBeNull();
    expect(options?.flash.url).toContain('/projects/from-config/');
    expect(handler.getProjectId).not.toHaveBeenCalled();
  });

  it('should fall back to the credentials project id', async () => {
    const handler = buildHandler({ projectId: 'from-key' });
    const { parseOptions } = await loadOptions({}, handler);

    const [options, err] = parseOptions();

    expect(err).toBeNull();
    expect(options?.pro.url).toContain('/projects/from-key/');
  });

  it('should resolve the project id once for both models', async () => {
    const handler = buildHandler({ projectId: 'from-key' });
    const { parseOptions } = await loadOptions({}, handler);

    parseOptions();

    expect(handler.getProjectId).toHaveBeenCalledTimes(1);
  });

  it('should fail when no project id is available', async () => {
    const handler = buildHandler({ projectId: null });
    const { parseOptions } = await loadOptions({}, handler);

    const [options, err] = parseOptions();

    expect(options).toBeNull();
    expect(err?.code).toBe(ERRORS.GOOGLE_PROJECT_ID_MISSING.code);
  });

  it('should not require a project id when both model urls are overridden', async () => {
    const handler = buildHandler({ projectId: null });
    const { parseOptions } = await loadOptions(
      {
        GOOGLE_GEMINI_FLASH_URL: 'https://example.test/flash',
        GOOGLE_GEMINI_PRO_URL: 'https://example.test/pro',
      },
      handler,
    );

    const [options, err] = parseOptions();

    expect(err).toBeNull();
    expect(options?.flash.url).toBe('https://example.test/flash:generateContent');
    expect(options?.pro.url).toBe('https://example.test/pro:generateContent');
    expect(handler.getProjectId).not.toHaveBeenCalled();
  });

  it('should pass the configured key path to the handler', async () => {
    const handler = buildHandler({ projectId: 'from-key' });
    const { parseOptions } = await loadOptions({ GOOGLE_SAK_PATH: '/xp/config/key.json' }, handler);

    parseOptions();

    expect(handler.getAccessToken).toHaveBeenCalledWith('/xp/config/key.json');
  });

  it('should pass a null key path to the handler when unset', async () => {
    const handler = buildHandler({ projectId: 'from-key' });
    const { parseOptions } = await loadOptions({}, handler);

    parseOptions();

    expect(handler.getAccessToken).toHaveBeenCalledWith(null);
  });

  it('should fail when the access token is missing', async () => {
    const handler = buildHandler({ accessToken: '', projectId: 'from-key' });
    const { parseOptions } = await loadOptions({}, handler);

    const [options, err] = parseOptions();

    expect(options).toBeNull();
    expect(err?.code).toBe(ERRORS.GOOGLE_ACCESS_TOKEN_MISSING.code);
  });

  it('should blame the credentials file when a key path is configured', async () => {
    const handler = buildFailingHandler();
    const { parseOptions } = await loadOptions({ GOOGLE_SAK_PATH: '/xp/config/key.json' }, handler);

    const [options, err] = parseOptions();

    expect(options).toBeNull();
    expect(err?.code).toBe(ERRORS.GOOGLE_CREDENTIALS_FILE_FAILED.code);
    expect(err?.message).toContain('java.io.IOException: boom');
  });

  it('should blame Application Default Credentials when no key path is configured', async () => {
    const handler = buildFailingHandler();
    const { parseOptions } = await loadOptions({}, handler);

    const [options, err] = parseOptions();

    expect(options).toBeNull();
    expect(err?.code).toBe(ERRORS.GOOGLE_ADC_FAILED.code);
    expect(err?.message).toContain('java.io.IOException: boom');
  });
});
