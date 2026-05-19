import { SPECIAL_NAMES } from '@shared/enums';
import { t } from 'i18next';

import type { ContentData, PropertyArray, PropertyValue } from './ContentData';
import type {
  FormItemSetWithPath,
  FormItemWithPath,
  FormOptionSetOptionWithPath,
  FormOptionSetWithPath,
  InputWithPath,
} from './FormItemWithPath';
import type { Mention } from './Mention';
import type { Path, PathElement } from './Path';
import type {
  FieldSet,
  FormItem,
  FormItemSet,
  FormOptionSet,
  FormOptionSetOption,
  Input,
} from './Schema';
import type { DataEntryType } from '@shared/data/DataEntry';

//
// * Input
//

export function getInputType(inputWithPath: Optional<InputWithPath>): DataEntryType {
  return inputWithPath?.Input.inputType === 'HtmlArea' ? 'html' : 'text';
}

//
// * Path
//

export const pathElementEqual = (
  element1: PathElement,
  element2: PathElement,
  compareLabel?: boolean,
): boolean => {
  const index1 = element1.index ?? 0;
  const index2 = element2.index ?? 0;
  return (
    element1.name === element2.name &&
    index1 === index2 &&
    (compareLabel ? element1.label === element2.label : true)
  );
};

export const pathsEqual = (path1: Path, path2: Path): boolean => {
  return (
    (!path1 && !path2) ||
    (path1?.elements.length === path2?.elements.length &&
      path1.elements.every((element, index) => pathElementEqual(element, path2.elements[index])))
  );
};

export const startsWith = (path: Path, prefix: Path): boolean => {
  return (
    path.elements.length > prefix.elements.length &&
    prefix.elements.every((element, index) => pathElementEqual(element, path.elements[index]))
  );
};

export const toPathElement = (value: string): PathElement => {
  const valArr = value.split('[');

  return {
    name: valArr[0],
    index: valArr[1] ? parseInt(valArr[1].slice(0, -1)) : 0,
  };
};

export const pathFromString = (pathAsString: string): Path => {
  const noLeadingSlashPath = pathAsString.startsWith('/') ? pathAsString.slice(1) : pathAsString;
  const elements = noLeadingSlashPath.split('/').map(toPathElement);
  return { elements };
};

export function pathToString(path: Path): string {
  const elements = path.elements.map(({ index, name }) => (!index ? name : `${name}[${index}]`));
  return `/${elements.join('/')}`;
}

export function pathToPrettifiedLabel(path: Path): string {
  const [label = '', index] = pathToLabelAndIndex(path) ?? [];
  return index == null ? label : `${label} [${index}]`;
}

export function pathToLabelAndIndex(path: Path): Optional<[string, Optional<number>]> {
  const lastElement = path.elements.at(-1);
  if (lastElement) {
    const index = lastElement.index != null ? lastElement.index + 1 : null;
    return [lastElement.label ?? lastElement.name, index];
  }
}

export function clonePath(path: Path): Path {
  const cloned = path.elements.map((element) => {
    return {
      name: element.name,
      label: element.label,
      index: element.index,
    };
  });

  return { elements: cloned };
}

export function pathToPrettifiedString(path: Path): string {
  return path.elements.map(pathElementToPrettifiedString).join(' / ');
}

function pathElementToPrettifiedString(element: PathElement): string {
  const text = element.label || element.name;
  return element.index == null ? text : `${text} [${element.index + 1}]`;
}

export function isChildPath(child: Path, parent: Path): boolean {
  return startsWith(child, parent) && child.elements.length === parent.elements.length + 1;
}

export function isRootPath(path: Path): boolean {
  return path.elements.length === 1;
}

export function getParentPath(path: Path): Optional<Path> {
  return path.elements.length > 1 ? { elements: path.elements.slice(0, -1) } : null;
}

export const pathsFromString = (pathAsString: string): Path[] => {
  const paths: Path[] = [];
  let path: Optional<Path> = pathFromString(pathAsString);

  while (path) {
    paths.unshift(path);
    path = getParentPath(path);
  }

  return paths;
};

export function getAllPaths(path: Path): Path[] {
  const parentPath = getParentPath(path);
  return parentPath ? [...getAllPaths(parentPath), path] : [path];
}

export function getAllPathsFromString(pathAsString: string): Path[] {
  return getAllPaths(pathFromString(pathAsString));
}

//
// * Schema
//

export const isPath = (item: Path): item is Path => 'elements' in item;

export const isInput = (item: FormItem): item is Input => 'Input' in item;

const isFieldSet = (item: FormItem): item is FieldSet => 'FieldSet' in item;

export const isFormItemSet = (item: FormItem): item is FormItemSet => 'FormItemSet' in item;

export const isFormOptionSet = (item: FormItem): item is FormOptionSet => 'FormOptionSet' in item;

export const isFormOptionSetOption = (item: FormItem): item is FormOptionSetOption =>
  'name' in item &&
  'label' in item &&
  'items' in item &&
  !isInput(item) &&
  !isFieldSet(item) &&
  !isFormItemSet(item) &&
  !isFormOptionSet(item);

export const isInputWithPath = (item: FormItemWithPath): item is InputWithPath =>
  isInput(item) && isPath(item);

export const isFormItemSetWithPath = (item: FormItemWithPath): item is FormItemSetWithPath =>
  isFormItemSet(item) && isPath(item);

export const isFormOptionSetWithPath = (item: FormItemWithPath): item is FormOptionSetWithPath =>
  isFormOptionSet(item) && isPath(item);

export const isFormOptionSetOptionWithPath = (
  item: FormItemWithPath,
): item is FormOptionSetOptionWithPath => isFormOptionSetOption(item) && isPath(item);

