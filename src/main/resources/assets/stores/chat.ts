import {t} from 'i18next';
import {nanoid} from 'nanoid';
import {atom, computed, map} from 'nanostores';

import {ERRORS} from '../../shared/errors';
import {Message} from '../../shared/model';
import {AnalysisResult} from '../../shared/prompts/analysis';
import {GenerationResult} from '../../shared/prompts/generation';
import {FailedMessagePayload} from '../../shared/websocket';
import {flattenGraph, pruneGraph} from '../common/graph';
import {
    ChatMessage,
    ModelChatMessage,
    SystemChatMessage,
    SystemChatMessageContent,
    SystemMessageType,
    UserChatMessage,
    UserChatMessageContent,
} from './data/ChatMessage';
import {MessageRole} from './data/MessageType';

//
//* Graph
//

const $startId = atom<Optional<string>>(undefined);

const $messages = map<Record<string, ChatMessage>>({});

export const $history = computed([$startId, $messages], (startId, messages): ChatMessage[] => {
    return startId != null ? flattenGraph(messages, startId) : [];
});

const $lastMessage = computed($history, (history): Optional<ChatMessage> => history.at(-1));

export function clearChat(): void {
    const startId = $startId.get();
    const messages = $messages.get();
    const firstMessage = startId ? messages[startId] : null;
    if (startId != null && firstMessage?.role === MessageRole.SYSTEM) {
        $messages.set({[startId]: firstMessage});
    } else {
        $messages.set({});
        $startId.set(undefined);
    }
}

//
//* History
//

export function createAnalysisHistory(): Message[] {
    const history = $history.get();
    const result: Message[] = [];
    let currentUserMessage: Optional<UserChatMessage> = null;

    for (const message of history) {
        if (message.role === MessageRole.USER) {
            currentUserMessage = message;
        } else if (message.role === MessageRole.MODEL) {
            const {analysisPrompt} = currentUserMessage?.content ?? {};
            const {analysisResult} = message.content;
            if (analysisPrompt && analysisResult) {
                result.push(createUserMessage(analysisPrompt));
                result.push(createModelMessage(analysisResult));
                currentUserMessage = null;
            }
            currentUserMessage = null;
        }
    }

    return result;
}

export function createGenerationHistory(): Message[] {
    const history = $history.get();
    const result: Message[] = [];
    let currentUserMessage: Optional<UserChatMessage> = null;

    for (const message of history) {
        if (message.role === MessageRole.USER) {
            currentUserMessage = message;
        } else if (message.role === MessageRole.MODEL) {
            const {generationPrompt} = currentUserMessage?.content ?? {};
            const {generationResult} = message.content;
            if (generationPrompt && generationResult) {
                result.push(createUserMessage(generationPrompt));
                result.push(createModelMessage(generationResult));
                currentUserMessage = null;
            }
            currentUserMessage = null;
        }
    }

    return result;
}

function createModelMessage(result: AnalysisResult | GenerationResult): Message {
    return {
        role: 'model',
        text: JSON.stringify(result, null, 2),
    };
}

function createUserMessage(prompt: string | undefined): Message {
    return {
        role: 'user',
        text: prompt ?? '',
    };
}

//
//* Messages
//

function findMessageById(id: string): Optional<Readonly<ChatMessage>> {
    return $messages.get()[id] ?? undefined;
}

function hasMessageById(id: string): boolean {
    return findMessageById(id) != null;
}

function findModelMessageById(id: string): Optional<Readonly<ModelChatMessage>> {
    const message = findMessageById(id);
    return message != null && message.role === MessageRole.MODEL ? message : undefined;
}

export function findUserMessageById(id: string): Optional<Readonly<UserChatMessage>> {
    const message = findMessageById(id);
    return message != null && message.role === MessageRole.USER ? message : undefined;
}

