import {t} from 'i18next';
import {nanoid} from 'nanoid';
import {atom, computed, map} from 'nanostores';

import {ERRORS} from '../../shared/errors';
import {FailedMessagePayload} from '../../shared/messages';
import {ModelMessage} from '../../shared/model';
import {AnalysisResult} from '../../shared/prompts/analysis';
import {GenerationResult} from '../../shared/prompts/generation';
import {flattenGraph, getNextActiveNode, pruneGraph} from '../common/graph';
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

const $startId = atom<Optional<string>>(undefined);

export const $messages = map<Record<string, ChatMessage>>({});

export const $history = computed([$startId, $messages], (startId, messages): ChatMessage[] => {
    return startId != null ? flattenGraph(messages, startId) : [];
});

const $lastMessage = computed($history, (history): Optional<ChatMessage> => history.at(-1));

export function clearChat(): void {
    const startId = $startId.get();
    const messages = $messages.get();

    const firstMessage = startId ? messages[startId] : null;
    if (startId != null && firstMessage?.role === MessageRole.SYSTEM) {
        $messages.set({[startId]: {...firstMessage, nextIds: []} satisfies SystemChatMessage});
    } else {
        $messages.set({});
        $startId.set(undefined);
    }
}

//
//* History
//

export function createAnalysisHistory(): ModelMessage[] {
    const history = $history.get();
    const result: ModelMessage[] = [];
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

export function createGenerationHistory(): ModelMessage[] {
    const history = $history.get();
    const result: ModelMessage[] = [];
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

function createModelMessage(result: AnalysisResult | GenerationResult): ModelMessage {
    return {
        role: 'model',
        text: JSON.stringify(result, null, 2),
    };
}

function createUserMessage(prompt: string | undefined): ModelMessage {
    return {
        role: 'user',
        text: prompt ?? '',
    };
}

//
//* Message: GET & FIND
//

function getMessageById(id: Optional<string>): Optional<Readonly<ChatMessage>> {
    return id ? $messages.get()[id] : undefined;
}

function hasMessageById(id: string): boolean {
    return getMessageById(id) != null;
}

function getModelMessageById(id: string): Optional<Readonly<ModelChatMessage>> {
    const message = getMessageById(id);
    return message != null && message.role === MessageRole.MODEL ? message : undefined;
}

export function getUserMessageById(id: string): Optional<Readonly<UserChatMessage>> {
    const message = getMessageById(id);
    return message != null && message.role === MessageRole.USER ? message : undefined;
}

//
//* Message: ADD
//

function addChatMessage<T extends ChatMessage>(message: T): Optional<T> {
    if (hasMessageById(message.id)) {
        return null;
    }

    const prevMessage = getMessageById(message.prevId);
    const lastMessage = $lastMessage.get();
    const forMessage = prevMessage ?? lastMessage;

    if (forMessage == null) {
        $startId.set(message.id);
    } else {
        updateChatMessage({
            ...forMessage,
            nextIds: [...forMessage.nextIds, message.id],
        } satisfies ChatMessage);
    }

    const currentActiveMessage = message.active && forMessage && getNextActiveNode($messages.get(), forMessage.id);
    if (currentActiveMessage) {
        $messages.setKey(currentActiveMessage.id, {...currentActiveMessage, active: false});
    }

    const newMessage: T = {...message, prevId: forMessage?.id};
    $messages.setKey(message.id, newMessage);

    return newMessage;
}

export function addUserMessage(content: UserChatMessageContent): Readonly<Optional<UserChatMessage>> {
    return addChatMessage({
        id: nanoid(),
        content,
        role: MessageRole.USER,
        nextIds: [],
        active: true,
    } satisfies UserChatMessage);
}

export function addModelMessage(analysisResult: AnalysisResult, forId?: string): Readonly<Optional<ModelChatMessage>> {
    return addChatMessage({
        id: nanoid(),
        role: MessageRole.MODEL,
        content: {analysisResult, selectedIndices: {}},
        nextIds: [],
        active: true,
        prevId: forId,
    } satisfies ModelChatMessage);
}

export function addSystemMessage(content: SystemChatMessageContent): Readonly<Optional<SystemChatMessage>> {
    return addChatMessage(toSystemMessage(content));
}

function toSystemMessage(content: SystemChatMessageContent): SystemChatMessage {
    return {id: content.key, content, role: MessageRole.SYSTEM, nextIds: [], active: true} satisfies SystemChatMessage;
}

//
//* Message: UPDATE
//

function updateChatMessage<T extends ChatMessage>(message: T): Optional<T> {
    if (!hasMessageById(message.id)) {
        return null;
    }

    $messages.setKey(message.id, message);

    return message;
}

export function updateUserMessage(
    id: string,
    content: Omit<UserChatMessageContent, 'node' | 'prompt'>,
): Optional<Readonly<UserChatMessage>> {
    const message = getUserMessageById(id);
    if (message == null) {
        return null;
    }

    return updateChatMessage({
        ...message,
        content: {...message.content, ...content},
    } satisfies UserChatMessage);
}

export function updateModelMessage(
    id: string,
    generationResult: GenerationResult,
): Optional<Readonly<ModelChatMessage>> {
    const message = getModelMessageById(id);
    if (message == null || message.content.generationResult != null) {
        return null;
    }

    return updateChatMessage({
        ...message,
        content: {...message.content, generationResult: generationResult ?? message.content.generationResult},
    } satisfies ModelChatMessage);
}

export function markMessageAsActive(id: Optional<string>): void {
    const message = getMessageById(id);
    if (message?.prevId == null || message.active) {
        return;
    }

    const prevMessage = getMessageById(message.prevId);
    if (prevMessage == null) {
        return;
    }

    const activeSibling = getNextActiveNode($messages.get(), prevMessage.id);
    if (activeSibling) {
        updateChatMessage({...activeSibling, active: false});
    }

    updateChatMessage({...message, active: true});
}

export function markAllNextMessagesInactive(id: string): void {
    const message = getMessageById(id);
    if (message == null) {
        return;
    }

    message.nextIds.forEach(nextId => {
        const nextMessage = getMessageById(nextId);
        if (nextMessage?.active) {
            updateChatMessage({...nextMessage, active: false});
        }
    });
}

//
//* Message: REMOVE
//

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
    const message = getModelMessageById(id);

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
        ...message,
        content: {...message.content, selectedIndices},
    } satisfies ModelChatMessage);
}

