import {MultipleValues} from './MultipleContentValue';

export type MessageItem = Optional<string | MultipleValues>;

export type MessageItems = Record<string, MessageItem>;
