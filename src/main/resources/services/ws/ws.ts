import { submitTask } from '/lib/xp/task';
import { send } from '/lib/xp/websocket';

import type { ContextUserParams } from '/lib/xp/context';

import type { LicenseState } from '../../shared/license';
import type {
  AltTextGeneratedMessage,
  AltTextGeneratedMessagePayload,
  AnalyzedMessage,
  AnalyzedMessagePayload,
  ClientMessage,
  FailedMessage,
  GenerateAltTextMessage,
  GeneratedMessage,
  GeneratedMessagePayload,
  GenerateMessage,
  LicenseUpdatedMessage,
  MessageMetadata,
  ServerMessage,
} from '../../shared/websocket';

import { CMS_REPO_PREFIX, generateAltTextForImage } from '../../lib/flow/altText';
import { analyze } from '../../lib/flow/analyze';
import { generate } from '../../lib/flow/generate';
import { respondError } from '../../lib/http/requests';
import { getLicenseState } from '../../lib/license/license-manager';
import { logDebug, LogDebugGroups, logError } from '../../lib/logger';
import { createOperationRegistry } from '../../lib/utils/operations';
import { unsafeUUIDv4 } from '../../lib/utils/uuid';
import { WS_PROTOCOL } from '../../shared/constants';
import { ERRORS } from '../../shared/errors';
import { MessageType } from '../../shared/websocket';

type WsData = Record<string, never>;

const activeOperations = createOperationRegistry();

//
//* WebSocket
//

export function get(request: Enonic.Request): Enonic.Response {
  if (!request.webSocket) {
    const error = ERRORS.REST_NOT_FOUND.withMsg(
      'Trying to access WebSocket with "webSocket" set to "false"',
    );
    return respondError(error, 404);
  }

  const protocols = request.headers?.['Sec-WebSocket-Protocol']?.split(', ');
  const isValidProtocol = protocols?.some((protocol) => protocol === WS_PROTOCOL);
  if (!isValidProtocol) {
    const error = ERRORS.WS_INVALID_PROTOCOL.withMsg(`Expected <${WS_PROTOCOL}>.`);
    return respondError(error, 400);
  }

  return {
    status: 101,
    webSocket: {
      subProtocols: [WS_PROTOCOL],
    },
  };
}

export function webSocketEvent(event: Enonic.WebSocketEvent<WsData>): void {
  try {
    const { type } = event;

    switch (type) {
      case 'open':
        break;
      case 'message':
        handleMessage(event);
        break;
      case 'close':
        handleClose();
        break;
      case 'error':
        handleError(event);
        break;
    }
  } catch (e) {
    logError(e);
  }
}

function handleClose(): void {
  // TODO: Prevent unnecessary operations and call to LLMs in case of close
}

function handleError(event: Enonic.WebSocketEvent): void {
  logError(event.error);
}

//
//* Receive
//

function handleMessage(event: Enonic.WebSocketEvent<WsData>): void {
  const { id } = event.session;
  const message = parseMessage(event.message);
  if (!message) {
    return;
  }

  logDebug(LogDebugGroups.WS, `Received message: ${JSON.stringify(message)}`);

  switch (message.type) {
    case MessageType.PING:
      sendMessage(id, { type: MessageType.PONG });
      break;
    case MessageType.CONNECT:
      handleConnect(id);
      break;
    case MessageType.GENERATE:
      handleGenerateMessage(id, message);
      break;
    case MessageType.STOP:
      stopGeneration(message.payload.generationId);
      break;
    case MessageType.GENERATE_ALT_TEXT:
      handleGenerateAltTextMessage(id, message, event);
      break;
  }
}

function parseMessage(message: Optional<string>): Optional<ClientMessage> {
  try {
    return message != null ? (JSON.parse(message) as ClientMessage) : undefined;
  } catch (_e) {
    return undefined;
  }
}

//
//* Send
//

function createMetadata(): MessageMetadata {
  return {
    id: unsafeUUIDv4(),
    timestamp: Date.now(),
  };
}

function sendMessage(socketId: string, message: Omit<ServerMessage, 'metadata'>): void {
  send(socketId, JSON.stringify({ ...message, metadata: createMetadata() }));
}

function sendAnalyzedMessage(socketId: string, payload: AnalyzedMessagePayload): void {
  const message = { type: MessageType.ANALYZED, payload } satisfies Omit<
    AnalyzedMessage,
    'metadata'
  >;
  sendMessage(socketId, message);
}

function sendGeneratedMessage(socketId: string, payload: GeneratedMessagePayload): void {
  const message = { type: MessageType.GENERATED, payload } satisfies Omit<
    GeneratedMessage,
    'metadata'
  >;
  sendMessage(socketId, message);
}

