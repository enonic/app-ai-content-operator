import { t } from 'i18next';
import { computed, map } from 'nanostores';

import { MENTION_ALL } from '@/common/mentions';
import { $context, resetContext } from '@/store/context';

import type { ContentData, PropertyValue } from './ContentData';
import type { FieldDescriptor } from './FieldDescriptor';
import type { FormItemWithPath, InputWithPath } from './FormItemWithPath';
import type { Language } from './Language';
import type { Path } from './Path';
import type { Schema } from './Schema';
import type { DataEntry } from '@shared/data/DataEntry';

import {
  createDisplayNameInput,
  getDataPathsToEditableItems,
  getFormItemsWithPaths,
  getHelpText,
  getInputType,
  getParentHelpTexts,
  getPropertyArrayByPath,
  isChildPath,
  isEditableInput,
  isRootPath,
  isTopicPath,
  pathFromString,
  pathsEqual,
  pathToMention,
  pathToPrettifiedLabel,
  pathToPrettifiedString,
  pathToString,
} from './content.utils';

export type Data = {
  language: Language;
  persisted: Optional<ContentData>;
  schema: Optional<Schema>;
};

export const $content = map<Data>({
  language: {
    tag: navigator?.language ?? 'en',
    name: 'English',
  },
  persisted: null,
  schema: null,
});

export const $language = computed(
  $content,
  ({ language }) => language?.tag ?? navigator?.language ?? 'en',
);

export const $contentPath = computed($content, ({ persisted }) => persisted?.contentPath ?? '');

export const $topic = computed($content, (data) => data.persisted?.topic ?? '');

export const $allFormItemsWithPaths = computed($content, ({ schema, persisted }) => {
  const schemaPaths = schema ? getFormItemsWithPaths(schema.form.formItems) : [];
  const result = persisted ? getDataPathsToEditableItems(schemaPaths, persisted) : [];

  return [createDisplayNameInput(), ...result];
});

export const $orderedPaths = computed($allFormItemsWithPaths, (items) => {
  return items.map((item) => pathToString(item));
});

const $helpTextMap = computed($allFormItemsWithPaths, (items) => {
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

function resolveInputsForContext(
  contextPath: Optional<Path>,
  allFormItems: FormItemWithPath[],
): InputWithPath[] {
  const input = contextPath
    ? allFormItems.find(
        (path): path is InputWithPath => pathsEqual(path, contextPath) && isEditableInput(path),
      )
    : null;

  if (input) {
    return [input];
  }

  const items: FormItemWithPath[] = contextPath
    ? allFormItems.filter((path) => isChildPath(path, contextPath))
    : allFormItems.filter((path) => isRootPath(path));

  return items.filter((item: FormItemWithPath): item is InputWithPath => isEditableInput(item));
}

export const $inputsInContext = computed([$context, $allFormItemsWithPaths], (context, allFormItems) =>
  resolveInputsForContext(context ? pathFromString(context) : null, allFormItems),
);

// True when the path resolves to an editable input: the field itself, or a parent's editable children.
export function isResolvableContext(context: string): boolean {
  return resolveInputsForContext(pathFromString(context), $allFormItemsWithPaths.get()).length > 0;
}

export const $mentions = computed([$inputsInContext], (inputs) => {
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

export const $fieldDescriptors = computed($allFormItemsWithPaths, (allFormItems) => {
  return allFormItems
    .filter((item: FormItemWithPath): item is InputWithPath => isEditableInput(item))
    .map((item) => ({
      name: pathToString(item),
      label: pathToPrettifiedLabel(item),
      displayName: pathToPrettifiedString(item),
      type: getInputType(item),
    })) satisfies FieldDescriptor[];
});

export const setLanguage = (language: Language): void => $content.setKey('language', language);

export const getPersistedData = (): Optional<Readonly<ContentData>> => $content.get().persisted;

export const setPersistedData = (data: ContentData): void => $content.setKey('persisted', data);

export const setSchema = (schema: Schema): void => $content.setKey('schema', schema);

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
    return { v: $topic.get() };
  }

  const fields = $content.get().persisted?.fields ?? [];
  const array = getPropertyArrayByPath(fields, path);
  return array?.values.at(path.elements.at(-1)?.index ?? 0);
}

$allFormItemsWithPaths.listen((allFormItemsWithPaths) => {
  const context = $context.get();
  if (!context) {
    return;
  }

  const path = pathFromString(context);
  const isValidContext = allFormItemsWithPaths.some((p) => pathsEqual(p, path));

  if (!isValidContext) {
    resetContext();
  }
});
