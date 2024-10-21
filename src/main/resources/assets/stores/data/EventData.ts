import {ContentData} from './ContentData';
import {Schema} from './Schema';

export type EventData = {
    payload: {
        data: ContentData;
        schema?: Schema;
    };
};
