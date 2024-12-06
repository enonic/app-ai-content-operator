import {atom, computed, map} from 'nanostores';
import {Descendant} from 'slate';

import {WS_PROTOCOL} from '../../shared/constants';
import {
    AnalyzedMessagePayload,
    ClientMessage,
    FailedMessagePayload,
    GeneratedMessagePayload,
    GenerateMessagePayload,
    MessageMetadata,
    MessageType,
    ServerMessage,
} from '../../shared/websocket';
import {parseNodes, parseText} from '../common/slate';
import {
    $lastUserMessage,
    addErrorMessage,
    addModelMessage,
    addUserMessage,
    createAnalysisHistory,
    createGenerationHistory,
    updateModelMessage,
    updateUserMessage,
} from './chat';
import {$config} from './config';
import {$contentPath, $language, createFields} from './data';

type WebSocketState =
    | 'mounted'
    | 'connecting'
    | 'connected'
    | 'disconnecting'
    | 'disconnected'
    | 'unmounting'
    | 'unmounted';

type WebSocketStore = {
    state: WebSocketState;
    connection: Optional<WebSocket>;
    online: boolean;
    reconnectAttempts: number;
};

export const $websocket = map<WebSocketStore>({
    state: 'unmounted',
    connection: null,
    online: navigator.onLine,
    reconnectAttempts: 0,
});

type Buffer = {
    userMessageId?: string;
    modelMessageId?: string;
};

const $buffer = map<Buffer>({});

const $lastPayload = atom<Optional<Readonly<GenerateMessagePayload>>>(null);

//
//* State
//

export const $busy = computed($buffer, ({userMessageId, modelMessageId}): boolean => {
    return userMessageId != null || modelMessageId != null;
});

export const $busyAnalyzing = computed($buffer, ({userMessageId, modelMessageId}): boolean => {
    return userMessageId != null && modelMessageId == null;
});

const $reconnectTimeout = computed($websocket, ({reconnectAttempts}) => Math.min(2 ** reconnectAttempts * 1000, 30000));

function incrementReconnectAttempts(): void {
    $websocket.setKey('reconnectAttempts', $websocket.get().reconnectAttempts + 1);
}

export const $canChat = computed([$websocket, $busy], ({connection, state, online}, busy) => {
    return connection != null && connection.readyState === WebSocket.OPEN && state === 'connected' && online && !busy;
});

//
//* Lifecycle
//

const $needsUnmount = computed([$websocket, $busy], ({state}, busy) => state === 'unmounting' && !busy);

export function mountWebSocket(): () => void {
    $websocket.setKey('state', 'mounted');
    $websocket.setKey('online', navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    connect();

    return () => {
        $websocket.setKey('state', 'unmounting');
        $needsUnmount.subscribe(needsUnmount => {
            if (needsUnmount) {
                // unsubscribe();

                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);

                // disconnect();
            }
        });
    };
}

//
//* Connection
//

const MAX_RECONNECT_ATTEMPTS = 5;
const CONNECTION_TIMEOUT = 60000; // ms
const PING_INTERVAL = 50000; // ms
const PONG_TIMEOUT = 15000; // ms

let pingInterval: number;
let pongTimeout: number;
let reconnectTimeout: number;

function connect(): void {
    const {state, connection} = $websocket.get();
    if (state === 'unmounting' || state === 'unmounted' || connection != null) {
        return;
    }

    const {wsServiceUrl} = $config.get();
    const ws = new WebSocket(wsServiceUrl, [WS_PROTOCOL]);

    $websocket.setKey('state', 'connecting');

    const connectionTimeout = setTimeout(() => {
        if ($websocket.get().state === 'connecting') {
            ws.close();
        }
    }, CONNECTION_TIMEOUT);

    ws.onopen = () => {
        clearTimeout(connectionTimeout);

        $websocket.setKey('connection', ws);
        $websocket.setKey('reconnectAttempts', 0);

        sendMessage({
            type: MessageType.CONNECT,
            metadata: createMetadata(),
        });

        pingInterval = window.setInterval(() => {
            sendMessage({
                type: MessageType.PING,
                metadata: createMetadata(),
            });
            pongTimeout = setTimeout(() => {
                disconnect();
            }, PONG_TIMEOUT);
        }, PING_INTERVAL);
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
        clearTimeout(connectionTimeout);
        cleanup();
        scheduleReconnect();
    };

    ws.onerror = e => {
        console.error(e);
    };
}

