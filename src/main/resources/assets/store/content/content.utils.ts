import { SPECIAL_NAMES } from '@shared/enums';
import { t } from 'i18next';

import type { ContentData, PropertyArray, PropertyValue } from './ContentData';
import type { FormItemWithPath, InputWithPath } from './FormItemWithPath';
import type { Mention } from './Mention';
import type { Path, PathElement } from './Path';
import type { FormItem, Input, ItemSet, Layout, OptionSet, OptionSetOption } from './Schema';
import type { DataEntryType } from '@shared/data/DataEntry';

//
// * Input
//

export function getInputType(inputWithPath: Optional<InputWithPath>): DataEntryType {
  return inputWithPath?.inputType === 'HtmlArea' ? 'html' : 'text';
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

export const isInput = (item: FormItem): item is Input =>
  'formItemType' in item && item.formItemType === 'Input';

const isLayout = (item: FormItem): item is Layout =>
  'formItemType' in item && item.formItemType === 'Layout';

export const isItemSet = (item: FormItem): item is ItemSet =>
  'formItemType' in item && item.formItemType === 'ItemSet';

export const isOptionSet = (item: FormItem): item is OptionSet =>
  'formItemType' in item && item.formItemType === 'OptionSet';

export const isOptionSetOption = (item: FormItem): item is OptionSetOption =>
  !('formItemType' in item);

export function getFormItemsWithPaths(formItems: readonly FormItem[]): FormItemWithPath[] {
  return getPathsOfMentionableItems(formItems, { elements: [] });
}

function getPathsOfMentionableItems(
  formItems: readonly FormItem[],
  path: Path,
): FormItemWithPath[] {
  return formItems.flatMap((item) => fetchFormItemPath(item, path));
}

function fetchFormItemPath(item: FormItem, path: Path): FormItemWithPath[] {
  if (isInput(item)) {
    return isInputToEdit(item) ? [getInputPathEntry(item, path)] : [];
  }

  if (isLayout(item)) {
    return getPathsOfMentionableItems(item.items, { elements: path.elements.slice() });
  }

  if (isItemSet(item)) {
    return getItemSetPathEntries(item, path);
  }

  if (isOptionSet(item)) {
    return getOptionSetPathEntries(item, path);
  }

  return [];
}

function isInputToEdit(item: Input): boolean {
  const inputType = item.inputType;
  return inputType === 'TextArea' || inputType === 'TextLine' || inputType === 'HtmlArea';
}

function getInputPathEntry(item: Input, path: Path): InputWithPath {
  const pathElements = path.elements.slice();
  pathElements.push({ name: item.name, label: item.label });
  return { ...item, elements: pathElements };
}

function getItemSetPathEntries(item: ItemSet, path: Path): FormItemWithPath[] {
  const pathElements = path.elements.slice();
  pathElements.push({ name: item.name, label: item.label });

  return [
    { ...item, elements: pathElements.slice() },
    ...getPathsOfMentionableItems(item.items, { elements: pathElements }),
  ];
}

function getOptionSetPathEntries(item: OptionSet, path: Path): FormItemWithPath[] {
  const pathElements = path.elements.slice();
  pathElements.push({ name: item.name, label: item.label });

  return [
    { ...item, elements: pathElements.slice() },
    ...item.options.flatMap((option) =>
      getOptionSetOptionPathEntries(option, { elements: pathElements }),
    ),
  ];
}

function getOptionSetOptionPathEntries(option: OptionSetOption, path: Path): FormItemWithPath[] {
  const pathElements = path.elements.slice();
  pathElements.push({ name: option.name, label: option.label });

  return [
    { ...option, elements: pathElements.slice() },
    ...getPathsOfMentionableItems(option.items ?? [], { elements: pathElements }),
  ];
}

export function isEditableInput(item: FormItem): item is Input {
  return isInput(item) && isInputToEdit(item);
}

export function isOrContainsEditableInput(formItem: FormItem): boolean {
  if (isInput(formItem)) {
    return isInputToEdit(formItem);
  }

  if (isLayout(formItem) || isItemSet(formItem)) {
    return formItem.items.some(isOrContainsEditableInput);
  }

  if (isOptionSet(formItem)) {
    return formItem.options.some((option) => (option.items ?? []).some(isOrContainsEditableInput));
  }

  if (isOptionSetOption(formItem)) {
    return (formItem.items ?? []).some(isOrContainsEditableInput);
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
  emitEmptyLeaf: boolean,
): Path[] {
  const pathElement = schemaPath.elements.shift();

  if (!pathElement || !properties) {
    return previousIterationResult;
  }

  const propertyArray = properties.find((propertyArray) => propertyArray.name === pathElement.name);

  if (!propertyArray || propertyArray.values.length === 0) {
    // An empty leaf input still renders as a field, so emit it at an index-less
    // path; a missing non-leaf is an uninstantiated set with nothing to focus.
    if (emitEmptyLeaf && schemaPath.elements.length === 0) {
      const leafPath =
        previousIterationResult.length > 0
          ? clonePath(previousIterationResult[0])
          : { elements: [] };
      leafPath.elements.push({ name: pathElement.name, label: pathElement.label });
      return [leafPath];
    }

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

    thisIterationResult.push(
      ...createPropertyPaths(value.set, clonePath(schemaPath), [newPath], emitEmptyLeaf),
    );
  });

  return thisIterationResult;
}

export function getDataPathsToEditableItems(
  schemaPaths: FormItemWithPath[],
  data: ContentData,
): FormItemWithPath[] {
  return schemaPaths.flatMap((schemaPath: FormItemWithPath) => {
    const dataPaths = createPropertyPaths(
      data.fields,
      clonePath(schemaPath),
      [],
      isInput(schemaPath),
    ).filter((dataPath) => dataPath.elements.length === schemaPath.elements.length);

    return dataPaths.map((dataPath) => ({ ...schemaPath, ...dataPath }));
  });
}

export function createDisplayNameInput(): InputWithPath {
  return {
    formItemType: 'Input',
    inputType: 'TextLine',
    label: t('field.mentions.topic.label'),
    name: SPECIAL_NAMES.topic,
    occurrences: {
      maximum: 1,
      minimum: 0,
    },
    elements: [{ name: SPECIAL_NAMES.topic, label: t('field.mentions.topic.label') }],
  };
}

export function isTopicPath(path: Path): boolean {
  return pathToString(path) === `/${SPECIAL_NAMES.topic}`;
}

export function getHelpText(item: FormItem): Optional<string> {
  if (isInput(item) || isItemSet(item) || isOptionSet(item)) {
    return item.helpText;
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