function updateChatMessage<T extends ChatMessage>(message: T): Optional<T> {
    if (!hasMessageById(message.id)) {
        return null;
    }

    $messages.setKey(message.id, message);

    return message;
}

function addChatMessage<T extends ChatMessage>(message: T): Optional<T> {
    if (hasMessageById(message.id)) {
        return null;
    }

    $messages.setKey(message.id, message);

    const lastMessage = $lastMessage.get();
    if (lastMessage == null) {
        $startId.set(message.id);
    } else {
        const newLastMessage = {...lastMessage, nextId: message.id};
        $messages.setKey(newLastMessage.id, newLastMessage);
    }

    return message;
}

function addForChatMessage<T extends ChatMessage>(message: T, forId: string): Optional<T> {
    if (hasMessageById(message.id)) {
        return null;
    }

    const forMessage = findMessageById(forId);
    if (forMessage == null) {
        return null;
    }

    $messages.setKey(message.id, message);

    const newForMessage = {...forMessage, nextId: message.id};
    $messages.setKey(newForMessage.id, newForMessage);

    return message;
}

export function addUserMessage(content: UserChatMessageContent): Readonly<Optional<UserChatMessage>> {
    return addChatMessage({id: nanoid(), content, role: MessageRole.USER, nextIds: []} satisfies UserChatMessage);
}

export function updateUserMessage(
    id: string,
    content: Omit<UserChatMessageContent, 'node' | 'prompt'>,
): Optional<Readonly<UserChatMessage>> {
    const message = findUserMessageById(id);
    if (message == null) {
        return null;
    }

    return updateChatMessage({
        id: message.id,
        content: {...message.content, ...content},
        role: MessageRole.USER,
        nextId: message.nextId,
        nextIds: message.nextIds,
    } satisfies UserChatMessage);
}

export function addSystemMessage(content: SystemChatMessageContent): Readonly<Optional<SystemChatMessage>> {
    return addChatMessage(toSystemMessage(content));
}

function toSystemMessage(content: SystemChatMessageContent): SystemChatMessage {
    return {id: content.key, content, role: MessageRole.SYSTEM} satisfies SystemChatMessage;
}

export function addModelMessage(analysisResult: AnalysisResult, forId: string): Readonly<Optional<ModelChatMessage>> {
    return addForChatMessage(
        {
            id: nanoid(),
            role: MessageRole.MODEL,
            content: {analysisResult, selectedIndices: {}},
        } satisfies ModelChatMessage,
        forId,
    );
}

export function updateModelMessage(
    id: string,
    generationResult: GenerationResult,
): Optional<Readonly<ModelChatMessage>> {
    const message = findModelMessageById(id);
    if (message == null || message.content.generationResult != null) {
        return null;
    }

    return updateChatMessage({
        id: message.id,
        role: MessageRole.MODEL,
        content: {...message.content, generationResult: generationResult ?? message.content.generationResult},
        nextId: message.nextId,
    } satisfies ModelChatMessage);
}

export function removeChatMessage(id: string): void {
    const startId = $startId.get();
    if (!hasMessageById(id) || startId == null) {
        return;
    }

    const newMessages = pruneGraph($messages.get(), startId, [id]);

    $messages.set(newMessages);
}

//
//* Switching indices
//

export function changeModelMessageSelectedIndex(id: string, key: string, index: number): void {
    const message = findModelMessageById(id);

    if (message == null || message.role !== MessageRole.MODEL) {
        return;
    }

    const {generationResult, selectedIndices} = message.content;

    if (generationResult == null || !(key in generationResult)) {
        return;
    }

    const value = generationResult[key];
    if (value == null || !Array.isArray(value)) {
        return;
    }

    if (index < 0 || index >= value.length || index === selectedIndices[key]) {
        return;
    }

    selectedIndices[key] = index;

    updateChatMessage({
        id: message.id,
        content: {...message.content, selectedIndices},
        role: MessageRole.MODEL,
        nextId: message.nextId,
    } satisfies ModelChatMessage);
}

