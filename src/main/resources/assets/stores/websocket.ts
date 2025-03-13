import {t} from 'i18next';
import {atom, computed, map} from 'nanostores';
import {Descendant} from 'slate';

import {WS_PROTOCOL} from '../../shared/constants';
import {
    AnalyzedMessagePayload,
    ClientMessage,
    FailedMessagePayload,
    GeneratedMessagePayload,
    GenerateMessagePayload,
    LicenseUpdatedPayload,
    LicenseUpdatedStatePayload,
    MessageMetadata,
    MessageType,
    ServerMessage,
} from '../../shared/websocket';
import {parseNodes, parseText} from '../common/slate';
import {
    addErrorMessage,
    addModelMessage,
    addStoppedMessage,
    addUserMessage,
    createAnalysisHistory,
    createGenerationHistory,
    getUserMessageById,
    markAllNextMessagesInactive,
    updateModelMessage,
    updateUserMessage,
} from './chat';
import {$config} from './config';
import {$context} from './context';
import {$contentPath, $fieldDescriptors, $language, createFields} from './data';
import {MessageRole} from './data/MessageType';
import {$licenseState} from './license';
import {getAllPathsFromString, pathToString} from './utils/path';

type WebSocketLifecycle = 'mounting' | 'mounted' | 'unmounting' | 'unmounted';

type WebSocketState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected';

type WebSocketStore = {
    lifecycle: WebSocketLifecycle;
    state: WebSocketState;
    connection: Optional<WebSocket>;
    online: boolean;
    reconnectAttempts: number;
};

export const $websocket = map<WebSocketStore>({
    lifecycle: 'unmounted',
    state: 'disconnected',
    connection: null,
    online: navigator.onLine,
    reconnectAttempts: 0,
});

type Buffer = {
    generationId?: string;
    userMessageId?: string;
    modelMessageId?: string;
};

const $buffer = map<Buffer>({});

const $lastPayload = atom<Optional<Readonly<GenerateMessagePayload>>>(null);

//
//* State
//

export const $isBusy = computed($buffer, ({generationId, userMessageId, modelMessageId}): boolean => {
    return generationId != null || userMessageId != null || modelMessageId != null;
});

export const $busyAnalyzing = computed($buffer, ({generationId, userMessageId, modelMessageId}): boolean => {
    return generationId != null && userMessageId != null && modelMessageId == null;
});

const $reconnectTimeout = computed($websocket, ({reconnectAttempts}) => Math.min(2 ** reconnectAttempts * 1000, 30000));

function incrementReconnectAttempts(): void {
    $websocket.setKey('reconnectAttempts', $websocket.get().reconnectAttempts + 1);
}

export const $isConnected = computed($websocket, ({connection, state, online}) => {
    return connection != null && connection.readyState === WebSocket.OPEN && state === 'connected' && online;
});

function isActiveConnection(connection: Optional<WebSocket>): connection is WebSocket {
    return (
        connection != null &&
        (connection.readyState === WebSocket.OPEN || connection.readyState === WebSocket.CONNECTING)
    );
}

//
//* Lifecycle
//

const $needsUnmount = computed([$websocket, $isBusy], ({lifecycle}, isBusy) => lifecycle === 'unmounting' && !isBusy);

let unsubscribeUnmount: Optional<() => void>;

