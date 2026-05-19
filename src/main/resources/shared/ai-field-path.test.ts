import { describe, expect, it } from 'vitest';

import { pathStringToAiFieldPath } from './ai-field-path';

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
