import { atom, computed, map } from 'nanostores';

import type { GenerateMessagePayload } from '@shared/websocket';

export type WebSocketLifecycle = 'mounting' | 'mounted' | 'unmounting' | 'unmounted';

export type WebSocketState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected';

export type WebSocketStore = {
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

export type Buffer = {
  generationId?: string;
  userMessageId?: string;
  modelMessageId?: string;
};

export const $buffer = map<Buffer>({});

export const $lastPayload = atom<Optional<Readonly<GenerateMessagePayload>>>(null);

export const $isBusy = computed(
  $buffer,
  ({ generationId, userMessageId, modelMessageId }): boolean => {
    return generationId != null || userMessageId != null || modelMessageId != null;
  },
);

export const $busyAnalyzing = computed(
  $buffer,
  ({ generationId, userMessageId, modelMessageId }): boolean => {
    return generationId != null && userMessageId != null && modelMessageId == null;
  },
);

export const $reconnectTimeout = computed($websocket, ({ reconnectAttempts }) =>
  Math.min(2 ** reconnectAttempts * 1000, 30_000),
);

export const $isConnected = computed($websocket, ({ connection, state, online }) => {
  return (
    connection != null &&
    connection.readyState === WebSocket.OPEN &&
    state === 'connected' &&
    online
  );
});

export const $needsUnmount = computed(
  [$websocket, $isBusy],
  ({ lifecycle }, isBusy) => lifecycle === 'unmounting' && !isBusy,
);
