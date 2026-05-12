import type { ContentData } from './ContentData';
import type { Language } from './Language';
import type { Schema } from './Schema';

export type UpdateEventData = {
  payload: {
    language?: Language;
    data?: ContentData;
    schema?: Schema;
  };
};