//
//* Errors
//

function replaceWithSystemMessage(message: string, type: SystemMessageType, messageToReplaceId?: string): void {
    const messageToReplace = messageToReplaceId ? findMessageById(messageToReplaceId) : null;
    const content = {key: messageToReplace ? messageToReplace.id : nanoid(), type, node: message};
    const systemMessage = toSystemMessage(content as SystemChatMessageContent);

    if (messageToReplace) {
        updateChatMessage(systemMessage);
    } else {
        addChatMessage(systemMessage);
    }
}

export function addErrorMessage(payload: FailedMessagePayload | string, messageToReplaceId?: string): void {
    const errorMessageText = getErrorMessageText(payload);
    replaceWithSystemMessage(errorMessageText, 'error', messageToReplaceId);
}

export function addStoppedMessage(role: Exclude<MessageRole, 'model'>, messageToReplaceId?: string): void {
    const message = role === MessageRole.USER ? t('text.system.stopped.user') : t('text.system.stopped.system');
    replaceWithSystemMessage(message, 'stop', messageToReplaceId);
}

function getErrorMessageText(payload: FailedMessagePayload | string): string {
    if (typeof payload === 'string') {
        return payload;
    }

    return payload.type === 'error' ? getErrorMessageByCode(payload.code) : payload.message;
}

function getErrorMessageByCode(code: number): string {
    switch (code) {
        case ERRORS.GOOGLE_SAK_MISSING.code:
        case ERRORS.GOOGLE_SAK_READ_FAILED.code:
        case ERRORS.GOOGLE_ACCESS_TOKEN_MISSING.code:
        case ERRORS.GOOGLE_PROJECT_ID_MISSING.code:
        case ERRORS.GOOGLE_GEMINI_URL_MISSING.code:
        case ERRORS.GOOGLE_GEMINI_URL_INVALID.code:
        case ERRORS.GOOGLE_PROJECT_ID_MISMATCH.code:
        case ERRORS.GOOGLE_MODEL_NOT_SUPPORTED.code:
            return t('text.error.configuration');
        case ERRORS.REST_TIMEOUT.code:
            return t('text.error.rest.timeout');
        case ERRORS.REST_WRONG_CONTENT_TYPE.code:
            return t('text.error.rest.wrongContentType');
        case ERRORS.GOOGLE_BLOCKED.code:
            return t('text.error.response.safety');
        case ERRORS.GOOGLE_BAD_REQUEST.code:
            return t('text.error.google.badRequest');
        case ERRORS.GOOGLE_UNAUTHORIZED.code:
            return t('text.error.google.unauthorized');
        case ERRORS.GOOGLE_FORBIDDEN.code:
            return t('text.error.google.forbidden');
        case ERRORS.GOOGLE_NOT_FOUND.code:
            return t('text.error.google.notFound');
        case ERRORS.GOOGLE_REQUEST_TIMEOUT.code:
            return t('text.error.google.requestTimeout');
        case ERRORS.GOOGLE_TOO_MANY_REQUESTS.code:
            return t('text.error.google.tooManyRequests');
        case ERRORS.GOOGLE_SERVER_ERROR.code:
            return t('text.error.google.serverError');
        case ERRORS.GOOGLE_SERVICE_UNAVAILABLE.code:
            return t('text.error.google.serviceUnavailable');
        case ERRORS.MODEL_MAX_TOKENS.code:
            return t('text.error.response.maxTokens');
        case ERRORS.MODEL_SAFETY.code:
            return t('text.error.response.safety');
        case ERRORS.MODEL_UNEXPECTED.code:
            return t('text.error.response.unexpected');
        default:
            return t('text.error.rest.unknown', {code});
    }
}

export function isRecord(record: unknown): record is AnyObject {
    return record != null && typeof record === 'object' && !Array.isArray(record);
}
