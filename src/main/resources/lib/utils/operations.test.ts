import { beforeEach, describe, expect, it } from 'vitest';

import { createOperationRegistry } from './operations';

const beanFactory = globalThis as unknown as { __: { newBean: (name: string) => unknown } };

beforeEach(() => {
  const map = new Map<string, boolean>();
  beanFactory.__.newBean = () => ({
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
  });
});

describe('createOperationRegistry', () => {
  it('reports inactive for unknown ids', () => {
    const registry = createOperationRegistry();
    expect(registry.isActive('op1')).toBe(false);
  });

  it('adds and tracks active operations', () => {
    const registry = createOperationRegistry();
    expect(registry.add('op1')).toBe(true);
    expect(registry.isActive('op1')).toBe(true);
  });

  it('rejects adding an operation twice', () => {
    const registry = createOperationRegistry();
    expect(registry.add('op1')).toBe(true);
    expect(registry.add('op1')).toBe(false);
  });

  it('removes operations', () => {
    const registry = createOperationRegistry();
    registry.add('op1');
    registry.remove('op1');
    expect(registry.isActive('op1')).toBe(false);
  });
});
