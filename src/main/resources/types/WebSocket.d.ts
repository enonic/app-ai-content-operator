namespace Enonic {
  interface WebSocketEvent<Data extends AnyObject = AnyObject> {
    type: 'open' | 'close' | 'message' | 'error';
    session: {
      id: string;
      user?: {
        key: string;
        displayName: string;
        login: string;
        idProvider: string;
        email?: string;
      };
    };
    data: Data;
    message?: string;
    error?: string;
  }
}
