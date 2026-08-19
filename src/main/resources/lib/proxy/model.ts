import type { Message } from '../../shared/model';
import type { ModelParameters } from '../../shared/modes';
import type { Schema, ThinkingLevel } from '../google/types';

export type ModelProxy = {
  generate(): Try<string>;
};

export type MediaPayload = {
  mimeType: string;
  data: string;
};

export type ProxyMessage = Message & {
  media?: MediaPayload;
};

export type ModelProxyConfig = {
  url: string;
  instructions: string;
  modelParameters: ModelParameters;
  thinkingLevel: ThinkingLevel;
  messages: ProxyMessage[];
  schema?: Schema;
};
