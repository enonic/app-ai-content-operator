import type { MultipleValues } from './MultipleValues';

export type MessageItem = Optional<string | MultipleValues>;

export type MessageItems = Record<string, MessageItem>;
