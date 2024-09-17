import {Path} from './Path';
import {FormItem, FormItemSet, FormOptionSet, FormOptionSetOption, Input} from './Schema';

export type FormItemWithPath = FormItem & Path;

export type InputWithPath = Input & Path;

export type FormItemSetWithPath = FormItemSet & Path;

export type FormOptionSetWithPath = FormOptionSet & Path;

export type FormOptionSetOptionWithPath = FormOptionSetOption & Path;