export function mountWebSocket(): () => void {
    const {lifecycle} = $websocket.get();

    if (lifecycle === 'unmounting' || lifecycle === 'unmounted') {
        unsubscribeUnmount?.();

        $websocket.setKey('lifecycle', 'mounting');
        $websocket.setKey('online', navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        connect();

        $websocket.setKey('lifecycle', 'mounted');
    }

    return () => {
        $websocket.setKey('lifecycle', 'unmounting');
        unsubscribeUnmount = $needsUnmount.subscribe(needsUnmount => {
            if (!needsUnmount) {
                return;
            }

            // `subscribe` may be undefined if handler is called instantly
            setTimeout(() => unsubscribeUnmount?.(), 0);

            disconnect();

            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);

            $websocket.setKey('lifecycle', 'unmounted');
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
const STOP_ANALYSIS_TIMEOUT = 20000; // ms
const STOP_GENERATION_TIMEOUT = 60000; // ms

let pingInterval: number;
let pongTimeout: number;
let reconnectTimeout: number;
let stopTimeout: number;

function connect(): void {
    const {state, connection} = $websocket.get();

    if (state === 'connecting' || state === 'connected') {
        return;
    }

    if (isActiveConnection(connection)) {
        cleanup(connection);
    }

    const {wsServiceUrl} = $config.get();
    const ws = new WebSocket(wsServiceUrl, [WS_PROTOCOL]);
    $websocket.setKey('connection', ws);

    $websocket.setKey('state', 'connecting');
    const connectionTimeout = setTimeout(() => {
        if ($websocket.get().state === 'connecting') {
            ws.close();
        }
    }, CONNECTION_TIMEOUT);

    ws.onopen = () => {
        clearTimeout(connectionTimeout);

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
            clearTimeout(pongTimeout);
            pongTimeout = setTimeout(() => {
                disconnect();
            }, PONG_TIMEOUT);
        }, PING_INTERVAL);
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
        clearTimeout(connectionTimeout);
        cleanup(ws);
        scheduleReconnect();
    };

    ws.onerror = e => {
        console.error(e);
    };
}

function disconnect(): void {
    const {state, connection} = $websocket.get();
    if (state !== 'disconnected' && state !== 'disconnecting') {
        $websocket.setKey('state', 'disconnecting');
        sendMessage({
            type: MessageType.DISCONNECT,
            metadata: createMetadata(),
        });
    }

    if (isActiveConnection(connection)) {
        connection.onerror = null;
        connection.close();
    }
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
    const {lifecycle, reconnectAttempts} = $websocket.get();
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.warn(`Max reconnect attempts reached: ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
        return;
    }

    if (lifecycle === 'unmounting' || lifecycle === 'unmounted') {
        return;
    }

    incrementReconnectAttempts();
    reconnectTimeout = window.setTimeout(() => {
        connect();
    }, $reconnectTimeout.get());
}

function cleanup(ws: WebSocket): void {
    if (isActiveConnection(ws)) {
        ws.close();
    }

    const {connection} = $websocket.get();
    if (ws !== connection) {
        return;
    }

    clearInterval(pingInterval);
    clearTimeout(reconnectTimeout);
    clearTimeout(pongTimeout);
    clearTimeout(stopTimeout);

    $websocket.setKey('state', 'disconnected');
    $websocket.setKey('connection', null);
    $websocket.setKey('online', navigator.onLine);
    $buffer.set({});
}

function handleDisconnected(): void {
    const {connection} = $websocket.get();
    if (isActiveConnection(connection)) {
        connection.close();
    }
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

        case MessageType.LICENSE_UPDATED:
            handleLicenseUpdatedMessage(message.payload);
            break;

        case MessageType.ANALYZED: {
            handleAnalyzedMessage(message.payload);
            break;
        }

        case MessageType.GENERATED: {
            handleGeneratedMessage(message.payload);
            break;
        }

        case MessageType.FAILED: {
            handleFailedMessage(message.payload);
            break;
        }

        case MessageType.DISCONNECTED:
            handleDisconnected();
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
    const metadata = createMetadata();
    sendMessage({type: MessageType.GENERATE, metadata, payload});

    $buffer.setKey('generationId', metadata.id);

    clearTimeout(stopTimeout);
    stopTimeout = setTimeout(() => {
        sendStop(MessageRole.SYSTEM);
    }, STOP_ANALYSIS_TIMEOUT);
}

//
//* Flow: Client → Server
//

export function sendStop(role: Exclude<MessageRole, 'model'>): void {
    if (!$isConnected.get()) {
        return;
    }

    const {generationId, modelMessageId} = $buffer.get();
    if (!generationId) {
        return;
    }

    sendMessage({type: MessageType.STOP, metadata: createMetadata(), payload: {generationId}});
    addStoppedMessage(role, modelMessageId);

    clearTimeout(stopTimeout);
    $buffer.set({});
}

export function sendPrompt(nodes: Descendant[]): void {
    if (!$isConnected.get()) {
        return;
    }

    const node = parseNodes(nodes);
    const prompt = parseText(nodes);
    const contextData = makeContextData();

    const message = addUserMessage({node, prompt, contextData});
    if (!message) {
        return;
    }

    $buffer.setKey('userMessageId', message.id);

    const payload = createGenerateMessagePayload(prompt);
    sendGenerateMessage(payload);
}

export function sendRetry(userMessageId: string): void {
    if (!$isConnected.get()) {
        return;
    }

    const userMessage = getUserMessageById(userMessageId);
    if (!userMessage) {
        addErrorMessage(t('text.error.message.repeat.notFound'));
        return;
    }

    markAllNextMessagesInactive(userMessage.id);

    $buffer.setKey('userMessageId', userMessage.id);

    const payload = createGenerateMessagePayload(userMessage.content.prompt);
    sendGenerateMessage(payload);
}

//
//* Flow: Server → Client
//

function isLicenseStatePayload(payload: LicenseUpdatedPayload): payload is LicenseUpdatedStatePayload {
    return 'licenseState' in payload;
}

function handleLicenseUpdatedMessage(payload: LicenseUpdatedPayload): void {
    if (isLicenseStatePayload(payload)) {
        $licenseState.set(payload.licenseState);
    } else {
        $licenseState.set('MISSING');
        console.log('Error on fetching license state', payload);
    }

    // in case when attempt to analyze/generate was made and license was missing
    clearTimeout(stopTimeout);
    $buffer.set({});
}

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

    clearTimeout(stopTimeout);
    stopTimeout = setTimeout(() => {
        sendStop(MessageRole.SYSTEM);
    }, STOP_GENERATION_TIMEOUT);
}

function handleGeneratedMessage({request, result}: GeneratedMessagePayload): void {
    const {userMessageId, modelMessageId} = $buffer.get();
    if (!userMessageId || !modelMessageId) {
        return;
    }

    updateUserMessage(userMessageId, {generationPrompt: request});
    updateModelMessage(modelMessageId, result);

    clearTimeout(stopTimeout);
    $buffer.set({});
}

function handleFailedMessage(payload: FailedMessagePayload): void {
    addErrorMessage(payload, $buffer.get().modelMessageId);

    clearTimeout(stopTimeout);
    $buffer.set({});
}

function makeContextData(): {name: string; title: string; displayName: string} | undefined {
    const context = $context.get();

    if (!context) {
        return;
    }

    const paths = context ? getAllPathsFromString(context) : [];
    const contextItem = paths.pop();

    if (!contextItem) {
        return;
    }

    const key = pathToString(contextItem);
    const fieldDescriptors = $fieldDescriptors.get();
    const descriptor = fieldDescriptors.find(descriptor => descriptor.name === key);

    return descriptor
        ? {
              name: descriptor.name,
              title: descriptor.displayName,
              displayName: descriptor.displayName.split('/').pop() as string,
          }
        : undefined;
}
