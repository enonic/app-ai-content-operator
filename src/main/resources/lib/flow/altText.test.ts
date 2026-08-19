import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Content } from '/lib/xp/content';
import type { ModelProxyConfig } from '../proxy/model';

import * as contentLib from '/lib/xp/content';
import * as contextLib from '/lib/xp/context';
import * as projectLib from '/lib/xp/project';

import { ERRORS } from '../../shared/errors';
import * as GoogleOptions from '../google/options';
import { GeminiProxy } from '../proxy/gemini';
import { generateAltTextForImage, parseAltTextResult } from './altText';

const { generateMock } = vi.hoisted(() => ({ generateMock: vi.fn() }));

vi.mock('/lib/xp/content', () => ({
  get: vi.fn(),
  getAttachments: vi.fn(),
  getAttachmentStream: vi.fn(),
  update: vi.fn(),
}));

vi.mock('/lib/xp/context', () => ({
  run: vi.fn((_context: unknown, callback: () => unknown) => callback()),
}));

vi.mock('/lib/xp/project', () => ({
  get: vi.fn(),
}));

vi.mock('../google/options', () => ({
  getModelConfig: vi.fn(),
}));

vi.mock('../proxy/gemini', () => ({
  GeminiProxy: vi.fn(function () {
    return { generate: generateMock };
  }),
}));

const downscalerBean = {
  prepare: vi.fn(),
  getMimeType: vi.fn(),
  getData: vi.fn(),
};

function createHashMapBean(): unknown {
  const map = new Map<string, boolean>();
  return {
    get: (key: string) => map.get(key) ?? null,
    put: (key: string, value: boolean) => map.set(key, value),
    putIfAbsent: (key: string, value: boolean) => {
      const previous = map.get(key) ?? null;
      if (previous == null) {
        map.set(key, value);
      }
      return previous;
    },
    remove: (key: string) => map.delete(key),
    forEach: () => undefined,
  };
}

const REPO = 'com.enonic.cms.default';
const USER = { login: 'alice', idProvider: 'system' };

type ContentOverrides = {
  type?: string;
  language?: string;
  altText?: string;
  attachment?: string | null;
};

function buildImageContent(overrides?: ContentOverrides): Content {
  const attachment = overrides?.attachment === undefined ? 'photo.jpg' : overrides.attachment;
  return {
    _id: 'c1',
    type: overrides?.type ?? 'media:image',
    language: overrides?.language,
    data: {
      media: attachment == null ? {} : { attachment },
      altText: overrides?.altText,
    },
  } as unknown as Content;
}

function mockHappyPath(overrides?: ContentOverrides): void {
  vi.mocked(contentLib.get).mockReturnValue(buildImageContent(overrides));
  vi.mocked(contentLib.getAttachments).mockReturnValue({
    'photo.jpg': { name: 'photo.jpg', size: 2048, mimeType: 'image/png' },
  } as never);
  vi.mocked(contentLib.getAttachmentStream).mockReturnValue({ openStream: () => 'stream' } as never);
  vi.mocked(GoogleOptions.getModelConfig).mockReturnValue([
    { url: 'https://example.com/model:generateContent', thinkingLevel: 'minimal' },
    null,
  ]);
  generateMock.mockReturnValue(['{"altText":"A red fox in the snow"}', null]);
  mockUpdateEditing(overrides);
}

// ? XP re-reads the node, so the editor can see content that changed during generation
function mockUpdateEditing(overrides?: ContentOverrides): void {
  vi.mocked(contentLib.update).mockImplementation(
    (params) => params.editor(buildImageContent(overrides)) as never,
  );
}

function editedContent(): { data: { altText?: string } } {
  const [result] = vi.mocked(contentLib.update).mock.results;
  return result.value as unknown as { data: { altText?: string } };
}

function lastProxyConfig(): ModelProxyConfig {
  return vi.mocked(GeminiProxy).mock.calls[0][0];
}

beforeEach(() => {
  vi.clearAllMocks();
  (globalThis as unknown as { __: { newBean: (name: string) => unknown } }).__.newBean = (name) =>
    name === 'java.util.concurrent.ConcurrentHashMap' ? createHashMapBean() : downscalerBean;
  downscalerBean.prepare.mockReturnValue(true);
  downscalerBean.getMimeType.mockReturnValue('image/jpeg');
  downscalerBean.getData.mockReturnValue('QkFTRTY0');
});

