import {t} from 'i18next';
import {nanoid} from 'nanoid';
import {computed, map} from 'nanostores';
import {Descendant} from 'slate';

import {ERRORS} from '../../shared/errors';
import type {ErrorResponse, Message, ModelPostResponse, ModelRequestData, ModelResult} from '../../shared/model';
import {parseNodes, parseText} from '../common/slate';
import {$config} from './config';
import {$contentPath, $language, createFields} from './data';
import {
    ChatMessage,
    ModelChatMessage,
    ModelChatMessageContent,
    SystemChatMessage,
    SystemChatMessageContent,
    UserChatMessage,
} from './data/ChatMessage';
import {MessageRole} from './data/MessageType';
import {postMessage} from './requests';

type UserChatMessageContent = UserChatMessage['content'];

export type Chat = {
    history: ChatMessage[];
};

export const $chat = map<Chat>({history: []});

export const $forIds = computed($chat, ({history}) =>
    history.filter(message => message.role === MessageRole.MODEL).map(message => message.forId),
);

export function clearChat(): void {
    const firstMessage = $chat.get().history.at(0);
    if ($chat.get().history.length > 0) {
        const hasFirstSystemMessage = firstMessage?.role === MessageRole.SYSTEM;
        $chat.setKey('history', hasFirstSystemMessage ? [firstMessage] : []);
    }
}

//
//* Data & History
//

function createModelRequestData(prompt: string): ModelRequestData {
    return {
        prompt,
        instructions: $config.get().instructions,
        history: createHistory(),
        meta: {
            language: $language.get(),
            contentPath: $contentPath.get(),
        },
        fields: createFields(),
    };
}

function createHistory(): Message[] {
    const forIds = $forIds.get();
    return $chat
        .get()
        .history.filter(message => message.role !== MessageRole.SYSTEM)
        .filter(message => message.role === MessageRole.MODEL || forIds.includes(message.id))
        .map((message): Message => {
            if (message.role === MessageRole.MODEL) {
                return {
                    role: 'model',
                    text: JSON.stringify(mapModelMessageContentToResult(message.content), null, 2),
                };
            }
            return {
                role: 'user',
                text: message.content.prompt ?? message.content.data.prompt,
            };
        });
}

//
//* Messages
//

function findUserMessageById(id: string): Optional<Readonly<UserChatMessage>> {
    const message = $chat.get().history.find(message => message.id === id);
    return message != null && message.role === MessageRole.USER ? message : null;
}

function isChatMessageReplaceable(a: ChatMessage, b: ChatMessage): boolean {
    if (a.role === MessageRole.USER && b.role === MessageRole.USER) {
        return true;
    }
    if (a.role === MessageRole.SYSTEM && b.role === MessageRole.SYSTEM) {
        return a.id === b.id || a.content.type === b.content.type;
    }
    return a.id === b.id;
}

function addOrReplaceLastChatMessage<T extends ChatMessage>(message: T): Readonly<T> {
    const {history} = $chat.get();
    const lastMessage = history.at(-1);

    if (lastMessage && isChatMessageReplaceable(lastMessage, message)) {
        $chat.setKey('history', [...history.slice(0, -1), message]);
    } else {
        $chat.setKey('history', [...history, message]);
    }

    return message;
}

function replaceChatMessage<T extends ChatMessage>(message: T): Optional<Readonly<T>> {
    const {history} = $chat.get();

    const index = history.findIndex(m => m.id === message.id && m.role === message.role);
    if (index >= 0) {
        $chat.setKey('history', [...history.slice(0, index), message, ...history.slice(index + 1)]);
        return message;
    }
}

function addUserMessage(content: UserChatMessageContent): Readonly<UserChatMessage> {
    const newMessage: UserChatMessage = {id: nanoid(), content, role: MessageRole.USER};
    return addOrReplaceLastChatMessage(newMessage);
}

export function addSystemMessage(content: SystemChatMessageContent): Readonly<SystemChatMessage> {
    const newMessage: SystemChatMessage = {id: content.key, content, role: MessageRole.SYSTEM};
    return addOrReplaceLastChatMessage(newMessage);
}

