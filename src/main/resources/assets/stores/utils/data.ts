import {ContentData, PropertyArray, PropertyValue} from '../data/ContentData';
import {FormItemSetWithPath, FormItemWithPath, FormOptionSetWithPath, InputWithPath} from '../data/FormItemWithPath';
import {Mention} from '../data/Mention';
import {Path, PathElement} from '../data/Path';
import {clonePath, getPathLabel, pathToPrettifiedString, pathToString} from './path';
import {
    isFormItemSet,
    isFormItemSetWithPath,
    isFormOptionSet,
    isFormOptionSetOptionWithPath,
    isFormOptionSetWithPath,
    isInput,
    isInputWithPath,
} from './schema';

export function pathToMention(item: FormItemWithPath): Mention {
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

export function findPathByDataAttrString(items: FormItemWithPath[], path: string): Optional<InputWithPath> {
    return items.filter(isInputWithPath).find(p => pathToString(p) === path);
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

    propertyArray.values.forEach((value: PropertyValue, index) => {
        const newPathElement: PathElement = {
            name: propertyArray.name,
            label: pathElement.label,
            index: index,
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