describe('generateAltTextForImage', () => {
  it('generates and saves alt text for an image', () => {
    mockHappyPath();

    const result = generateAltTextForImage(REPO, 'c1', USER);

    expect(result).toBe('A red fox in the snow');
    expect(contentLib.update).toHaveBeenCalledTimes(1);
    expect(vi.mocked(contentLib.update).mock.calls[0][0].key).toBe('c1');
    expect(editedContent().data.altText).toBe('A red fox in the snow');
  });

  it('runs the whole flow in the caller context', () => {
    mockHappyPath();

    generateAltTextForImage(REPO, 'c1', USER);

    expect(contextLib.run).toHaveBeenCalledTimes(1);
    expect(contextLib.run).toHaveBeenCalledWith(
      { repository: REPO, branch: 'draft', user: USER },
      expect.any(Function),
    );
  });

  it('skips content that already has alt text', () => {
    mockHappyPath({ altText: 'Existing text' });

    const result = generateAltTextForImage(REPO, 'c1', USER);

    expect(result).toBeNull();
    expect(GeminiProxy).not.toHaveBeenCalled();
    expect(contentLib.update).not.toHaveBeenCalled();
  });

  it('keeps alt text written while the model was generating', () => {
    mockHappyPath();
    mockUpdateEditing({ altText: 'Written meanwhile' });

    const result = generateAltTextForImage(REPO, 'c1', USER);

    expect(editedContent().data.altText).toBe('Written meanwhile');
    expect(result).toBeNull();
  });

  it('leaves an image replaced while the model was generating untouched', () => {
    mockHappyPath();
    mockUpdateEditing({ attachment: 'other.png' });

    const result = generateAltTextForImage(REPO, 'c1', USER);

    expect(editedContent().data.altText).toBeUndefined();
    expect(result).toBeNull();
  });

  it('sends the prepared image and schema to the model', () => {
    mockHappyPath({ language: 'no' });

    generateAltTextForImage(REPO, 'c1', USER);

    const proxyConfig = lastProxyConfig();
    expect(proxyConfig.messages).toHaveLength(1);
    expect(proxyConfig.messages[0].media).toEqual({ mimeType: 'image/jpeg', data: 'QkFTRTY0' });
    expect(proxyConfig.instructions).toContain('language tag "no"');
    expect(proxyConfig.schema?.required).toEqual(['altText']);
  });

  it('skips content that is not an image', () => {
    mockHappyPath({ type: 'portal:site' });

    const result = generateAltTextForImage(REPO, 'c1', USER);

    expect(result).toBeNull();
    expect(GeminiProxy).not.toHaveBeenCalled();
    expect(contentLib.update).not.toHaveBeenCalled();
  });

  it('skips when the image cannot be prepared', () => {
    mockHappyPath();
    downscalerBean.prepare.mockReturnValue(false);

    generateAltTextForImage(REPO, 'c1', USER);

    expect(GeminiProxy).not.toHaveBeenCalled();
    expect(contentLib.update).not.toHaveBeenCalled();
  });

  it('leaves content untouched when generation fails', () => {
    mockHappyPath();
    generateMock.mockReturnValue([null, ERRORS.MODEL_UNEXPECTED]);

    const result = generateAltTextForImage(REPO, 'c1', USER);

    expect(result).toBeNull();
    expect(contentLib.update).not.toHaveBeenCalled();
  });

  it('falls back to the project language', () => {
    mockHappyPath({ language: undefined });
    vi.mocked(projectLib.get).mockReturnValue({ language: 'sv' } as never);

    generateAltTextForImage(REPO, 'c1', USER);

    expect(projectLib.get).toHaveBeenCalledWith({ id: 'default' });
    expect(lastProxyConfig().instructions).toContain('language tag "sv"');
  });

  it('defaults to English when neither content nor project has a language', () => {
    mockHappyPath({ language: undefined });
    vi.mocked(projectLib.get).mockReturnValue(null);

    generateAltTextForImage(REPO, 'c1', USER);

    expect(lastProxyConfig().instructions).toContain('language tag "en"');
  });
});

describe('parseAltTextResult', () => {
  it('parses a valid result', () => {
    expect(parseAltTextResult('{"altText":"A red fox"}')).toBe('A red fox');
  });

  it('strips wrapping backticks', () => {
    expect(parseAltTextResult('```{"altText":"A red fox"}```')).toBe('A red fox');
  });

  it('returns null for a blank alt text', () => {
    expect(parseAltTextResult('{"altText":"  "}')).toBeNull();
  });

  it('returns null for a non-string alt text', () => {
    expect(parseAltTextResult('{"altText":42}')).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(parseAltTextResult('not json')).toBeNull();
  });
});
