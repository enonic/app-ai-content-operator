import {computed, map} from 'nanostores';

import {SchemaType} from '../../lib/shared/enums';
import {SPECIAL_NAMES} from '../../lib/shared/prompts';
import {SchemaField} from '../../types/shared/model';
import {isNonNullable} from '../common/data';
import {addGlobalUpdateDataHandler, AiEvents, dispatch} from '../common/events';
import {findMentionByPath, findMentionsNames, MENTION_ALL, MENTION_TOPIC} from '../common/mentions';
import {$context} from './context';
import {ApplyMessage} from './data/ApplyMessage';
import {ContentData, PropertyArray, PropertyValue} from './data/ContentData';
import {DataEntry} from './data/DataEntry';
import {UpdateEventData} from './data/EventData';
import {FormItemSetWithPath, FormItemWithPath, FormOptionSetWithPath, InputWithPath} from './data/FormItemWithPath';
import {Language} from './data/Language';
import {Mention} from './data/Mention';
import {Path, PathElement} from './data/Path';
import {FormItemSet, FormOptionSet, Schema} from './data/Schema';
import {$scope, isScopeEmpty} from './scope';
import {
    clonePath,
    getPathLabel,
    isChildPath,
    isRootPath,
    pathFromString,
    pathToPrettifiedString,
    pathToString,
} from './utils/path';
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
} from './utils/schema';

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
    const fields = $data.get().persisted?.fields ?? [];
    const array = doGetPropertyArrayByPath(fields, path);
    return array?.values.at(path.elements.at(-1)?.index ?? 0);
}

function doGetPropertyArrayByPath(properties: ReadonlyArray<PropertyArray>, path: Path): Optional<PropertyArray> {
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
    const array = doGetPropertyArrayByPath(data.fields, path);

    if (array) {
        const index = path.elements.at(-1)?.index ?? 0;
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

export const getLanguageTag = (): string => $data.get().language?.tag ?? navigator?.language ?? 'en';
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
        value: $topic.get(),
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
    return ['# Content', '```json', JSON.stringify((generatePathsEntries(), null, 2)), '```'].join('\n');
}

export function getInputType(inputWithPath: InputWithPath | undefined): 'html' | 'text' {
    return inputWithPath?.Input.inputType === 'HtmlArea' ? 'html' : 'text';
}

function createDataEntry(inputWithPath: InputWithPath): DataEntry {
    return {
        value: getValueByPath(inputWithPath)?.v ?? '',
        type: getInputType(inputWithPath),
        schemaType: inputWithPath.Input.inputType,
        schemaLabel: inputWithPath.Input.label,
    };
}

export function getStoredPathByDataAttrString(value: string): InputWithPath | undefined {
    return $allFormItemsWithPaths
        .get()
        .filter(isInputWithPath)
        .find(path => pathToString(path) === value);
}

//
//* EVENTS
//

export function dispatchResultApplied(entries: ApplyMessage[]): void {
    const {persisted} = $data.get();
    if (!persisted) {
        return;
    }

    const newData = structuredClone(persisted);
    let isAnyChanged = false;

    entries.forEach(({name, content}) => {
        if (name === SPECIAL_NAMES.topic) {
            newData.topic = content;
            isAnyChanged = true;
            return;
        }

        const path = getStoredPathByDataAttrString(name);
        if (path) {
            setValueByPath({v: content}, path, newData);
            isAnyChanged = true;
            return;
        }

        // handle value not updated
        console.warn('No path found for:', name);
    });

    if (isAnyChanged) {
        setPersistedData(newData);
        dispatch(AiEvents.RESULT_APPLIED);
    }
}
