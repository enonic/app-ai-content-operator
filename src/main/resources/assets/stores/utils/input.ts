import {DataEntryType} from '../../../shared/data/DataEntry';
import {InputWithPath} from '../data/FormItemWithPath';

export function getInputType(inputWithPath: Optional<InputWithPath>): DataEntryType {
    return inputWithPath?.Input.inputType === 'HtmlArea' ? 'html' : 'text';
}
