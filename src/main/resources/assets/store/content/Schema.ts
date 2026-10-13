import type {
  FormItemJson,
  FormJson,
  InputJson,
  ItemSetJson,
  LayoutJson,
  OptionSetJson,
  OptionSetOptionJson,
} from '@enonic/ui-types';

export type Schema = {
  name: string;
  form: FormJson;
};

export type FormItem = FormItemJson | OptionSetOption;

export type Input = InputJson;

export type Layout = LayoutJson;

export type ItemSet = ItemSetJson;

export type OptionSet = OptionSetJson;

export type OptionSetOption = OptionSetOptionJson;
