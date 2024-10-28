import {computed, map} from 'nanostores';

import {SchemaType} from '../../lib/shared/enums';
import {SPECIAL_NAMES} from '../../lib/shared/prompts';
import {SchemaField} from '../../types/shared/model';
import {isNonNullable} from '../common/data';
import {addGlobalUpdateDataHandler} from '../common/events';
import {findMentionByPath, findMentionsNames, MENTION_ALL, MENTION_TOPIC} from '../common/mentions';
import {$context} from './context';
import {ContentData, PropertyArray, PropertyValue} from './data/ContentData';
import {EventData} from './data/EventData';
import {FormItemSetWithPath, FormItemWithPath, FormOptionSetWithPath, InputWithPath} from './data/FormItemWithPath';
import {Language} from './data/Language';
import {Mention} from './data/Mention';
import {Path, PathElement} from './data/Path';
import {FormItemSet, FormOptionSet, Schema} from './data/Schema';
import {
    clonePath,
    getPathLabel,
    isChildPath,
    isRootPath,
    pathFromString,
    pathsEqual,
    pathToPrettifiedString,
    pathToString,
} from './pathUtil';
import {
    getFormItemsWithPaths,
    isFormItemSet,
    isFormItemSetWithPath,
    isFormOptionSet,
    isFormOptionSetOptionWithPath,
    isFormOptionSetWithPath,
    isInput,
    isInputWithPath,
    isOrContainsEditableInput,
} from './schemaUtil';
import {$scope, isScopeEmpty} from './scope';

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

export interface DataEntry {
    value: string | boolean | number;
    type: 'text' | 'html';
    schemaType: string;
    schemaLabel: string;
    schemaHelpText?: string;
}

addGlobalUpdateDataHandler((event: CustomEvent<EventData>) => {
    putEventDataToStore(event.detail);
});

export const getLanguage = (): Readonly<Language> => $data.get().language;

export const setLanguage = (language: Language): void => $data.setKey('language', language);

export const getPersistedData = (): Optional<Readonly<ContentData>> => $data.get().persisted;

export const setPersistedData = (data: ContentData): void => $data.setKey('persisted', data);

export const getSchema = (): Optional<Readonly<Schema>> => $data.get().schema;

export const setSchema = (schema: Schema): void => $data.setKey('schema', schema);

