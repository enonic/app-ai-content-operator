import {DataEntryType} from '../../../shared/data/DataEntry';

export type FieldDescriptor = {
    name: string;
    label: string;
    displayName: string;
    type: DataEntryType;
};
