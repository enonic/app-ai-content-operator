declare interface OperationRegistryBean {
  /**
   * Checks whether an operation with the given id is currently running on this node.
   */
  isActive(id: string): boolean;

  /**
   * Registers an operation. Returns `false` when an operation with the same id is already running.
   */
  add(id: string): boolean;

  /**
   * Removes an operation, marking it as stopped or finished.
   */
  remove(id: string): void;
}

interface XpBeans {
  'com.enonic.app.ai.contentoperator.ws.OperationRegistry': OperationRegistryBean;
}
