import {t} from 'i18next';
import {nanoid} from 'nanoid';
import {computed, map} from 'nanostores';
import {Descendant} from 'slate';

import {SPECIAL_NAMES} from '../../lib/shared/prompts';
import {ErrorResponse, Message, ModelResponseGenerateData} from '../../types/shared/model';
import {isErrorResponse} from '../common/data';
import {parseNodes, parseText} from '../common/slate';
import {createPrompt} from './data';
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

export type ChatState = 'empty' | 'new' | 'ongoing';

export const $chat = map<Chat>({history: []});

export const $chatState = computed($chat, (chat): ChatState => {
    if (chat.history.length === 0) {
        return 'empty';
    }
    const hasSystemMessagesOnly = chat.history.every(message => message.role === MessageRole.SYSTEM);
    return hasSystemMessagesOnly ? 'new' : 'ongoing';
});

export function clearChat(): void {
    if ($chat.get().history.length > 0) {
        $chat.setKey('history', []);
    }
}

function isChatMessageReplaceable(a: ChatMessage, b: ChatMessage): boolean {
    if (a.role === MessageRole.USER && b.role === MessageRole.USER) {
        return true;
    }
    if (a.role === MessageRole.SYSTEM && b.role === MessageRole.SYSTEM) {
        return a.id === b.id || a.content.type === b.content.type;
    }
    return false;
}

function addOrReplaceChatMessage(message: ChatMessage): void {
    const {history} = $chat.get();
    const lastMessage = history.at(-1);

    if (lastMessage && isChatMessageReplaceable(lastMessage, message)) {
        $chat.setKey('history', [...history.slice(0, -1), message]);
    } else {
        $chat.setKey('history', [...history, message]);
    }
}

function addUserMessage(content: UserChatMessageContent): void {
    const newMessage: UserChatMessage = {id: nanoid(), content, role: MessageRole.USER};
    addOrReplaceChatMessage(newMessage);
}

export function addSystemMessage(content: SystemChatMessageContent): void {
    const newMessage: SystemChatMessage = {id: nanoid(), content, role: MessageRole.SYSTEM};
    addOrReplaceChatMessage(newMessage);
}

function addCompleteModelMessage(content: ModelChatMessageContent): void {
    const newMessage: ModelChatMessage = {id: nanoid(), content, role: MessageRole.MODEL};
    addOrReplaceChatMessage(newMessage);
}

function addModelMessage(text: string): void {
    const newMessage = createModelMessage(text);
    addOrReplaceChatMessage(newMessage);
}

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

export async function sendUserMessage(nodes: Descendant[]): Promise<void> {
    const node = parseNodes(nodes);
    const text = parseText(nodes);
    const prompt = createPrompt(text);

    addUserMessage({node, text, prompt});

    const messages = historyToMessages($chat.get().history);

    await sendMessages(messages);
}

export async function sendRetryMessage(): Promise<void> {
    const lastUserMessage = $chat.get().history.findLast(message => message.role === MessageRole.USER);

    const text = lastUserMessage ? lastUserMessage.content.text : 'Create text for all fields.';
    const prompt = lastUserMessage ? lastUserMessage.content.prompt : createPrompt(text);

    const messages: Message[] = [...historyToMessages($chat.get().history), {role: 'user', text: prompt}];

    await sendMessages(messages);
}

async function sendMessages(messages: Message[]): Promise<void> {
    const response = await postMessage(messages);
    handleResponse(response);
}

function handleResponse([response, error]: Err<ModelResponseGenerateData | ErrorResponse>): void {
    if (error) {
        addCompleteModelMessage(createErrorContent(error.message));
        return;
    }

    if (checkAndHandleInvalidResponse(response)) {
        return;
    }

    const {content, finishReason} = response;

    switch (finishReason) {
        case undefined:
        case 'STOP':
            addModelMessage(content);
            break;
        case 'MAX_TOKENS':
            addCompleteModelMessage(createErrorContent(t('text.error.response.maxTokens')));
            break;
        case 'SAFETY':
            addCompleteModelMessage(createErrorContent(t('text.error.response.safety')));
            break;
        default:
            addCompleteModelMessage(createErrorContent(t('text.error.response.finishReason', {finishReason})));
    }
}

function checkAndHandleInvalidResponse(
    response: Optional<ModelResponseGenerateData | ErrorResponse>,
): response is Optional<ErrorResponse> {
    if (response == null) {
        addCompleteModelMessage(createErrorContent(t('text.error.response.noResponse')));
        return true;
    }
    if (isErrorResponse(response)) {
        addCompleteModelMessage(createErrorContent(response.error.message));
        return true;
    }

    return false;
}

function createErrorContent(message: string): ModelChatMessageContent {
    return {'Oops! Something went wrong': message};
}

function createModelMessage(text: string): ModelChatMessage {
    const content = parseModelMessageText(text);
    return {id: nanoid(), content, role: MessageRole.MODEL};
}

function parseModelMessageText(text: string): ModelChatMessageContent {
    try {
        const content: unknown = JSON.parse(text);
        if (!isRecord(content)) {
            throw new Error('AI response is not in a valid object format.');
        }
        return mapToModelMessageContent(content);
    } catch (error) {
        console.error('Error parsing chat message', error);
        return {[`${SPECIAL_NAMES.unclear}`]: text};
    }
}

export function isRecord(record: unknown): record is AnyObject {
    return record != null && typeof record === 'object' && !Array.isArray(record);
}

function mapToModelMessageContent(content: Record<string, unknown>): ModelChatMessageContent {
    return Object.entries(content).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
            return {...acc, [key]: value};
        }

        if (Array.isArray(value)) {
            if (value.length > 1) {
                return {...acc, [key]: {values: value, selectedIndex: 0}};
            } else {
                return {...acc, [key]: String(value[0] ?? '')};
            }
        }

        if (isRecord(value) && 'value' in value && typeof value.value === 'string') {
            return {...acc, [key]: value.value};
        }

        return {...acc, [key]: String(value)};
    }, {});
}

const isUserOrModel = (message: ChatMessage): message is UserChatMessage | ModelChatMessage => {
    return message.role !== MessageRole.SYSTEM;
};

function historyToMessages(history: ChatMessage[]): Message[] {
    return history.filter(isUserOrModel).map(({role, content}) => ({
        role,
        text: role === MessageRole.USER ? content.prompt : modelChatMessageContentToText(content),
    }));
}

function modelChatMessageContentToText(content: ModelChatMessageContent): string {
    const obj: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(content)) {
        if (typeof value === 'string') {
            obj[key] = value;
        } else if (value != null && 'values' in value) {
            obj[key] = value.values;
        }
    }
    return JSON.stringify(obj, null, 2);
}
