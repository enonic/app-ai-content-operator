import {nanoid} from 'nanoid';
import {map} from 'nanostores';
import {Descendant} from 'slate';

import {SPECIAL_NAMES} from '../../lib/shared/prompts';
import {ErrorResponse, Message, ModelResponseGenerateData, SchemaField} from '../../types/shared/model';
import {isErrorResponse} from '../common/data';
import {parseNodes, parseText} from '../common/slate';
import {createPrompt, findFields} from './data';
import {ChatMessage, ModelChatMessage, ModelChatMessageContent, UserChatMessage} from './data/ChatMessage';
import {MessageType} from './data/MessageType';
import {postMessage} from './requests';

type UserChatMessageContent = UserChatMessage['content'];

export type Chat = {
    history: ChatMessage[];
};

export const $chat = map<Chat>({history: []});

export function clearChat(): void {
    $chat.setKey('history', []);
}

function addOrReplaceChatMessage(message: ChatMessage): void {
    const {history} = $chat.get();
    const lastMessage = history[history.length - 1];
    if (lastMessage?.type === message.type && message.type === MessageType.USER) {
        $chat.setKey('history', [...history.slice(0, -1), message]);
    } else {
        $chat.setKey('history', [...history, message]);
    }
}

function addUserMessage(content: UserChatMessageContent): void {
    const newMessage: UserChatMessage = {id: nanoid(), content, type: MessageType.USER};
    addOrReplaceChatMessage(newMessage);
}

function addCompleteModelMessage(content: ModelChatMessageContent): void {
    const newMessage: ModelChatMessage = {id: nanoid(), content, type: MessageType.MODEL};
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

    if (message == null || message.type !== MessageType.MODEL) {
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
    const fields = findFields(text);
    const prompt = createPrompt(text);

    addUserMessage({node, text, prompt});

    const messages = historyToMessages($chat.get().history);

    await sendMessages(messages, fields);
}

export async function sendRetryMessage(): Promise<void> {
    const lastUserMessage = $chat.get().history.findLast(message => message.type === MessageType.USER);

    const text = lastUserMessage ? lastUserMessage.content.text : 'Create text for all fields.';
    const prompt = lastUserMessage ? lastUserMessage.content.prompt : createPrompt(text);
    const fields = findFields(text);

    const messages: Message[] = [...historyToMessages($chat.get().history), {role: 'user', text: prompt}];

    await sendMessages(messages, fields);
}

async function sendMessages(messages: Message[], fields: SchemaField[]): Promise<void> {
    try {
        const response = await postMessage(messages, fields);
        handleResponse(response);
    } catch (error) {
        console.error('Error sending message', error);
    }
}

function handleResponse(response: Optional<ModelResponseGenerateData | ErrorResponse>): void {
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
            addCompleteModelMessage(
                createErrorContent('Token limit exceeded. Your prompt lead to pruned response that cannot be parsed.'),
            );
            break;
        default:
            addCompleteModelMessage(
                createErrorContent(`AI service stopped generating response. Reason <${finishReason}>`),
            );
    }
}

function checkAndHandleInvalidResponse(
    response: Optional<ModelResponseGenerateData | ErrorResponse>,
): response is Optional<ErrorResponse> {
    if (response == null) {
        addCompleteModelMessage(createErrorContent('No response from the AI service.'));
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
    return {id: nanoid(), content, type: MessageType.MODEL};
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

function historyToMessages(history: ChatMessage[]): Message[] {
    return history.map(({type, content}) => ({
        role: type,
        text: type === MessageType.USER ? content.text : modelChatMessageContentToText(content),
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
