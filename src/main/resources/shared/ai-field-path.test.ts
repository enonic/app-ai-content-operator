import { describe, expect, it } from 'vitest';

import { aiFieldPathToPathString, pathStringToAiFieldPath } from './ai-field-path';

describe('pathStringToAiFieldPath', () => {
  it('should convert a plain nested path to a dotted data field', () => {
    expect(pathStringToAiFieldPath('/items/group/title')).toEqual({
      kind: 'data',
      field: 'items.group.title',
    });
  });

  it('should keep bracketed indices as-is', () => {
    expect(pathStringToAiFieldPath('/items/item[2]/title')).toEqual({
      kind: 'data',
      field: 'items.item[2].title',
    });
  });

  it('should convert the __topic__ sentinel to a topic path', () => {
    expect(pathStringToAiFieldPath('/__topic__')).toEqual({ kind: 'topic' });
  });

  it('should handle a path with no leading slash', () => {
    expect(pathStringToAiFieldPath('title')).toEqual({ kind: 'data', field: 'title' });
  });
});

describe('aiFieldPathToPathString', () => {
  it('should convert data and topic paths back to operator paths', () => {
    expect(aiFieldPathToPathString({ kind: 'data', field: 'items.item[2].title' })).toBe(
      '/items/item[2]/title',
    );
    expect(aiFieldPathToPathString({ kind: 'topic' })).toBe('/__topic__');
  });

  it('should return null for kinds the operator cannot address', () => {
    expect(aiFieldPathToPathString({ kind: 'pageConfig', field: 'x' })).toBeNull();
  });
});
