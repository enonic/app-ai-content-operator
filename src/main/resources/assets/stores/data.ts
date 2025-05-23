import {t} from 'i18next';
import {computed, map} from 'nanostores';

import type {DataEntry} from '../../shared/data/DataEntry';
import {addGlobalUpdateDataHandler} from '../common/events';
import {MENTION_ALL} from '../common/mentions';
import {$context, resetContext} from './context';
import {ContentData, PropertyValue} from './data/ContentData';
import {UpdateEventData} from './data/EventData';
import {FieldDescriptor} from './data/FieldDescriptor';
import {FormItemWithPath, InputWithPath} from './data/FormItemWithPath';
import {Language} from './data/Language';
import {Path} from './data/Path';
import {Schema} from './data/Schema';
import {
    createDisplayNameInput,
    getDataPathsToEditableItems,
    getHelpText,
    getParentHelpTexts,
    getPropertyArrayByPath,
    isTopicPath,
    pathToMention,
} from './utils/data';
import {getInputType} from './utils/input';
import {
    isChildPath,
    isRootPath,
    pathFromString,
    pathsEqual,
    pathToPrettifiedLabel,
    pathToPrettifiedString,
    pathToString,
} from './utils/path';
import {getFormItemsWithPaths, isEditableInput} from './utils/schema';

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
    const result = persisted ? getDataPathsToEditableItems(schemaPaths, persisted) : [];

    return [createDisplayNameInput(), ...result];
});

export const $orderedPaths = computed($allFormItemsWithPaths, items => {
    return items.map(item => pathToString(item));
});

const $helpTextMap = computed($allFormItemsWithPaths, items => {
    return items.reduce(
        (acc, item) => {
            const path = pathToString(item);
            const helpText = getHelpText(item);

            if (helpText) {
                acc[path] = helpText;
            }

            return acc;
        },
        {} as Record<string, string>,
    );
});

//
//* CONTEXT
//
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

export const $mentions = computed([$inputsInContext], inputs => {
    const mentions = inputs.map(pathToMention);

    if (mentions.length > 1) {
        mentions.unshift({
            path: MENTION_ALL.path,
            label: t('field.mentions.all.label'),
            prettified: t('field.mentions.all.prettified'),
        });
    }

    return mentions;
});

$allFormItemsWithPaths.listen(allFormItemsWithPaths => {
    const context = $context.get();
    if (!context) {
        return;
    }

    const path = pathFromString(context);
    const isValidContext = allFormItemsWithPaths.some(p => pathsEqual(p, path));

    if (!isValidContext) {
        resetContext();
    }
});

//
//* FIELDS
//

export const $fieldDescriptors = computed($allFormItemsWithPaths, allFormItems => {
    return [
        ...allFormItems
            .filter((item: FormItemWithPath): item is InputWithPath => isEditableInput(item))
            .map(item => ({
                name: pathToString(item),
                label: pathToPrettifiedLabel(item),
                displayName: pathToPrettifiedString(item),
                type: getInputType(item),
            })),
    ] satisfies FieldDescriptor[];
});

export function createFields(): Record<string, DataEntry> {
    const result: Record<string, DataEntry> = {};

    $inputsInContext.get().forEach((inputWithPath: InputWithPath) => {
        result[pathToString(inputWithPath)] = {
            value: findValueByPath(inputWithPath)?.v ?? '',
            type: getInputType(inputWithPath),
            schemaType: inputWithPath.Input.inputType,
            schemaLabel: inputWithPath.Input.label,
            schemaHelpText: inputWithPath.Input.helpText,
            parentHelpTexts: getParentHelpTexts(inputWithPath, $helpTextMap.get()),
        };
    });

    return result;
}

export function findValueByPath(path: Path): Optional<PropertyValue> {
    if (isTopicPath(path)) {
        return {v: $topic.get()};
    }

    const fields = $data.get().persisted?.fields ?? [];
    const array = getPropertyArrayByPath(fields, path);
    return array?.values.at(path.elements.at(-1)?.index ?? 0);
}
