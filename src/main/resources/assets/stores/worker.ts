import {t} from 'i18next';
import {atom, computed, map} from 'nanostores';
import {Descendant} from 'slate';

import {
    AnalyzedMessagePayload,
    FailedMessagePayload,
    GeneratedMessagePayload,
    GenerateMessagePayload,
    MessageType,
} from '../../shared/messages';
import {ClientMessage, MessageMetadata, ServerMessage, WSMessageType} from '../../shared/websocket';
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
import {$contentPath, $language, createFields} from './data';
import {MessageRole} from './data/MessageType';

type WorkerLifecycle = 'mounting' | 'mounted' | 'unmounting' | 'unmounted';

type WorkerState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected';

type WorkerStore = {
    lifecycle: WorkerLifecycle;
    state: WorkerState;
    connection: Optional<SharedWorker>;
    online: boolean;
};

const $worker = map<WorkerStore>({
    lifecycle: 'unmounted',
    state: 'disconnected',
    connection: null,
    online: navigator.onLine,
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

export const $isConnected = computed($worker, ({connection, state, online}) => {
    return connection != null && state === 'connected' && online;
});

//
//* Lifecycle
//

const $needsUnmount = computed([$worker, $isBusy], ({lifecycle}, isBusy) => lifecycle === 'unmounting' && !isBusy);

let unsubscribeUnmount: Optional<() => void>;

export function mountWorker(): () => void {
    const {lifecycle} = $worker.get();

    if (lifecycle === 'unmounting' || lifecycle === 'unmounted') {
        unsubscribeUnmount?.();

        $worker.setKey('lifecycle', 'mounting');
        $worker.setKey('online', navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        connect();

        $worker.setKey('lifecycle', 'mounted');
    }

    return () => {
        $worker.setKey('lifecycle', 'unmounting');
        unsubscribeUnmount = $needsUnmount.subscribe(needsUnmount => {
            if (!needsUnmount) {
                return;
            }

            // `subscribe` may be undefined if handler is called instantly
            setTimeout(() => unsubscribeUnmount?.(), 0);

            disconnect();

            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);

            $worker.setKey('lifecycle', 'unmounted');
        });
    };
}

//
//* Connection
//

const STOP_ANALYSIS_TIMEOUT = 20000; // ms
const STOP_GENERATION_TIMEOUT = 60000; // ms

let stopTimeout: number;

function connect(): void {
    const {state, connection} = $worker.get();

    if (state === 'connecting' || state === 'connected') {
        return;
    }

    cleanup(connection);

    const {sharedSocketUrl} = $config.get();
    const worker = new SharedWorker(sharedSocketUrl, {type: 'module'});

    $worker.setKey('connection', worker);
    $worker.setKey('state', 'connecting');

    worker.port.addEventListener('message', event => {
        handleMessage(event as MessageEvent<ServerMessage>);
    });

    worker.port.addEventListener('error', event => {
        console.error(event);
    });

    worker.port.start();
}

function disconnect(): void {
    const {state, connection} = $worker.get();
    if (state !== 'disconnected' && state !== 'disconnecting') {
        $worker.setKey('state', 'disconnecting');
    }

    cleanup(connection);
}

function handleOnline(): void {
    $worker.setKey('online', true);
}

function handleOffline(): void {
    $worker.setKey('online', false);
}

function cleanup(worker: Optional<SharedWorker>): void {
    worker?.port.close();

    const {connection} = $worker.get();
    if (worker !== connection) {
        return;
    }

    clearTimeout(stopTimeout);

    $worker.setKey('state', 'disconnected');
    $worker.setKey('connection', null);
    $worker.setKey('online', navigator.onLine);
    $buffer.set({});
}

function handleDisconnected(): void {
    const {state} = $worker.get();
    if (state !== 'disconnected' && state !== 'disconnecting') {
        $worker.setKey('state', 'disconnected');
    }
    $buffer.set({});
}

//
//* Receive
//

function handleMessage(event: MessageEvent<ServerMessage>): void {
    const message = event.data;

    switch (message.type) {
        case WSMessageType.CONNECTED:
            $worker.setKey('state', 'connected');
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

        case WSMessageType.DISCONNECTED:
            handleDisconnected();
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
    const {connection} = $worker.get();
    connection?.port.postMessage({type: 'send', payload: message});
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

    const message = addUserMessage({node, prompt});
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
