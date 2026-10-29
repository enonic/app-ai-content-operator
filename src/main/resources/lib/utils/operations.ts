import { APP_NAME } from '../constants';

export type OperationRegistry = {
  isActive(id: string): boolean;
  add(id: string): boolean;
  remove(id: string): void;
};

export function createOperationRegistry(): OperationRegistry {
  const operations = __.newBean(`${APP_NAME}.ws.OperationRegistry`);

  return {
    isActive: (id) => operations.isActive(id),
    add: (id) => operations.add(id),
    remove(id) {
      operations.remove(id);
    },
  };
}
