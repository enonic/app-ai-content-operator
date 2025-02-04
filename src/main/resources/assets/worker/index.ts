import {ConnectedMessage, DisconnectedMessage, MessageMetadata, WSMessageType} from '../../shared/websocket';
import {isSharedWorkerScope} from './utils/scope';
import {$isConnected, connect, sendMessage, WebSocketMessage} from './websocket';

if (!isSharedWorkerScope(self)) {
    throw new Error('Script is not executed in a SharedWorker.');
}

//
//* Utils
//

function createMetadata(): MessageMetadata {
    return {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
    };
}

function isWebSocketMessage(message: unknown): message is WebSocketMessage {
    return typeof message === 'object' && message !== null && 'type' in message;
}

//
//* Ports
//

const ports = new Set<MessagePort>();

function broadcast(message: unknown): void {
    ports.forEach(port => port.postMessage(message));
}

//
//* Lifecycle
//

self.onconnect = (event: MessageEvent) => {
    const port = event.ports[0];
    ports.add(port);

    port.onmessage = (event: MessageEvent) => {
        if (isWebSocketMessage(event.data)) {
            sendMessage(event.data);
        }
    };

    if ($isConnected.get()) {
        const metadata = createMetadata();
        port.postMessage({type: WSMessageType.CONNECTED, metadata} as ConnectedMessage);
    }
};

connect(message => broadcast(message));

//
//* WebSocket
//

$isConnected.subscribe(connected => {
    const metadata = createMetadata();
    if (connected) {
        broadcast({type: WSMessageType.CONNECTED, metadata} as ConnectedMessage);
    } else {
        broadcast({type: WSMessageType.DISCONNECTED, metadata} as DisconnectedMessage);
    }
});
