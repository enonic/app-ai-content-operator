import {ContentData} from './ContentData';
import {Language} from './Language';
import {Schema} from './Schema';

export type EventData = {
    payload: {
        language?: Language;
        data?: ContentData;
        schema?: Schema;
    };
};
