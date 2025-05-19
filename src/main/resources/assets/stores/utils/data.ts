import {t} from 'i18next';

import {SPECIAL_NAMES} from '../../../shared/enums';
import {ContentData, PropertyArray, PropertyValue} from '../data/ContentData';
import {FormItemSetWithPath, FormItemWithPath, FormOptionSetWithPath, InputWithPath} from '../data/FormItemWithPath';
import {Mention} from '../data/Mention';
import {Path, PathElement} from '../data/Path';
import {FormItem} from '../data/Schema';
import {clonePath, getParentPath, pathToPrettifiedLabel, pathToPrettifiedString, pathToString} from './path';
import {isFormItemSet, isFormOptionSet, isInput} from './schema';

export function pathToMention(item: FormItemWithPath): Mention {
    return {
        path: pathToString(item),
        prettified: pathToPrettifiedString(item),
        label: pathToPrettifiedLabel(item),
    };
}

export function getPropertyArrayByPath(properties: ReadonlyArray<PropertyArray>, path: Path): Optional<PropertyArray> {
    const pathElements = [...path.elements];
    const pathElement = pathElements.shift();

    const propertyArray = pathElement && properties.find(({name}) => name === pathElement.name);

    if (!propertyArray || pathElements.length === 0) {
        return propertyArray;
    }

    const value = propertyArray.values.at(pathElement.index ?? 0);

    if (!value || !value.set) {
        return;
    }

    return getPropertyArrayByPath(value.set, {elements: pathElements});
}

export function setValueByPath(value: PropertyValue, path: Path, data: ContentData): void {
    const array = getPropertyArrayByPath(data.fields, path);

    if (array) {
        const index = path.elements.at(-1)?.index ?? 0;
        array.values[index] = value;
    }
}

function createPropertyPaths(
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

    propertyArray.values.forEach((value, index, array) => {
        const newPathElement: PathElement = {
            name: propertyArray.name,
            label: pathElement.label,
            index: array.length > 1 ? index : undefined,
        };

        const newPath = previousIterationResult.length > 0 ? clonePath(previousIterationResult[0]) : {elements: []};
        newPath.elements.push(newPathElement);

        thisIterationResult.push(...createPropertyPaths(value.set, clonePath(schemaPath), [newPath]));
    });

    return thisIterationResult;
}

export function getDataPathsToEditableItems(schemaPaths: FormItemWithPath[], data: ContentData): FormItemWithPath[] {
    return schemaPaths.flatMap((schemaPath: FormItemWithPath) => {
        const dataPaths = createPropertyPaths(data.fields, clonePath(schemaPath), []).filter(
            dataPath => dataPath.elements.length === schemaPath.elements.length,
        );

        return dataPaths.map(dataPath => {
            if (isInput(schemaPath)) {
                return {
                    ...dataPath,
                    Input: schemaPath.Input,
                } satisfies InputWithPath;
            }

            if (isFormItemSet(schemaPath)) {
                return {
                    ...dataPath,
                    FormItemSet: schemaPath.FormItemSet,
                } satisfies FormItemSetWithPath;
            }

            if (isFormOptionSet(schemaPath)) {
                return {
                    ...dataPath,
                    FormOptionSet: schemaPath.FormOptionSet,
                } satisfies FormOptionSetWithPath;
            }

            return {
                // FormOptionSetOption, take all props, then overwrite with correct path (path with correct index)
                ...schemaPath,
                ...dataPath,
            };
        });
    });
}

export function createDisplayNameInput(): InputWithPath {
    return {
        Input: {
            inputType: 'TextLine',
            label: t('field.mentions.topic.label'),
            name: SPECIAL_NAMES.topic,
            occurrences: {
                maximum: 1,
                minimum: 0,
            },
        },
        elements: [{name: SPECIAL_NAMES.topic, label: t('field.mentions.topic.label')}],
    };
}

export function isTopicPath(path: Path): boolean {
    return pathToString(path) === `/${SPECIAL_NAMES.topic}`;
}

export function getHelpText(item: FormItem): Optional<string> {
    if (isInput(item)) {
        return item.Input.helpText;
    } else if (isFormItemSet(item)) {
        return item.FormItemSet.helpText;
    } else if (isFormOptionSet(item)) {
        return item.FormOptionSet.helpText;
    }

    return undefined;
}

export function getParentHelpTexts(path: Path, helpTextMap: Record<string, string>): string[] | undefined {
    const texts: string[] = [];

    let parentPath = getParentPath(path);
    while (parentPath) {
        const helpText = helpTextMap[pathToString(parentPath)];
        if (helpText) {
            texts.push(helpText);
        }

        parentPath = getParentPath(parentPath);
    }

    return texts.length > 0 ? texts : undefined;
}
