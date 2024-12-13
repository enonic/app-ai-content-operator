import {t} from 'i18next';
import {nanoid} from 'nanoid';
import {computed, map} from 'nanostores';

import {ERRORS} from '../../shared/errors';
import {Message} from '../../shared/model';
import {AnalysisResult} from '../../shared/prompts/analysis';
import {GenerationResult} from '../../shared/prompts/generation';
import {FailedMessagePayload} from '../../shared/websocket';
import {
    ChatMessage,
    ModelChatMessage,
    SystemChatMessage,
    SystemChatMessageContent,
    UserChatMessage,
    UserChatMessageContent,
} from './data/ChatMessage';
import {MessageRole} from './data/MessageType';

export type Chat = {
    history: ChatMessage[];
};

export const $chat = map<Chat>({history: []});

export const $forIds = computed($chat, ({history}) =>
    history.filter(message => message.role === MessageRole.MODEL).map(message => message.for),
);

export function clearChat(): void {
    const firstMessage = $chat.get().history.at(0);
    if ($chat.get().history.length > 0) {
        const hasFirstSystemMessage = firstMessage?.role === MessageRole.SYSTEM;
        $chat.setKey('history', hasFirstSystemMessage ? [firstMessage] : []);
    }
}

//
//* History
//

export function createAnalysisHistory(): Message[] {
    return $chat
        .get()
        .history.filter(message => message.role !== MessageRole.SYSTEM)
        .filter(message => message.role === MessageRole.MODEL || $forIds.get().includes(message.id))
        .map((message): Message => {
            if (message.role === MessageRole.MODEL) {
                return {
                    role: 'model',
                    text: JSON.stringify(message.content.analysisResult, null, 2),
                };
            }
            return {
                role: 'user',
                text: message.content.analysisPrompt ?? '',
            };
        });
}

export function createGenerationHistory(): Message[] {
    return $chat
        .get()
        .history.filter(message => message.role !== MessageRole.SYSTEM)
        .filter(message => message.role === MessageRole.MODEL || $forIds.get().includes(message.id))
        .map((message): Message => {
            if (message.role === MessageRole.MODEL) {
                return {
                    role: 'model',
                    text: JSON.stringify(message.content.generationResult, null, 2),
                };
            }
            return {
                role: 'user',
                text: message.content.generationPrompt ?? '',
            };
        });
}

//
//* Messages
//

function findMessageById(id: string): Optional<Readonly<ChatMessage>> {
    return $chat.get().history.find(message => message.id === id);
}

function findModelMessageById(id: string): Optional<Readonly<ModelChatMessage>> {
    const message = findMessageById(id);
    return message != null && message.role === MessageRole.MODEL ? message : null;
}

export function findUserMessageById(id: string): Optional<Readonly<UserChatMessage>> {
    const message = findMessageById(id);
    return message != null && message.role === MessageRole.USER ? message : null;
}

function isChatMessageReplaceable(a: ChatMessage, b: ChatMessage): boolean {
    if (a.role === MessageRole.USER && b.role === MessageRole.USER) {
        return true;
    }
    if (a.role === MessageRole.SYSTEM && b.role === MessageRole.SYSTEM) {
        return a.id === b.id || a.content.type === b.content.type;
    }
    if (a.role === MessageRole.MODEL && b.role === MessageRole.MODEL) {
        return a.id === b.id;
    }
    return false;
}

function replaceChatMessage<T extends ChatMessage>(message: T): Optional<T> {
    const {history} = $chat.get();

    const index = history.findIndex(m => m.id === message.id);
    if (index >= 0) {
        $chat.setKey('history', [...history.slice(0, index), message, ...history.slice(index + 1)]);
        return message;
    }
}

function addChatMessage<T extends ChatMessage>(message: T): T {
    $chat.setKey('history', [...$chat.get().history, message]);
    return message;
}

function addOrReplaceChatMessage<T extends ChatMessage>(message: T): T {
    const {history} = $chat.get();
    const lastMessage = history.at(-1);
    const isLastMessageToBeReplaced = lastMessage && isChatMessageReplaceable(lastMessage, message);
    const newHistory = isLastMessageToBeReplaced ? [...history.slice(0, -1), message] : [...history, message];

    $chat.setKey('history', newHistory);

    return message;
}

export function addUserMessage(content: UserChatMessageContent): Readonly<UserChatMessage> {
    return addOrReplaceChatMessage({id: nanoid(), content, role: MessageRole.USER} satisfies UserChatMessage);
}

export function updateUserMessage(
    id: string,
    content: Omit<UserChatMessageContent, 'node' | 'prompt'>,
): Optional<Readonly<UserChatMessage>> {
    const message = findUserMessageById(id);
    if (message == null) {
        return null;
    }

    return replaceChatMessage({
        id: message.id,
        content: {...message.content, ...content},
        role: MessageRole.USER,
    } satisfies UserChatMessage);
}

export function addSystemMessage(content: SystemChatMessageContent): Readonly<SystemChatMessage> {
    return addOrReplaceChatMessage(toSystemMessage(content));
}

function toSystemMessage(content: SystemChatMessageContent): SystemChatMessage {
    return {id: content.key, content, role: MessageRole.SYSTEM} satisfies SystemChatMessage;
}

export function addModelMessage(analysisResult: AnalysisResult, forId: string): Optional<Readonly<ModelChatMessage>> {
    return addOrReplaceChatMessage({
        id: nanoid(),
        for: forId,
        content: {analysisResult, selectedIndices: {}},
        role: MessageRole.MODEL,
    } satisfies ModelChatMessage);
}

export function updateModelMessage(
    id: string,
    generationResult: GenerationResult,
): Optional<Readonly<ModelChatMessage>> {
    const message = findModelMessageById(id);
    if (message == null || message.content.generationResult != null) {
        return null;
    }

    return replaceChatMessage({
        id: message.id,
        for: message.for,
        content: {...message.content, generationResult: generationResult ?? message.content.generationResult},
        role: MessageRole.MODEL,
    } satisfies ModelChatMessage);
}

//
//* Switching indices
//

export function changeModelMessageSelectedIndex(id: string, key: string, index: number): void {
    const {history} = $chat.get();
    const messageIndex = history.findIndex(message => message.id === id);
    const message = history[messageIndex];

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

    const newMessage: ModelChatMessage = {
        id: message.id,
        for: message.for,
        content: {...message.content, selectedIndices},
        role: MessageRole.MODEL,
    };

    $chat.setKey('history', [...history.slice(0, messageIndex), newMessage, ...history.slice(messageIndex + 1)]);
}

//
//* Errors
//

export function addErrorMessage(payload: FailedMessagePayload | string, messageToReplaceId?: string): void {
    const errorMessageText = getErrorMessageText(payload);
    const messageToReplace = messageToReplaceId ? findMessageById(messageToReplaceId) : null;
    const content = {key: messageToReplace ? messageToReplace.id : nanoid(), type: 'error', node: errorMessageText};
    const systemMessage = toSystemMessage(content as SystemChatMessageContent);

    if (messageToReplace) {
        replaceChatMessage(systemMessage);
    } else {
        addChatMessage(systemMessage);
    }
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