function addModelMessage(content: ModelChatMessageContent, forId: string): Readonly<ModelChatMessage> {
    const newMessage: ModelChatMessage = {id: nanoid(), content, role: MessageRole.MODEL, forId};
    return addOrReplaceLastChatMessage(newMessage);
}

export function updateUserMessage(id: string, prompt: string): Optional<Readonly<UserChatMessage>> {
    const message = findUserMessageById(id);
    if (message == null) {
        return null;
    }

    return replaceChatMessage({
        id: message.id,
        content: {...message.content, prompt},
        role: MessageRole.USER,
    } satisfies UserChatMessage);
}

//
//* Indexing
//

export function changeModelMessageSelectedIndex(id: string, key: string, index: number): void {
    const {history} = $chat.get();
    const messageIndex = history.findIndex(message => message.id === id);
    const message = structuredClone(history[messageIndex]);

    if (message == null || message.role !== MessageRole.MODEL) {
        return;
    }

    const value = message.content[key];
    if (value == null || typeof value === 'string' || !('selectedIndex' in value)) {
        return;
    }

    if (index < 0 || index >= value.values.length || index === value.selectedIndex) {
        return;
    }

    value.selectedIndex = index;

    $chat.setKey('history', [...history.slice(0, messageIndex), message, ...history.slice(messageIndex + 1)]);
}

//
//* Flow
//

export async function sendUserMessage(nodes: Descendant[]): Promise<void> {
    const node = parseNodes(nodes);
    const text = parseText(nodes);
    const data = createModelRequestData(text);

    const userMessage = addUserMessage({node, data});

    await sendData(userMessage);
}

export async function sendRetryMessage(userMessageId: string): Promise<void> {
    const userMessage = findUserMessageById(userMessageId);
    if (userMessage == null) {
        addSystemMessage({key: nanoid(), type: 'error', node: t('text.error.message.repeat.notFound')});
        return;
    }

    const {node, prompt} = userMessage.content;
    const data = structuredClone(userMessage.content.data);
    addUserMessage({node, data, prompt});

    await sendData(userMessage);
}

async function sendData(userMessage: Readonly<UserChatMessage>): Promise<void> {
    const {id, content} = userMessage;

    const response = await postMessage(content.data);

    if (isErrorResponse(response)) {
        addErrorMessage(response.error);
        return;
    }

    const {request, result} = response;

    const updatedUserMessage = updateUserMessage(id, request);
    if (updatedUserMessage == null) {
        addSystemMessage({key: nanoid(), type: 'error', node: t('text.error.message.update.notFound')});
        return;
    }

    addModelMessage(mapToModelMessageContent(result), userMessage.id);
}

//
//* Errors
//

function isErrorResponse(response: ModelPostResponse): response is ErrorResponse {
    return 'error' in response;
}

export function addErrorMessage(error: AiError): void {
    console.error(`Error <${error.code}>: ${error.message}`);

    const message = getErrorMessageByCode(error.code);
    addSystemMessage({key: nanoid(), type: 'error', node: message});
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
        case ERRORS.MODEL_RESPONSE_PARSE_FAILED.code:
        case ERRORS.MODEL_RESPONSE_INCORRECT.code:
            return t('text.error.response.parse');
        default:
            return t('text.error.rest.unknown', {code});
    }
}

//
//* Data
//

export function isRecord(record: unknown): record is AnyObject {
    return record != null && typeof record === 'object' && !Array.isArray(record);
}

function mapToModelMessageContent(content: ModelResult): ModelChatMessageContent {
    return Object.entries(content).reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
            if (value.length > 1) {
                return {...acc, [key]: {values: value, selectedIndex: 0}};
            } else {
                return {...acc, [key]: String(value[0] ?? '')};
            }
        }

        return {...acc, [key]: String(value)};
    }, {});
}

function mapModelMessageContentToResult(content: ModelChatMessageContent): ModelResult {
    const result: ModelResult = {};
    Object.entries(content).forEach(([key, value]) => {
        result[key] = typeof value === 'string' ? value : value.values;
    });
    return result;
}
