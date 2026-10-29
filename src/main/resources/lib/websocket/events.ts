import { listener, send as sendEvent } from '/lib/xp/event';
import { send } from '/lib/xp/websocket';

import { createOperationRegistry } from '../utils/operations';

type SocketMessageEventData = {
  socketId: string;
  message: string;
};

type StopOperationEventData = {
  generationId: string;
};

const SOCKET_MESSAGE_EVENT = `${app.name}.ws.send`;
const STOP_OPERATION_EVENT = `${app.name}.ws.stop`;

export function emitSocketMessage(socketId: string, message: string): void {
  sendEvent<SocketMessageEventData>({
    type: SOCKET_MESSAGE_EVENT,
    distributed: true,
    data: { socketId, message },
  });
}

export function emitStopOperation(generationId: string): void {
  sendEvent<StopOperationEventData>({
    type: STOP_OPERATION_EVENT,
    distributed: true,
    data: { generationId },
  });
}

// ! Tasks run on any cluster node, but only the node holding the socket can deliver to it
export function registerSocketEventListeners(): void {
  const activeOperations = createOperationRegistry();

  listener<SocketMessageEventData>({
    type: `custom.${SOCKET_MESSAGE_EVENT}`,
    callback: ({ data }) => send(data.socketId, data.message),
  });

  listener<StopOperationEventData>({
    type: `custom.${STOP_OPERATION_EVENT}`,
    callback: ({ data }) => activeOperations.remove(data.generationId),
  });
}
