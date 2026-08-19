export type OperationRegistry = {
  isActive(id: string): boolean;
  add(id: string): boolean;
  remove(id: string): void;
};

export function createOperationRegistry(): OperationRegistry {
  const operations = __.newBean<Java.ConcurrentHashMap<string, boolean>>(
    'java.util.concurrent.ConcurrentHashMap',
  );

  return {
    isActive: (id) => operations.get(id) != null,
    // ! Must stay atomic: a check-then-put lets two callers claim the same id
    add: (id) => operations.putIfAbsent(id, true) == null,
    remove(id) {
      operations.remove(id);
    },
  };
}