function disconnect(): void {
    const {state, connection} = $websocket.get();
    if (state !== 'disconnected') {
        $websocket.setKey('state', 'disconnecting');
        sendMessage({
            type: MessageType.DISCONNECT,
            metadata: createMetadata(),
        });
    }
    connection?.close();
}

function handleOnline(): void {
    $websocket.setKey('online', true);
}

function handleOffline(): void {
    $websocket.setKey('online', false);
    $websocket.setKey('reconnectAttempts', 0);
    disconnect();
}

function scheduleReconnect(): void {
    const {state, reconnectAttempts} = $websocket.get();
    if (state === 'unmounting' || state === 'unmounted' || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        return;
    }

    incrementReconnectAttempts();
    window.setTimeout(() => {
        connect();
    }, $reconnectTimeout.get());
}

function cleanup(): void {
    clearInterval(pingInterval);
    clearTimeout(reconnectTimeout);
    clearTimeout(pongTimeout);
    $websocket.setKey('connection', null);
    $websocket.setKey('state', 'disconnected');
    $buffer.set({});
}

//
//* Receive
//

function handleMessage(event: MessageEvent<string>): void {
    const message = JSON.parse(event.data) as ServerMessage;

    switch (message.type) {
        case MessageType.CONNECTED:
            $websocket.setKey('state', 'connected');
            break;

        case MessageType.ANALYZED: {
            handleAnalyzedMessage(message.payload);
            break;
        }

        case MessageType.GENERATED: {
            handleGeneratedMessage(message.payload);
            $buffer.set({});
            break;
        }

        case MessageType.FAILED: {
            handleFailedMessage(message.payload);
            break;
        }

        case MessageType.DISCONNECTED:
            cleanup();
            break;

        case MessageType.PONG:
            clearTimeout(pongTimeout);
            break;
    }
}

//
//* Send
//

function createMetadata(): MessageMetadata {
    return {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
    };
}

function createGenerateMessagePayload(prompt: string): GenerateMessagePayload {
    const payload: GenerateMessagePayload = {
        prompt,
        instructions: $config.get().instructions,
        history: {
            analysis: createAnalysisHistory(),
            generation: createGenerationHistory(),
        },
        meta: {
            language: $language.get(),
            contentPath: $contentPath.get(),
        },
        fields: createFields(),
    };

    $lastPayload.set(structuredClone(payload));

    return payload;
}

function sendMessage(message: ClientMessage): void {
    const {connection} = $websocket.get();
    if (connection?.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(message));
    }
}

function sendGenerateMessage(payload: GenerateMessagePayload): void {
    sendMessage({type: MessageType.GENERATE, metadata: createMetadata(), payload});
}

//
//* Flow: Client → Server
//

export function sendPrompt(nodes: Descendant[]): void {
    if (!$canChat.get()) {
        return;
    }

    const node = parseNodes(nodes);
    const message = addUserMessage({node});
    if (!message) {
        return;
    }

    $buffer.setKey('userMessageId', message.id);

    const prompt = parseText(nodes);
    const payload = createGenerateMessagePayload(prompt);
    sendGenerateMessage(payload);
}

export function sendRetry(): void {
    if (!$canChat.get()) {
        return;
    }

    const payload = structuredClone($lastPayload.get());
    const node = $lastUserMessage.get()?.content.node;
    if (!payload || !node) {
        return;
    }

    const message = addUserMessage({node});
    if (!message) {
        return;
    }

    $buffer.setKey('userMessageId', message.id);

    sendGenerateMessage(payload);
}

//
//* Flow: Server → Client
//

function handleAnalyzedMessage({request, result}: AnalyzedMessagePayload): void {
    const {userMessageId} = $buffer.get();
    if (!userMessageId) {
        return;
    }

    const userMessage = updateUserMessage(userMessageId, {analysisPrompt: request});
    if (!userMessage) {
        return;
    }

    const modelMessage = addModelMessage(result, userMessage.id);
    if (!modelMessage) {
        return;
    }

    $buffer.setKey('modelMessageId', modelMessage.id);
}

function handleGeneratedMessage({request, result}: GeneratedMessagePayload): void {
    const {userMessageId, modelMessageId} = $buffer.get();
    if (!userMessageId || !modelMessageId) {
        return;
    }

    updateUserMessage(userMessageId, {generationPrompt: request});
    updateModelMessage(modelMessageId, result);

    $buffer.set({});
}

function handleFailedMessage(payload: FailedMessagePayload): void {
    $buffer.set({});
    addErrorMessage(payload);
}
