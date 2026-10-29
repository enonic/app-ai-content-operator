import { beforeEach, describe, expect, it } from 'vitest';

import { createOperationRegistry } from './operations';

const beanFactory = globalThis as unknown as { __: { newBean: (name: string) => unknown } };

beforeEach(() => {
  const operations = new Set<string>();
  beanFactory.__.newBean = () => ({
    isActive: (id: string) => operations.has(id),
    add: (id: string) => {
      if (operations.has(id)) {
        return false;
      }
      operations.add(id);
      return true;
    },
    remove: (id: string) => operations.delete(id),
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
