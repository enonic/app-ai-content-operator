import {t} from 'i18next';
import {computed, map} from 'nanostores';

import type {DataEntry} from '../../shared/data/DataEntry';
import {addGlobalUpdateDataHandler} from '../common/events';
import {MENTION_ALL, MENTION_TOPIC} from '../common/mentions';
import {$context} from './context';
import {ContentData, PropertyValue} from './data/ContentData';
import {UpdateEventData} from './data/EventData';
import {FieldDescriptor} from './data/FieldDescriptor';
import {FormItemWithPath, InputWithPath} from './data/FormItemWithPath';
import {Language} from './data/Language';
import {Path} from './data/Path';
import {Schema} from './data/Schema';
import {getDataPathsToEditableItems, getPropertyArrayByPath, pathToMention} from './utils/data';
import {getInputType} from './utils/input';
import {
    getPathLabel,
    isChildPath,
    isRootPath,
    pathFromString,
    pathsEqual,
    pathToPrettifiedString,
    pathToString,
} from './utils/path';
import {getFormItemsWithPaths, isEditableInput, isOrContainsEditableInput} from './utils/schema';

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

export const $language = computed($data, ({language}) => language?.tag ?? navigator?.language ?? 'en');
export const $contentPath = computed($data, ({persisted}) => persisted?.contentPath ?? '');

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
//* CONTEXT
//
export const $mentionInContext = computed([$context, $allFormItemsWithPaths], (context, allFormItems) => {
    if (!context) {
        return undefined;
    }

    const matchingPath = allFormItems.filter(isOrContainsEditableInput).find(path => pathToString(path) === context);
    return matchingPath && pathToMention(matchingPath);
});

export const $inputsInContext = computed([$context, $allFormItemsWithPaths], (context, allFormItems) => {
    const contextPath = context && pathFromString(context);

    const input = contextPath
        ? allFormItems.find((path): path is InputWithPath => pathsEqual(path, contextPath) && isEditableInput(path))
        : null;

    if (input) {
        return [input];
    }

    const items: FormItemWithPath[] = contextPath
        ? allFormItems.filter(path => isChildPath(path, contextPath))
        : allFormItems.filter(path => isRootPath(path));

    return items.filter((item: FormItemWithPath): item is InputWithPath => isEditableInput(item));
});

export const $mentions = computed([$inputsInContext, $context], (inputs, context) => {
    const mentions = inputs.map(pathToMention);

    if (context == null) {
        mentions.unshift(MENTION_TOPIC);
    }

    if (mentions.length > 1) {
        mentions.unshift(MENTION_ALL);
    }

    return mentions;
});

//
//* FIELDS
//

export const $fieldDescriptors = computed($allFormItemsWithPaths, allFormItems => {
    return [
        {
            name: MENTION_TOPIC.path,
            label: t('field.mentions.topic.label'),
            displayName: t('field.mentions.topic.prettified'),
            type: 'text',
        },
        ...allFormItems
            .filter((item: FormItemWithPath): item is InputWithPath => isEditableInput(item))
            .map(item => ({
                name: pathToString(item),
                label: getPathLabel(item),
                displayName: pathToPrettifiedString(item),
                type: getInputType(item),
            })),
    ] satisfies FieldDescriptor[];
});

export function createFields(): Record<string, DataEntry> {
    const result: Record<string, DataEntry> = {};

    const isRootContext = $context.get() == null;
    if (isRootContext) {
        result[MENTION_TOPIC.path] = {
            value: $topic.get(),
            type: 'text',
            schemaType: 'text',
            schemaLabel: t('field.mentions.topic.label'),
        };
    }

    $inputsInContext.get().forEach((inputWithPath: InputWithPath) => {
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
