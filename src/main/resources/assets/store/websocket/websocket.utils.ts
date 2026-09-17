import { aiFieldPathToPathString } from '@shared/ai-field-path';
import { WS_PROTOCOL } from '@shared/constants';
import { MessageType } from '@shared/websocket';
import { t } from 'i18next';

import { parseNodes, parseText } from '@/common/slate';
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
} from '@/store/chat';
import { $config } from '@/store/config';
import {
  $contentPath,
  $fieldDescriptors,
  $language,
  MessageRole,
  createFields,
  getAllPathsFromString,
  pathToString,
} from '@/store/content';
import { $context } from '@/store/context';
import { $dialog } from '@/store/dialog/dialog.store';
import { applyResults, getHostApi } from '@/store/host';
import { $licenseState } from '@/store/license';

import type { AiFieldPath, AiFieldsRequest, AiFieldsResult } from '@shared/ai-protocol';
import type {
  AltTextGeneratedMessagePayload,
  AnalyzedMessagePayload,
  ClientMessage,
  FailedMessagePayload,
  GeneratedMessagePayload,
  GenerateMessagePayload,
  LicenseUpdatedPayload,
  LicenseUpdatedStatePayload,
  MessageMetadata,
  ServerMessage,
} from '@shared/websocket';
import type { Descendant } from 'slate';

import {
  $buffer,
  $isBusy,
  $isConnected,
  $lastPayload,
  $needsUnmount,
  $reconnectTimeout,
  $websocket,
} from './websocket.store';

//
//* State helpers
//

function incrementReconnectAttempts(): void {
  $websocket.setKey('reconnectAttempts', $websocket.get().reconnectAttempts + 1);
}

function isActiveConnection(connection: Optional<WebSocket>): connection is WebSocket {
  return (
    connection != null &&
    (connection.readyState === WebSocket.OPEN || connection.readyState === WebSocket.CONNECTING)
  );
}

//
//* Lifecycle
//

let unsubscribeUnmount: Optional<() => void>;

