import {computed} from 'nanostores';
import {Descendant} from 'slate';

import {$config} from './config';
import {MessageRole} from './data/MessageType';
import {
    $isBusy as $isWebSocketBusy,
    $isConnected as $isWebSocketConnected,
    $busyAnalyzing as $webSocketBusyAnalyzing,
    mountWebSocket,
    sendPrompt as sendPromptWebSocket,
    sendRetry as sendRetryWebSocket,
    sendStop as sendStopWebSocket,
} from './websocket';
import {
    $isBusy as $isWorkerBusy,
    $isConnected as $isWorkerConnected,
    $busyAnalyzing as $workerBusyAnalyzing,
    mountWorker,
    sendPrompt as sendPromptWorker,
    sendRetry as sendRetryWorker,
    sendStop as sendStopWorker,
} from './worker';

// TODO: Remove after separate WebSocket support is dropped

export const $isBusy = computed([$isWorkerBusy, $isWebSocketBusy], (isWorkerBusy, isWebSocketBusy): boolean => {
    return isWorkerBusy || isWebSocketBusy;
});

export const $busyAnalyzing = computed(
    [$workerBusyAnalyzing, $webSocketBusyAnalyzing],
    (workerBusyAnalyzing, webSocketBusyAnalyzing): boolean => {
        return workerBusyAnalyzing || webSocketBusyAnalyzing;
    },
);

export const $isConnected = computed(
    [$isWorkerConnected, $isWebSocketConnected],
    (isWorkerConnected, isWebSocketConnected): boolean => {
        return isWorkerConnected || isWebSocketConnected;
    },
);

export function mountConnection(): () => void {
    const {sharedSocketUrl, wsServiceUrl} = $config.get();
    if (sharedSocketUrl) {
        return mountWorker();
    }

    if (wsServiceUrl) {
        return mountWebSocket();
    }

    console.error('[Enonic AI] No SharedSocket or WebSocket service URL configured.');

    return () => {
        /* empty */
    };
}

export function sendStop(role: Exclude<MessageRole, 'model'>): void {
    const {sharedSocketUrl, wsServiceUrl} = $config.get();
    if (sharedSocketUrl) {
        return sendStopWorker(role);
    }

    if (wsServiceUrl) {
        return sendStopWebSocket(role);
    }
}

export function sendPrompt(nodes: Descendant[]): void {
    const {sharedSocketUrl, wsServiceUrl} = $config.get();
    if (sharedSocketUrl) {
        return sendPromptWorker(nodes);
    }

    if (wsServiceUrl) {
        return sendPromptWebSocket(nodes);
    }
}

export function sendRetry(userMessageId: string): void {
    const {sharedSocketUrl, wsServiceUrl} = $config.get();
    if (sharedSocketUrl) {
        return sendRetryWorker(userMessageId);
    }

    if (wsServiceUrl) {
        return sendRetryWebSocket(userMessageId);
    }
}
