import type { Path } from './Path';
import type { FormItem, Input, ItemSet, OptionSet, OptionSetOption } from './Schema';

export type FormItemWithPath = FormItem & Path;

export type InputWithPath = Input & Path;

export type ItemSetWithPath = ItemSet & Path;

export type OptionSetWithPath = OptionSet & Path;

export type OptionSetOptionWithPath = OptionSetOption & Path;
