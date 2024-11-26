import {computed, map} from 'nanostores';

import {isNonNullable} from '../common/data';
import {addGlobalUpdateDataHandler, AiEvents, dispatch} from '../common/events';
import {findMentionsNames, MENTION_ALL, MENTION_TOPIC} from '../common/mentions';
import {$context} from './context';
import {ApplyMessage} from './data/ApplyMessage';
import {ContentData, PropertyValue} from './data/ContentData';
import {DataEntry} from './data/DataEntry';
import {UpdateEventData} from './data/EventData';
import {InputWithPath} from './data/FormItemWithPath';
import {Language} from './data/Language';
import {Path} from './data/Path';
import {Schema} from './data/Schema';
import {getDataPathsToEditableItems, getPropertyArrayByPath, pathToMention} from './utils/data';
import {getInputType} from './utils/input';
import {isChildPath, isRootPath, pathFromString, pathsEqual, pathToString} from './utils/path';
import {getFormItemsWithPaths, isEditableInput, isInputWithPath, isOrContainsEditableInput} from './utils/schema';

export type Data = {
    language: Language;
    persisted: Optional<ContentData>;
    schema: Optional<Schema>;
};

export const $data = map<Data>({
    language: {
        tag: navigator?.language ?? 'en',
        name: 'English',
    },
    persisted: null,
    schema: null,
});

addGlobalUpdateDataHandler(event => {
    putEventDataToStore(event.detail);
});

export const setLanguage = (language: Language): void => $data.setKey('language', language);

export const getPersistedData = (): Optional<Readonly<ContentData>> => $data.get().persisted;

export const setPersistedData = (data: ContentData): void => $data.setKey('persisted', data);

export const setSchema = (schema: Schema): void => $data.setKey('schema', schema);

function putEventDataToStore(eventData: UpdateEventData): void {
    if (!eventData.payload) {
        return;
    }

    const {language, data, schema} = eventData.payload;

    if (language) {
        setLanguage(language);
    }

    if (data) {
        setPersistedData(data);
    }

    if (schema) {
        setSchema(schema);
    }
}

export const $topic = computed($data, data => data.persisted?.topic ?? '');

export const $allFormItemsWithPaths = computed($data, ({schema, persisted}) => {
    const schemaPaths = schema ? getFormItemsWithPaths(schema.form.formItems) : [];
    return persisted ? getDataPathsToEditableItems(schemaPaths, persisted) : [];
});

export const $allPaths = computed($allFormItemsWithPaths, paths => paths.map(pathToString));

//
//* SCOPE
//
export const $scopedPaths = computed([$allFormItemsWithPaths, $context], (allFormItems, context) => {
    // no context
    if (!context) {
        return allFormItems.filter(isRootPath).filter(isEditableInput);
    }

    const contextPath = pathFromString(context);
    const formItem = allFormItems.find(p => pathsEqual(p, contextPath));

    // context is a specific input, scope is this input
    if (formItem && isEditableInput(formItem)) {
        return [formItem];
    }

    // context is a set or an option, scope is all direct children
    return allFormItems.filter(path => isChildPath(path, contextPath)).filter(isEditableInput);
});

export const $mentions = computed([$scopedPaths, $context], (scopedPaths, context) => {
    const mentions = scopedPaths.map(pathToMention);

    if (mentions.length > 1) {
        mentions.push(MENTION_ALL);
    }

    const isRootContext = context == null;
    if (isRootContext) {
        mentions.push(MENTION_TOPIC);
    }

    return mentions;
});

//
//* CONTEXT
//
export const $mentionInContext = computed([$context, $allFormItemsWithPaths], (context, allFormItems) => {
    if (!context) {
        return undefined;
    }

    const matchingPath = allFormItems.filter(isOrContainsEditableInput).find(path => pathToString(path) === context);
    return matchingPath && pathToMention(matchingPath);
});

//
//* EVENTS
//

export function dispatchResultApplied(entries: ApplyMessage[]): void {
    dispatch(AiEvents.RESULT_APPLIED, entries);
}

//
//* PROMPT
//
export function createPrompt(text: string): string {
    return [text, createPromptContext(), createPromptFields(text), createPromptContent()]
        .filter(isNonNullable)
        .join('\n\n');
}

function createPromptContext(): string {
    const mentionInContext = $mentionInContext.get()?.path;
    return [
        '# Context',
        `- Topic is "${$topic.get()}"`,
        `- Language is "${$data.get().language?.tag ?? navigator?.language ?? 'en'}"`,
        ...(mentionInContext ? [`- Field in Context is "${mentionInContext}"`] : []),
    ].join('\n');
}

function createPromptFields(text: string): Optional<string> {
    const mentionInContext = $mentionInContext.get()?.path;
    const mentionsInText = findMentionsNames(text);
    const canAddContext = mentionInContext && !mentionsInText.includes(mentionInContext);
    const mentions = canAddContext ? [mentionInContext, ...mentionsInText] : mentionsInText;

    if (mentions.length === 0) {
        return null;
    }

    const hasDirectAllMentions = mentions.includes(MENTION_ALL.path);
    const fields = hasDirectAllMentions
        ? $mentions
              .get()
              .map(v => v.path)
              .filter(v => v !== MENTION_ALL.path)
        : mentions;

    return ['# Fields', ...fields.map(v => `- ${v}`)].join('\n');
}

function createPromptContent(): string {
    return ['# Content', '```json', JSON.stringify(generatePathsEntries(), null, 2), '```'].join('\n');
}

function generatePathsEntries(): Record<string, DataEntry> {
    const result: Record<string, DataEntry> = {};

    const isRootContext = $context.get() == null;
    if (isRootContext) {
        result[MENTION_TOPIC.path] = {
            value: $topic.get(),
            type: 'text',
            schemaType: 'text',
            schemaLabel: 'Display Name',
        };
    }

    $scopedPaths
        .get()
        .filter(isInputWithPath)
        .forEach((inputWithPath: InputWithPath) => {
            result[pathToString(inputWithPath)] = {
                value: findValueByPath(inputWithPath)?.v ?? '',
                type: getInputType(inputWithPath),
                schemaType: inputWithPath.Input.inputType,
                schemaLabel: inputWithPath.Input.label,
            };
        });

    return result;
}

export function findValueByPath(path: Path): Optional<PropertyValue> {
    const fields = $data.get().persisted?.fields ?? [];
    const array = getPropertyArrayByPath(fields, path);
    return array?.values.at(path.elements.at(-1)?.index ?? 0);
}