export function getFormItemsWithPaths(formItems: FormItem[]): FormItemWithPath[] {
  return getPathsOfMentionableItems(formItems, { elements: [] });
}

function getPathsOfMentionableItems(formItems: FormItem[], path: Path): FormItemWithPath[] {
  return formItems.flatMap((item) => fetchFormItemPath(item, path));
}

function fetchFormItemPath(item: FormItem, path: Path): FormItemWithPath[] {
  if (isInput(item)) {
    return isInputToEdit(item) ? [getInputPathEntry(item, path)] : [];
  }

  if (isFieldSet(item)) {
    return getPathsOfMentionableItems(item.FieldSet.items, { elements: path.elements.slice() });
  }

  if (isFormItemSet(item)) {
    return getFormItemSetPathEntries(item, path);
  }

  if (isFormOptionSet(item)) {
    return getFormOptionSetPathEntries(item, path);
  }

  return [];
}

function isInputToEdit(item: Input): boolean {
  const inputType = item.Input.inputType;
  return inputType === 'TextArea' || inputType === 'TextLine' || inputType === 'HtmlArea';
}

function getInputPathEntry(item: Input, path: Path): InputWithPath {
  const pathElements = path.elements.slice();
  pathElements.push({ name: item.Input.name, label: item.Input.label });
  return { elements: pathElements, Input: item.Input };
}

function getFormItemSetPathEntries(item: FormItemSet, path: Path): FormItemWithPath[] {
  const pathElements = path.elements.slice();
  pathElements.push({ name: item.FormItemSet.name, label: item.FormItemSet.label });

  const formItemSetItemWithPath = {
    elements: pathElements.slice(),
    FormItemSet: item.FormItemSet,
  };
  return [
    formItemSetItemWithPath,
    ...getPathsOfMentionableItems(item.FormItemSet.items, { elements: pathElements }),
  ];
}

function getFormOptionSetPathEntries(item: FormOptionSet, path: Path): FormItemWithPath[] {
  const pathElements = path.elements.slice();

  pathElements.push({ name: item.FormOptionSet.name, label: item.FormOptionSet.label });

  const result: FormItemWithPath[] = [];

  const formOptionSetWithPath: FormOptionSetWithPath = {
    elements: pathElements.slice(),
    FormOptionSet: item.FormOptionSet,
  };

  result.push(formOptionSetWithPath);

  item.FormOptionSet.options.forEach((option) => {
    result.push(...getFormOptionSetOptionPathEntries(option, { elements: pathElements }));
  });

  return result;
}

function getFormOptionSetOptionPathEntries(
  option: FormOptionSetOption,
  path: Path,
): FormItemWithPath[] {
  const pathElements = path.elements.slice();
  pathElements.push({ name: option.name, label: option.label });

  const optionFormItemWithPath: FormOptionSetOptionWithPath = {
    elements: pathElements.slice(),
    items: option.items,
    name: option.name,
    label: option.label,
  };

  return [
    optionFormItemWithPath,
    ...getPathsOfMentionableItems(option.items, { elements: pathElements }),
  ];
}

export function isEditableInput(item: FormItem): item is Input {
  return isInput(item) && isInputToEdit(item);
}

export function isOrContainsEditableInput(formItem: FormItem): boolean {
  if (isInput(formItem)) {
    return isInputToEdit(formItem);
  }

  if (isFieldSet(formItem)) {
    return formItem.FieldSet.items.some(isOrContainsEditableInput);
  }

  if (isFormItemSet(formItem)) {
    return formItem.FormItemSet.items.some(isOrContainsEditableInput);
  }

  if (isFormOptionSet(formItem)) {
    return formItem.FormOptionSet.options.some((option) =>
      option.items.some(isOrContainsEditableInput),
    );
  }

  if (isFormOptionSetOption(formItem)) {
    return formItem.items.some(isOrContainsEditableInput);
  }

  return false;
}

//
// * Data
//

export function pathToMention(item: FormItemWithPath): Mention {
  return {
    path: pathToString(item),
    prettified: pathToPrettifiedString(item),
    label: pathToPrettifiedLabel(item),
  };
}

export function getPropertyArrayByPath(
  properties: readonly PropertyArray[],
  path: Path,
): Optional<PropertyArray> {
  const pathElements = [...path.elements];
  const pathElement = pathElements.shift();

  const propertyArray = pathElement && properties.find(({ name }) => name === pathElement.name);

  if (!propertyArray || pathElements.length === 0) {
    return propertyArray;
  }

  const value = propertyArray.values.at(pathElement.index ?? 0);

  if (!value || !value.set) {
    return;
  }

  return getPropertyArrayByPath(value.set, { elements: pathElements });
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

  const propertyArray = properties.find((propertyArray) => propertyArray.name === pathElement.name);

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

    const newPath =
      previousIterationResult.length > 0 ? clonePath(previousIterationResult[0]) : { elements: [] };
    newPath.elements.push(newPathElement);

    thisIterationResult.push(...createPropertyPaths(value.set, clonePath(schemaPath), [newPath]));
  });

  return thisIterationResult;
}

export function getDataPathsToEditableItems(
  schemaPaths: FormItemWithPath[],
  data: ContentData,
): FormItemWithPath[] {
  return schemaPaths.flatMap((schemaPath: FormItemWithPath) => {
    const dataPaths = createPropertyPaths(data.fields, clonePath(schemaPath), []).filter(
      (dataPath) => dataPath.elements.length === schemaPath.elements.length,
    );

    return dataPaths.map((dataPath) => {
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
    elements: [{ name: SPECIAL_NAMES.topic, label: t('field.mentions.topic.label') }],
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

export function getParentHelpTexts(
  path: Path,
  helpTextMap: Record<string, string>,
): string[] | undefined {
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