function putEventDataToStore(eventData: EventData): void {
    if (!eventData['payload']) {
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

export const $allFormItemsWithPaths = computed($data, store => {
    void store.persisted;
    const schemaPaths = makePathsToFormItems();

    const data = getPersistedData();
    return data ? getDataPathsToEditableItems(schemaPaths, data) : [];
});

export const $scopedPaths = computed([$allFormItemsWithPaths, $scope], (allFormItems, scope) => {
    const scopePath = scope ? pathFromString(scope) : null;
    const items: FormItemWithPath[] = scopePath
        ? allFormItems.filter(path => isChildPath(path, scopePath))
        : allFormItems.filter(isRootPath);

    return items.filter(isOrContainsEditableInput);
});

export const $mentions = computed($scopedPaths, scopedPaths => {
    const mentions = scopedPaths.map(pathToMention);

    if (mentions.length > 0) {
        mentions.push(MENTION_ALL);
    }

    if (isScopeEmpty()) {
        mentions.push(MENTION_TOPIC);
    }

    return mentions;
});

export const $mentionInContext = computed([$context, $allFormItemsWithPaths], (context, allFormItems) => {
    if (!context) {
        return undefined;
    }

    const allPaths = allFormItems.filter(isOrContainsEditableInput);
    const path = allPaths.find(path => pathToString(path) === context);

    if (!path) {
        return undefined;
    }

    const mentions = allPaths.map(pathToMention);
    return findMentionByPath(mentions, path);
});

function makePathsToFormItems(): FormItemWithPath[] {
    const schema = getSchema();
    return schema ? getFormItemsWithPaths(schema.form.formItems) : [];
}

function getDataPathsToEditableItems(schemaPaths: FormItemWithPath[], data: ContentData): FormItemWithPath[] {
    return schemaPaths.flatMap((schemaPath: FormItemWithPath) => {
        const dataPaths = makePropertyPaths(data.fields, clonePath(schemaPath), []).filter(
            dataPath => dataPath.elements.length === schemaPath.elements.length,
        );

        return dataPaths.map(dataPath => {
            if (isInput(schemaPath)) {
                return {
                    ...dataPath,
                    Input: schemaPath.Input,
                } as InputWithPath;
            }

            if (isFormItemSet(schemaPath)) {
                return {
                    ...dataPath,
                    FormItemSet: (schemaPath as FormItemSet).FormItemSet,
                } as FormItemSetWithPath;
            }

            if (isFormOptionSet(schemaPath)) {
                return {
                    ...dataPath,
                    FormOptionSet: (schemaPath as FormOptionSet).FormOptionSet,
                } as FormOptionSetWithPath;
            }

            return {
                // FormOptionSetOption, take all props, then overwrite with correct path (path with correct index)
                ...schemaPath,
                ...dataPath,
            };
        });
    });
}

function makePropertyPaths(
    properties: PropertyArray[] | undefined,
    schemaPath: Path,
    previousIterationResult: Path[],
): Path[] {
    const pathElement = schemaPath.elements.shift();

    if (!pathElement || !properties) {
        return previousIterationResult;
    }

    const propertyArray = properties.find(propertyArray => propertyArray.name === pathElement.name);

    if (!propertyArray || propertyArray.values.length === 0) {
        return previousIterationResult;
    }

    const thisIterationResult: Path[] = [];

    propertyArray.values.forEach((value: PropertyValue, index) => {
        const newPathElement: PathElement = {
            name: propertyArray.name,
            label: pathElement.label,
            index: index,
        };

        const newPath = previousIterationResult.length > 0 ? clonePath(previousIterationResult[0]) : {elements: []};
        newPath.elements.push(newPathElement);

        thisIterationResult.push(...makePropertyPaths(value.set, clonePath(schemaPath), [newPath]));
    });

    return thisIterationResult;
}

export function getValueByStringPath(pathAsString: string): Optional<PropertyValue> {
    const path = pathFromString(pathAsString);
    return path ? getValueByPath(path) : null;
}

export function getValueByPath(path: Path): Optional<PropertyValue> {
    const array = getPropertyArrayByPath(path);

    if (array) {
        const index = path.elements[path.elements.length - 1]?.index ?? 0;
        return array.values[index];
    }

    return null;
}

function getPropertyArrayByPath(
    path: Path,
    data = structuredClone(getPersistedData()),
): Optional<Readonly<PropertyArray>> {
    return data ? doGetPropertyArrayByPath(data.fields, path) : undefined;
}

function doGetPropertyArrayByPath(properties: PropertyArray[], path: Path): Optional<PropertyArray> {
    const pathElements = path.elements.slice();
    const pathElement = pathElements.shift();

    if (!pathElement) {
        return;
    }

    const propertyArray = properties.find(propertyArray => propertyArray.name === pathElement.name);

    if (!propertyArray || pathElements.length === 0) {
        return propertyArray;
    }

    const index = pathElement.index ?? 0;
    const value = propertyArray.values[index];

    if (!value || !value.set) {
        return;
    }

    return doGetPropertyArrayByPath(value.set, {elements: pathElements});
}

export function setValueByPath(value: PropertyValue, path: Path, data: ContentData): void {
    const array = getPropertyArrayByPath(path, data);

    if (array) {
        const index = path.elements[path.elements.length - 1]?.index ?? 0;
        array.values[index] = value;
    }
}

function pathToMention(item: FormItemWithPath): Mention {
    return {
        path: pathToString(item),
        prettified: pathToPrettifiedString(item),
        label: getPathLabel(item),
        type:
            isFormItemSetWithPath(item) || isFormOptionSetWithPath(item) || isFormOptionSetOptionWithPath(item)
                ? 'scope'
                : 'normal',
    };
}

export const getLanguageTag = (): string => getLanguage()?.tag ?? navigator?.language ?? 'en';
export const generatePathsEntries = (): Record<string, DataEntry> => {
    const result: Record<string, DataEntry> = {};

    if (isScopeEmpty()) {
        result[MENTION_TOPIC.path] = generateTopicDataEntry();
    }

    $scopedPaths
        .get()
        .filter(isInputWithPath)
        .forEach((path: InputWithPath) => {
            result[pathToString(path)] = createDataEntry(path);
        });

    return result;
};

function generateTopicDataEntry(): DataEntry {
    return {
        value: getPersistedData()?.topic || '',
        type: 'text',
        schemaType: 'text',
        schemaLabel: 'Display Name',
    };
}

export function createPrompt(text: string): string {
    return [text, createContext(), createFields(text), createContent()].filter(isNonNullable).join('\n\n');
}

function createContext(): string {
    const mentionInContext = $mentionInContext.get()?.path;

    const context = ['# Context', `- Topic is "${$topic.get()}"`, `- Language is "${getLanguageTag()}"`];

    if (mentionInContext) {
        context.push(`- Field in Context is "${mentionInContext}"`);
    }

    return context.join('\n');
}

export function findFields(text: string): SchemaField[] {
    const mentions = findMentionsNames(text);

    const hasDirectAllMentions = mentions.includes(MENTION_ALL.path);
    const hasTopicMentions = hasDirectAllMentions || mentions.includes(MENTION_TOPIC.path);
    const fieldsFromMentions = hasDirectAllMentions ? $mentions.get().map(v => v.path) : mentions;

    const customFields = fieldsFromMentions
        .filter(v => v !== MENTION_ALL.path && v !== MENTION_TOPIC.path)
        .map(name => {
            return {name, type: SchemaType.ARRAY, description: `Content for ${name}.`} satisfies SchemaField;
        });

    return [
        {
            name: SPECIAL_NAMES.unclear,
            type: SchemaType.STRING,
            description: 'Response, when request data is insufficient.',
        },
        {
            name: SPECIAL_NAMES.common,
            type: SchemaType.STRING,
            description: 'Response on common requests, not related to schema.',
        },
        {
            name: SPECIAL_NAMES.error,
            type: SchemaType.STRING,
            description: 'Response, when it is impossible to process request properly.',
        },
        {
            name: SPECIAL_NAMES.topic,
            type: SchemaType.ARRAY,
            description: 'Title (also topic or display name) of the content.',
            required: hasTopicMentions,
        },
        ...customFields,
    ];
}

function createFields(text: string): Optional<string> {
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

    return ['# Fields', ...fields.sort().map(v => `- ${v}`)].join('\n');
}

function createContent(): string {
    return ['# Content', '```json', pathsEntriesToString(generatePathsEntries()), '```'].join('\n');
}

export function getPathType(path: InputWithPath | undefined): 'html' | 'text' {
    return path?.Input.inputType === 'HtmlArea' ? 'html' : 'text';
}

function createDataEntry(path: InputWithPath): DataEntry {
    return {
        value: getValueByPath(path)?.v ?? '',
        type: getPathType(path),
        schemaType: path.Input.inputType,
        schemaLabel: path.Input.label,
    };
}

function pathsEntriesToString(pathsEntries: Record<string, DataEntry>): string {
    return JSON.stringify(pathsEntries, null, 2);
}

export function getStoredPathByDataAttrString(value: string): InputWithPath | undefined {
    return $allFormItemsWithPaths
        .get()
        .filter(isInputWithPath)
        .find(path => pathToString(path) === value);
}

export function getFormItemByStringPath(pathAsString: string): Optional<FormItemWithPath> {
    return $allFormItemsWithPaths.get().find(path => pathToString(path) === pathAsString);
}

export function getFormItemByPath(path: Path): Optional<FormItemWithPath> {
    return $allFormItemsWithPaths.get().find(p => pathsEqual(p, path));
}

export function generateAllPathsEntries(): Record<string, DataEntry> {
    const entries: Record<string, DataEntry> = {};

    const inputs = $allFormItemsWithPaths.get().filter(isInputWithPath);
    inputs.forEach(path => {
        entries[pathToString(path)] = createDataEntry(path);
    });

    return entries;
}