export function mountWebSocket(): () => void {
  const { lifecycle } = $websocket.get();

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
    unsubscribeUnmount = $needsUnmount.subscribe((needsUnmount) => {
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
const CONNECTION_TIMEOUT = 60_000; // ms
const PING_INTERVAL = 50_000; // ms
const PONG_TIMEOUT = 15_000; // ms
const STOP_ANALYSIS_TIMEOUT = 20_000; // ms
const STOP_GENERATION_TIMEOUT = 60_000; // ms
const ALT_TEXT_RESULT_TIMEOUT = 60_000; // ms
const FIELDS_RESULT_TIMEOUT = 60_000; // ms

let pingInterval: number;
let pongTimeout: number;
let reconnectTimeout: number;
let stopTimeout: number;
let altTextResultTimeout: number;

function connect(): void {
  const { state, connection } = $websocket.get();

  if (state === 'connecting' || state === 'connected') {
    return;
  }

  if (isActiveConnection(connection)) {
    cleanup(connection);
  }

  const { wsServiceUrl } = $config.get();
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
      pongTimeout = window.setTimeout(() => {
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

  ws.onerror = (e) => {
    console.error(e);
  };
}

function disconnect(): void {
  const { state, connection } = $websocket.get();
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
  const { lifecycle, reconnectAttempts } = $websocket.get();
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.warn(`Max reconnect attempts reached: ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
    // ! A held temporary connection keeps the lifecycle mounted but dead, blocking the next reconnect
    abortAltTextRequests();
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

  const { connection } = $websocket.get();
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
  const { connection } = $websocket.get();
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
      flushPendingAltText();
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

    case MessageType.ALT_TEXT_GENERATED:
      handleAltTextGeneratedMessage(message.payload);
      break;

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
  const { connection } = $websocket.get();
  if (connection?.readyState === WebSocket.OPEN) {
    connection.send(JSON.stringify(message));
  }
}

function sendGenerateMessage(payload: GenerateMessagePayload): void {
  const metadata = createMetadata();
  sendMessage({ type: MessageType.GENERATE, metadata, payload });

  $buffer.setKey('generationId', metadata.id);

  clearTimeout(stopTimeout);
  stopTimeout = window.setTimeout(() => {
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

  const { generationId, modelMessageId } = $buffer.get();
  if (!generationId) {
    return;
  }

  sendMessage({ type: MessageType.STOP, metadata: createMetadata(), payload: { generationId } });
  if (activeFieldsRequest == null) {
    addStoppedMessage(role, modelMessageId);
  }

  clearTimeout(stopTimeout);
  $buffer.set({});
  finishFieldsRequest(() => 'stopped');
}

//
//* Flow: headless field generation (voice)
//
// CS asks for values for given fields without the dialog: the request becomes a
// prompt with one mention per field and goes through the server's generation
// pipeline, but stays out of the chat history; the results are applied as soon
// as they arrive. A temporary connection is held while the dialog is closed.

type FieldsRequest = AiFieldsRequest & { pathStrings: string[]; unsupported: AiFieldPath[] };

let pendingFieldsRequest: Optional<FieldsRequest>;
let activeFieldsRequest: Optional<FieldsRequest>;
let releaseFieldsConnection: Optional<() => void>;
let fieldsResultTimeout: number;

export function requestFieldsGeneration(request: AiFieldsRequest): void {
  const api = getHostApi();
  if (activeFieldsRequest != null || pendingFieldsRequest != null || $isBusy.get()) {
    api.reportResult({
      requestId: request.requestId,
      applied: [],
      failed: request.paths.map((path) => ({ path, message: 'busy' })),
    });
    return;
  }

  const unsupported = request.paths.filter((path) => aiFieldPathToPathString(path) == null);
  const pathStrings = request.paths
    .map(aiFieldPathToPathString)
    .filter((path): path is string => path != null);
  const fieldsRequest: FieldsRequest = { ...request, pathStrings, unsupported };
  console.info('[ai.contentOperator] voice request', request.requestId, pathStrings.join(', '));

  if (pathStrings.length === 0) {
    reportFieldsResult(fieldsRequest, {});
    return;
  }

  request.paths.forEach((path) => {
    if (!unsupported.includes(path)) api.setFieldState(path, 'processing');
  });

  clearTimeout(fieldsResultTimeout);
  fieldsResultTimeout = window.setTimeout(() => {
    finishFieldsRequest(() => 'timeout');
  }, FIELDS_RESULT_TIMEOUT);

  if ($isConnected.get()) {
    activeFieldsRequest = fieldsRequest;
    sendFieldsRequest(fieldsRequest);
    return;
  }

  pendingFieldsRequest = fieldsRequest;
  console.info('[ai.contentOperator] voice request waits for a connection');
  const { lifecycle } = $websocket.get();
  if (
    releaseFieldsConnection == null &&
    (lifecycle === 'unmounted' || lifecycle === 'unmounting')
  ) {
    releaseFieldsConnection = mountWebSocket();
  }
}

function flushPendingFieldsRequest(): void {
  const request = pendingFieldsRequest;
  if (request == null) {
    return;
  }
  pendingFieldsRequest = null;
  activeFieldsRequest = request;
  sendFieldsRequest(request);
}

function buildFieldsPrompt({ pathStrings, instructions }: FieldsRequest): string {
  const mentions = pathStrings.map((path) => `{{${path}}}`);
  const list =
    mentions.length > 1
      ? `${mentions.slice(0, -1).join(', ')} and ${mentions[mentions.length - 1]}`
      : mentions[0];
  const prompt = `Generate a suggestion for ${list}.`;
  return instructions ? `${prompt} ${instructions}` : prompt;
}

function sendFieldsRequest(request: FieldsRequest): void {
  const prompt = buildFieldsPrompt(request);
  sendGenerateMessage(createGenerateMessagePayload(prompt));
  console.info('[ai.contentOperator] voice prompt sent', JSON.stringify(prompt));
}

function pickFirst(entry: string | string[] | undefined): string | undefined {
  return Array.isArray(entry) ? entry[0] : entry;
}

// Applies what the model produced for the requested fields and reports back.
function reportFieldsResult(
  request: FieldsRequest,
  result: Record<string, string | string[]>,
): void {
  const api = getHostApi();
  const applied: AiFieldPath[] = [];
  const failed: AiFieldsResult['failed'] = request.unsupported.map((path) => ({
    path,
    message: 'unsupported field',
  }));

  request.paths.forEach((path) => {
    const pathString = aiFieldPathToPathString(path);
    if (pathString == null) {
      return;
    }
    const text = pickFirst(result[pathString] ?? result[pathString.slice(1)]);
    if (text == null || text.length === 0) {
      api.setFieldState(path, 'failed');
      failed.push({ path, message: 'no suggestion' });
      return;
    }
    applyResults([{ path: pathString, text }]);
    api.setFieldState(path, 'completed');
    applied.push(path);
  });

  console.info(
    '[ai.contentOperator] voice result',
    applied.length,
    'applied,',
    failed.length,
    'failed',
  );
  api.reportResult({ requestId: request.requestId, applied, failed });
}

// Ends the active or pending request as failed with the given message.
function finishFieldsRequest(message: () => string): void {
  const request = activeFieldsRequest ?? pendingFieldsRequest;
  activeFieldsRequest = null;
  pendingFieldsRequest = null;
  clearTimeout(fieldsResultTimeout);
  if (request == null) {
    return;
  }
  console.info('[ai.contentOperator] voice request failed:', message());
  const api = getHostApi();
  request.paths.forEach((path) => api.setFieldState(path, 'failed', { message: message() }));
  api.reportResult({
    requestId: request.requestId,
    applied: [],
    failed: request.paths.map((path) => ({ path, message: message() })),
  });
  releaseFieldsConnectionIfIdle();
}

function releaseFieldsConnectionIfIdle(): void {
  if (activeFieldsRequest != null || pendingFieldsRequest != null) {
    return;
  }
  const release = releaseFieldsConnection;
  releaseFieldsConnection = null;
  if (release != null && $dialog.get().hidden) {
    release();
  }
}

export function sendGenerateAltText(contentId: string, project: string): void {
  if (!$isConnected.get()) {
    return;
  }

  sendMessage({
    type: MessageType.GENERATE_ALT_TEXT,
    metadata: createMetadata(),
    payload: { contentId, project },
  });
}

// Alt text requests may arrive while the dialog (which owns the socket
// lifecycle) is closed. Queue them, hold a temporary connection open until
// the server returns the results, then release it.
type AltTextRequest = { contentId: string; project: string };

let pendingAltTextRequests: AltTextRequest[] = [];
let inFlightAltTextIds: string[] = [];
let releaseAltTextConnection: Optional<() => void>;

export function requestAltTextGeneration(contentId: string, project: string): void {
  if ($isConnected.get()) {
    sendAltTextRequest({ contentId, project });
    return;
  }

  if (!pendingAltTextRequests.some((request) => request.contentId === contentId)) {
    pendingAltTextRequests.push({ contentId, project });
  }

  const { lifecycle } = $websocket.get();
  if (
    releaseAltTextConnection == null &&
    (lifecycle === 'unmounted' || lifecycle === 'unmounting')
  ) {
    releaseAltTextConnection = mountWebSocket();
  }
}

function sendAltTextRequest({ contentId, project }: AltTextRequest): void {
  if (!inFlightAltTextIds.includes(contentId)) {
    inFlightAltTextIds.push(contentId);
  }
  sendGenerateAltText(contentId, project);

  // A lost result must not hold the temporary connection open forever.
  clearTimeout(altTextResultTimeout);
  altTextResultTimeout = window.setTimeout(() => {
    inFlightAltTextIds = [];
    releaseAltTextConnectionIfIdle();
  }, ALT_TEXT_RESULT_TIMEOUT);
}

function flushPendingAltText(): void {
  const requests = pendingAltTextRequests;
  pendingAltTextRequests = [];
  requests.forEach((request) => sendAltTextRequest(request));
}

function handleAltTextGeneratedMessage(payload: AltTextGeneratedMessagePayload): void {
  inFlightAltTextIds = inFlightAltTextIds.filter((id) => id !== payload.contentId);
  if (inFlightAltTextIds.length === 0) {
    clearTimeout(altTextResultTimeout);
    releaseAltTextConnectionIfIdle();
  }
}

function abortAltTextRequests(): void {
  pendingAltTextRequests = [];
  inFlightAltTextIds = [];
  clearTimeout(altTextResultTimeout);
  releaseAltTextConnectionIfIdle();
}

function releaseAltTextConnectionIfIdle(): void {
  if (pendingAltTextRequests.length > 0 || inFlightAltTextIds.length > 0) {
    return;
  }

  const release = releaseAltTextConnection;
  releaseAltTextConnection = null;
  // If the dialog opened meanwhile, its effect owns the lifecycle now.
  if (release != null && $dialog.get().hidden) {
    release();
  }
}

export function sendPrompt(nodes: Descendant[]): void {
  if (!$isConnected.get()) {
    return;
  }

  const node = parseNodes(nodes);
  const prompt = parseText(nodes);
  const contextData = makeContextData();

  const message = addUserMessage({ node, prompt, contextData });
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

function isLicenseStatePayload(
  payload: LicenseUpdatedPayload,
): payload is LicenseUpdatedStatePayload {
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

  // The server sends the license right after CONNECTED and this wipes the
  // buffer, so a request queued for a fresh connection is only sent from here.
  if (pendingFieldsRequest != null) {
    if ($licenseState.get() === 'OK') {
      flushPendingFieldsRequest();
    } else {
      finishFieldsRequest(() => 'license');
    }
  } else if (activeFieldsRequest != null && $licenseState.get() !== 'OK') {
    finishFieldsRequest(() => 'license');
  }
}

function handleAnalyzedMessage({ request, result }: AnalyzedMessagePayload): void {
  if (activeFieldsRequest != null) {
    clearTimeout(stopTimeout);
    stopTimeout = window.setTimeout(() => {
      sendStop(MessageRole.SYSTEM);
    }, STOP_GENERATION_TIMEOUT);
    return;
  }

  const { userMessageId } = $buffer.get();
  if (!userMessageId) {
    return;
  }

  const userMessage = updateUserMessage(userMessageId, { analysisPrompt: request });
  if (!userMessage) {
    return;
  }

  const modelMessage = addModelMessage(result, userMessage.id);
  if (!modelMessage) {
    return;
  }

  $buffer.setKey('modelMessageId', modelMessage.id);

  clearTimeout(stopTimeout);
  stopTimeout = window.setTimeout(() => {
    sendStop(MessageRole.SYSTEM);
  }, STOP_GENERATION_TIMEOUT);
}

function handleGeneratedMessage({ request, result }: GeneratedMessagePayload): void {
  const fieldsRequest = activeFieldsRequest;
  if (fieldsRequest != null) {
    activeFieldsRequest = null;
    clearTimeout(stopTimeout);
    clearTimeout(fieldsResultTimeout);
    $buffer.set({});
    reportFieldsResult(fieldsRequest, result);
    releaseFieldsConnectionIfIdle();
    return;
  }

  const { userMessageId, modelMessageId } = $buffer.get();
  if (!userMessageId || !modelMessageId) {
    return;
  }

  updateUserMessage(userMessageId, { generationPrompt: request });
  updateModelMessage(modelMessageId, result);

  clearTimeout(stopTimeout);
  $buffer.set({});
}

function handleFailedMessage(payload: FailedMessagePayload): void {
  if (activeFieldsRequest != null) {
    clearTimeout(stopTimeout);
    $buffer.set({});
    finishFieldsRequest(() => payload.message);
    return;
  }

  addErrorMessage(payload, $buffer.get().modelMessageId);

  clearTimeout(stopTimeout);
  $buffer.set({});
}

function makeContextData(): { name: string; title: string; displayName: string } | undefined {
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
  const descriptor = fieldDescriptors.find((descriptor) => descriptor.name === key);

  return descriptor
    ? {
        name: descriptor.name,
        title: descriptor.displayName,
        displayName: descriptor.displayName.split('/').pop() as string,
      }
    : undefined;
}