function sendAltTextGeneratedMessage(
  socketId: string,
  payload: AltTextGeneratedMessagePayload,
): void {
  const message = { type: MessageType.ALT_TEXT_GENERATED, payload } satisfies Omit<
    AltTextGeneratedMessage,
    'metadata'
  >;
  sendMessage(socketId, message);
}

function sendConnectedMessage(socketId: string): void {
  sendMessage(socketId, { type: MessageType.CONNECTED });
}

function sendLicenseUpdatedMessage(
  socketId: string,
  licenseStateOrError?: Try<LicenseState>,
): void {
  const license = licenseStateOrError ?? getLicenseState();
  const [licenseState, licenseError] = license;
  const payload = licenseError ? licenseError : { licenseState };
  const message = { type: MessageType.LICENSE_UPDATED, payload } satisfies Omit<
    LicenseUpdatedMessage,
    'metadata'
  >;

  sendMessage(socketId, message);
}

function sendFailedErrorMessage(socketId: string, error: AiError): void {
  const message = {
    type: MessageType.FAILED,
    payload: {
      type: 'error',
      message: error.message,
      code: error.code,
    },
  } satisfies Omit<FailedMessage, 'metadata'>;
  sendMessage(socketId, message);
}

function sendFailedWarningMessage(socketId: string, text: string): void {
  const message = {
    type: MessageType.FAILED,
    payload: {
      type: 'warning',
      message: text,
    },
  } satisfies Omit<FailedMessage, 'metadata'>;
  sendMessage(socketId, message);
}

//
//* Flow
//

function handleConnect(socketId: string): void {
  sendConnectedMessage(socketId);
  sendLicenseUpdatedMessage(socketId);
}

function handleGenerateMessage(socketId: string, message: GenerateMessage): void {
  const result = getLicenseState();
  const [licenseState] = getLicenseState();

  if (licenseState !== 'OK') {
    return sendLicenseUpdatedMessage(socketId, result);
  }

  submitTask({
    descriptor: 'analyzeAndGenerate',
    config: { socketId, message: JSON.stringify(message) },
  });
}

function handleGenerateAltTextMessage(
  socketId: string,
  message: GenerateAltTextMessage,
  event: Enonic.WebSocketEvent<WsData>,
): void {
  const { contentId, project } = message.payload;

  const result = getLicenseState();
  const [licenseState] = result;

  // ! Every skip path must answer, or the client holds a temporary connection until it times out
  if (licenseState !== 'OK') {
    sendLicenseUpdatedMessage(socketId, result);
    return sendAltTextGeneratedMessage(socketId, { contentId, altText: null });
  }

  const { user } = event.session;
  const repo = project ? `${CMS_REPO_PREFIX}${project}` : null;
  if (user == null || repo == null) {
    logDebug(
      LogDebugGroups.WS,
      `Skipped alt text request: no user or no project <${String(project)}>`,
    );
    return sendAltTextGeneratedMessage(socketId, { contentId, altText: null });
  }

  submitTask({
    descriptor: 'generateAltText',
    config: {
      socketId,
      repo,
      contentId,
      login: user.login,
      idProvider: user.idProvider,
    },
  });
}

export function generateAltText(
  socketId: string,
  repo: string,
  contentId: string,
  user: ContextUserParams,
): void {
  const altText = generateAltTextForImage(repo, contentId, user) ?? null;
  sendAltTextGeneratedMessage(socketId, { contentId, altText });
}

export function analyzeAndGenerate(socketId: string, message: GenerateMessage): void {
  try {
    const { id } = message.metadata;

    if (!activeOperations.add(id)) {
      return sendFailedErrorMessage(
        socketId,
        ERRORS.WS_OPERATION_ALREADY_RUNNING.withMsg(`Generation id: ${id}`),
      );
    }

    const [analysis, err1] = analyze(message.payload);

    if (!activeOperations.isActive(id)) {
      return;
    }

    if (err1) {
      return sendFailedErrorMessage(socketId, err1);
    }

    if (typeof analysis === 'string') {
      return sendFailedWarningMessage(socketId, analysis);
    }

    sendAnalyzedMessage(socketId, analysis);

    const [generation, err2] = generate({
      prompt: analysis.result,
      history: message.payload.history.generation,
      fields: message.payload.fields,
    });

    if (!activeOperations.isActive(id)) {
      return;
    }

    if (err2) {
      return sendFailedErrorMessage(socketId, err2);
    }

    sendGeneratedMessage(socketId, generation);

    activeOperations.remove(id);
  } catch (e) {
    sendFailedErrorMessage(socketId, ERRORS.WS_UNKNOWN_ERROR.withMsg('See server logs.'));
    logError(e);
  }
}

function stopGeneration(id: string): void {
  activeOperations.remove(id);
}