//
//* Errors
//

function replaceWithSystemMessage(message: string, type: SystemMessageType, messageToReplaceId?: string): void {
    const messageToReplace = getMessageById(messageToReplaceId);
    const content: SystemChatMessageContent = {
        key: messageToReplace ? messageToReplace.id : (messageToReplaceId ?? nanoid()),
        type,
        node: message,
    };
    const systemMessage = toSystemMessage(content);

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
        case ERRORS.MODEL_PROHIBITED_CONTENT.code:
            return t('text.error.response.prohibitedContent');
        case ERRORS.MODEL_SPII.code:
            return t('text.error.response.spii');
        case ERRORS.MODEL_UNEXPECTED.code:
            return t('text.error.response.unexpected');
        case ERRORS.MODEL_ANALYSIS_PARSE_FAILED.code:
        case ERRORS.MODEL_ANALYSIS_WRONG_TYPE.code:
            return t('text.error.analysis.wrongType');
        case ERRORS.MODEL_ANALYSIS_EMPTY.code:
            return t('text.error.analysis.empty');
        case ERRORS.MODEL_GENERATION_PARSE_FAILED.code:
        case ERRORS.MODEL_GENERATION_WRONG_TYPE.code:
            return t('text.error.generation.wrongType');
        case ERRORS.MODEL_GENERATION_INCORRECT.code:
            return t('text.error.generation.incorrect');
        case ERRORS.MODEL_GENERATION_EMPTY.code:
            return t('text.error.generation.empty');
        default:
            return t('text.error.rest.unknown', {code});
    }
}

export function isRecord(record: unknown): record is AnyObject {
    return record != null && typeof record === 'object' && !Array.isArray(record);
}
