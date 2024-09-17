import {
    FormItemSetWithPath,
    FormItemWithPath,
    FormOptionSetOptionWithPath,
    FormOptionSetWithPath,
    InputWithPath,
} from './data/FormItemWithPath';
import {Path} from './data/Path';
import {FieldSet, FormItem, FormItemSet, FormOptionSet, FormOptionSetOption, Input} from './data/Schema';

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

export const isInputWithPath = (item: FormItemWithPath): item is InputWithPath => isInput(item) && isPath(item);

export const isFormItemSetWithPath = (item: FormItemWithPath): item is FormItemSetWithPath =>
    isFormItemSet(item) && isPath(item);

export const isFormOptionSetWithPath = (item: FormItemWithPath): item is FormOptionSetWithPath =>
    isFormOptionSet(item) && isPath(item);

export const isFormOptionSetOptionWithPath = (item: FormItemWithPath): item is FormOptionSetOptionWithPath =>
    isFormOptionSetOption(item) && isPath(item);

export function getFormItemsWithPaths(formItems: FormItem[]): FormItemWithPath[] {
    const result: FormItemWithPath[] = [];
    result.push(...getPathsOfMentionableItems(formItems, {elements: []}));
    return result;
}

function getPathsOfMentionableItems(formItems: FormItem[], path: Path): FormItemWithPath[] {
    const result: FormItemWithPath[] = [];

    formItems.forEach(item => {
        result.push(...fetchFormItemPath(item, path));
    });

    return result;
}

function fetchFormItemPath(item: FormItem, path: Path): FormItemWithPath[] {
    if (isInput(item)) {
        return isInputToEdit(item) ? [getInputPathEntry(item, path)] : [];
    }

    if (isFieldSet(item)) {
        return getPathsOfMentionableItems(item.FieldSet.items, {elements: path.elements.slice()});
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
    pathElements.push({name: item.Input.name, label: item.Input.label});
    return {elements: pathElements, Input: item.Input};
}

function getFormItemSetPathEntries(item: FormItemSet, path: Path): FormItemWithPath[] {
    const pathElements = path.elements.slice();
    pathElements.push({name: item.FormItemSet.name, label: item.FormItemSet.label});

    const formItemSetItemWithPath = {
        elements: pathElements.slice(),
        FormItemSet: item.FormItemSet,
    };
    return [formItemSetItemWithPath, ...getPathsOfMentionableItems(item.FormItemSet.items, {elements: pathElements})];
}

function getFormOptionSetPathEntries(item: FormOptionSet, path: Path): FormItemWithPath[] {
    const pathElements = path.elements.slice();

    pathElements.push({name: item.FormOptionSet.name, label: item.FormOptionSet.label});

    const result: FormItemWithPath[] = [];

    const formOptionSetWithPath: FormOptionSetWithPath = {
        elements: pathElements.slice(),
        FormOptionSet: item.FormOptionSet,
    };

    result.push(formOptionSetWithPath);

    item.FormOptionSet.options.forEach(option => {
        result.push(...getFormOptionSetOptionPathEntries(item, option, {elements: pathElements}));
    });

    return result;
}

function getFormOptionSetOptionPathEntries(
    item: FormOptionSet,
    option: FormOptionSetOption,
    path: Path,
): FormItemWithPath[] {
    const pathElements = path.elements.slice();
    pathElements.push({name: option.name, label: option.label});

    const optionFormItemWithPath: FormOptionSetOptionWithPath = {
        elements: pathElements.slice(),
        items: option.items,
        name: option.name,
        label: option.label,
    };

    return [optionFormItemWithPath, ...getPathsOfMentionableItems(option.items, {elements: pathElements})];
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
        return formItem.FormOptionSet.options.some(option => option.items.some(isOrContainsEditableInput));
    }

    if (isFormOptionSetOption(formItem)) {
        return formItem.items.some(isOrContainsEditableInput);
    }

    return false;
}
